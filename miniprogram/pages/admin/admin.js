const util = require('../../utils/util.js');
const ADMIN_PASSWORD = '9850';

Page({
  data: {
    authorized: false,
    password: '',
    labs: [],
    records: [],
    totalCount: 0,
    todayCount: 0
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onLogin() {
    if (this.data.password === ADMIN_PASSWORD) {
      this.setData({ authorized: true });
      this.loadData();
      wx.showToast({ title: '验证成功', icon: 'success' });
    } else {
      wx.showToast({ title: '密码错误', icon: 'none' });
    }
  },

  async loadData() {
    await Promise.all([this.loadLabs(), this.loadRecords()]);
  },

  async loadLabs() {
    try {
      const labs = await util.getLabList();
      this.setData({ labs });
    } catch (e) {
      console.error('Load labs failed:', e);
    }
  },

  async loadRecords() {
    try {
      const records = await util.getRegisters();
      const today = new Date().toISOString().split('T')[0];
      this.setData({
        records,
        totalCount: records.length,
        todayCount: records.filter(r => r.date === today).length
      });
    } catch (e) {
      console.error('Load records failed:', e);
    }
  },

  onAddLab() {
    wx.showModal({
      title: '添加实验室',
      editable: true,
      placeholderText: '输入实验室名称',
      success: async res => {
        if (res.confirm && res.content) {
          const name = res.content.trim();
          if (!name) return;
          try {
            await util.addLab(name);
            wx.showToast({ title: '添加成功', icon: 'success' });
            this.loadLabs();
          } catch (e) {
            wx.showToast({ title: e.error || '添加失败', icon: 'none' });
          }
        }
      }
    });
  },

  onDeleteLab(e) {
    const lab = e.currentTarget.dataset.lab;
    wx.showModal({
      title: '确认删除',
      content: `确定删除"${lab}"吗？`,
      success: async res => {
        if (res.confirm) {
          try {
            await util.deleteLab(lab);
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadLabs();
          } catch (e) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onRefresh() {
    this.loadData();
    wx.showToast({ title: '已刷新', icon: 'success' });
  }
});
