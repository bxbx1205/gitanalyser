import React from "react";

const UserForm = ({
  user1,
  user2,
  setUser1,
  setUser2,
  handleSearch,
  loading,
  compareMode,
  setCompareMode,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="flex flex-col w-full max-w-xs">
          <input
            type="text"
            placeholder="Enter User 1 GitHub Username"
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(user1, false);
            }}
            className="p-2 rounded border border-gray-600 bg-gray-900 text-white"
          />
          <button
            onClick={() => handleSearch(user1, false)}
            disabled={loading || !user1.trim()}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded px-4 py-2"
          >
            Search User 1
          </button>
        </div>

        {/* Show second input only if compareMode is ON */}
        {compareMode && (
          <div className="flex flex-col w-full max-w-xs">
            <input
              type="text"
              placeholder="Enter User 2 GitHub Username"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(user2, true);
              }}
              className="p-2 rounded border border-gray-600 bg-gray-900 text-white"
            />
            <button
              onClick={() => handleSearch(user2, true)}
              disabled={loading || !user2.trim()}
              className="mt-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded px-4 py-2"
            >
              Search User 2
            </button>
          </div>
        )}
      </div>

      {/* Compare Mode Toggle */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm select-none">
        <input
          type="checkbox"
          id="compareToggle"
          checked={compareMode}
          onChange={() => setCompareMode((prev) => !prev)}
          className="w-4 h-4 cursor-pointer"
        />
        <label htmlFor="compareToggle" className="cursor-pointer">
          Compare Mode
        </label>
      </div>
    </div>
  );
};

export default UserForm;
