import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminPanel from './components/AdminPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const API_URL = "http://localhost:5001/api"; // backend URL

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null); // { username, isAdmin, collection }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // home, search, searchResults, collection, admin

  // Fetch current user info on token change
  useEffect(() => {
    if (token) fetchCurrentUser();
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
      alert("Session expired, please log in again.");
      handleLogout();
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUsername('');
      setPassword('');
      setCurrentView('home');
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUsername('');
      setPassword('');
      setCurrentView('home');
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    setCurrentView('home');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.data);
      setCurrentView('searchResults');
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  };

  const handleAddCard = async (card) => {
    try {
      const res = await axios.post(`${API_URL}/collection/add`, card, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, collection: res.data }));
    } catch (err) {
      console.error(err);
      alert("Failed to add card");
    }
  };

  const handleRemoveCard = async (cardId) => {
    try {
      const res = await axios.post(`${API_URL}/collection/remove`, { cardId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, collection: res.data }));
    } catch (err) {
      console.error(err);
      alert("Failed to remove card");
    }
  };

  // Render login/register if not logged in
  if (!token) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>MTG Library</h1>
        <div style={styles.authBox}>
          <input style={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button style={styles.button} onClick={isRegistering ? handleRegister : handleLogin}>
            {isRegistering ? "Register" : "Login"}
          </button>
          <p style={styles.switchText}>
            {isRegistering ? "Already have an account?" : "No account?"}{" "}
            <button style={styles.linkButton} onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Logged-in UI
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MTG Library</h1>
      <div style={styles.topBar}>
        <span style={{ marginRight: '10px' }}>Hello, {user?.username}</span>
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>

{user?.isAdmin && currentView === "analytics" && (
  <div style={styles.contentBox}>
    <button
      style={styles.backButton}
      onClick={() => setCurrentView("admin")}
    >
      ⬅ Back
    </button>
    <AnalyticsDashboard apiUrl={API_URL} token={token} />
  </div>
)}

      {/* Admin Panel View */}
      {user?.isAdmin && currentView === 'admin' && (
        <div style={styles.contentBox}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentView('home')}
          >
            ⬅ Back
          </button>
          <AdminPanel 
            apiUrl={API_URL} 
            token={token} 
            onNavigate={setCurrentView}
          />
        </div>
      )}

      {/* Home View */}
      {currentView === 'home' && (
        <div style={styles.homeBox}>
          <button
            style={styles.mainButton}
            onClick={() => setCurrentView('search')}
          >
            Search Cards
          </button>
          <button
            style={styles.mainButton}
            onClick={() => setCurrentView('collection')}
          >
            View My Collection
          </button>
          {user?.isAdmin && (
            <button
              style={styles.mainButton}
              onClick={() => setCurrentView('admin')}
            >
              Admin Panel
            </button>
          )}
        </div>
      )}


      {/* Search View */}
      {currentView === 'search' && (
        <div style={styles.contentBox}>
          <button style={styles.backButton} onClick={() => setCurrentView('home')}>⬅ Back</button>
          <h2>Search Cards</h2>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input style={styles.input} placeholder="Search cards" value={query} onChange={e => setQuery(e.target.value)} required />
            <button style={styles.button} type="submit">Search</button>
          </form>
        </div>
      )}

      {/* Search Results */}
      {currentView === 'searchResults' && (
        <div style={styles.contentBox}>
          <button style={styles.backButton} onClick={() => setCurrentView('search')}>⬅ Back</button>
          <h2>Search Results</h2>
          <div style={styles.cardGrid}>
            {searchResults.map(card => (
              <div key={card.id} style={styles.card}>
                <p style={styles.cardName}>{card.name}</p>
                {card.image_uris?.small && <img style={styles.cardImage} src={card.image_uris.small} alt={card.name} />}
                <button style={styles.cardButton} onClick={() => handleAddCard({ cardId: card.id, name: card.name, imageUrl: card.image_uris?.small || '' })}>
                  Add to Collection
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection View */}
      {currentView === 'collection' && (
        <div style={styles.contentBox}>
          <button style={styles.backButton} onClick={() => setCurrentView('home')}>⬅ Back</button>
          <h2>My Collection</h2>
          <div style={styles.cardGrid}>
            {user?.collection?.map(card => (
              <div key={card.cardId} style={styles.card}>
                <p style={styles.cardName}>{card.name}</p>
                {card.imageUrl && <img style={styles.cardImage} src={card.imageUrl} alt={card.name} />}
                <button style={styles.cardButton} onClick={() => handleRemoveCard(card.cardId)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// Styles
const styles = {
  container: { fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center', background: '#1f1f2e', minHeight: '100vh', color: '#f0f0f0' },
  title: { fontSize: '2.5em', marginBottom: '20px', color: '#00fff0' },
  authBox: { background: '#2a2a3c', padding: '20px', borderRadius: '10px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' },
  input: { padding: '10px', margin: '5px', borderRadius: '5px', border: '1px solid #444', width: '200px', background: '#3a3a4f', color: '#fff' },
  button: { padding: '10px 20px', margin: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#00d9c0', color: '#1f1f2e', cursor: 'pointer', fontWeight: 'bold' },
  linkButton: { background: 'none', border: 'none', color: '#ffb347', cursor: 'pointer', textDecoration: 'underline' },
  switchText: { marginTop: '10px' },
  topBar: { marginBottom: '20px' },
  logoutButton: { padding: '5px 10px', borderRadius: '5px', border: 'none', backgroundColor: '#ff4d6d', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  homeBox: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' },
  mainButton: { padding: '15px 30px', fontSize: '1em', borderRadius: '10px', border: 'none', backgroundColor: '#ffb347', color: '#1f1f2e', cursor: 'pointer', fontWeight: 'bold' },
  contentBox: { textAlign: 'center' },
  backButton: { marginBottom: '10px', padding: '5px 10px', borderRadius: '5px', border: 'none', backgroundColor: '#ff7f50', color: '#1f1f2e', cursor: 'pointer', fontWeight: 'bold' },
  searchForm: { marginBottom: '20px' },
  cardGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' },
  card: { width: '150px', background: '#2a2a3c', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(128,0,128,0.5)', textAlign: 'center' },
  cardName: { fontWeight: 'bold', marginBottom: '10px', color: '#ffb347' },
  cardImage: { width: '100%', borderRadius: '5px', marginBottom: '10px' },
  cardButton: { padding: '5px 10px', borderRadius: '5px', border: 'none', backgroundColor: '#00d9c0', color: '#1f1f2e', cursor: 'pointer', fontWeight: 'bold' },
};

export default App;
