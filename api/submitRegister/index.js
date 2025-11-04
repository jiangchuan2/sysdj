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
    const { lab, studentId, name, phone, fromScan } = req.body;
    
    // 验证必填字段
    if (!lab || !studentId || !name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必填字段' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('sysdj');
    
    const now = new Date();
    const registerData = {
      lab: lab,
      studentId: studentId,
      name: name,
      phone: phone,
      fromScan: fromScan || false,
      createTime: now,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0]
    };
    
    const result = await db.collection('lab_registers').insertOne(registerData);
    
    await client.close();
    
    res.json({ 
      success: true, 
      _id: result.insertedId,
      message: '登记成功'
    });
  } catch (error) {
    console.error('提交登记失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
