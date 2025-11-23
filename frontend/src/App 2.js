import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [collection, setCollection] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // home, search, collection

  useEffect(() => {
    if (token) fetchCollection();
  }, [token]);

  const fetchCollection = async () => {
    try {
      const res = await axios.get(`${API_URL}/collection`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollection(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setCurrentView('home');
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setCurrentView('home');
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
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
      setCollection(res.data);
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
      setCollection(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to remove card");
    }
  };

  if (!token) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>MTG Library</h1>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {isRegistering ? (
          <button onClick={handleRegister}>Register</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
        <p>
          {isRegistering ? "Already have an account?" : "No account?"}{" "}
          <button onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>MTG Library</h1>
      <button onClick={() => { setToken(''); localStorage.removeItem('token'); setCurrentView('home'); }}>Logout</button>

      {currentView === 'home' && (
        <>
          <div style={{ marginTop: '20px' }}>
            <h2>Actions</h2>
            <button onClick={() => setCurrentView('search')}>Search Cards</button>
            <button onClick={() => setCurrentView('collection')}>View My Collection</button>
          </div>
        </>
      )}

      {currentView === 'search' && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setCurrentView('home')}>Back</button>
          <h2>Search Cards</h2>
          <form onSubmit={handleSearch}>
            <input placeholder="Search cards" value={query} onChange={e => setQuery(e.target.value)} required />
            <button type="submit">Search</button>
          </form>
        </div>
      )}

      {currentView === 'searchResults' && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setCurrentView('home')}>Back</button>
          <h2>Search Results</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
            {searchResults.map(card => (
              <div key={card.id} style={{ margin: '10px', border: '1px solid gray', padding: '5px' }}>
                <p>{card.name}</p>
                {card.image_uris?.small && <img src={card.image_uris.small} alt={card.name} />}
                <button onClick={() => handleAddCard({ cardId: card.id, name: card.name, imageUrl: card.image_uris?.small || '' })}>
                  Add to Collection
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'collection' && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setCurrentView('home')}>Back</button>
          <h2>My Collection</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {collection.map(card => (
              <div key={card.cardId} style={{ margin: '10px', border: '1px solid gray', padding: '5px' }}>
                <p>{card.name}</p>
                {card.imageUrl && <img src={card.imageUrl} alt={card.name} />}
                <button onClick={() => handleRemoveCard(card.cardId)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
