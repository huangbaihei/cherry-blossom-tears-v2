class CherryBlossomsRender {
  maxAddingInterval = 10
  initCherryBlossomCount = 30
  constructor() {}
  init() {
    this.setParameters()

    this.createCherries()

    this.render = this.render.bind(this)
    this.render()
  }
  setParameters() {
    const canvas = document.getElementById('canvas')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    this.context = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    this.cherries = []
    this.maxAddingInterval = Math.round(this.maxAddingInterval * 1000 / this.width)
    this.addingInterval = this.maxAddingInterval

    this.initCherryBlossomCount = Math.round(this.initCherryBlossomCount * this.width / 1000)

    // console.log('画布初始参数设置成功')
  }
  createCherries() {
    for (let i = 0; i < this.initCherryBlossomCount; i++) {
      this.cherries.push(new CherryBlossom(this, true))
    }
    // console.log('初始花瓣组数据创建成功')
  }
  render() {
    requestAnimationFrame(this.render)
    this.context.clearRect(0, 0, this.width, this.height)

    this.cherries.sort(function(cherry1, cherry2) {
      return cherry1.z - cherry2.z
    })

    for (let i = this.cherries.length - 1; i >= 0; i--) {
      if (!this.cherries[i].render(this.context)) {
        this.cherries.splice(i, 1)
        // console.log('一个花瓣清除成功')
      }
    }

    if (--this.addingInterval == 0) {
      this.addingInterval = this.maxAddingInterval
      this.cherries.push(new CherryBlossom(this, false))
    }

    // console.log('花瓣组渲染成功')
  }
}