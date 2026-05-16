Page({
  data: {},

  onLoad: function () {
    console.log('Index page loaded');
  },

  onScanCode: function () {
    wx.scanCode({
      success: (res) => {
        console.log('Scan result:', res);
        const result = res.result;
        if (result.includes('lab=')) {
          const labName = result.replace('lab=', '');
          wx.navigateTo({ url: `/pages/register/register?lab=${encodeURIComponent(labName)}` });
        } else {
          wx.showModal({
            title: '确认实验室',
            content: `扫描到内容：${result}\n是否将此作为实验室名称？`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.navigateTo({ url: `/pages/register/register?lab=${encodeURIComponent(result)}` });
              }
            }
          });
        }
      },
      fail: (err) => {
        console.error('Scan failed:', err);
        wx.showToast({ title: '扫描失败，请重试', icon: 'none' });
      }
    });
  },

  onManualRegister: function () {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  onGoToQRCode: function () {
    wx.navigateTo({ url: '/pages/qrcode/qrcode' });
  },

  onGoToAdmin: function () {
    wx.navigateTo({ url: '/pages/admin/admin' });
  }
});
