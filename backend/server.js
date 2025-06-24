require('dotenv').config();

app.use(express.static('public'));

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000; // CHANGE PORT HERE IF NEEDED

app.use(cors());
app.use(express.json());

// MongoDB
const mongoUrl = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
  try {
    await client.connect();
    db = client.db('DiscDiary');
    console.log("MongoDB verbunden");
  } catch (err) {
    console.error("Fehler beim Verbinden zur MongoDB:", err);
  }
}

connectDB();

// get entries
app.get('/entries', async (req, res) => {
  try {
    const entries = await db.collection('entries').find().toArray();
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Einträge' });
  }
});

// save entry to DB
app.post('/entries', async (req, res) => {
  const entry = req.body;
  try {
    await db.collection('entries').insertOne(entry);
    res.status(201).json({ message: '🎉 Gespeichert!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server läuft auf http://localhost:${port}`);
});
