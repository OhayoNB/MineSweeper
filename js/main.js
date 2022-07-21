'use strict'

var gBoard
const MINE = '💣'
const FLAG = '⛳️'
const LIVE = '❤️‍🔥'

const NORMAL = '😀'
const LOSE = '🤯'
const WIN = '😎'

var gSeconds = 0
var stopWatchInterval
var gIsBoardClickable = true
var gLivesLeft = 3
var gLivesLeftStr = ['❤️‍🔥', '❤️‍🔥', '❤️‍🔥']

var gLevel = {
  SIZE: 4,
  MINES: 2,
}

var gGame = {
  isOn: false,
}

function initGame() {
  gBoard = buildBoard()
  renderBoard(gBoard)
  document.querySelector('.lives').innerText = gLivesLeftStr.join('')
}

function selectLevels(value) {
  switch (value) {
    case '4':
      gLevel.SIZE = 4
      gLevel.MINES = 2
      break
    case '8':
      gLevel.SIZE = 8
      gLevel.MINES = 12
      break
    case '12':
      gLevel.SIZE = 12
      gLevel.MINES = 30
      break
  }

  initAfterLevelSelect()
}

function initAfterLevelSelect() {
  clearInterval(stopWatchInterval)
  gGame.isOn = false
  document.querySelector('.mines-left').innerText = `Mines: ` + gLevel.MINES
  gSeconds = 0
  var elStopWatch = document.querySelector('.stopwatch')
  elStopWatch.innerText = `Time: ${gSeconds}`
  gLivesLeft = 3
  gIsBoardClickable = true
  gLivesLeftStr = ['❤️‍🔥', '❤️‍🔥', '❤️‍🔥']
  document.querySelector('.lives').innerText = gLivesLeftStr.join('')
  document.querySelector('.smiley').innerText = NORMAL
  initGame()
}

function buildBoard() {
  const board = []

  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      const cell = {
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      board[i][j] = cell
    }
  }
  return board
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j].isMine) continue
      board[i][j].minesAroundCount = calculateMineNegs(board, i, j)
    }
  }
}

function calculateMineNegs(board, cellI, cellJ) {
  var mineCount = 0

  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (board[i][j].isMine) mineCount++
    }
  }
  return mineCount
}

function setRandomMines(cellI, cellJ) {
  for (var i = 0; i < gLevel.MINES; i++) {
    const cell = drawEmptyCell()
    // First click is never a Mine
    if ((cellI === cell.i) & (cellJ === cell.j)) {
      i--
      continue
    }
    gBoard[cell.i][cell.j].isMine = true
  }
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'

    for (var j = 0; j < board[i].length; j++) {
      var currCell = board[i][j]
      var cellClass = getClassName({ i, j })

      strHTML += `\t<td class="cell ${cellClass}" onmousedown="cellClicked(this, ${i}, ${j}, event)">`

      if (currCell.isShown) {
        if (currCell.isMine) strHTML += MINE
        else strHTML += currCell.minesAroundCount
      } else if (currCell.isMarked) strHTML += FLAG

      strHTML += `</td>\n`
    }
    strHTML += '</tr>\n'
  }
  const elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j, event) {
  if (!gIsBoardClickable) return
  if (!gGame.isOn) {
    initGame()
    setRandomMines(i, j)
    setMinesNegsCount(gBoard)
    document.querySelector('.mines-left').innerText = `Mines: ` + gLevel.MINES
    gSeconds = 0
    stopWatchInterval = setInterval(displayStopwatch, 1000)
    gGame.isOn = true
  }
  //   console.log(`event:`, event)
  const cell = gBoard[i][j]

  if (cell.isShown) return

  if (event.button === 2) {
    cell.isMarked = !cell.isMarked

    if (cell.isMarked) gLevel.MINES--
    else gLevel.MINES++

    if (isGameOver()) gameWin()

    document.querySelector('.mines-left').innerText = `Mines: ` + gLevel.MINES
  } else if (event.button === 0) {
    if (cell.isMarked) return
    cell.isShown = true
    if (isGameOver()) {
      console.log('ss')
      console.log(gBoard)
      gameWin()
    }
    if (cell.isMine) {
      if (gLivesLeft > 1) {
        gLivesLeft--
        gLivesLeftStr.pop()
        document.querySelector('.lives').innerText = gLivesLeftStr
          .toString()
          .replace(',', '')
        gLevel.MINES--
        document.querySelector('.mines-left').innerText =
          `Mines: ` + gLevel.MINES
      } else {
        // When last cell remaining is a mine
        cell.isShown = true

        gLivesLeftStr.pop()
        document.querySelector('.lives').innerText = gLivesLeftStr
          .toString()
          .replace(',', '')
        gameLose()
      }
    }
    if (cell.minesAroundCount === 0) expandShown(gBoard, elCell, i, j)
  }

  renderBoard(gBoard)
}

function gameLose() {
  clearInterval(stopWatchInterval)
  gGame.isOn = false
  revealMines()
  document.querySelector('.smiley').innerText = LOSE
  gIsBoardClickable = false
  console.log('game lose')
}

function gameWin() {
  clearInterval(stopWatchInterval)
  gGame.isOn = false

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (!gBoard[i][j].isMine && !gBoard[i][j].isMarked)
        gBoard[i][j].isShown = true
    }
  }
  document.querySelector('.smiley').innerText = WIN
  gIsBoardClickable = false
  console.log('game win')
}

function revealMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine && !gBoard[i][j].isMarked)
        gBoard[i][j].isShown = true
    }
  }
  renderBoard(gBoard)
}

// function cellMarked(elCell) {}

function isGameOver() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (
        (!gBoard[i][j].isMine && !gBoard[i][j].isShown) ||
        (gBoard[i][j].isMine && !gBoard[i][j].isMarked)
      ) {
        return false
      }
    }
  }
  return true
}

function expandShown(board, elCell, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (!board[i][j].isShown) board[i][j].isShown = true
    }
  }
  renderBoard(board)
}

function displayStopwatch() {
  gSeconds++
  var s = gSeconds
  var elStopWatch = document.querySelector('.stopwatch')
  elStopWatch.innerHTML = `Time: ${s}`
}
