const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const app = getApp();
const API_URL = app.globalData.apiBaseUrl;

const CACHE_KEYS = {
  LAB_LIST: 'lab_list_cache',
  LAB_LIST_TIMESTAMP: 'lab_list_timestamp'
};

const CACHE_TTL = 5 * 60 * 1000;

const getCache = (key) => {
  try {
    const data = wx.getStorageSync(key);
    const timestamp = wx.getStorageSync(key + '_timestamp');
    if (data && timestamp && Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  } catch (e) {
    console.error('Get cache failed:', e);
  }
  return null;
};

const setCache = (key, data) => {
  try {
    wx.setStorageSync(key, data);
    wx.setStorageSync(key + '_timestamp', Date.now());
  } catch (e) {
    console.error('Set cache failed:', e);
  }
};

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: 15000,
      success(res) {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject({ statusCode: res.statusCode, message: res.data?.error || res.data?.message || 'Request failed' });
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

const getLabList = async (useCache = true) => {
  if (useCache) {
    const cached = getCache(CACHE_KEYS.LAB_LIST);
    if (cached) {
      console.log('Using cached lab list');
      return cached;
    }
  }
  const res = await request({
    url: `${API_URL}/api/getLabList`,
    method: 'GET'
  });
  // Vercel API returns { success: true, data: ['lab1', 'lab2'] }
  const labs = res.data || [];
  const sorted = labs.sort();
  setCache(CACHE_KEYS.LAB_LIST, sorted);
  return sorted;
};

const submitRegister = (data) => {
  return request({
    url: `${API_URL}/api/submitRegister`,
    method: 'POST',
    data: {
      lab: data.lab,
      name: data.name,
      studentId: data.student_id,
      phone: data.phone,
      fromScan: data.from_scan
    }
  });
};

const getRecords = async () => {
  const res = await request({
    url: `${API_URL}/api/getRegisters`,
    method: 'GET'
  });
  return res.data || [];
};

module.exports = {
  formatTime,
  request,
  getLabList,
  submitRegister,
  getRecords,
  getCache,
  setCache
}
