import { GAME_STATUS, PAIRS_COUNT, GAME_TIME } from './constants.js'
import { getRandomColorPairs, setTimerText, createTimer } from './utils.js'
import {
  getColorElementList,
  getColorListElement,
  getInactiveColorList,
  getPlayAgainButton,
} from './selectors.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = createTimer({
  seconds: GAME_TIME,
  onChange: (seconds) => {
    const fullSecond = `0${seconds}`.slice(-2)
    setTimerText(fullSecond)
  },
  onFinish: () => {
    gameStatus = GAME_STATUS.FINISHED
    setTimerText('Game Over!!!')
  },
})

function initColor() {
  const colorList = getRandomColorPairs(PAIRS_COUNT)

  const liList = getColorElementList()
  liList.forEach((liElement, index) => {
    liElement.dataset.color = colorList[index]
    const overlayElement = liElement.querySelector('.overlay')
    if (overlayElement) overlayElement.style.backgroundColor = colorList[index]
  })
}

function showPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (playAgainButton) playAgainButton.classList.add('show')
}

function hidePlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (playAgainButton) playAgainButton.classList.remove('show')
}

function handleColorClick(liElement) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  const isClicked = liElement.classList.contains('active')
  if (!liElement || shouldBlockClick || isClicked) return

  liElement.classList.add('active')
  selections.push(liElement)

  if (selections.length < 2) return
  gameStatus = GAME_STATUS.BLOCKING
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor
  if (isMatch) {
    const isWin = getInactiveColorList().length === 0
    if (isWin) {
      gameStatus = GAME_STATUS.FINISHED
      showPlayAgainButton()
      setTimerText('YOU WIN!!!')
      timer.clear()
    }
    selections = []
    if (gameStatus !== GAME_STATUS.FINISHED) {
      gameStatus = GAME_STATUS.PLAYING
    }

    return
  }

  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')
    selections = []
    gameStatus = GAME_STATUS.PLAYING
  }, 500)
}

function attackEventForColorList() {
  const ulElement = getColorListElement()
  if (!ulElement) return
  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName !== 'LI') return
    handleColorClick(event.target)
  })
}

function resetGame() {
  // reset global vars
  gameStatus = GAME_STATUS.PLAYING
  selections = []

  //reset DOM Element
  // - remove class active
  // - hide replay button
  // - clear timer text
  const colorElementList = getColorElementList()
  for (const colorElement of colorElementList) {
    colorElement.classList.remove('active')
  }
  hidePlayAgainButton()
  setTimerText('')

  // re-generate color
  initColor()

  startTimer()
}

function attackEventForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (!playAgainButton) return
  playAgainButton.addEventListener('click', resetGame)
}

function startTimer() {
  timer.start()
}

;(() => {
  initColor()

  attackEventForColorList()

  attackEventForPlayAgainButton()

  startTimer()
})()
