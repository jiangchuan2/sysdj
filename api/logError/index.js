const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { type, message, error, stack } = req.body;
    
    console.error(`[${type}] ${message}`);
    if (error) {
      console.error(`Error: ${error}`);
    }
    if (stack) {
      console.error(`Stack: ${stack}`);
    }

    // 保存到 MongoDB
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db('sysdj');
      
      await db.collection('error_logs').insertOne({
        type: type,
        message: message,
        error: error,
        stack: stack,
        timestamp: new Date()
      });
      
      await client.close();
    } catch (dbError) {
      console.error('保存错误日志到数据库失败:', dbError);
    }

    res.json({
      success: true,
      message: '错误日志已记录'
    });
  } catch (error) {
    console.error('记录错误失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
