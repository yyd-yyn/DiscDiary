const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/DiscDiary.html'));
});

// MongoDB Setup
const mongoUrl = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUrl);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('DiscDiary');
    console.log("✅ MongoDB connected");

    // Pass the db instance to routes
    const entriesRoutes = require('./routes/entries')(db);
    app.use('/api/entries', entriesRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectDB();
