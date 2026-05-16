const app = getApp();
const API_URL = app.globalData.apiBaseUrl;
const ADMIN_PASSWORD = '9850';

Page({
  data: {
    labList: [],
    isAuthorized: false,
    qrCodes: {},
    generatingQR: {}
  },

  onLoad: function () {
    this.checkAdminAuth();
  },

  onShow: function () {
    if (this.data.isAuthorized) {
      this.loadLabList();
    }
  },

  checkAdminAuth: function () {
    wx.showModal({
      title: '管理员验证',
      content: '',
      editable: true,
      placeholderText: '请输入密码',
      success: (res) => {
        if (res.confirm) {
          if (res.content === ADMIN_PASSWORD) {
            this.setData({ isAuthorized: true });
            this.loadLabList();
            wx.showToast({ title: '验证成功', icon: 'success' });
          } else {
            wx.showModal({ title: '验证失败', content: '管理员密码不正确', showCancel: false, success: () => wx.navigateBack() });
          }
        } else {
          wx.navigateBack();
        }
      }
    });
  },

  loadLabList: function () {
    if (!this.data.isAuthorized) return;
    wx.showLoading({ title: '加载中...' });
    wx.request({
      url: `${API_URL}/api/getLabList`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.success) {
          this.setData({ labList: (res.data.data || []).sort() });
        }
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '加载失败', icon: 'error' }); }
    });
  },

  onAddLab: function () {
    if (!this.data.isAuthorized) return;
    wx.showModal({
      title: '添加实验室',
      editable: true,
      placeholderText: '如：物理325',
      success: (res) => {
        if (res.confirm && res.content) {
          const name = res.content.trim();
          if (!name) return wx.showToast({ title: '名称不能为空', icon: 'none' });
          if (this.data.labList.includes(name)) return wx.showToast({ title: '实验室已存在', icon: 'none' });
          wx.request({
            url: `${API_URL}/api/addLab`,
            method: 'POST',
            data: { name },
            success: (r) => {
              if (r.statusCode === 200 && r.data.success) {
                wx.showToast({ title: '添加成功', icon: 'success' });
                this.loadLabList();
              } else {
                wx.showToast({ title: r.data.error || '添加失败', icon: 'none' });
              }
            }
          });
        }
      }
    });
  },

  onDeleteLab: function (e) {
    if (!this.data.isAuthorized) return;
    const labName = e.currentTarget.dataset.lab;
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${labName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${API_URL}/api/deleteLab`,
            method: 'POST',
            data: { name: labName },
            success: (r) => {
              if (r.statusCode === 200 && r.data.success) {
                wx.showToast({ title: '删除成功', icon: 'success' });
                this.loadLabList();
                const qrCodes = this.data.qrCodes;
                delete qrCodes[labName];
                this.setData({ qrCodes });
              }
            }
          });
        }
      }
    });
  },

  onGenerateQR: function (e) {
    if (!this.data.isAuthorized) return;
    const labName = e.currentTarget.dataset.lab;
    const qrCodes = this.data.qrCodes;
    if (qrCodes[labName]) return wx.showToast({ title: '已生成，请勿重复操作', icon: 'none' });
    const registerLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('lab=' + labName)}`;
    qrCodes[labName] = registerLink;
    this.setData({ qrCodes });
    wx.showToast({ title: '二维码已生成', icon: 'success' });
  },

  onPreviewQR: function (e) {
    const labName = e.currentTarget.dataset.lab;
    const qrUrl = this.data.qrCodes[labName];
    if (qrUrl) wx.previewImage({ urls: [qrUrl], current: qrUrl });
  },

  onSaveQR: function (e) {
    if (!this.data.isAuthorized) return;
    const labName = e.currentTarget.dataset.lab;
    const qrUrl = this.data.qrCodes[labName];
    if (!qrUrl) return wx.showToast({ title: '请先生成二维码', icon: 'none' });
    wx.downloadFile({
      url: qrUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
            fail: () => wx.showToast({ title: '保存失败，请检查权限', icon: 'none' })
          });
        }
      }
    });
  }
});
