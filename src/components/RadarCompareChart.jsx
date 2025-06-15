// src/components/RadarCompareChart.jsx
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
} from "recharts";

const RadarCompareChart = ({ user1, user2 }) => {
  if (!user1?.userInfo?.login || !user2?.userInfo?.login) return null;

  const data = [
    {
      metric: "Stars",
      [user1.userInfo.login]: user1.stats.totalStars,
      [user2.userInfo.login]: user2.stats.totalStars,
    },
    {
      metric: "Forks",
      [user1.userInfo.login]: user1.stats.totalForks,
      [user2.userInfo.login]: user2.stats.totalForks,
    },
    {
      metric: "Watchers",
      [user1.userInfo.login]: user1.stats.totalWatchers,
      [user2.userInfo.login]: user2.stats.totalWatchers,
    },
  ];

  return (
    <div className="bg-neutral-900 rounded-xl p-4">
      <h2 className="text-center text-white mb-4 font-semibold">📊 Radar Stats</h2>
      <RadarChart outerRadius={100} width={350} height={300} data={data}>
        <PolarGrid stroke="#444" />
        <PolarAngleAxis dataKey="metric" stroke="#ccc" />
        <PolarRadiusAxis stroke="#888" />
        <Radar name={user1.userInfo.login} dataKey={user1.userInfo.login} stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
        <Radar name={user2.userInfo.login} dataKey={user2.userInfo.login} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </div>
  );
};

export default RadarCompareChart;
