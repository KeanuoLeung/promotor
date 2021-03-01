// miniprogram/pages/swipeedit/swipeedit.js
const app = getApp()
const db = wx.cloud.database({
  env: 'promoter-bj00n'
})
const data = db.collection('data')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [{
      id: 1,
      data: '',
      oriTime: null
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    options = JSON.parse(options.data)
    console.log(options)
    if (options.type !== 'new') {
      this.setData({cards: options.data, oriTime: options.date})
    }
  },
  textchange(e) {
    let {
      target: {
        id
      },
      detail: {
        value
      }
    } = e

    let oriCards = this.data.cards
    let curCard = oriCards.find(item => item.id === Number(id))
    curCard.data = value
    this.setData({
      cards: oriCards
    })
  },
  addcard() {
    let oriCards = this.data.cards;
    oriCards.push({
      id: this.data.cards[this.data.cards.length - 1].id + 1,
      data: ''
    })
    this.setData({
      cards: oriCards
    })
  },
  deletecard() {
    let oriCards = this.data.cards;
    if (oriCards.length <= 1) return
    oriCards.splice(oriCards.length - 1, 1)
    this.setData({
      cards: oriCards
    })
  },
  goplay() {
    console.log(this.data.cards)
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
        type: '卡片',
        value: this.data.cards[0].data,
        data: this.data.cards
      })

      data.doc(curUser._id).update({
        data: {
          history: history
        }
      })
    })
    wx.navigateTo({
      url: `../swipeshow/swipeshow?cards=${JSON.stringify(this.data.cards)}`,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})