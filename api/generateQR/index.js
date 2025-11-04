const QRCode = require('qrcode');

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
    const { labName } = req.body;
    
    if (!labName) {
      return res.status(400).json({ 
        success: false, 
        error: '实验室名称不能为空' 
      });
    }

    // 构建小程序的跳转路径
    const path = `pages/register/register?lab=${encodeURIComponent(labName)}`;
    
    // 生成二维码数据 URL
    const qrCodeDataUrl = await QRCode.toDataURL(path, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 430
    });
    
    res.json({ 
      success: true, 
      qrCode: qrCodeDataUrl,
      labName: labName,
      message: '二维码生成成功'
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: '生成二维码失败'
    });
  }
};
