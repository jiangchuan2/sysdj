// Serverless Function: api/generateQR/index.js
const { MongoClient } = require('mongodb');
const axios = require('axios');

const uri = process.env.MONGODB_URI;
const DB_NAME = 'sysdj_db';
const LAB_COLLECTION = 'lab_list';

// 从环境变量获取 AppID 和 AppSecret
const APPID = process.env.WECHAT_APPID;
const APPSECRET = process.env.WECHAT_APPSECRET;

// 1. 获取 Access Token
async function getAccessToken() {
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`;
    const response = await axios.get(tokenUrl);
    
    if (response.data.errcode) {
        throw new Error(`获取 Access Token 失败: ${response.data.errmsg}`);
    }
    return response.data.access_token;
}

// 2. 生成小程序码
async function generateWxaCode(accessToken, labName) {
    const codeUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
    
    // scene 参数是用户扫码后，小程序可以获取到的参数
    const scene = `lab=${encodeURIComponent(labName)}`;
    
    const response = await axios.post(codeUrl, {
        scene: scene,
        page: 'pages/register/register', // 扫码后跳转的页面
        width: 430
    }, {
        responseType: 'arraybuffer' // 关键：返回的是二进制数据
    });

    // 检查是否是错误信息
    if (response.headers['content-type'].includes('application/json')) {
        const errorData = JSON.parse(Buffer.from(response.data).toString());
        if (errorData.errcode) {
            throw new Error(`生成小程序码失败: ${errorData.errmsg}`);
        }
    }

    return response.data; // 返回 Buffer
}

// 3. 上传到云存储 (需要一个独立的存储服务，这里使用一个占位符)
async function uploadToStorage(buffer, labName) {
    // !!! Vercel 环境下，您需要使用一个独立的存储服务，如 AWS S3, Cloudinary, 或腾讯云COS !!!
    // 为了简化，我将返回一个 Base64 字符串，让前端自己处理
    // **注意：您需要将此部分替换为您实际的存储服务上传逻辑**
    const base64Image = Buffer.from(buffer).toString('base64');
    
    // 假设我们直接返回 Base64，前端用 wx.downloadFile 下载
    return {
        fileID: `base64://${labName}-${Date.now()}`,
        base64: base64Image
    };
}


module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
        return;
    }

    if (!APPID || !APPSECRET) {
        res.status(500).json({ success: false, message: '服务器未配置 WECHAT_APPID 或 WECHAT_APPSECRET 环境变量' });
        return;
    }
    
    const client = new MongoClient(uri);

    try {
        const { labName } = req.body;
        if (!labName) {
            res.status(400).json({ success: false, message: '实验室名称不能为空' });
            return;
        }

        // 1. 获取 Access Token
        const accessToken = await getAccessToken();
        
        // 2. 生成小程序码 (Buffer)
        const codeBuffer = await generateWxaCode(accessToken, labName);
        
        // 3. 上传到存储服务 (!!! 占位符 !!!)
        const uploadResult = await uploadToStorage(codeBuffer, labName); 
        
        // 4. 保存 FileID 到 MongoDB
        await client.connect();
        const database = client.db(DB_NAME);
        const labCollection = database.collection(LAB_COLLECTION);
        
        await labCollection.updateOne(
            { name: labName },
            { $set: { qrCodeFileID: uploadResult.fileID, qrCodeUpdateTime: new Date() } }
        );

        res.status(200).json({
            success: true,
            fileID: uploadResult.fileID,
            labName: labName,
            base64: uploadResult.base64, // 临时返回 Base64 供前端测试
            message: '二维码生成成功'
        });

    } catch (error) {
        console.error('二维码生成失败:', error);
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    } finally {
        await client.close();
    }
};

