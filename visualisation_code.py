import requests
import json
import matplotlib.pyplot as plt


API_endpoint = 'http://127.0.0.1:8000/search'

SIMILARITY_THRESHOLD = 0.10
N_RESULTS = 20
UPVOTES_MIN = 0 

QUERIES = ["bitcoin", "ethereum", "dogecoin", "solana", "cardano", "defi", "etf", "halving", "airdrop", "ordinals"]
K_LIST = [1, 3, 5, 10, 15, 20]


def precision_at_k(relevance_scores, k):
    #takes a list of relevance scores for a query and computes precision at some k for that query
    if k <= 0:
        return 0.0
    else:
        return sum(relevance_scores[:k]) / float(k)

def average_precision_over_ks(relevance_scores, k_list):
    # average Precision@K for a single query over all provided K values
    if not k_list:
        return 0.0
    precisions = []
    for k in k_list:
        precisions.append(precision_at_k(relevance_scores, k))
    return sum(precisions) / len(k_list)
    

def get_relevance_scores(query, n_results, upvotes_min):
    #gets list of relevance scores(similarity) from backend and turns it into a binary list based on a certain threshold
    params = {"q": query, "n": str(n_results), "upvotes_min": str(upvotes_min)}
    resp = requests.get(API_endpoint, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    posts = data.get("posts", [])

    similarities = []
    for p in posts:
        similarities.append(float(p.get("relevance_score", 0.0)))

    relevance_scores = []
    for s in similarities:
        if s >= SIMILARITY_THRESHOLD:
            relevance_scores.append(1)
        else:
            relevance_scores.append(0)

    # Return both the binary relevance list, raw similarities, and per-K precisions for later aggregation steps
    return {
        "relevance": relevance_scores,
        "similarities": similarities,
        "per_k": {f"P@{k}": precision_at_k(relevance_scores, k) for k in K_LIST}
    }

def precision_per_k():
    # Average Precision@K across all queries per k
    
    per_query = {}
    for q in QUERIES:
        result = get_relevance_scores(q, N_RESULTS, UPVOTES_MIN)
        per_query[q] = result["per_k"]
        print(f"{q}: {per_query[q]}")


    per_k = {}
    for k in K_LIST:
        total = 0.0
        count = 0
        for q in QUERIES:
            total += per_query[q][f"P@{k}"]
            count += 1
            per_k[f"P@{k}"] = total / count if count else 0.0
            
    

    with open("precision_at_k_results.json", "w", encoding="utf-8") as f:
        json.dump({"per_query": per_query, "per_k": per_k, "threshold": SIMILARITY_THRESHOLD, "K": K_LIST}, f, indent=2)
    

    labels = list(per_k.keys())
    values = [per_k[k] for k in labels]
    plt.figure(figsize=(6, 4))
    plt.bar(labels, values, color="#3b82f6")
    plt.ylim(0, 1)
    plt.ylabel("Avg Precision of Queries")
    plt.title(f"Avg Precision@K of Queries per K,  (similarity ≥ {SIMILARITY_THRESHOLD})")
    plt.tight_layout()
    plt.savefig("precision_at_k.png", dpi=200)
    print("Saved plot to precision_at_k.png")

def similarity_per_k():
    # Average raw similarity per K (mean of top-k similarity values) across all queries
    
    per_query_sims = {}
    for q in QUERIES:
        result = get_relevance_scores(q, N_RESULTS, UPVOTES_MIN)
        sims = result["similarities"]
        # compute mean of top-k similarities for each K
        sim_k = {}
        for k in K_LIST:
            if k > 0 and len(sims) >= 1:
                sim_k[f"Sim@{k}"] = sum(sims[:k]) / float(k)
            else:
                sim_k[f"Sim@{k}"] = 0.0
        per_query_sims[q] = sim_k

    # average over queries for each K
    sim_per_k = {}
    for k in K_LIST:
        total = 0.0
        count = 0
        for q in QUERIES:
            total += per_query_sims[q][f"Sim@{k}"]
            count += 1
        sim_per_k[f"Sim@{k}"] = total / count if count else 0.0

    # plot
    with open("similarity_per_k_results.json", "w", encoding="utf-8") as f:
        json.dump({"per_query": per_query_sims, "per_k": sim_per_k, "K": K_LIST}, f, indent=2)
    

    labels = list(sim_per_k.keys())
    values = [sim_per_k[k] for k in labels]
    plt.figure(figsize=(6, 4))
    plt.bar(labels, values, color="#6366f1")
    plt.ylim(0, 1)
    plt.ylabel("Avg Similarity")
    plt.title("Average Raw Similarity per K")
    plt.tight_layout()
    plt.savefig("similarity_per_k.png", dpi=200)
    print("Saved plot to similarity_per_k.png")

def precision_per_query():
    with open("precision_at_k_results.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    per_query = data.get("per_query", {})
    # Compute average precision per query over all Ks
    avg_per_query = {}
    for q in QUERIES:
        precisions = per_query.get(q, {})
        
        values = [precisions.get(f"P@{k}", 0.0) for k in K_LIST]
        avg_per_query[q] = sum(values) / len(K_LIST) if K_LIST else 0.0

    # Save the per-query averages to file for convenience
    with open("precision_per_query_avg.json", "w", encoding="utf-8") as f:
        json.dump({"avg_per_query": avg_per_query, "K": K_LIST}, f, indent=2)
    print("Wrote precision_per_query_avg.json")

    # Faceted bars: average precision over all Ks, by query term
    queries = QUERIES
    avg_values = [avg_per_query[q] for q in queries]
    plt.figure(figsize=(8, 4))
    plt.bar(queries, avg_values, color="#10b981")
    plt.ylim(0, 1)
    plt.ylabel(f"Average Precision@K")
    plt.title(f"Average Precision@K per Query; (similarity ≥ {SIMILARITY_THRESHOLD})\nPrecision@K averaged over K_LIST = {K_LIST}")
    plt.xticks(rotation=30, ha="right")
    plt.tight_layout()
    plt.savefig("avg_precision_per_query.png", dpi=200)
    print("Saved plot to avg_precision_per_query.png")
    


def main():
    precision_per_k()
    precision_per_query()
    similarity_per_k()
    
if __name__ == "__main__":
    main()