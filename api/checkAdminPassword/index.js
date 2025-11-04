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
    const { password } = req.body;
    const adminPassword = '9850'; // 请在这里修改您的管理员密码
    
    if (password === adminPassword) {
      res.json({
        success: true,
        message: '管理员验证成功'
      });
    } else {
      res.status(401).json({
        success: false,
        message: '管理员密码错误'
      });
    }
  } catch (error) {
    console.error('检查管理员密码失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
