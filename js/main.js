'use strict'

var gBoard
const MINE = '💣'
const FLAG = '⛳️'

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
  shownCount: 0,
  markedCount: 0,
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

  levelSelectInit()
}

function levelSelectInit() {
  clearInterval(stopWatchInterval)
  gGame.isOn = false
  gGame.shownCount = 0
  gGame.markedCount = 0

  gSeconds = 0
  var elStopWatch = document.querySelector('.stopwatch')
  elStopWatch.innerText = `Time: ${gSeconds}`

  gIsBoardClickable = true

  gLivesLeft = 3
  gLivesLeftStr = ['❤️‍🔥', '❤️‍🔥', '❤️‍🔥']
  document.querySelector('.lives').innerText = gLivesLeftStr.join('')

  document.querySelector('.smiley').innerText = NORMAL

  displayRemainedMines()

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
    console.log(cell)
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
      var isShown = currCell.isShown ? ' shown' : ''

      strHTML += `\t<td class="cell ${isShown}" onmousedown="cellClicked(this, ${i}, ${j}, event)">`

      if (currCell.isShown) {
        if (currCell.isMine) strHTML += MINE
        else if (currCell.minesAroundCount === 0) {
          strHTML += ''
        } else {
          strHTML += currCell.minesAroundCount
        }
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
    displayRemainedMines()

    gSeconds = 0
    stopWatchInterval = setInterval(displayStopwatch, 1000)

    gGame.isOn = true
  }

  const cell = gBoard[i][j]

  if (cell.isShown) return

  if (event.button === 2) {
    if (cell.isMarked) gGame.markedCount--
    else gGame.markedCount++

    cell.isMarked = !cell.isMarked

    displayRemainedMines()
  } else if (event.button === 0) {
    if (cell.isMarked) return
    cell.isShown = true
    gGame.shownCount++

    if (cell.isMine) {
      if (gLivesLeft > 1) {
        gLivesLeft--
        gLivesLeftStr.pop()
        document.querySelector('.lives').innerText = gLivesLeftStr
          .toString()
          .replace(',', '')

        displayRemainedMines()
      } else {
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
  checkGameOver()
}

function displayRemainedMines() {
  var elMinesLeft = document.querySelector('.mines-left')
  var minesLeft = gLevel.MINES - (3 - gLivesLeft)

  elMinesLeft.innerText = `Mines: ${minesLeft - gGame.markedCount}`
}

function gameLose() {
  clearInterval(stopWatchInterval)
  gGame.isOn = false

  revealMines()

  document.querySelector('.smiley').innerText = LOSE
  gIsBoardClickable = false
}

function gameWin() {
  clearInterval(stopWatchInterval)
  gGame.isOn = false

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

function checkGameOver() {
  const cellsWithoutMines = gLevel.SIZE ** 2 - gLevel.MINES
  const livesInUse = 3 - gLivesLeft

  if (
    gGame.shownCount - livesInUse === cellsWithoutMines &&
    gGame.markedCount + livesInUse === gLevel.MINES
  ) {
    gameWin()
  }
}

function expandShown(board, elCell, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (!board[i][j].isShown) {
        board[i][j].isShown = true
        gGame.shownCount++
      }
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
