// TODO: Create cookies for saves
// TODO: Remove scss that's not needed
// TODO: Fix hints

// ////////////////////
// GLOBAL VARIABLES //
// ////////////////////

var SOL = {
  game: null,
  scoring: null,
  stats: {
    score: 0,
    moves: 0,
    time: {
      now: 0,
      interval: null
    },
    // Array of {score, time, moves, wasWin}
    scores: []
  },
  DOM: {

    // General
    board: document.getElementById('board //TODO'),
    stacks: document.getElementsByClassName('stack //TODO'),

    // Buttons
    undo: document.getElementById('undo //TODO'),
    newgames: document.getElementsByClassName('newgame //TODO'),
    autocomplete: document.getElementById('//TODO'),
    cycle: document.getElementById('//TODO'), // TODO CHECK IF NULL

    // Menu
    menu: {
      modal: document.getElementById('menu'),
      openbutton: document.getElementById('menu-open'),
      closebutton: document.getElementById('menu-close')
    },

    // Text info
    timer: document.getElementById('timer //TODO'),
    score: document.getElementById('score //TODO'),

    // Modals
    scoreboard: document.getElementById('//TODO'),
    help: document.getElementById('//TODO'),
    cookie: document.getElementById('//TODO'),

    // Logic
    activeCard: null,
    possibleMove: true,
    autoCompletable: false
  },
  cardColors: [
    'royalblue',
    'plum',
    'brickred',
    'red',
    'orange',
    'yellow',
    'green',
    'emerald',
    'mint',
    'aqua'
  ]
};
SOL.DOM.board.className += SOL.cardColors[Math.floor(Math.random() * SOL.cardColors.length)];

// Go back in time once and decrease score
SOL.undo = function () {

};
// Creates a gamestate and pushes it to cookies
SOL.save = function () {

};
// Moves a card from one location to another
SOL.move = function () {

};
// Adds a card to bottom of stack
SOL.push = function (stack, card) {

};
// Removes a card from bottom of stack 
// Returns the id of the removed card
SOL.pop = function (stack) {
  return 0;
}
// Rebuilds DOM from stack variable
SOL.rebuild = function () {

};
// Calculates score and shows win screen / stats
SOL.win = function () {

};

// //////////////////////
// TIME AND SCORE DOM //
// //////////////////////

// Updates score in DOM
SOL.stats.updateScore = function (change, set) {
  if (typeof set === 'number') {
    this.score = set;
  } else {
    this.score += change;
  }
  SOL.DOM.score.innerHTML = this.score;
};
// Updates time in DOM
SOL.DOM.updateTime = function (seconds) {
  SOL.DOM.timer.innerHTML = (seconds / 3600 >= 1 ? Math.floor(seconds / 3600) + ':' : '') +
  (Math.floor(seconds / 60) % 60).toString().padStart(2, '0') + ':' +
  (seconds % 60).toString().padStart(2, '0');
};
// Starts the timer interval
SOL.stats.time.start = function () {
  this.timer = setInterval(() => {
    this.now += 1;
    if (this.now % 10 === 0) {
      SOL.stats.updateScore(SOL.scoring.afterTenSeconds);
    }
    SOL.DOM.updateTime(this.now);
  }, 1000);
};
// Only stops the timer
SOL.stats.time.stop = function () {
  clearInterval(this.timer);
  this.timer = null;
};
// Only sets the timer to zero
SOL.stats.time.reset = function () {
  SOL.DOM.updateTime(0);
};
