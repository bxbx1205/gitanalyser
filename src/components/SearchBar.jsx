import { Search } from 'lucide-react';

const SearchBar = ({ user1, user2, setUser1, setUser2, handleSearch, compareMode, setCompareMode, loading }) => (
  <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
    <input
      type="text"
      value={user1}
      onChange={(e) => setUser1(e.target.value)}
      placeholder="Enter GitHub username..."
      className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 w-full sm:w-auto"
      onKeyDown={(e) => e.key === 'Enter' && handleSearch(user1)}
    />
    <button
      onClick={() => handleSearch(user1)}
      className="bg-[#8884d8] px-4 py-2 rounded text-white text-sm"
      disabled={loading}
    >
      {loading ? 'Loading...' : <span className="flex items-center gap-1"><Search size={14} /> Search</span>}
    </button>
    <button
      onClick={() => setCompareMode(!compareMode)}
      className="text-xs text-gray-400 underline ml-2"
    >
      {compareMode ? '🔙 Back to Single' : '🤝 Compare Users'}
    </button>

    {compareMode && (
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="text"
          value={user2}
          onChange={(e) => setUser2(e.target.value)}
          placeholder="Enter another username..."
          className="p-2 rounded bg-zinc-800 text-white border border-zinc-700"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(user2, true)}
        />
        <button
          onClick={() => handleSearch(user2, true)}
          className="bg-[#82ca9d] px-4 py-2 rounded text-black text-sm"
        >
          Compare
        </button>
      </div>
    )}
  </div>
);

export default SearchBar;
