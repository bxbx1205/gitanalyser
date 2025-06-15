const UserProfileCard = ({ userData, title }) => (
  <div className="bg-gray-900 p-4 rounded shadow">
    <div className="flex gap-4 items-center">
      <img src={userData.userInfo.avatar_url} alt="avatar" className="w-16 h-16 rounded-full" />
      <div>
        <h2 className="text-lg font-bold">{userData.userInfo.login}</h2>
        <p className="text-sm text-gray-400">{userData.userInfo.bio || 'No bio, mysterious coder 🥷'}</p>
      </div>
    </div>
    <div className="mt-3 text-sm text-gray-300">
      <p>Followers: {userData.userInfo.followers}</p>
      <p>Following: {userData.userInfo.following}</p>
      <p>Public Repos: {userData.userInfo.public_repos}</p>
    </div>
  </div>
);

export default UserProfileCard;