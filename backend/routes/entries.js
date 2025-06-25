const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function(db) {
  const router = express.Router();

  // GET entry by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const entry = await db.collection('entries').findOne({ _id: new ObjectId(id) });
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      res.json(entry);
    } catch (err) {
      console.error("❌ Fetch entry error:", err);
      res.status(500).json({ error: 'Error fetching entry' });
    }
  });

  // POST new entry
  router.post('/', async (req, res) => {
    const entry = req.body;
    try {
      await db.collection('entries').insertOne(entry);
      res.status(201).json({ message: '🎉 Saved!' });
    } catch (err) {
      console.error("❌ Save entry error:", err);
      res.status(500).json({ error: 'Error saving entry' });
    }
  });

  // PUT update entry by ID
  router.put('/:id', async (req, res) => {
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
    } catch (err) {
      console.error("❌ Update entry error:", err);
      res.status(500).json({ error: 'Error updating entry' });
    }
  });

  // DELETE entry by ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.collection('entries').deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      res.json({ message: 'Entry deleted' });
    } catch (err) {
      console.error("❌ Delete entry error:", err);
      res.status(500).json({ error: 'Error deleting entry' });
    }
  });

  return router;
};
