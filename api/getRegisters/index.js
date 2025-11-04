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
    const { lab, date } = req.query;
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    
    let query = {};
    if (lab) {
      query.lab = lab;
    }
    if (date) {
      query.date = date;
    }
    
    const registers = await db.collection('lab_registers')
      .find(query)
      .sort({ createTime: -1 })
      .toArray();
    
    await client.close();
    
    res.json({ 
      success: true, 
      data: registers,
      count: registers.length
    });
  } catch (error) {
    console.error('获取登记记录失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
