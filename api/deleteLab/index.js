const { MongoClient, ObjectId } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
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
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: '实验室名称不能为空' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    
    const result = await db.collection('lab_list').deleteOne({ name: name });
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '实验室不存在' 
      });
    }
    
    res.json({ 
      success: true, 
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除实验室失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
