// Game Object
// var SOL = {};

// General
SOL.game = {

  // Settings
  maxGameStates: 1,
  progressiveUndo: 1,
  cycleTimes: 2,

  // Board information
  cards: 52,
  colors: ['hearts', 'diamonds', 'clubs', 'spades'],
  stacks: [[], [], [], [], [], [], [], [], [], [], [], [], []],
  distribution: '24d//////1u/1d1u/2d1u/3d1u/4d1u/5d1u/6d1u',
  history: [],

  // Logic
  activeCard: null,
  possibleMove: true,
  autoCompletable: false
};

// Scoring rules
SOL.scoring = {
  pileToTableau: 5,
  tableauToFoundation: 10,
  undo: -10,
  foundationToTableau: -15,
  uncoverFaceDown: 5,
  afterTenSeconds: -2
};


// Resolve rules for clicking on card
SOL.clickCard = function (cardInfo) {
  console.log(cardInfo);
  // SOL.save(); ???

  // Clicking on deck
  if (cardInfo.stack === 0) {
    SOL.move(0, 1, 3, true, true);

  // Uncover face down card
  } else if (cardInfo.card.facedown) {
    if (SOL.game.activeCard !== null) {
      document.getElementById(cardInfo.id).classList.remove('clicked');
    }

  // Select card
  } else if (SOL.game.activeCard === null) {
    document.getElementById(cardInfo.card.id).classList.add('clicked');

  // Let two cards interact
  } else {

  }
};

// Make a move
SOL.clickStack = function (stack) {
  console.log(stack);
};


// Check for win or autocompleteabilty
SOL.check = function () {

};


// Move all cards to wincondition
SOL.complete = function () {

};

SOL.new();
