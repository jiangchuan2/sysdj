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
    const { name, password } = req.body;
    
    // 验证密码
    const adminPassword = '9850';
    if (password !== adminPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '密码错误' 
      });
    }
    
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '实验室名称不能为空' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    
    // 检查是否已存在
    const existing = await db.collection('lab_list').findOne({ name: name });
    if (existing) {
      await client.close();
      return res.status(400).json({ 
        success: false, 
        message: '实验室已存在' 
      });
    }
    
    const result = await db.collection('lab_list').insertOne({ 
      name: name, 
      createTime: new Date() 
    });
    
    await client.close();
    
    res.json({ 
      success: true, 
      data: result.insertedId,
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加实验室失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
