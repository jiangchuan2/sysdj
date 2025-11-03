const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { labName } = req.body;
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    const result = await db.collection('lab_list').insertOne({ 
      name: labName, 
      createTime: new Date() 
    });
    await client.close();
    
    res.json({ success: true, data: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};