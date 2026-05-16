const app = getApp();
Page({
  data: {
    errorLogs: []
  },
  onLoad: function () {
    this.loadErrorLogs();
  },
  loadErrorLogs: function () {
    wx.showLoading({
      title: '加载中',
    });
    wx.cloud.callFunction({
      name: 'getErrorLogs', // 稍后我们将创建这个云函数
      data: {},
      success: res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          this.setData({
            errorLogs: res.result.data.map(log => ({
              ...log,
              timestamp: new Date(log.timestamp).toLocaleString() // 格式化时间戳
            }))
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
          console.error('获取错误日志失败', res.result);
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        console.error('[云函数] [getErrorLogs] 调用失败', err);
      }
    });
  }
});