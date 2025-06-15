import { Star, GitBranch } from 'lucide-react';

const RepoList = ({ repos, themeColor = '#8884d8' }) => (
  <div className="space-y-3">
    {repos.slice(0, 5).map((repo) => (
      <div key={repo.id} className="bg-gray-800 rounded p-3">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-bold text-sm" style={{ color: themeColor }}>
          {repo.name}
        </a>
        {repo.description && <div className="text-xs text-gray-400">{repo.description}</div>}
        <div className="flex gap-4 text-xs text-gray-400 mt-1 items-center">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: themeColor }}></span>
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazers_count}</span>
          <span className="flex items-center gap-1"><GitBranch size={12} /> {repo.forks_count}</span>
        </div>
      </div>
    ))}
  </div>
);

export default RepoList;