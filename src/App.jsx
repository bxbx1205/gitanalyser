import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Search, GitBranch, Star, Eye, Users, Calendar, Code, Activity, Trophy, TrendingUp } from 'lucide-react';

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

  const fetchGitHubData = async (username) => {
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) throw new Error('User not found');
      const userInfo = await userResponse.json();

      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
      const repos = await reposResponse.json();

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

      const topRepos = repos
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 10);

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
      throw new Error(`Error: ${err.message}`);
    }
  };

  const handleSearch = async (username, isSecondUser = false) => {
    if (!username.trim()) {
      setError('Please enter a username!');
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

  const formatLanguageData = (languageStats) => {
    return Object.entries(languageStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const formatActivityData = (activityPattern) => {
    return Object.entries(activityPattern)
      .map(([year, repos]) => ({ year: parseInt(year), repos }))
      .sort((a, b) => a.year - b.year);
  };

  const getRadarData = () => {
    if (!userData1 || !userData2) return [];
    const metrics = [
      { subject: 'Repositories', user1: userData1.stats.totalRepos, user2: userData2.stats.totalRepos },
      { subject: 'Stars', user1: userData1.stats.totalStars, user2: userData2.stats.totalStars },
      { subject: 'Forks', user1: userData1.stats.totalForks, user2: userData2.stats.totalForks },
      { subject: 'Followers', user1: userData1.userInfo.followers, user2: userData2.userInfo.followers },
      { subject: 'Following', user1: userData1.userInfo.following, user2: userData2.userInfo.following },
    ];
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

  const StatsCard = ({ icon: Icon, title, value }) => (
    <div style={{ borderLeft: '4px solid #444', background: '#222', color: '#eee', borderRadius: 4, padding: 8, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
      <div>
        <div>{title}</div>
        <div style={{ fontWeight: 'bold', fontSize: 16 }}>{value}</div>
      </div>
      <Icon size={22} color="#8884d8" />
    </div>
  );

  const UserProfileCard = ({ userData, title }) => {
    if (!userData) return null;
    const { userInfo, stats } = userData;
    return (
      <div style={{ background: '#181818', color: '#eee', borderRadius: 4, padding: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <img
            src={userInfo.avatar_url}
            alt={userInfo.login}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #8884d8', marginRight: 8 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{title}</div>
            <div style={{ color: '#8884d8' }}>@{userInfo.login}</div>
            {userInfo.name && <div style={{ fontSize: 12 }}>{userInfo.name}</div>}
            {userInfo.bio && <div style={{ fontSize: 11, color: '#aaa' }}>{userInfo.bio}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <StatsCard icon={Code} title="Repos" value={stats.totalRepos} />
          <StatsCard icon={Star} title="Stars" value={stats.totalStars} />
          <StatsCard icon={GitBranch} title="Forks" value={stats.totalForks} />
          <StatsCard icon={Users} title="Followers" value={userInfo.followers} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#111', color: '#eee', minHeight: '100vh', fontFamily: 'sans-serif', fontSize: 14 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Activity size={28} color="#8884d8" />
            GitHub Analyzer 
          </h1>
          <div style={{ color: '#aaa', fontSize: 13 }}>Check your or anyone's GitHub stats here!</div>
        </div>
        <div style={{ background: '#181818', borderRadius: 4, padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>User Search</div>
            <div>
              <input
                type="checkbox"
                id="compareMode"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                style={{ marginRight: 4 }}
              />
              <label htmlFor="compareMode" style={{ fontSize: 12 }}>Compare users?</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', gap: 4 }}>
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(user1)}
                style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #333', background: '#222', color: '#eee' }}
              />
              <button
                onClick={() => handleSearch(user1)}
                disabled={loading}
                style={{ padding: '6px 12px', borderRadius: 4, background: '#8884d8', color: '#fff', border: 'none', fontSize: 12 }}
              >
                <Search size={16} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
            {compareMode && (
              <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                <input
                  type="text"
                  placeholder="Enter another username..."
                  value={user2}
                  onChange={(e) => setUser2(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(user2, true)}
                  style={{ flex: 1, padding: 6, borderRadius: 4, border: '1px solid #333', background: '#222', color: '#eee' }}
                />
                <button
                  onClick={() => handleSearch(user2, true)}
                  disabled={loading}
                  style={{ padding: '6px 12px', borderRadius: 4, background: '#82ca9d', color: '#222', border: 'none', fontSize: 12 }}
                >
                  <Search size={16} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                  Compare
                </button>
              </div>
            )}
          </div>
          {error && (
            <div style={{ marginTop: 8, padding: 6, background: '#400', color: '#faa', borderRadius: 4, fontSize: 12 }}>{error}</div>
          )}
        </div>
        {(userData1 || userData2) && (
          <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {['overview', 'languages', 'activity', 'repositories'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 4,
                    background: activeTab === tab ? '#8884d8' : '#222',
                    color: activeTab === tab ? '#fff' : '#aaa',
                    border: 'none',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    fontSize: 13
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {userData1 && <div style={{ flex: 1 }}><UserProfileCard userData={userData1} title="User 1" /></div>}
              {compareMode && userData2 && <div style={{ flex: 1 }}><UserProfileCard userData={userData2} title="User 2" /></div>}
            </div>
            {activeTab === 'overview' && (
              <div>
                {compareMode && userData1 && userData2 && (
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Trophy size={16} color="#ffc658" />
                      User Comparison
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name={userData1.userInfo.login} dataKey="user1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                        <Radar name={userData2.userInfo.login} dataKey="user2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
                        <Legend />
                        <Tooltip formatter={(value, name, props) => [props.payload[`raw${name.slice(-1)}`], name.slice(0, -1)]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  {userData1 && (
                    <>
                      <div style={{ background: '#222', borderRadius: 4, padding: 10, textAlign: 'center', flex: 1 }}>
                        <TrendingUp size={20} color="#8884d8" />
                        <div style={{ fontWeight: 'bold' }}>{userData1.stats.totalStars}</div>
                        <div style={{ fontSize: 12 }}>Stars</div>
                      </div>
                      <div style={{ background: '#222', borderRadius: 4, padding: 10, textAlign: 'center', flex: 1 }}>
                        <GitBranch size={20} color="#82ca9d" />
                        <div style={{ fontWeight: 'bold' }}>{userData1.stats.totalForks}</div>
                        <div style={{ fontSize: 12 }}>Forks</div>
                      </div>
                      <div style={{ background: '#222', borderRadius: 4, padding: 10, textAlign: 'center', flex: 1 }}>
                        <Eye size={20} color="#d084d0" />
                        <div style={{ fontWeight: 'bold' }}>{userData1.stats.totalWatchers}</div>
                        <div style={{ fontSize: 12 }}>Watchers</div>
                      </div>
                      <div style={{ background: '#222', borderRadius: 4, padding: 10, textAlign: 'center', flex: 1 }}>
                        <Calendar size={20} color="#ffc658" />
                        <div style={{ fontWeight: 'bold' }}>
                          {new Date(userData1.userInfo.created_at).getFullYear()}
                        </div>
                        <div style={{ fontSize: 12 }}>Joined</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'languages' && (
              <div style={{ display: 'flex', gap: 8 }}>
                {userData1 && (
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12, flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{userData1.userInfo.login} - Languages</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={formatLanguageData(userData1.stats.languageStats)}
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
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
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12, flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{userData2.userInfo.login} - Languages</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={formatLanguageData(userData2.stats.languageStats)}
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
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
              <div>
                {userData1 && (
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={16} color="#8884d8" />
                      Repo Activity
                    </div>
                    <ResponsiveContainer width="100%" height={140}>
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
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Activity Comparison</div>
                    <ResponsiveContainer width="100%" height={140}>
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
              <div style={{ display: 'flex', gap: 8 }}>
                {userData1 && (
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12, flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={16} color="#ffc658" />
                      Top Repos - {userData1.userInfo.login}
                    </div>
                    <div>
                      {userData1.stats.topRepos.slice(0, 5).map((repo) => (
                        <div key={repo.id} style={{ background: '#222', borderRadius: 4, padding: 8, marginBottom: 6 }}>
                          <div>
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: '#8884d8', textDecoration: 'none' }}>
                              {repo.name}
                            </a>
                            {repo.description && (
                              <div style={{ fontSize: 12, color: '#aaa' }}>{repo.description}</div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 12, color: '#aaa' }}>
                              {repo.language && (
                                <span>
                                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#8884d8', marginRight: 2 }}></span>
                                  {repo.language}
                                </span>
                              )}
                              <span><Star size={12} /> {repo.stargazers_count}</span>
                              <span><GitBranch size={12} /> {repo.forks_count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {compareMode && userData2 && (
                  <div style={{ background: '#181818', borderRadius: 4, padding: 12, flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={16} color="#ffc658" />
                      Top Repos - {userData2.userInfo.login}
                    </div>
                    <div>
                      {userData2.stats.topRepos.slice(0, 5).map((repo) => (
                        <div key={repo.id} style={{ background: '#222', borderRadius: 4, padding: 8, marginBottom: 6 }}>
                          <div>
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: '#82ca9d', textDecoration: 'none' }}>
                              {repo.name}
                            </a>
                            {repo.description && (
                              <div style={{ fontSize: 12, color: '#aaa' }}>{repo.description}</div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 12, color: '#aaa' }}>
                              {repo.language && (
                                <span>
                                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#82ca9d', marginRight: 2 }}></span>
                                  {repo.language}
                                </span>
                              )}
                              <span><Star size={12} /> {repo.stargazers_count}</span>
                              <span><GitBranch size={12} /> {repo.forks_count}</span>
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
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: '#666' }}>
         
          <div>Data comes from GitHub API. Koi galti hoo toh maaf kar dena 😭</div>
        </div>
      </div>
    </div>
  );
};

export default GitAnalyzer;
