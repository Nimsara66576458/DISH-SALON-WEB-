import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

// Render එකට දැමූ පසු ලැබෙන URL එක මෙතනට දාන්න
const BACKEND_URL = "https://dish-salon-web.onrender.com"; 
const socket = io(BACKEND_URL);

function App() {
  const [posts, setPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ url: '', type: 'image', caption: '' });

  useEffect(() => {
    // මුලින්ම පෝස්ට් ටික ලබා ගැනීම
    axios.get(`${BACKEND_URL}/posts`).then(res => setPosts(res.data));

    // Admin අලුතින් යමක් දැමූ සැණින් එය පෙන්වීම
    socket.on('newPost', (newPost) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    return () => socket.off('newPost');
  }, []);

  const loginAdmin = () => {
    const pass = prompt("මුරපදය ඇතුළත් කරන්න:");
    if (pass === "NIMSARA2009") {
      setIsAdmin(true);
    } else {
      alert("මුරපදය වැරදියි!");
    }
  };

  const handleUpload = async () => {
    if (!formData.url || !formData.caption) return alert("සම්පූර්ණ කරන්න!");
    await axios.post(`${BACKEND_URL}/upload`, formData);
    setFormData({ url: '', type: 'image', caption: '' });
    alert("සාර්ථකයි!");
  };

  return (
    <div className="App">
      <nav className="nav">
        <h1>Dish Salon</h1>
        <button onClick={loginAdmin} className="adm-btn">Admin</button>
      </nav>

      {isAdmin && (
        <div className="admin-panel">
          <h3>Admin Dashboard</h3>
          <input type="text" placeholder="Image/Video URL" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
          <select onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <textarea placeholder="Caption..." value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} />
          <button onClick={handleUpload}>Publish</button>
        </div>
      )}

      <div className="gallery">
        {posts.map(post => (
          <div key={post._id} className="card">
            {post.type === 'image' ? <img src={post.url} alt="Salon" /> : <video src={post.url} controls />}
            <p className="cap">{post.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
