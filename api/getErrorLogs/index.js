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
    
    // 获取最近 100 条错误日志
    const logs = await db.collection('error_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    await client.close();
    
    res.json({ 
      success: true, 
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('获取错误日志失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
