import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
const Dashboard = ({ tasks }) => {
  const data = [
    { name: 'Done', value: tasks.filter(t => t.status === 'Completed').length },
    { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length }
  ];
  const COLORS = ['#10B981', '#F59E0B'];
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
      <h2 className="dark:text-white font-bold mb-4">Task Analysis</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={50} outerRadius={70} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default Dashboard;