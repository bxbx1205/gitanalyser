const GITHUB_API_BASE = "https://api.github.com/users";

export async function fetchUserData(username) {
  try {
    const userInfo = await fetch(`${GITHUB_API_BASE}/${username}`).then((res) => res.json());

    if (!userInfo.login) {
      throw new Error("User not found");
    }

    const repos = await fetch(`${GITHUB_API_BASE}/${username}/repos?per_page=100`).then((res) => res.json());

    let totalStars = 0;
    let totalForks = 0;
    let totalWatchers = 0;
    const languageStats = {};
    const activityPattern = {};
    let topRepos = [];

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      totalWatchers += repo.watchers_count || 0;

      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }

      const year = new Date(repo.created_at).getFullYear().toString();
      activityPattern[year] = (activityPattern[year] || 0) + 1;
    });

    topRepos = [...repos]
      .filter(r => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5);

    return {
      userInfo,
      stats: {
        totalStars,
        totalForks,
        totalWatchers,
        languageStats,
        activityPattern,
        topRepos,
      },
    };
  } catch (error) {
    console.error("GitHub API Error:", error.message || error);
    throw new Error("GitHub API Error");
  }
}
