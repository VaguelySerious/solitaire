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
// SOL.DOM.board.className += SOL.cardColors[Math.floor(Math.random() * SOL.cardColors.length)];

// Generates a DOM Node from card object
SOL.generate = function (card) {
  // TODO Set facedown class according to card

  return 'DOMSTRING';
};

// Get the card object from the id
SOL.lookup = function (id) {
  return {};
};

// Adds a card to bottom of stack
SOL.push = function (stack, card) {
  var domCard = SOL.generate(card);
  SOL.game.stacks[stack].push(card);
  // SOL.DOM.stacks[stack].append(SOL.generate(card));
};

// Removes a card from bottom of stack
// Returns the id of the removed card
SOL.pop = function (stack) {
  var children = SOL.DOM.stacks[stack];
  if (SOL.game.stacks[stack].length > 0) {
    children[children.length - 1].outerHTML = '';
    return SOL.game.stacks[stack].pop();
  } else {
    throw new Error('Can not pop empty stack');
  }
};

// Moves a card from one location to another
SOL.move = function (from, to, amount, onebyone) {

};

// Create new deck
SOL.new = function () {
  var deck = [],
      tempNumber = '',
      currentStack = 0,
      tempIsFacedown = true,
      i, j, len;

  for (i = 0, len = SOL.game.cards; i < len; i++) {
    deck.push({
      id: i,
      color: SOL.game.colors[i % SOL.game.colors.length],
      value: i % 13,
      facedown: true
    });
  }

  SOL.shuffle(deck);

  for (i = 0, len = SOL.game.distribution.length; i < len; i++) {
    if (/[0-9]/.test(SOL.game.distribution[i])) {
      tempNumber += SOL.game.distribution[i];
    } else {
      switch(SOL.game.distribution[i]) {
        case '/':
          currentStack++;
          break;

        case 'u': // falls through
          tempIsFacedown = true;
        case 'd':
          for (j = 0; j < +tempNumber; j++) {
            var tempCard = deck.pop();
            tempCard.facedown = tempIsFacedown;
            SOL.push(currentStack, tempCard);
          }

          tempIsFacedown = false;
          break;

        default:
          throw new Error('Invalid fen string for cards distribution');
          break;
      }

      tempNumber = '';
    }
  }
};

// Rebuilds DOM from stack variable
SOL.rebuild = function () {

};

// Go back in time once and decrease score
SOL.undo = function () {

};

// Creates a gamestate and pushes it to cookies
SOL.save = function () {

};

// Calculates score and shows win screen / stats
SOL.win = function () {

};

// /////////////////////////////
// TIME SCORE DOM AND HELPERS //
// /////////////////////////////

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
  this.timer = setInterval(function () {
    SOL.stats.time.now += 1;
    if (SOL.stats.time.now % 10 === 0) {
      SOL.stats.updateScore(SOL.scoring.afterTenSeconds);
    }
    SOL.DOM.updateTime(SOL.stats.time.now);
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

// Shuffles an array in place (CBR)
SOL.shuffle = function (arr) {
  var j, temp, i;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
