import React, { useState, useEffect } from "react";
import {
  Trophy,
  TrendingUp,
  GitBranch,
  Eye,
  Calendar,
} from "lucide-react";
import UserForm from "./components/UserForm";
import TabBar from "./components/TabBar";
import UserProfileCard from "./components/UserProfileCard";
import RadarCompareChart from "./components/RadarCompareChart";
import RepoList from "./components/RepoList";
import LanguageChart from "./components/LanguageChart";
import ActivityChart from "./components/ActivityChart";
import { fetchUserData } from "./services/githubService";

const App = () => {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [userData1, setUserData1] = useState(null);
  const [userData2, setUserData2] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!compareMode) {
      setUserData2(null);
      setUser2("");
    }
  }, [compareMode]);

  const handleSearch = async (username, isSecond = false) => {
    if (!username) {
      if (isSecond) setUserData2(null);
      else setUserData1(null);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchUserData(username);
      if (isSecond) {
        setUserData2(data);
      } else {
        setUserData1(data);
      }
    } catch (err) {
      setError(err.message || "User not found");
      if (isSecond) setUserData2(null);
      else setUserData1(null);
    }
    setLoading(false);
  };

  const getRadarData = () => {
    if (!userData1 || !userData2) return [];
    const subjects = [
      ["Stars", "totalStars"],
      ["Forks", "totalForks"],
      ["Watchers", "totalWatchers"],
      ["Repos", "repoCount"],
    ];
    return subjects.map(([label, key]) => ({
      subject: label,
      user1: userData1.stats[key] || 0,
      user2: userData2.stats[key] || 0,
      raw1: userData1.stats[key] || 0,
      raw2: userData2.stats[key] || 0,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-400">
          🐙 GitHub Analyser (thoda tuta phuta)
        </h1>
        <UserForm
          user1={user1}
          user2={user2}
          setUser1={setUser1}
          setUser2={setUser2}
          handleSearch={handleSearch}
          loading={loading}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
        />

        {error && (
          <div className="bg-red-900 text-red-200 p-2 mt-2 rounded text-sm">
            {error}
          </div>
        )}

        {(userData1 || userData2) && (
          <>
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {userData1 && <UserProfileCard userData={userData1} title="User 1" />}
              {compareMode && userData2 && (
                <UserProfileCard userData={userData2} title="User 2" />
              )}
            </div>

            {activeTab === "overview" && (
              <div>
                {compareMode && userData1 && userData2 && (
                  <div className="bg-gray-800 p-4 rounded mb-4">
                    <div className="font-semibold flex items-center gap-2 mb-2">
                      <Trophy size={18} className="text-yellow-400" />
                      User Comparison
                    </div>
                    <RadarCompareChart
                      data={getRadarData()}
                      user1={userData1}
                      user2={userData2}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                  <div className="bg-gray-800 rounded p-4">
                    <TrendingUp className="mx-auto text-indigo-400" />
                    <div className="text-lg font-bold">
                      {userData1?.stats?.totalStars || 0}
                    </div>
                    <div>Stars</div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <GitBranch className="mx-auto text-green-400" />
                    <div className="text-lg font-bold">
                      {userData1?.stats?.totalForks || 0}
                    </div>
                    <div>Forks</div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <Eye className="mx-auto text-pink-400" />
                    <div className="text-lg font-bold">
                      {userData1?.stats?.totalWatchers || 0}
                    </div>
                    <div>Watchers</div>
                  </div>
                  <div className="bg-gray-800 rounded p-4">
                    <Calendar className="mx-auto text-yellow-300" />
                    <div className="text-lg font-bold">
                      {new Date(userData1?.userInfo?.created_at).getFullYear() || "-"}
                    </div>
                    <div>Joined</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "repositories" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {userData1 && (
                  <RepoList
                    title={userData1.userInfo.login}
                    repos={userData1.stats.topRepos}
                    color="#8884d8"
                  />
                )}
                {compareMode && userData2 && (
                  <RepoList
                    title={userData2.userInfo.login}
                    repos={userData2.stats.topRepos}
                    color="#82ca9d"
                  />
                )}
              </div>
            )}

            {activeTab === "languages" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {userData1 && (
                  <LanguageChart languageStats={userData1.stats.languageStats} />
                )}
                {compareMode && userData2 && (
                  <LanguageChart languageStats={userData2.stats.languageStats} />
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {userData1 && (
                  <ActivityChart activityPattern={userData1.stats.activityPattern} />
                )}
                {compareMode && userData2 && (
                  <ActivityChart activityPattern={userData2.stats.activityPattern} />
                )}
              </div>
            )}
          </>
        )}

        <div className="text-center text-xs mt-10 text-gray-500">
          <p>Data from GitHub API. Kahi kuch galti ho gayi ho toh maaf kar dena 😭</p>
        </div>
      </div>
    </div>
  );
};

export default App;
