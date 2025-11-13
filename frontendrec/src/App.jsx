import React, { useState } from 'react';
import { Search, User, ThumbsUp, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function TopicRecommender() {
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Replace this URL with your actual API endpoint
  const API_ENDPOINT = 'https://your-api-endpoint.com/recommend';

  const handleSearch = async (searchTopic) => {
    const query = (searchTopic ?? topic).trim();
    if (!query) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_ENDPOINT}?topic=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error(err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Transform results for chart
  const chartData =
    results?.users?.slice(0, 10).map((user) => ({
      name: user.username || user.name || 'Unknown',
      upvotes: user.totalUpvotes || user.upvotes || 0,
    })) || [];

  const totalUpvotes =
    results?.users?.reduce(
      (sum, u) => sum + (u.totalUpvotes || u.upvotes || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6 py-16">
      {/* centered column container */}
      <div className="w-full max-w-3xl">
        {/* header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Crypto Recommender
          </h1>
          <p className="text-sm text-gray-600 mt-1">Find top cryptocurrencies by coin type</p>
        </header>

        {/* search card (centered, narrower column) */}
        <main className="mx-auto max-w-2xl">
          <form
            onSubmit={onSubmit}
            className="relative bg-white rounded-2xl shadow-[0_20px_40px_rgba(13,38,76,0.06)] p-5 md:p-6"
            aria-label="Search crypto topic"
          >
            {/* search input with floating button */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                  <Search size={18} className="text-blue-600" />
                </div>

                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a cryptocurrency (e.g., Bitcoin, Ethereum)"
                  aria-label="Search topic"
                  className="flex-1 text-lg px-4 py-3 pr-28 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                />

                {/* keep a small visible button on small screens (inline) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <Search size={16} />
                  {loading ? 'Searching' : 'Search'}
                </button>
              </div>

              {/* floating button for md+ screens (absolutely positioned to the right of input) */}
              <button
                type="submit"
                onClick={() => {}}
                disabled={loading}
                className="hidden md:inline-flex items-center gap-2 absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow"
              >
                <Search size={16} />
                {loading ? 'Searching' : 'Search'}
              </button>
            </div>

            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

            <p className="text-xs text-gray-400 mt-3">Tip: try "Bitcoin", "Ethereum", or "Stablecoin".</p>
          </form>

          {/* Results or Empty state */}
          <div className="mt-6">
            {results ? (
              <div className="space-y-5">
                {/* stat cards in a row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <User className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-800">{results.users?.length || 0}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-full">
                      <ThumbsUp className="text-green-600" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Upvotes</p>
                      <p className="text-2xl font-bold text-gray-800">{totalUpvotes}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-full">
                      <TrendingUp className="text-purple-600" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Topic</p>
                      <p className="text-2xl font-bold text-gray-800 truncate">{topic || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* chart */}
                {chartData.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Contributors</h3>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ right: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-35} textAnchor="end" height={60} interval={0} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="upvotes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* user list */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">User Rankings</h3>
                  <div className="space-y-3">
                    {results.users?.length ? (
                      results.users.map((user, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                              #{idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 truncate">{user.username || user.name || 'Anonymous'}</p>
                              <p className="text-sm text-gray-500">{user.posts || 0} posts</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <ThumbsUp size={16} className="text-green-600" />
                            <span className="font-semibold text-gray-800">{user.totalUpvotes || user.upvotes || 0}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No users found for this topic.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow p-12 text-center mt-4">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-1">Start Your Search</h3>
                <p className="text-gray-500">Enter a topic above to find top contributors</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
