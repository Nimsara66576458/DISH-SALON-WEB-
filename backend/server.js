const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io සබඳතාවය - Real-time updates සඳහා
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// ඔබේ MongoDB URL එක (මෙය එලෙසම තබන්න)
const mongoURI = "mongodb+srv://Imesh:Imesh@cluster0.lilyk0q.mongodb.net/";

mongoose.connect(mongoURI)
    .then(() => console.log("Dish Salon Database Connected!"))
    .catch(err => console.log(err));

// දත්ත ආකෘතිය (Schema)
const PostSchema = new mongoose.Schema({
    url: String,
    type: String, // 'image' හෝ 'video'
    caption: String,
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// API පාරවල් (Routes)
app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

app.post('/upload', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    io.emit('newPost', newPost); // මෙතනින් තමයි Real-time update එක වෙන්නේ
    res.status(201).json(newPost);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
