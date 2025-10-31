// Serverless Function: api/getRegisterList/index.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const DB_NAME = 'sysdj_db';
const REGISTER_COLLECTION = 'lab_registers';
const LAB_COLLECTION = 'lab_list';

module.exports = async (req, res) => {
  // 仅允许 GET 请求
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  // 假设管理员密码通过 Header 或 Query 传递，这里仅作简单示例
  const adminPassword = req.query.password || req.headers['x-admin-password'];
  const expectedPassword = '123'; // 替换为您的管理员密码

  if (adminPassword !== expectedPassword) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(DB_NAME);
    const registerCollection = database.collection(REGISTER_COLLECTION);
    const labCollection = database.collection(LAB_COLLECTION);

    // 获取所有登记记录
    const registerList = await registerCollection.find({}).sort({ createTime: -1 }).toArray();
    
    // 获取实验室列表 (用于前端的下拉选择等)
    const labList = await labCollection.find({}).project({ name: 1, _id: 0 }).toArray();

    res.status(200).json({
      success: true,
      registerList: registerList,
      labList: labList.map(lab => lab.name)
    });

  } catch (error) {
    console.error('获取登记列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  } finally {
    await client.close();
  }
};

