const TabBar = ({ activeTab, setActiveTab }) => (
  <div className="flex justify-center gap-4 mb-6">
    {['overview', 'languages', 'activity', 'repositories'].map((tab) => (
      <button
        key={tab}
        className={`px-3 py-2 rounded text-sm ${
          activeTab === tab ? 'bg-violet-500 text-white' : 'bg-gray-700 text-gray-300'
        }`}
        onClick={() => setActiveTab(tab)}
      >
        {tab.toUpperCase()}
      </button>
    ))}
  </div>
);

export default TabBar;