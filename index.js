// Root index.js for Vercel
module.exports = (req, res) => {
  res.status(200).json({
    message: 'API Server is running',
    endpoints: [
      '/api/getLabList',
      '/api/addLab'
    ]
  });
};