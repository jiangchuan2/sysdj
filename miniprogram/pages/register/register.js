const util = require('../../utils/util.js');

Page({
  data: {
    labs: [],
    labIndex: -1,
    name: '',
    studentId: '',
    phone: '',
    loading: false,
    fromScan: false,
    scannedLab: ''
  },

  onLoad: function (options) {
    console.log('register onLoad, options:', options);
    
    if (options.lab) {
      const labName = decodeURIComponent(options.lab);
      console.log('从扫码进入，实验室:', labName);
      this.setData({
        scannedLab: labName,
        fromScan: true
      });
    }
    
    this.loadLabList();
  },

  onShow: function () {
    console.log('register onShow');
    this.loadLabList();
  },

  loadLabList: async function () {
    console.log('开始加载实验室列表...');
    wx.showLoading({ title: '加载实验室中...' });

    try {
      const labs = await util.getLabList();
      console.log('处理后的实验室列表:', labs);
      
      this.setData({ labs: labs });
      wx.hideLoading();
      
      if (this.data.fromScan && this.data.scannedLab) {
        const index = labs.indexOf(this.data.scannedLab);
        console.log('扫码实验室索引:', index);
        if (index >= 0) {
          this.setData({ labIndex: index });
        } else {
          wx.showToast({ 
            title: '实验室不存在，请重新选择', 
            icon: 'none' 
          });
          this.setData({ scannedLab: '', fromScan: false });
        }
      }
    } catch (err) {
      wx.hideLoading();
      console.error('加载实验室列表失败:', err);
      wx.showToast({ title: '网络连接失败', icon: 'error' });
    }
  },

  onLabChange: function (e) {
    const index = parseInt(e.detail.value);
    console.log('选择实验室索引:', index, '实验室名称:', this.data.labs[index]);
    this.setData({ 
      labIndex: index,
      fromScan: false,
      scannedLab: ''
    });
  },

  onInputName: function (e) {
    this.setData({ name: e.detail.value });
  },

  onInputStudentId: function (e) {
    this.setData({ studentId: e.detail.value });
  },

  onInputPhone: function (e) {
    this.setData({ phone: e.detail.value });
  },

  onSubmit: async function () {
    const { labIndex, labs, name, studentId, phone, fromScan } = this.data;

    if (labIndex < 0) {
      wx.showToast({ title: '请选择实验室', icon: 'none' });
      return;
    }
    
    const selectedLab = labs[labIndex];
    
    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!studentId) {
      wx.showToast({ title: '请输入学号', icon: 'none' });
      return;
    }
    if (!phone) {
      wx.showToast({ title: '请输入电话', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '提交中...' });

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString();

    console.log('提交数据:', {
      lab: selectedLab,
      name: name,
      student_id: studentId,
      phone: phone,
      date: date,
      time: time,
      from_scan: fromScan
    });

    try {
      await util.submitRegister({
        lab: selectedLab,
        name: name,
        student_id: studentId,
        phone: phone,
        date: date,
        time: time,
        from_scan: fromScan
      });

      wx.hideLoading();
      this.setData({ loading: false });
      
      wx.showToast({
        title: '登记成功',
        icon: 'success'
      });

      this.setData({
        name: '',
        studentId: '',
        phone: '',
        labIndex: -1,
        fromScan: false,
        scannedLab: ''
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    } catch (err) {
      wx.hideLoading();
      this.setData({ loading: false });
      console.error('提交失败:', err);
      wx.showToast({ title: '提交失败', icon: 'error' });
    }
  }
});
