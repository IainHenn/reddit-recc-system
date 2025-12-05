import React from "react";

export default function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: "search", label: "Search" },
    { id: "about", label: "About" },
    { id: "stats", label: "Statistics" }, // example extra tab
  ];

  return (
    <nav className="w-full bg-white shadow-md py-3 px-6 flex items-center justify-between">
      <div className="text-xl font-bold text-blue-700">Crypto Advisor</div>

      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`text-sm font-medium pb-1 border-b-2 transition 
              ${
                currentTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-600"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}