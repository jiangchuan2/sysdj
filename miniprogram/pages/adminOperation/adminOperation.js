const app = getApp();

Page({
  data: {
    loggedIn: false, // 初始状态为未登录
    password: '',
    error: ''
  },

  onLoad: function (options) {
    // 页面加载时检查登录状态，如果已登录则直接显示功能列表
    // 这里可以根据实际需求，例如从本地缓存或全局状态中获取登录信息
    // 暂时默认未登录，需要输入密码
  },

  onPasswordInput: function (e) {
    this.setData({
      password: e.detail.value,
      error: '' // 清除之前的错误信息
    });
  },

  onLogin: function () {
    const { password } = this.data;
    if (!password) {
      this.setData({
        error: '密码不能为空'
      });
      return;
    }

    wx.cloud.callFunction({
      name: 'checkAdminPassword',
      data: {
        password: password
      },
      success: res => {
        if (res.result && res.result.success) {
          this.setData({
            loggedIn: true,
            error: ''
          });
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        } else {
          this.setData({
            error: res.result.message || '密码错误'
          });
          wx.showToast({
            title: '密码错误',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('调用云函数失败', err);
        this.setData({
          error: '登录失败，请稍后再试'
        });
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  navigateToErrorLogs: function () {
    if (this.data.loggedIn) {
      console.log("Navigate to Error Logs");
      wx.navigateTo({
        url: '/pages/errorLogs/errorLogs'
      });
    } else {
      this.setData({
        error: '请先登录'
      });
    }
  },

  navigateToReservationManagement: function () {
    if (this.data.loggedIn) {
      console.log("Navigate to Reservation Management");
      wx.showToast({
        title: '管理实验室预约功能待开发',
        icon: 'none'
      });
    } else {
      this.setData({
        error: '请先登录'
      });
    }
  },

  navigateToUserManagement: function () {
    if (this.data.loggedIn) {
      console.log("Navigate to User Management");
      wx.showToast({
        title: '用户管理功能待开发',
        icon: 'none'
      });
    } else {
      this.setData({
        error: '请先登录'
      });
    }
  }
});

