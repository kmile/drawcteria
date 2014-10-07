var MAX_COLOR_DISTANCE = Math.sqrt(Math.pow(255, 2) * 3)
var MAX_X = 80
var MAX_Y = 40

var elem = document.getElementById('drawing')
var params = { width: 20*MAX_X, height: 20*MAX_Y }
var two = new Two(params).appendTo(elem)

var rects = []
var bacts = []
var rectColors = []
var count = 0

var itv = null

for (var x = 0; x < MAX_X; x++) {
  rects[x] = []
  bacts[x] = []
  rectColors[x] = []
  for (var y = 0; y < MAX_Y; y++) {
    var rect = two.makeRectangle(x*20+10, y*20+10, 19, 19)
    if(x < MAX_X / 3 && y < MAX_Y / 2) {
      rect.fill = 'rgb(0, 0, 255)'
      rectColors[x][y] = [0, 0, 255]
    } else {
      if (y % 8 < 4) {
        rect.fill = 'rgb(255, 0, 0)'
        rectColors[x][y] = [255, 0, 0]
      } else {
        rect.fill = 'rgb(255, 255, 255)'
        rectColors[x][y] = [255, 255, 255]
      }
    }
    rect.opacity = 0.1
    rect.noStroke()
    rects[x][y] = rect
    bacts[x][y] = null
  }
}

function init() {
  for (var i = 0; i < 5; i++) {
    var b = new Bacteria(Math.floor(Math.random() * MAX_X), Math.floor(Math.random() * MAX_Y), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
    bacts[b.x][b.y] = b
  }

  var b = new Bacteria(10, 10, 0, 0, 255)
  bacts[b.x][b.y] = b

  two.update()
  itv = setInterval(update, 100)
}

function update() {
  for (var x = 0; x < MAX_X; x++) {
    for (var y = 0; y < MAX_Y; y++) {
      if(bacts[x][y] != null) {
        bacts[x][y].tick()
      }
    }
  }
  two.update()
  if(count == 0) {
    clearInterval(itv)
    console.log("Extinct")
  }
}

init()

function Bacteria(x, y, r, g, b) {
  this.rect = null
  this.x = x
  this.y = y
  this.r = r
  this.g = g
  this.b = b
  var MAX_MUTATION = 25
  var that = this
  var distance = getDistance()
  var threshold = 0.5
  var lower = 0.5 - threshold / 2
  var correctness = 1 - distance / MAX_COLOR_DISTANCE
  var probability = lower + correctness * threshold

  function draw() {
    that.rect = two.makeRectangle(x*20+10, y*20+10, 19, 19)
    that.rect.fill = 'rgb('+r+', '+g+', '+b+')'
    that.rect.opacity = 1
    that.rect.noStroke()
    two.update()
  }

  function getTargetColor() {
    return rectColors[x][y]
  }

  function getMutatedColor() {
    var newR = r + Math.random() * MAX_MUTATION - MAX_MUTATION / 2
    var newG = g + Math.random() * MAX_MUTATION - MAX_MUTATION / 2
    var newB = b + Math.random() * MAX_MUTATION - MAX_MUTATION / 2

    newR = Math.floor(Math.min(Math.max(newR, 0), 255))
    newG = Math.floor(Math.min(Math.max(newG, 0), 255))
    newB = Math.floor(Math.min(Math.max(newB, 0), 255))

    return [newR, newG, newB]
  }

  function split() {
    var neighbours = _.shuffle([
      [-1, -1], [-1,  0], [-1, 1],
      [ 0, -1],           [ 0, 1],
      [ 1, -1], [ 1,  0], [ 1, 1]
    ])

    var emptyNeighbour = _.find(neighbours, function(n) { return (x + n[0] >= 0) && (x + n[0] < MAX_X) && (y + n[1] >= 0) && (y + n[1] < MAX_Y) && (bacts[x + n[0]][y + n[1]] == null) })
    if (emptyNeighbour == null) {
      return
    }

    var newX = x + emptyNeighbour[0]
    var newY = y + emptyNeighbour[1]
    var newColors = getMutatedColor()
    bacts[newX][newY] = new Bacteria(newX, newY, newColors[0], newColors[1], newColors[2])
  }

  function die() {
    delete bacts[x][y]
    count--
    two.remove(that.rect)
  }

  function getDistance() {
    var targetColor = getTargetColor()
    return Math.sqrt(Math.pow(targetColor[0] - r, 2) + Math.pow(targetColor[1] - g, 2) + Math.pow(targetColor[2] - b, 2))
  }

  this.tick = function() {
    if (Math.random() < probability) {
      split()
    } else {
      die()
    }
  }

  count++
  draw()
}
