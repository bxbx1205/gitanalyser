import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Search, User, GitBranch, Star, Eye, Users, Calendar, Code, Activity, Zap, Trophy, TrendingUp } from 'lucide-react';

// रंग palette - colors ke liye yaha se pick karte hai
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

const GitAnalyzer = () => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [userData1, setUserData1] = useState(null);
  const [userData2, setUserData2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // GitHub API se data laane ka function - यह काम करता है 
  const fetchGitHubData = async (username) => {
    try {
      // पहले user ki basic info लेते हैं
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) throw new Error('User nahi mila bhai');
      const userInfo = await userResponse.json();

      // अब repos की list लेते हैं 
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const repos = await reposResponse.json();

      // Language stats निकालते हैं - थोड़ा complex logic है यह
      const languageStats = {};
      let totalStars = 0;
      let totalForks = 0;
      let totalWatchers = 0;

      repos.forEach(repo => {
        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        }
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;
        totalWatchers += repo.watchers_count || 0;
      });

      // Top repositories - stars ke base pe sort karte hai
      const topRepos = repos
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 10);

      // Activity pattern - created date se समझते हैं
      const activityPattern = {};
      repos.forEach(repo => {
        const year = new Date(repo.created_at).getFullYear();
        activityPattern[year] = (activityPattern[year] || 0) + 1;
      });

      return {
        userInfo,
        repos,
        stats: {
          totalRepos: repos.length,
          totalStars,
          totalForks,
          totalWatchers,
          languageStats,
          topRepos,
          activityPattern
        }
      };
    } catch (err) {
      throw new Error(`Error fetching data: ${err.message}`);
    }
  };

  // Search handle करने का function
  const handleSearch = async (username, isSecondUser = false) => {
    if (!username.trim()) {
      setError('Username toh daal de bhai!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchGitHubData(username.trim());
      
      if (isSecondUser) {
        setUserData2(data);
      } else {
        setUserData1(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Language data को chart ke liye format करते हैं
  const formatLanguageData = (languageStats) => {
    return Object.entries(languageStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Activity data format करना
  const formatActivityData = (activityPattern) => {
    return Object.entries(activityPattern)
      .map(([year, repos]) => ({ year: parseInt(year), repos }))
      .sort((a, b) => a.year - b.year);
  };

  // Comparison के लिए radar chart data
  const getRadarData = () => {
    if (!userData1 || !userData2) return [];

    const metrics = [
      { subject: 'Repositories', user1: userData1.stats.totalRepos, user2: userData2.stats.totalRepos },
      { subject: 'Stars', user1: userData1.stats.totalStars, user2: userData2.stats.totalStars },
      { subject: 'Forks', user1: userData1.stats.totalForks, user2: userData2.stats.totalForks },
      { subject: 'Followers', user1: userData1.userInfo.followers, user2: userData2.userInfo.followers },
      { subject: 'Following', user1: userData1.userInfo.following, user2: userData2.userInfo.following },
    ];

    // Normalize करते हैं values को 0-100 scale पर
    return metrics.map(metric => {
      const maxVal = Math.max(metric.user1, metric.user2) || 1;
      return {
        subject: metric.subject,
        user1: (metric.user1 / maxVal) * 100,
        user2: (metric.user2 / maxVal) * 100,
        raw1: metric.user1,
        raw2: metric.user2
      };
    });
  };

  // Stats card component - यह reusable है
  const StatsCard = ({ icon: Icon, title, value, color = 'blue' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  );

  // User profile card
  const UserProfileCard = ({ userData, title }) => {
    if (!userData) return null;

    const { userInfo, stats } = userData;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={userInfo.avatar_url} 
            alt={userInfo.login}
            className="w-16 h-16 rounded-full border-4 border-blue-500"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-lg font-semibold text-blue-600">@{userInfo.login}</p>
            {userInfo.name && <p className="text-gray-600">{userInfo.name}</p>}
            {userInfo.bio && <p className="text-sm text-gray-500 mt-1">{userInfo.bio}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Code} title="Repositories" value={stats.totalRepos} color="blue" />
          <StatsCard icon={Star} title="Total Stars" value={stats.totalStars} color="yellow" />
          <StatsCard icon={GitBranch} title="Total Forks" value={stats.totalForks} color="green" />
          <StatsCard icon={Users} title="Followers" value={userInfo.followers} color="purple" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section - यहाँ title और search है */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Activity className="w-8 h-8 text-blue-600" />
            GitHub Analyzer
          </h1>
          <p className="text-gray-600">Analyze and compare GitHub profiles with detailed insights</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Search Users</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="compareMode"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="compareMode" className="text-sm font-medium text-gray-700">
                Compare Mode
              </label>
            </div>
          </div>

          <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* First User Search */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(user1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSearch(user1)}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>

            {/* Second User Search - only show in compare mode */}
            {compareMode && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter second username for comparison..."
                  value={user2}
                  onChange={(e) => setUser2(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(user2, true)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSearch(user2, true)}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Compare
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {(userData1 || userData2) && (
          <div>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-md">
              {['overview', 'languages', 'activity', 'repositories'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* User Profile Cards */}
            <div className={`grid ${compareMode && userData2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
              {userData1 && <UserProfileCard userData={userData1} title="User 1" />}
              {compareMode && userData2 && <UserProfileCard userData={userData2} title="User 2" />}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Comparison Radar Chart - only show when comparing */}
                {compareMode && userData1 && userData2 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Head-to-Head Comparison
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name={userData1.userInfo.login} dataKey="user1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name={userData2.userInfo.login} dataKey="user2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip formatter={(value, name, props) => [props.payload[`raw${name.slice(-1)}`], name.slice(0, -1)]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userData1 && (
                    <>
                      <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{userData1.stats.totalStars}</p>
                        <p className="text-sm text-gray-600">Total Stars Earned</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <GitBranch className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{userData1.stats.totalForks}</p>
                        <p className="text-sm text-gray-600">Total Forks</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{userData1.stats.totalWatchers}</p>
                        <p className="text-sm text-gray-600">Total Watchers</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {new Date(userData1.userInfo.created_at).getFullYear()}
                        </p>
                        <p className="text-sm text-gray-600">Joined GitHub</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'languages' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userData1 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {userData1.userInfo.login} - Programming Languages
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatLanguageData(userData1.stats.languageStats)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {formatLanguageData(userData1.stats.languageStats).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {compareMode && userData2 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {userData2.userInfo.login} - Programming Languages
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatLanguageData(userData2.stats.languageStats)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {formatLanguageData(userData2.stats.languageStats).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                {userData1 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Repository Creation Activity
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatActivityData(userData1.stats.activityPattern)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="repos" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {compareMode && userData1 && userData2 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Activity Comparison Over Years
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={(() => {
                          const years = new Set([
                            ...Object.keys(userData1.stats.activityPattern),
                            ...Object.keys(userData2.stats.activityPattern)
                          ]);
                          return Array.from(years).map(year => ({
                            year: parseInt(year),
                            user1: userData1.stats.activityPattern[year] || 0,
                            user2: userData2.stats.activityPattern[year] || 0
                          })).sort((a, b) => a.year - b.year);
                        })()}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="user1" stroke="#8884d8" name={userData1.userInfo.login} />
                        <Line type="monotone" dataKey="user2" stroke="#82ca9d" name={userData2.userInfo.login} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'repositories' && (
              <div className="space-y-6">
                {userData1 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Repositories - {userData1.userInfo.login}
                    </h3>
                    <div className="space-y-3">
                      {userData1.stats.topRepos.slice(0, 5).map((repo, index) => (
                        <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-600 hover:text-blue-800">
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                  {repo.name}
                                </a>
                              </h4>
                              {repo.description && (
                                <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {repo.language && (
                                  <span className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    {repo.language}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {repo.stargazers_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  {repo.forks_count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {compareMode && userData2 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Repositories - {userData2.userInfo.login}
                    </h3>
                    <div className="space-y-3">
                      {userData2.stats.topRepos.slice(0, 5).map((repo, index) => (
                        <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-600 hover:text-green-800">
                                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                  {repo.name}
                                </a>
                              </h4>
                              {repo.description && (
                                <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {repo.language && (
                                  <span className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    {repo.language}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {repo.stargazers_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  {repo.forks_count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Made with ❤️ for analyzing GitHub profiles</p>
          <p className="text-sm">Data fetched from GitHub API</p>
        </div>
      </div>
    </div>
  );
};

export default GitAnalyzer;