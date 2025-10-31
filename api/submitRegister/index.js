// Serverless Function: api/submitRegister/index.js
const { MongoClient } = require('mongodb');

// 从环境变量中获取 MongoDB 连接字符串
const uri = process.env.MONGODB_URI;

// 数据库名称和集合名称
const DB_NAME = 'sysdj_db'; // 请替换为您的数据库名称
const COLLECTION_NAME = 'lab_registers'; // 登记记录集合名

// 导出函数，Vercel 会自动识别为 Serverless Function
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  // 确保连接在函数执行期间保持
  const client = new MongoClient(uri);

  try {
    const registerData = req.body;

    // 表单验证 (保留原有的验证逻辑)
    if (!registerData.lab) {
      res.status(400).json({ success: false, message: '请选择实验室' });
      return;
    }
    if (!registerData.studentId) {
      res.status(400).json({ success: false, message: '请输入学号' });
      return;
    }
    if (!registerData.name) {
      res.status(400).json({ success: false, message: '请输入姓名' });
      return;
    }
    if (!registerData.phone || !/^1[3-9]\d{9}$/.test(registerData.phone)) {
      res.status(400).json({ success: false, message: '请输入正确的手机号码' });
      return;
    }

    const now = new Date();
    const dataToSave = {
      ...registerData,
      createTime: now,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
    };

    await client.connect();
    const database = client.db(DB_NAME);
    const collection = database.collection(COLLECTION_NAME);

    const result = await collection.insertOne(dataToSave);

    res.status(200).json({ success: true, message: '登记成功', _id: result.insertedId });

  } catch (error) {
    console.error('登记失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  } finally {
    await client.close();
  }
};

