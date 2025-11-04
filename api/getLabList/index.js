const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    
    const labs = await db.collection('lab_list')
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    await client.close();
    
    res.json({ 
      success: true, 
      data: labs.map(lab => lab.name) 
    });
  } catch (error) {
    console.error('获取实验室列表失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
