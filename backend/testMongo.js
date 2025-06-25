const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function test() {
  try {
    await client.connect();
    const db = client.db('DiscDiary');
    const entries = await db.collection('entries').find().toArray();
    console.log('Entries in DB:', entries);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

test();
