const app = getApp();
const API = app.globalData.apiBaseUrl;
const ADMIN_PASSWORD = '9850';

const request = (method, path, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API}${path}`,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      timeout: 15000,
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(res.data || { error: 'Request failed' });
      },
      fail: err => reject(err)
    });
  });
};

const get = path => request('GET', path);
const post = (path, data) => request('POST', path, data);

const getLabList = async () => {
  const res = await get('/api/getLabList');
  return (res.data || []).sort();
};

const submitRegister = data => post('/api/submitRegister', data);

const getRegisters = async () => {
  const res = await get('/api/getRegisters');
  return res.data || [];
};

const addLab = name => post('/api/addLab', { name, password: ADMIN_PASSWORD });

const deleteLab = name => post('/api/deleteLab', { name, password: ADMIN_PASSWORD });

module.exports = { getLabList, submitRegister, getRegisters, addLab, deleteLab };
