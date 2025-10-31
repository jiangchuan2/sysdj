// Serverless Function: api/checkAdminPassword/index.js
// 这个函数只做密码检查，不涉及数据库，所以不需要 mongodb 依赖

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  try {
    const { password } = req.body;
    const expectedPassword = '123'; // 请替换为您的管理员密码

    if (password === expectedPassword) {
      res.status(200).json({ success: true, message: '密码正确' });
    } else {
      res.status(401).json({ success: false, message: '密码错误' });
    }

  } catch (error) {
    console.error('密码验证失败:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

