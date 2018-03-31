// TODO Fix SOL.complete to actually do that
// TODO SOL.save() on cardinteraction
// TODO Different color

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

  // Clicking on deck
  if (cardInfo.stack === 0) {
    console.log('Deck cycle');
    // var deckCards = SOL.DOM.stacks[1].childNodes;
    // for (var i = 1; i <= deckCards.length || i < 4; i++) {
      // deckCards[deckCards.length-i].classList.add('hidden');
    // }
    SOL.move(0, 1, 3, true, true);
    SOL.deselectLast();

  // Uncover face down card
  } else if (cardInfo.card.facedown) {
 
    console.log('Uncover facedown');
    SOL.stats.updateScore(SOL.scoring.uncoverFaceDown);
    cardInfo.card.facedown = false;
    document.getElementById(cardInfo.card.id).classList.remove('facedown');
    SOL.deselectLast();

  // Select card
  } else if (SOL.game.activeCard === null) {
    SOL.game.activeCard = cardInfo;
    SOL.highlight(cardInfo);
    console.log('Only select card');

  // Deselect on same-card-twice or push to foundation
  } else if (SOL.game.activeCard.card === cardInfo.card) {
    // Moving ace to foundation
    if (SOL.game.activeCard.card.value === 0) {
      for (var j = 2; j < 6; j++) {
        if (SOL.game.stacks[j].length === 0) {
          SOL.move(SOL.game.activeCard.stack, j, 1);
          console.log('Move to empty foundation doubleclick');
          break;
        }
      }
    // Moving other card to foundation
    } else {
      for (var j = 2; j < 6; j++) {
        if (SOL.game.stacks[j].length !== 0) {
          var lastCard = SOL.game.stacks[j][SOL.game.stacks[j].length - 1]
          console.log('lastcard: '+JSON.stringify(lastCard));
          if (SOL.game.activeCard.card.value === lastCard.value + 1
            && SOL.game.activeCard.card.color === lastCard.color){
            console.log('Move to non-empty foundation double-click');
            SOL.move(SOL.game.activeCard.stack, j, 1);
            break;
          }
        }
      }
    }
    SOL.deselectLast();

  // Let two cards interact
  } else {
    SOL.highlight(cardInfo);

    // Card is higher and different color
    if (SOL.game.activeCard.card.value === cardInfo.card.value - 1
      && SOL.differentColor(SOL.game.activeCard.card.color, cardInfo.card.color)
      && cardInfo.stack > 5) {
      console.log('Normal move card');
      SOL.move(
        SOL.game.activeCard.stack,
        cardInfo.stack,
        SOL.game.stacks[SOL.game.activeCard.stack].length - SOL.game.activeCard.pos);

    // Wrong selection
    } else if (SOL.game.activeCard.card.value === cardInfo.card.value + 1
      && SOL.game.activeCard.card.color === cardInfo.card.color){
      console.log('Move to non-empty foundation double-click');
      SOL.move(SOL.game.activeCard.stack, cardInfo.stack, 1);
    } else {
      console.log('Two-card interaction failure');
      // TODO Errorflash
    }

    setTimeout(function () {
      SOL.deselectLast();
      SOL.dehighlight(cardInfo);
    }, 300);
  }

  SOL.check();
};

// Make a move
SOL.clickStack = function (stack) {
  console.log(stack);
  // Move to foundation
  if (SOL.game.activeCard
    && SOL.game.activeCard.card.value === 0
    && stack > 1 && stack < 6) {
    console.log('Move card to foundation');
    SOL.move(SOL.game.activeCard.stack, stack, 1);

  // Move Kings to empty stack
  } else if (SOL.game.activeCard
    && SOL.game.activeCard.card.value === 12
    && stack > 5) {
    console.log('Move king to empty field');
    SOL.move(SOL.game.activeCard.stack, stack, 1);
    // TODO MOVE ALL CARDS
  } else {
    // Error flash
    console.log('Failed empty stack interaction');
  }
  setTimeout(function () {
      SOL.deselectLast();
  }, 300);
};


// Check for win or autocompleteabilty
SOL.check = function () {

};


// Move all cards to wincondition
SOL.complete = function () {
  // SOL.game.stacks = [[],[],[a],[a],[a],[a]]
  SOL.rebuild();
};

SOL.new();

// Deselect Active Card
SOL.deselectLast = function () {
  if (SOL.game.activeCard !== null) {
    SOL.dehighlight(SOL.game.activeCard);
    SOL.game.activeCard = null;
  }
}

// Highlight certain card
SOL.highlight = function (cardInfo) {
  document.getElementById(cardInfo.card.id).classList.add('clicked');
}

// Dehighlight certain card
SOL.dehighlight = function (cardInfo) {
  document.getElementById(cardInfo.card.id).classList.remove('clicked');
}

// Checks if two cards have different colors
SOL.differentColor = function (card1, card2) {
  return true;
}
