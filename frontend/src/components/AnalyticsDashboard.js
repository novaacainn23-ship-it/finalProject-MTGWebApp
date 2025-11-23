import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

export default function AnalyticsDashboard({ apiUrl, token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${apiUrl}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [apiUrl, token]);

  if (!data) return <p>Loading analytics...</p>;

  const pieData = Object.entries(data.cardFrequency).map(([name, value]) => ({
    name,
    value
  }));

  const barData = data.cardsPerUser;

  const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];

  return (
    <div>
      <h2>📊 Analytics Dashboard</h2>

      <div style={styles.grid}>
        {/* Total Users */}
        <div style={styles.card}>
          <h3>Total Users</h3>
          <p>{data.totalUsers}</p>
        </div>

        {/* Total Cards */}
        <div style={styles.card}>
          <h3>Total Cards in Collections</h3>
          <p>{data.totalCards}</p>
        </div>
      </div>

      {/* -------- Pie Chart -------- */}
      <h3 style={{ marginTop: "30px" }}>Most Collected Cards</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* -------- Bar Chart -------- */}
      <h3 style={{ marginTop: "40px" }}>Cards Per User</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={barData} margin={{ top: 20 }}>
            <XAxis dataKey="username" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4ECDC4" name="Cards Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  card: {
    background: "#2a2a3c",
    padding: "20px",
    borderRadius: "10px",
    color: "#fff",
    width: "200px",
    textAlign: "center",
  },
};
