// api/addLab/index.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
        return;
    }

    const { labName } = req.body; // 假设前端传递 labName

    if (!labName) {
        res.status(400).json({ success: false, message: '缺少实验室名称' });
        return;
    }

    try {
        await client.connect();
        const database = client.db('sysdj'); // 替换为您的数据库名称
        const labListCollection = database.collection('lab_list');

        // 检查是否已存在
        const existingLab = await labListCollection.findOne({ name: labName });
        if (existingLab) {
            res.status(400).json({ success: false, message: '实验室已存在' });
            return;
        }

        // 插入新实验室
        const result = await labListCollection.insertOne({
            name: labName,
            createTime: new Date()
        });

        res.status(200).json({
            success: true,
            data: result.insertedId,
            message: '实验室添加成功'
        });

    } catch (error) {
        console.error('添加实验室失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误，添加实验室失败',
            error: error.message
        });
    } finally {
        await client.close();
    }
};