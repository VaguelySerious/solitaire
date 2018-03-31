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
    board: document.getElementById('board'),
    stacks: document.getElementsByClassName('stack'),

    // Buttons
    undo: document.getElementById('undo'),
    newgames: document.getElementsByClassName('newgame//TODO'),
    autocomplete: document.getElementById('//TODO'),
    cycle: document.getElementById('//TODO'), // TODO CHECK IF NULL

    // Menu
    menu: {
      modal: document.getElementById('menu'),
      openbutton: document.getElementById('menu-open'),
      closebutton: document.getElementById('menu-close')
    },

    // Text info
    timer: document.getElementById('printinfo'),
    score: document.getElementById('printinfo'),

    // Modals
    scoreboard: document.getElementById('//TODO'),
    help: document.getElementById('//TODO'),
    cookie: document.getElementById('//TODO'),

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

// Create object with dynamic dom bindings
function Modal (modalID, visibleClass, closers, openers) {
  this.modal = document.getElementById(modalID);
  this.visibleClass = visibleClass;
  if (typeof openers === 'string') {
    var openNodes = document.getElementsByClassName(openers);
    for (var i = 0; i < openNodes.length; i++){
      openNodes[i].addEventListener('click', this.open.bind(this));
    }
  } else {
    for (var i = 0; i < openers.length; i++){
      if (closers.length === 0) {
        document.getElementById(openers[i]).addEventListener('click', this.toggle.bind(this));
      } else {
        document.getElementById(openers[i]).addEventListener('click', this.open.bind(this));
      }
    }
  }
  if (typeof closers === 'string') {
    var closeNodes = document.getElementsByClassName(closers);
    for (var i = 0; i < closeNodes.length; i++){
      closeNodes[i].addEventListener('click', this.open.bind(this));
    }
  } else {
    for (var i = 0; i < closers.length; i++){
      document.getElementById(closers[i]).addEventListener('click', this.close.bind(this));
    }
  }
}
Modal.prototype.open = function(){
  this.modal.classList.remove(this.visibleClass);
};
Modal.prototype.close = function(){
  this.modal.classList.add(this.visibleClass);
};
Modal.prototype.toggle = function(){
  this.modal.classList.toggle(this.visibleClass);
};

// Generates a DOM Node from card object
SOL.generate = function (card) {
  return sprintf(
    SOL.template,
    card.value,
    card.color,
    card.facedown ? 'facedown' : '',
    card.id
  );
};

// Get the card object from the id
SOL.lookup = function (id) {
  var i;
  var j;
  for (i = 0; i < SOL.game.stacks.length; i++) {
    for (j = 0; j < SOL.game.stacks[i].length; j++) {
      if (SOL.game.stacks[i][j] && SOL.game.stacks[i][j].id === id) {
        return {
          card: SOL.game.stacks[i][j],
          stack: i,
          pos: j
        }
      }
    }
  }
  throw new Error('Lookup could not find the card by ID');
};

// Adds a card to bottom of stack
SOL.push = function (stack, card) {
  var domCard = SOL.generate(card);
  SOL.game.stacks[stack].push(card);
  SOL.DOM.stacks[stack].insertAdjacentHTML('beforeend', SOL.generate(card));
};

// Removes a card from bottom of stack
// Returns the id of the removed card
SOL.pop = function (stack) {
  var children = SOL.DOM.stacks[stack].childNodes;
  if (SOL.game.stacks[stack].length > 0) {
    children[children.length - 1].outerHTML = '';
    return SOL.game.stacks[stack].pop();
  } else {
    throw new Error('Cannot pop empty stack');
  }
};

// Moves a card from one location to another
SOL.move = function (from, to, amount, flip, reverse) {
  var cards = [];
  var i;

  // Remove the cards from the origin stack
  for (i = 0; i < amount; i++) {
    cards.push(SOL.pop(from));

    if (flip) {
      cards[i].facedown = !cards[i].facedown;
    }
  }

  // Push the cards to the target stack
  for (i = 0; i < amount; i++) {
    if (reverse) {
      SOL.push(to, cards.shift());
    } else {
      SOL.push(to, cards.pop());
    }
  }

  return cards[cards.length - 1] != null;
};

// Create new deck
SOL.new = function () {
  var deck = [];
  var tempNumber = '';
  var currentStack = 0;
  var tempIsFacedown = true;
  var i;
  var j;
  var len;

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
      switch (SOL.game.distribution[i]) {
      case '/':
        currentStack++;
        break;

      case 'u':
        tempIsFacedown = false;
        // falls through
      case 'd':
        for (j = 0; j < +tempNumber; j++) {
          var tempCard = deck.pop();
          tempCard.facedown = tempIsFacedown;
          SOL.push(currentStack, tempCard);
        }

        tempIsFacedown = true;
        break;

      default:
        throw new Error('Invalid fen string for cards distribution');
      }

      tempNumber = '';
    }
  }
};

// Rebuilds DOM from stack variable
SOL.rebuild = function () {
  var i;
  var j;

  // Flush the board stacks
  for (var i = 0; i < SOL.DOM.stacks.length; i++) {
    SOL.DOM.stacks[i].innerHTML = '';

    // Refill from stack variable
    for (var j = 0; j < SOL.game.stacks[i].length; j++) {
      var domCard = SOL.generate(SOL.game.stacks[i][j]);
      SOL.DOM.stacks[i].insertAdjacentHTML('beforeend', domCard);
    }
  }
};

// Go back in time once and decrease score
SOL.undo = function () {
  var lastState = JSON.parse(SOL.game.history.pop());

  SOL.stats.moves += 1;
  SOL.game.stacks = lastState.stacks;
  SOL.stats.score = lastState.score + SOL.scoring.undo;

  SOL.rebuild();
};

// Creates a gamestate and pushes it to cookies
SOL.save = function () {
  var state = {
    score: SOL.stats.score,
    scores: SOL.stats.scores,
    time: SOL.stats.time.now,
    moves: SOL.stats.moves,
    stacks: SOL.game.stacks
  };

  SOL.game.history.push(JSON.stringify(state));
  SOL.stats.moves += 1;

  if (SOL.game.history.length > SOL.game.maxGameStates) {
    SOL.game.history.shift();
  }
};

// Calculates score and shows win screen / stats
SOL.win = function () {

};

// /////////////////
// TIME SCORE DOM //
// /////////////////

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
  SOL.stats.time.now = 0;
  SOL.DOM.updateTime(0);
};


// /////////////////
// TIME SCORE DOM //
// /////////////////

// Sprintf
function sprintf(text) {
  var i = 1;
  var args = arguments;
  return text.replace(/%s/g, function () {
    return i < args.length ? args[i++] : '';
  });
}

// Template for card DOM objects
SOL.template = '<div class="card card-%s %s %s" id="%s"><div class="card__front"><span class="card__values"></span></div><div class="card__back"></div></div>';

// Shuffles an array in place (CBR)
SOL.shuffle = function (arr) {
  var j;
  var temp;
  var i;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
};



// ////////////
// MAIN CODE //
// ////////////


document.body.addEventListener("click", function(event){
  if (event.target.classList.contains('card')){
    SOL.clickCard(SOL.lookup(+event.target.id));
  } else if (event.target.classList.contains('stack')) {
    SOL.clickStack(+event.target.id.slice(-1));
  }
});
