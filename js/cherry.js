class CherryBlossom {
  farLimit = 600  
  surfaceRate = 0.5
  focusPosition = 300
  maxRippleCount = 100
  rippleRadius = 100
  sinkOffset = 20
  constructor(renderer, isRandom) {
    this.renderer = renderer
    this.init(isRandom)
  }
  init(isRandom) {
    this.x = this.getRandomValue(-this.renderer.width, this.renderer.width)
    this.y = isRandom ? this.getRandomValue(0, this.renderer.height) : this.renderer.height * 1.5
    this.z = this.getRandomValue(0, this.farLimit)

    this.vx = this.getRandomValue(-2, 2)
    this.vy = -2

    this.theta = this.getRandomValue(0, Math.PI * 2)
    this.phi = this.getRandomValue(0, Math.PI * 2)
    this.psi = 0
    this.dpsi = this.getRandomValue(Math.PI / 600, Math.PI / 300)

    this.opacity = 0
    this.endTheta = false
    this.endPhi = false

    this.rippleCount = 0

    const axis = this.getAxis()
    const theta = (this.theta + Math.ceil(-(this.y + this.renderer.height * this.surfaceRate) / this.vy) * Math.PI / 500) % (Math.PI * 2)

    this.offsetY = 40 * ((theta <= Math.PI / 2 || theta >= Math.PI * 3 / 2) ? -1 : 1)
    this.thresholdY = this.renderer.height / 2 + this.renderer.height * this.surfaceRate * axis.rate

    this.entityColor = this.renderer.context.createRadialGradient(0, 40, 0, 0, 40, 80)
    const addEntityColorList = [
      { offset: 0, color: `hsl(330, 70%, ${50 * (0.3 + axis.rate)}%)` },
      { offset: 0.05, color: `hsl(330, 40%, ${55 * (0.3 + axis.rate)}%)` },
      { offset: 1, color: `hsl(330, 20%, ${70 * (0.3 + axis.rate)}%)` }
    ]
    addEntityColorList.forEach(x => {
      this.entityColor.addColorStop(x.offset, x.color)
    })

    this.shadowColor = this.renderer.context.createRadialGradient(0, 40, 0, 0, 40, 80)
    const addShadowColorList = [
      { offset: 0, color: `hsl(330, 40%, ${30 * (0.3 + axis.rate)}%)` },
      { offset: 0.05, color: `hsl(330, 40%, ${30 * (0.3 + axis.rate)}%)` },
      { offset: 1, color: `hsl(330, 20%, ${40 * (0.3 + axis.rate)}%)` }
    ]
    addShadowColorList.forEach(x => {
      this.shadowColor.addColorStop(x.offset, x.color)
    })
    // console.log('一个花瓣初始数据创建成功')
  }
  getRandomValue(min, max) {
    return min + (max - min) * Math.random()
  }
  getAxis() {
    const rate = this.focusPosition / (this.z + this.focusPosition)
    const x = this.renderer.width / 2 + this.x * rate
    const y = this.renderer.height / 2 - this.y * rate
    return { rate, x, y }
  }
  render(context) {
    const axis = this.getAxis()

    if (axis.y == this.thresholdY && this.rippleCount < this.maxRippleCount) {
      context.save()
      context.lineWidth = 2
      context.strokeStyle = `hsla(0, 0%, 100%, ${(this.maxRippleCount - this.rippleCount) / this.maxRippleCount})`
      context.translate(axis.x + this.offsetY * axis.rate * (this.theta <= Math.PI ? -1 : 1), axis.y)
      context.scale(1, 0.3)
      context.beginPath()
      context.arc(0, 0, this.rippleCount / this.maxRippleCount * this.rippleRadius * axis.rate, 0, Math.PI * 2, false)
      context.stroke()
      context.restore()
      this.rippleCount++
    }

    if (axis.y < this.thresholdY || (!this.endTheta || !this.endPhi)) {
      if (this.y <= 0) {
        this.opacity = Math.min(this.opacity + 0.01, 1)
      }
      context.save()
      context.globalAlpha = this.opacity
      context.fillStyle = this.shadowColor
      context.strokeStyle = `hsl(330, 30%, ${40 * (0.3 + axis.rate)}%)`
      context.translate(axis.x, Math.max(axis.y, this.thresholdY + this.thresholdY - axis.y))
      context.rotate(Math.PI - this.theta)
      context.scale(axis.rate * -Math.sin(this.phi), axis.rate)
      context.translate(0, this.offsetY)
      this.renderCherry(context)
      context.restore()
    }

    context.save()
    context.fillStyle = this.entityColor
    context.strokeStyle = `hsl(330, 40%, ${70 * (0.3 + axis.rate)}%)`
    context.translate(axis.x, axis.y, Math.abs(this.sinkOffset * Math.sin(this.psi) * axis.rate))
    context.rotate(this.theta)
    context.scale(axis.rate * Math.sin(this.phi), axis.rate)
    context.translate(0, this.offsetY)
    this.renderCherry(context)
    context.restore()

    if (this.y <= -this.renderer.height / 4) {
      if (!this.endTheta) {
        for(let theta = Math.PI / 2; theta <= Math.PI * 3 / 2; theta += Math.PI){
          if(this.theta < theta && this.theta + Math.PI / 200 > theta){
            this.theta = theta;
            this.endTheta = true;
            break;
          }
        }
      }
      if (!this.endPhi) {
        for(let phi = Math.PI / 8; phi <= Math.PI * 7 / 8; phi += Math.PI * 3 / 4){
          if(this.phi < phi && this.phi + Math.PI / 200 > phi){
            this.phi = Math.PI / 8;
            this.endPhi = true;
            break;
          }
        }
      }
    }
    if (!this.endTheta) {
      if (axis.y == this.thresholdY) {
        this.theta += Math.PI / 200 * ((this.theta < Math.PI / 2 || (this.theta >= Math.PI && this.theta < Math.PI * 3 / 2)) ? 1 : -1);
      } else {
        this.theta += Math.PI / 500;
      }
      this.theta %= Math.PI * 2;
    }
    if (this.endPhi) {
      if(this.rippleCount == this.maxRippleCount){
        this.psi += this.dpsi;
        this.psi %= Math.PI * 2;
      }
    } else {
      this.phi += Math.PI / ((axis.y == this.thresholdY) ? 200 : 500);
      this.phi %= Math.PI;
    }
    if (this.y <= -this.renderer.height * this.surfaceRate) {
      this.x += 2;
      this.y = -this.renderer.height * this.surfaceRate;
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }
    // console.log('一个花瓣渲染成功')
    return this.z > -this.focusPosition && this.z < this.farLimit && this.x < this.renderer.width * 1.5;
  }
  renderCherry(context) {
    context.beginPath()
    context.moveTo(0, 40)
    context.bezierCurveTo(-60, 20, -10,-60, 0, -20)
    context.bezierCurveTo(10, -60, 60, 20, 0, 40)
    context.fill()
    for(let i = -4; i < 4; i++) {
      context.beginPath()
      context.moveTo(0, 40)
      context.quadraticCurveTo(i * 12, 10, i * 4, -24 + Math.abs(i) * 2)
      context.stroke()
    }
  }
}