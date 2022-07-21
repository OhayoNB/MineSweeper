'use strict'

function getEmptyCells() {
  var emptyCells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (!gBoard[i][j].isMine) {
        emptyCells.push({ i, j })
      }
    }
  }
  return emptyCells
}

function drawEmptyCell() {
  var emptyCells = getEmptyCells()
  var emptyCell = emptyCells.splice(getRandomInt(0, emptyCells.length), 1)
  return emptyCell[0]
}

//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

//{i,j} to 'cell-i-j'
function getClassName(location) {
  var cellClass = `cell-${location.i}-${location.j}`
  return cellClass
}
