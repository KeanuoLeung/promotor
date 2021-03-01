// miniprogram/pages/scrolledit/scrolledit.js
const db = wx.cloud.database({
  env: 'promoter-bj00n'
})
const data = db.collection('data')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    textdata: '',
    checked: false,
    oriTime: null
  },
  goplay() {
    let d = new Date();
    console.log('time', d.getTime())
    data.where({
      _openid: app.globalData.openid
    }).get().then(res => {
      console.log('go', res)
      let curUser = res.data[0];
      let history = curUser.history;
      if (this.data.oriTime) {
        history = history.filter(item => item.date != this.data.oriTime)
      }
        history.push({
          date: d.getTime(),
          type: '滚动',
          value: this.data.textdata
        })
      
      data.doc(curUser._id).update({
        data: {
          history: history
        }
      })
    })
    wx.navigateTo({
      url: `../scrollpro/scrollpro?value=${this.data.textdata}&voice=${this.data.checked}`,
    })
  },
  textchange(e) {
    console.log(e.detail.value);
    this.setData({
      textdata: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options = JSON.parse(options.data)
    console.log(options)
    let {
      type,
      value,
      date
    } = options;
    if (type === 'new') {
      this.setData({
        textdata: ''
      })
    } else {
      this.setData({
        textdata: value,
        oriTime: date
      })
    }
  },
  initPage: function () {

  },
  onChange(e) {
    this.setData({
      checked: e.detail
    })
  }
})