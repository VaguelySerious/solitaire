// Game Object
// var SOL = {};

// General
SOL.game = {
  maxGameStates: 1,
  progressiveUndo: 1,
  cycleTimes: 2,
  cards: 52,
  colors: ['hearts', 'diamonds', 'clubs', 'spades'],
  stacks: [[], [], [], [], [], [], [], [], [], [], [], [], []],
  distribution: '24d//////1u/1d1u/2d1u/3d1u/4d1u/5d1u/6d1u',
  history: []
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


// Make a move
SOL.tryMove = function () {

};


// Check for win or autocompleteabilty
SOL.check = function () {

};


// Move all cards to wincondition
SOL.complete = function () {

};

SOL.new();
