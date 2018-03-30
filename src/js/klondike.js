// Game Object
var SOL = {};

// General
SOL.game = {
  maxGameStates: 1,
  progressiveUndo: 1,
  cycleTimes: 2,
  colors: ['hearts', 'diamonds', 'clubs', 'spades'],
  stacks: [[], [], [], [], [], [], [], [], [], [], [], [], []],
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
SOL.move = function () {

};
// Check for win or autocompleteabilty
SOL.check = function () {

};
// Move all cards to wincondition
SOL.complete = function () {

};
SOL.new = function () {

};
