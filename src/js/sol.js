// TODO: Read cookies on startup
// TODO: Remove scss that's not needed
// TODO: Fix hints

// ////////////////////
// GLOBAL VARIABLES //
// ////////////////////

SOL.stats = {
  score: 0,
  moves: 0,
  time: {
    now: 0,
    interval: null
  },
  // Array of {score, time, moves, wasWin}
  scores: []
};
SOL.DOM = {

    // General
    board: document.getElementById('board'),
    stacks: document.getElementsByClassName('stack'),

    // Buttons
    undo: document.getElementById('undo'),
    newgames: document.getElementsByClassName('new-game'),
    autocomplete: document.getElementById('//TODO'),
    cycle: document.getElementById('//TODO'), // TODO CHECK IF NULL

    // Text info
    timer: document.getElementById('printinfo'),
    score: document.getElementById('printinfo'),
};
SOL.cardColors = [
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
];

// Create object with dynamic dom bindings
function Modal (modalID, visibleClass, toggles) {
  this.modal = document.getElementById(modalID);
  this.visibleClass = visibleClass;
  if (typeof toggles === 'string') {
    var toggleNodes = document.getElementsByClassName(toggles);
    for (var i = 0; i < toggleNodes.length; i++){
      toggleNodes[i].addEventListener('click', this.toggle.bind(this));
    }
  } else {
    for (var i = 0; i < toggles.length; i++){
      document.getElementById(toggles[i]).addEventListener('click', this.toggle.bind(this));
    }
  }
}
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

// Go back in time once and update score
SOL.undo = function () {
  if (SOL.game.history.length > 0) {
    var lastState = JSON.parse(SOL.game.history.pop());

    SOL.stats.moves += 1;
    SOL.game.stacks = lastState.stacks;
    SOL.stats.score = lastState.score + SOL.scoring.undo;

    SOL.rebuild();

    // Last available gamestate, disable the button
    if (SOL.game.history.length <= 0) {
      SOL.DOM.undo.setAttribute('disabled', 'true');
    }
  } else {
    throw new Error('Undo unavailable');
  }
};

// Creates a gamestate and pushes it to cookies
SOL.save = function () {
  var state = JSON.stringify({
    score: SOL.stats.score,
    scores: SOL.stats.scores,
    time: SOL.stats.time.now,
    moves: SOL.stats.moves,
    stacks: SOL.game.stacks
  });

  SOL.game.history.push(state);
  SOL.stats.moves += 1;

  document.cookie = 'gamestate=' + state + ';';

  if (SOL.game.history.length > SOL.game.maxGameStates) {
    SOL.game.history.shift();
  }

  // Game is undoable, so enable the button
  if (SOL.game.history.length >= 1) {
    SOL.DOM.undo.removeAttribute('disabled');
  }
};

// Calculates score and shows win screen / stats
SOL.win = function () {

};

// Checks if two cards have different colors
SOL.differentColor = function (color1, color2) {
  return (SOL.game.colors.indexOf(color1) > 1
      && SOL.game.colors.indexOf(color2) < 2)
    || (SOL.game.colors.indexOf(color1) < 2
      && SOL.game.colors.indexOf(color2) > 1)
};

// Highlight certain card
SOL.highlight = function (cardInfo) {
  document.getElementById(cardInfo.card.id).classList.add('clicked');
};

// Dehighlight certain card
SOL.dehighlight = function (cardInfo) {
  document.getElementById(cardInfo.card.id).classList.remove('clicked');
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



// ///////////////
// DOM BINDINGS //
// ///////////////

modal_menu = new Modal('menu', 'visible', 'menu-toggle');
modal_help = new Modal('help', 'visible', 'help-toggle');
modal_score = new Modal('scoreboard', 'visible', 'score-toggle');
modal_score = new Modal('scoreboard', 'visible', 'new-game');
modal_cookie = new Modal('cookie', 'hidden', 'cookie-toggle');

document.body.addEventListener("click", function(event){
  if (event.target.classList.contains('card')){
    SOL.clickCard(SOL.lookup(+event.target.id));
  } else if (event.target.classList.contains('stack')) {
    SOL.clickStack(+event.target.id.slice(event.target.id.indexOf('-')+1));
  }
});

SOL.DOM.undo.addEventListener('click', function() { 
  SOL.undo(); 
});
for (var i = 0; i < SOL.DOM.newgames.length; i++){
  SOL.DOM.newgames[i].addEventListener('click', function() { 
    SOL.new(); 
  }); 
}

document.onkeypress = function(e){
  console.log(e.which);
  switch(e.which) {
    // CTRL-Z
    case 26: SOL.undo();
    break; 
    // U
    case 85: SOL.undo();
    break; 
    // N
    case 110: SOL.new();
    break;
    // H
    case 104: modal_help.toggle();
    break;
    // M
    case 109: modal_menu.toggle();
    break;
    // S
    case 115: modal_score.toggle();
    break;
  }
};


// ////////////
// MAIN CODE //
// ////////////

document.body.className += SOL.cardColors[Math.floor(Math.random() * SOL.cardColors.length)];
var SOL_cookie_save = document.cookie;
if (SOL_cookie_save !== '') {
  SOL_cookie_save = JSON.parse(SOL_cookie_save.slice(10));
  if (typeof SOL_cookie_save.stacks !== 'undefined') {
    SOL.game.stacks = SOL_cookie_save.stacks;
    SOL.stats.score = SOL_cookie_save.score;
    SOL.stats.time.now = SOL_cookie_save.time;
    SOL.stats.time.start();
    SOL.rebuild();
  } else {
    SOL.new();
  }
} else {
  SOL.new();
}
