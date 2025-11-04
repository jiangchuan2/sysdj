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
    const { labName, labId } = req.body;
    
    if (!labName && !labId) {
      return res.status(400).json({ 
        success: false, 
        error: '实验室名称或 ID 不能为空' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    
    let deleteQuery = {};
    if (labId) {
      deleteQuery = { _id: new ObjectId(labId) };
    } else {
      deleteQuery = { name: labName };
    }
    
    const result = await db.collection('lab_list').deleteOne(deleteQuery);
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: '实验室不存在' 
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
