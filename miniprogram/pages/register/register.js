const util = require('../../utils/util.js');

Page({
  data: {
    labs: [],
    labIndex: -1,
    name: '',
    studentId: '',
    phone: '',
    loading: false
  },

  onLoad(options) {
    this.loadLabs();
    if (options.lab) {
      const labName = decodeURIComponent(options.lab);
      const idx = this.data.labs.indexOf(labName);
      if (idx >= 0) this.setData({ labIndex: idx });
    }
  },

  async loadLabs() {
    try {
      const labs = await util.getLabList();
      this.setData({ labs });
      // If we had a scanned lab, set it now
      if (this.data.labIndex === -1 && this.options && this.options.lab) {
        const labName = decodeURIComponent(this.options.lab);
        const idx = labs.indexOf(labName);
        if (idx >= 0) this.setData({ labIndex: idx });
      }
    } catch (e) {
      wx.showToast({ title: '加载实验室失败', icon: 'none' });
    }
  },

  onLabChange(e) {
    this.setData({ labIndex: parseInt(e.detail.value) });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async onSubmit() {
    const { labIndex, labs, name, studentId, phone } = this.data;
    if (labIndex < 0) return wx.showToast({ title: '请选择实验室', icon: 'none' });
    if (!name) return wx.showToast({ title: '请输入姓名', icon: 'none' });
    if (!studentId) return wx.showToast({ title: '请输入学号', icon: 'none' });
    if (!phone) return wx.showToast({ title: '请输入电话', icon: 'none' });

    this.setData({ loading: true });
    try {
      await util.submitRegister({
        lab: labs[labIndex],
        name,
        studentId,
        phone,
        fromScan: !!this.options.lab
      });
      wx.showToast({ title: '登记成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
    this.setData({ loading: false });
  }
});
