Page({
  onScanCode() {
    wx.scanCode({
      success: res => {
        const result = res.result;
        const labName = result.includes('lab=') ? result.split('lab=')[1] : result;
        wx.navigateTo({ url: `/pages/register/register?lab=${encodeURIComponent(labName)}` });
      },
      fail: () => wx.showToast({ title: '扫描失败', icon: 'none' })
    });
  },
  onManualRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },
  onGoToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  }
});
