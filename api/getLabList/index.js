// api/getLabList/index.js
const { MongoClient } = require('mongodb');

// 从 Vercel 环境变量中获取 MongoDB 连接字符串
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // 允许跨域访问（小程序请求需要）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理 OPTIONS 请求（预检请求）
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
        return;
    }

    try {
        await client.connect();
        const database = client.db('sysdj'); // 替换为您的数据库名称
        const labListCollection = database.collection('lab_list'); // 实验室列表集合名

        // 查询所有实验室，并按名称排序
        const labs = await labListCollection.find({})
            .sort({ name: 1 })
            .toArray();

        // 返回数据格式与原云函数保持一致
        res.status(200).json({
            success: true,
            data: labs,
            message: '实验室列表获取成功'
        });

    } catch (error) {
        console.error('获取实验室列表失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误，获取实验室列表失败',
            error: error.message
        });
    } finally {
        await client.close();
    }
};