// 网络诊断测试页面 - pages/networkTest/networkTest.js
// 用于测试小程序是否能连接到各个 API

Page({
  data: {
    testResults: [],
    testing: false
  },

  onLoad: function() {
    this.runTests();
  },

  runTests: function() {
    this.setData({ 
      testing: true,
      testResults: []
    });

    const tests = [
      {
        name: 'Vercel API (getLabList)',
        url: 'https://sysdj.vercel.app/api/getLabList',
        method: 'GET'
      },
      {
        name: 'GitHub API',
        url: 'https://api.github.com/users/github',
        method: 'GET'
      },
      {
        name: 'Vercel Health Check',
        url: 'https://sysdj.vercel.app/',
        method: 'GET'
      }
    ];

    let completed = 0;
    const results = [];

    tests.forEach((test, index) => {
      wx.request({
        url: test.url,
        method: test.method,
        timeout: 10000,
        success: (res) => {
          results[index] = {
            name: test.name,
            status: '✅ 成功',
            statusCode: res.statusCode,
            time: new Date().toLocaleTimeString()
          };
          completed++;
          this.updateResults(results, completed, tests.length);
        },
        fail: (err) => {
          results[index] = {
            name: test.name,
            status: '❌ 失败',
            error: err.errMsg,
            time: new Date().toLocaleTimeString()
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
  }
});
