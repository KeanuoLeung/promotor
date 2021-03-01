// miniprogram/pages/scrollpro/scrollpro.js
import makePy from '../../utils/py';
var interval = null;
var running = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: [{
      char: '你'
    }],
    curHeight: 0,
    index: 0,
    timePerChar: 50,
    showBar: false,
    time: 0,
    displayTime: '00:00:00',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let {
      voice
    } = options
    this.initPage(options.value);
    //this.beginAutoScroll()
    if (voice === "true")
      this.beginVoiceRecognition()
    else {
      this.beginAutoScroll()
      this.setData({
        showBar: true
      })
    }

    if (!interval) {
      interval = setInterval(() => {
        this.setData({
          time: this.data.time + 1,
          displayTime: this.parseTime(this.data.time)
        })
      }, 10);
    }

  },
  parseTime() {
    var mm = parseInt(this.data.time / 100 / 60);
    if (mm < 10) mm = '0' + mm;
    var ss = parseInt(this.data.time % 6000 / 100);
    if (ss < 10) ss = '0' + ss;
    var ssss = parseInt(this.data.time % 100);
    if (ssss < 10) ssss = '0' + ssss;
    return `${mm}:${ss}:${ssss}`
  },
  initPage(input) {
    let temp = input.split('');
    temp = temp.map((item, index) => ({
      char: `${item}`,
      index: `char${index}`,
      pass: false,
      class: item === '\n' ? 'enter' : ''
    }))
    console.log(temp)
    this.setData({
      article: temp
    })
  },
  sliderchange(e) {
    console.log(e)
    console.log(e.detail)
    this.setData({
      timePerChar: e.detail
    })
  },
  beginAutoScroll() {
    //自动滚动
    setTimeout(() => {
      if (!running) return;
      let temp = this.data.article;
      temp[this.data.index++].pass = true;

      this.setData({
        article: temp,
      })
      this.scrollToChar(temp[this.data.index].index)
      this.beginAutoScroll()
    }, this.data.timePerChar * 10)
  },
  beginVoiceRecognition() {
    let plugin = requirePlugin("QCloudAIVoice");
    plugin.setQCloudSecret(1255325322, 'AKID8TZUv6giBhAWfSpbsxlWDgJSRFvhowFa', 'QknaJn3EGN2UsAKNIzRdZJyObZJpEOLJ', false);

    let manager = plugin.getRecordRecognitionManager();
    let index = 0;

    // 请在页面onLoad时初始化好下列函数并确保腾讯云账号信息已经设置
    manager.onStart((res) => {
      console.log('recorder start', res.msg);
    })
    manager.onStop((res) => {
      console.log('recorder stop', res.tempFilePath);
    })
    manager.onError((res) => {
      console.log('recorder error', res.errMsg);
    })
    // temp[index++].pass = true;

    //  this.setData({
    //    article: temp
    //  })
    //  this.scrollToChar(temp[index].index)
    manager.onRecognize((res) => {
      if (res.result) {
        console.log("current result", res.result);
        let curRes = res.result.replace('。', '');
        curRes = curRes.replace('，', '');
        curRes = curRes.replace(',', '');
        curRes = curRes.replace('.', '');
        let lastChar = curRes[curRes.length - 1];
        let start = index;
        for (let i = index; i < index + 30; i++) {
          if (makePy(lastChar) === makePy(this.data.article[i].char)) {
            let temp = this.data.article;
            for (let j = start; j <= i; j++) {
              temp[j].pass = true;
            }
            this.setData({
              article: temp
            })
            index = i;
            this.scrollToChar(temp[index].index)
            break;
          }
        }
      } else if (res.errMsg) {
        console.log("recognize error", res.errMsg);
      }
    })
    // 需要开始识别时调用此方法

    manager.start({
      duration: 10000,
      engine_model_type: '16k_0'
    });

    let voiceId = setInterval(() => {
      console.log('again')
      manager.start({
        duration: 10000,
        engine_model_type: '16k_0'
      });
    }, 10600)
    this.setData({
      voiceId: voiceId
    })
  },
  scrollToChar(charId) {
    let that = this;
    let topquery = wx.createSelectorQuery();
    topquery.select('#char0').boundingClientRect();
    let query = wx.createSelectorQuery();
    topquery.exec((res1) => {
      let realTop = res1[0].top;
      let charHeight = res1[0].height;
      query.select(`#${charId}`).boundingClientRect()
      query.exec((res) => {
        console.log(charId, res[0].top);
        console.log(res)

        wx.pageScrollTo({
          scrollTop: res[0].top - realTop - charHeight
        })
      })
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
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onHide...')
    if (interval) {
      clearInterval(interval);
      interval = null;
    } else {
      this.setData({
        time: 0,
        displayTime: '00:00:00'
      })
    }
    running = false;
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