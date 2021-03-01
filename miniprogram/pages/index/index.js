//index.js
import makePy from '../../utils/py';
const app = getApp()

const db = wx.cloud.database({
  env: 'promoter-bj00n'
})
const data = db.collection('data')


Page({
  data: {
    active: 0,
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    msg: '',
    list: [{
        "text": "主页",
        "iconPath": "/page/weui/images/tabbar_icon_chat_default.png",
        "selectedIconPath": "/page/weui/images/tabbar_icon_chat_active.png",
        dot: true
      },
      {
        "text": "设置",
        "iconPath": "/page/weui/images/tabbar_icon_setting_default.png",
        "selectedIconPath": "/page/weui/images/tabbar_icon_setting_active.png",
        badge: 'New'
      }
    ],
    history: [],
    rpxRatio: 1,
    colorData0: {
      hueData: {
        colorStopRed: 255,
        colorStopGreen: 0,
        colorStopBlue: 0,
      },
      pickerData: {
        hex: '#666666'
      }
    },
    popShow: false,
    rgb: 'rgb(0,154,97)',
    statusBarHeight: getApp().globalData.statusBarHeight,
    hashistory: false,
  },
  pickColor(e) {
    let rgb = e.detail.color
  },
  showpicker(e) {
    this.setData({
      popShow: true
    })
  },
  onClose() {
    this.setData({
      popShow: false
    })
  },
  onChange(event) {
    // event.detail 的值为当前选中项的索引
    this.setData({
      active: event.detail
    });
  },
  gotoscroll() {
    let a = JSON.stringify({type:'new'})
    wx.navigateTo({
      url: '../scrolledit/scrolledit?data=' + a,
    })
  },
  gotoswipe() {
    let a = JSON.stringify({type:'new'})
    wx.navigateTo({
      url: '../swipeedit/swipeedit?data=' + a,
    })
  },
  onLoad: function () {
    this.setData({
      msg: JSON.stringify()
    })
    this.getOpenID();
    let _this = this
    wx.getSystemInfo({
      success(res) {
        _this.setData({
          rpxRatio: res.screenWidth / 750
        })
      }
    })
  },
  onShow: function () {
    this.getOpenID()
  },

  getOpenID: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: (res) => {
        console.log('result', res)
        console.log('openid', res.result.openid)
        app.globalData = {
          openid: res.result.openid
        }
        console.log('open!!!', app.globalData.openid)

        data.where({
          _openid: app.globalData.openid
        }).get().then((res, err) => {
          //初始化数据库条目
          if (res.data.length === 0) {
            data.add({
              data: {
                history: []
              }
            })
            return
          }
          let curUser = res.data[0]
          console.log(curUser)
          let history = curUser.history;
          history.sort((a, b) => b.date - a.date)
          history = history.map(item => ({
            ...item,
            color: this.randomColor()
          }))
          this.setData({
            history: history
          })
          if (history.length) {
            this.setData({
              hashistory: true
            })
          }
        })
      }
    })
  },

  randomColor: function () {
    const colors = ['#f8aaa9', '#6f81e8', '#db5eaa', '#ffbc65', '#fb9195', '#cacac9']
    return colors[Math.floor(Math.random() * Math.floor(6))]
  },

  test: function (e) {
    let history = this.data.history
    let curHistory = history.find(item => item.date == e.target.id)
    console.log(curHistory)
    if (curHistory.type === '滚动') {
      console.log('开始滚动')
      wx.navigateTo({
        url: `../scrolledit/scrolledit?data=${JSON.stringify(curHistory)}`,
      })
    } else if (curHistory.type === '卡片') {
      wx.navigateTo({
        url: `../swipeedit/swipeedit?data=${JSON.stringify(curHistory)}`,
      })
    }
  },
  delete: function (e) {
    let id = e.target.id
    data.where({
      _openid: app.globalData.openid
    }).get().then(res => {
      console.log('go', res)
      let curUser = res.data[0];
      let history = curUser.history;
      history = history.filter(item => item.date != id)
      data.doc(curUser._id).update({
        data: {
          history: history
        }
      }).then(() => {
        wx.showToast({
          title: '已删除',
        })
        this.getOpenID()
      })
    })
  },
  goempty() {
    wx.showToast({
      title: '功能还未开发完毕',
    })
  },


  toPinyin: function (ori) {
    return ori.split('').map(item => makePy(item, false).toLocaleLowerCase())
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})