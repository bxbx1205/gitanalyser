import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActivityChart = ({ activityPattern }) => {
  if (!activityPattern || Object.keys(activityPattern).length === 0) return null;

  const data = Object.entries(activityPattern)
    .map(([year, count]) => ({
      year,
      repos: count,
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return (
    <div className="bg-neutral-900 rounded-xl p-4">
      <h2 className="text-white text-center mb-4 font-semibold">🕓 Yearly Activity</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="year" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Bar dataKey="repos" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
