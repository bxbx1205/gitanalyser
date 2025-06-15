
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57", "#a4de6c"];

const LanguageChart = ({ languageStats }) => {
  if (!languageStats || Object.keys(languageStats).length === 0) return null;

  const data = Object.entries(languageStats).map(([language, count]) => ({
    name: language,
    value: count,
  }));

  return (
    <div className="bg-neutral-900 rounded-xl p-4">
      <h2 className="text-white text-center mb-4 font-semibold">🧠 Language Spread</h2>
      <PieChart width={320} height={250}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default LanguageChart;
