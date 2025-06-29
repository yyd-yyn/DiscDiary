const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

async function connectDB() {
  try {
    const mongoUrl = 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db('DiscDiary');
    console.log("✅ MongoDB connected");

    const entriesRoutes = require('./routes/entries')(db);
    app.use('/api/entries', entriesRoutes);
    app.use(express.static(path.join(__dirname, '../frontend')));
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/DiscDiary.html'));
    });

    // Test route
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Test route works!' });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectDB();