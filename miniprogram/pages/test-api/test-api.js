// test-api.js - API测试页面

const app = getApp();
const API_URL = app.globalData.supabaseUrl;
const API_KEY = app.globalData.supabaseKey;

Page({
  data: {
    testResults: [],
    testing: false
  },

  onLoad: function() {
    console.log('API测试页面加载');
    this.runTests();
  },

  runTests: function() {
    this.setData({ 
      testing: true,
      testResults: []
    });

    const tests = [
      {
        name: 'Supabase API 基础访问',
        url: API_URL,
        method: 'GET'
      },
      {
        name: '获取实验室列表',
        url: `${API_URL}/rest/v1/lab_list?select=*&order=name.asc`,
        method: 'GET',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Vercel API 测试',
        url: 'https://sysdj.vercel.app/api/getLabList',
        method: 'GET'
      },
      {
        name: 'GitHub API 测试',
        url: 'https://api.github.com/users/github',
        method: 'GET'
      }
    ];

    let completed = 0;
    const results = [];

    tests.forEach((test, index) => {
      console.log(`开始测试: ${test.name}`);
      
      wx.request({
        url: test.url,
        method: test.method,
        headers: test.headers || {
          'content-type': 'application/json'
        },
        timeout: 10000,
        success: (res) => {
          console.log(`${test.name} 成功, 状态码:`, res.statusCode);
          results[index] = {
            name: test.name,
            status: '✅ 成功',
            statusCode: res.statusCode,
            response: res.data
          };
          completed++;
          this.updateResults(results, completed, tests.length);
        },
        fail: (err) => {
          console.error(`${test.name} 失败:`, err);
          results[index] = {
            name: test.name,
            status: '❌ 失败',
            error: err.errMsg
          };
          completed++;
          this.updateResults(results, completed, tests.length);
        }
      });
    });
  },

  updateResults: function(results, completed, total) {
    this.setData({ testResults: results });
    
    if (completed === total) {
      this.setData({ testing: false });
      
      // 检查是否全部成功
      const allSuccess = results.every(r => r.status.includes('✅'));
      if (allSuccess) {
        wx.showToast({
          title: '所有测试通过！',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '部分测试失败',
          icon: 'none'
        });
      }
    }
  },

  // 重新测试
  retryTests: function() {
    this.runTests();
  }
});