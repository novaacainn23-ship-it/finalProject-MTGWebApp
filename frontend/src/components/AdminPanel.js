import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanel({ apiUrl, token, onNavigate }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, [apiUrl, token]);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${apiUrl}/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const promoteUser = async (id) => {
    try {
      const res = await axios.post(`${apiUrl}/admin/promote/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // update the user list
      setUsers(prev =>
        prev.map(u => (u._id === id ? { ...u, isAdmin: true } : u))
      );

      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to promote user");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>

      {/* Analytics Navigation */}
      <button
        onClick={() => onNavigate("analytics")}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#00d9c0",
          color: "#1f1f2e",
          cursor: "pointer",
          fontWeight: "bold",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        📊 Open Analytics Dashboard
      </button>

      <ul>
        {users.map((u) => (
          <li key={u._id} style={{ marginBottom: "12px" }}>
            <span style={{ fontWeight: "bold" }}>{u.username}</span>

            {/* Admin Badge */}
            {u.isAdmin && (
              <span style={{ marginLeft: "10px", color: "#00d9c0" }}>
                (Admin)
              </span>
            )}

            {/* Promote Button */}
            {!u.isAdmin && (
              <button
                onClick={() => promoteUser(u._id)}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#4ECDC4",
                  color: "#1f1f2e",
                  cursor: "pointer",
                }}
              >
                Promote
              </button>
            )}

            {/* Delete Button (Disabled for admin users) */}
            {!u.isAdmin && (
              <button
                onClick={() => deleteUser(u._id)}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#ff4d6d",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
