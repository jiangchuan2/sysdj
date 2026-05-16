const util = require('../../utils/util.js');
const ADMIN_PASSWORD = '9850';

Page({
  data: {
    records: [],
    isAuthorized: false,
    loading: false,
    labFilterList: ['全部'],
    labFilterIndex: 0,
    dateFilter: '',
    studentIdFilter: '',
    startTimeFilter: '',
    endTimeFilter: '',
    totalCount: 0,
    todayCount: 0,
    filteredCount: 0,
    allRecords: []
  },

  onLoad: function () {
    this.checkAdminAuth();
  },

  onShow: function () {
    if (this.data.isAuthorized) {
      this.loadRecords();
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
            this.loadRecords();
            this.loadLabFilterList();
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

  loadLabFilterList: async function () {
    try {
      const labs = await util.getLabList();
      this.setData({ labFilterList: ['全部', ...labs] });
    } catch (err) {
      console.error('加载实验室列表失败:', err);
    }
  },

  loadRecords: async function () {
    if (!this.data.isAuthorized) return;
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });
    try {
      const data = await util.getRecords();
      const records = (data || []).map(item => ({
        _id: item._id || item.id,
        lab: item.lab,
        name: item.name,
        studentId: item.studentId,
        phone: item.phone,
        date: item.date,
        time: item.time,
        fromScan: item.fromScan || item.from_scan || false
      }));
      this.setData({
        records: records,
        allRecords: records,
        totalCount: records.length
      });
      this.calculateTodayCount(records);
      wx.hideLoading();
      this.setData({ loading: false });
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('加载失败:', err);
      wx.showToast({ title: '加载数据失败', icon: 'error' });
    }
  },

  calculateTodayCount: function (records) {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = records.filter(r => r.date === today).length;
    this.setData({ todayCount });
  },

  onRefresh: function () {
    this.loadRecords();
  },

  onLabFilter: function (e) {
    const index = parseInt(e.detail.value);
    this.setData({ labFilterIndex: index });
    this.filterRecords();
  },

  onDateFilter: function (e) {
    this.setData({ dateFilter: e.detail.value });
    this.filterRecords();
  },

  onStudentIdFilter: function (e) {
    this.setData({ studentIdFilter: e.detail.value });
    this.filterRecords();
  },

  onStartTimeFilter: function (e) {
    this.setData({ startTimeFilter: e.detail.value });
    this.filterRecords();
  },

  onEndTimeFilter: function (e) {
    this.setData({ endTimeFilter: e.detail.value });
    this.filterRecords();
  },

  onClearTimeFilter: function () {
    this.setData({ startTimeFilter: '', endTimeFilter: '' });
    this.filterRecords();
  },

  filterRecords: function () {
    const allRecords = this.data.allRecords;
    const lab = this.data.labFilterList[this.data.labFilterIndex];
    const { dateFilter, studentIdFilter, startTimeFilter, endTimeFilter } = this.data;
    let filtered = allRecords;

    if (lab !== '全部') {
      filtered = filtered.filter(r => r.lab === lab);
    }
    if (dateFilter) {
      filtered = filtered.filter(r => r.date === dateFilter);
    }
    if (studentIdFilter) {
      filtered = filtered.filter(r => r.studentId.includes(studentIdFilter));
    }
    if (startTimeFilter && endTimeFilter) {
      filtered = filtered.filter(r => r.time >= startTimeFilter && r.time <= endTimeFilter);
    }

    this.setData({ records: filtered, filteredCount: filtered.length });
  },

  onExportData: function () {
    const records = this.data.records;
    if (records.length === 0) {
      wx.showToast({ title: '没有数据可导出', icon: 'none' });
      return;
    }
    let csv = '实验室,姓名,学号,电话,日期,时间,登记方式\n';
    records.forEach(r => {
      csv += `${r.lab},${r.name},${r.studentId},${r.phone},${r.date},${r.time},${r.fromScan ? '扫码' : '手动'}\n`;
    });
    wx.setClipboardData({
      data: csv,
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
    });
  }
});
