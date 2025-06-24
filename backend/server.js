require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb'); 
const bodyParser = require('body-parser'); 

const app = express();
const PORT = 3000;

app.use(bodyParser.json()); 

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB
const mongoUrl = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUrl);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('DiscDiary');
    console.log("✅ MongoDB verbunden");

    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Fehler beim Verbinden zur MongoDB:", err);
  }
}

connectDB();

// GET entries
app.get('/entries', async (req, res) => {
  try {
    const entries = await db.collection('entries').find().toArray();
    res.json(entries);
  } catch (err) {
    console.error("❌ Fehler beim Abrufen:", err);
    res.status(500).json({ error: 'Fehler beim Abrufen' });
  }
});

// POST entry
app.post('/entries', async (req, res) => {
  const entry = req.body;
  try {
    await db.collection('entries').insertOne(entry);
    res.status(201).json({ message: '🎉 Gespeichert!' });
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});
