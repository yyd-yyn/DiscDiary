require('dotenv').config();

const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb'); 
const bodyParser = require('body-parser'); 
const { ObjectId } = require("mongodb");
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

// GET all entries
app.get('/api/entries', async (req, res) => {
  try {
    const entries = await db.collection('entries').find().toArray();
    res.json(entries);
  } catch (err) {
    console.error("❌ Fehler beim Abrufen:", err);
    res.status(500).json({ error: 'Fehler beim Abrufen' });
  }
});

// GET single entry by ID
app.get('/api/entries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await db.collection('entries').findOne({ _id: new ObjectId(id) });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen eines Eintrags:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen des Eintrags' });
  }
});

// POST new entry
app.post('/api/entries', async (req, res) => {
  const entry = req.body;
  try {
    await db.collection('entries').insertOne(entry);
    res.status(201).json({ message: '🎉 Gespeichert!' });
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// PUT update entry by id
app.put('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  const updatedEntry = req.body;

  delete updatedEntry._id;

  try {
    const result = await db.collection('entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedEntry }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry updated' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
});

// DELETE entry by id
app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.collection('entries').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error during delete' });
  }
});
