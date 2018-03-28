// TODO: Create cookies for saves
// TODO: Remove scss that's not needed
// TODO: Fix hints
// TODO: Make Sol function and initialize
// TODO: Put all functions into Sol

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var Sol = {
  settings: {
    maxGameStates: 1,
    progressiveUndo: 1,
    cycleTimes: 2
  },
  scoring: {
    pileToTableau: 5,
    tableauToFoundation: 10,
    undo: -10,
    foundationToTableau: -15,
    uncoverFaceDown: 5
  },
  gamedata: {
    colors: ["hearts", "diamonds", "clubs", "spades"],
    stacks: [[],[],[],[],[],[],[],[],[],[],[],[],[]],
    gameStates: []
  },
  stats: {
    score: 0,
    gameTime: 0,
    bestTime: 9999999,
    bestScore: 0,
    timerStarted: false,
    timerInterval: null,
    scoreNode: null,
    timerNode: null
  },
  cardstate: {
    toDeleteCard: null,
    toDeleteLastCard: null,
    lastCard: null,
    autoCompletable: false,
    possibleMove: true
  },
  dom: {

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
}
document.getElementById("board").className += Sol.cardColors[Math.floor(Math.random() * Sol.cardColors.length)];


////////////////////
// GAME FUNCTIONS //
////////////////////

// Create the DOM element for a given card number
function cardFromNumber(num){
  if (num == null || isNaN(num))
    alert("cardFromNumber(null) was called");
  var divs = [];
  classNames = ["card card--" + Sol.gamedata.colors[Math.floor(num%52/13)]+ " card--" + num%13 + (num < 52 ? "" : " card--back"),
                 "card__front", "card__color", "card__color", "card__back"];
  for (var i = 0; i < classNames.length; i++){
    divs.push(document.createElement("div"));
    divs[i].className += classNames[i];
    if (i != 0)
      divs[i==2 || i==3 ? 1 : 0].appendChild(divs[i]);
  }
  return divs[0];
}

// Get card number from DOM element
function numFromCard(card){
  var arr = card.className.split(" ");
  var num = Sol.gamedata.colors.indexOf(arr[1].slice(6)) * 13;
  num += +arr[2].slice(6);
  if (arr[3] === "card--back") num += 52;
  return num;
}

// Tells you where a card is on the board
function findCardPos(card){
  if (card == null) return null;
  var num = numFromCard(card);
  for (var i = 0; i < Sol.gamedata.stacks.length; i++) {
    for (var j = 0; j < Sol.gamedata.stacks[i].length; j++) {
      if (Sol.gamedata.stacks[i][j] === num)
        return [i, j, num];
    }
  }
  alert("ERROR: Card can't be found in any stack.");
  return null;
}

// Cycle through the deck
function deckCycle () {
  moveElements(0, 1, 1, true, false);
  return Sol.gamedata.stacks[0].length;
}

// Add a card to both Stacks and the DOM
function addElement(num, stack, flip, pos){
  if (num == null || isNaN(num)) return null;

  flip = flip | false;
  pos = pos | false;
  if (flip){
    if (num >= 52)
      num -= 52;
    else
      num += 52;
  }
  if (!pos){
    Sol.gamedata.stacks[stack].push(num);
    document.getElementById('stack'+stack).append(cardFromNumber(num))
  } else {
    Sol.gamedata.stacks[stack].unshift(num);
    document.getElementById('stack'+stack).prepend(cardFromNumber(num))
  }
}

// Removes a card from a stack and returns it
function removeElement(stack){
  if (stack != null){
    children = document.getElementById('stack'+stack).childNodes;
    if (children.length == 0) return null;
    children[children.length - 1].outerHTML = "";
  }
  return Sol.gamedata.stacks[stack].pop();
}

// Moves a certain amount of cards from one stack to another
function moveElements(from, to, amount, flip, pos){
  flip = flip | false;
  pos = pos | false;
  var cards = [];
  for (var i = 0; i < amount; i++) {
    cards.push(removeElement(from));
  }
  for (var j = cards.length - 1; j >= 0; j--) {
    addElement(cards[j], to, flip, pos);
  }

  // Scoring
  if (from > 1 && from < 6) Sol.stats.score += Sol.scoring.foundationToTableau;
  else if (to > 1 && to < 6) Sol.stats.score += Sol.scoring.tableauToFoundation;
  else if (from === 1 && to > 5) Sol.stats.score += Sol.scoring.pileToTableau;
  updateScore();
}

// Handle card selection and game logic
function cardInteraction(card){

  var cardPos = findCardPos(card);  
  // Click on deck to cycle
  if (numFromCard(card) == last(0)){
    createGameState();
    deckCycle();
    if (Sol.cardstate.lastCard != null) forgetLastCard();
  }
  // Uncover a face down card
  else if (numFromCard(card) >= 52){
    if (Sol.cardstate.lastCard != null) forgetLastCard();
    if (cardPos[1] == Sol.gamedata.stacks[cardPos[0]].length - 1){
      createGameState();
      // change card in stack
      Sol.gamedata.stacks[cardPos[0]][cardPos[1]] = numFromCard(card) - 52;
      // Scoring
      Sol.stats.score += Sol.scoring.uncoverFaceDown;
      updateScore();
      // flip card in DOM
      card.classList.toggle("card--back");
    }
  }
  // Highlight a card
  else if (Sol.cardstate.lastCard == null){
    card.classList.toggle("card--clicked");
    Sol.cardstate.lastCard = card;
  }
  // Interact with the current and last highlighted card
  else {
    var lastCardPos = findCardPos(Sol.cardstate.lastCard);
    var num1 = numFromCard(card);
    var num2 = numFromCard(Sol.cardstate.lastCard);

    card.classList.toggle("card--clicked");

    if (Sol.cardstate.lastCard != card ){
        // IF the card is one above the other and a different color OR IF it's one below the other and on the foundation
        if (((num2%13 + 1 === num1%13 && (num1 >= 26 && num2 < 26 || num1 < 26 && num2 >= 26)) || 
        (num2 - 1 === num1 && cardPos[0] > 1 && cardPos[0] < 6)) && cardPos[0] >= 2){
          createGameState();
          moveElements(lastCardPos[0], cardPos[0], Sol.gamedata.stacks[lastCardPos[0]].length - lastCardPos[1]);
        } else {
          Sol.cardstate.lastCard.classList.toggle("card--flash");
          card.classList.toggle("card--flash");
          setTimeout(function(){
            card.classList.toggle("card--flash");
            Sol.cardstate.lastCard.classList.toggle("card--flash");
          },250);
        }
    } else {
      // Check if there is available slot in foundation
      for (var y = 2; y < 6; y++){
        if (last(y) === numFromCard(Sol.cardstate.lastCard) - 1 ||
        (Sol.gamedata.stacks[y].length === 0 && numFromCard(Sol.cardstate.lastCard) % 13 === 0)){
          createGameState();
          moveElements(lastCardPos[0], y, 1);
          // Scoring
          if (lastCardPos[0] == 1) Sol.stats.score += Sol.scoring.pileToTableau;
          updateScore();
          break;
        }
      }
    }

    // Un-highlight both cards
    Sol.cardstate.toDeleteCard = card;
    Sol.cardstate.toDeleteLastCard = Sol.cardstate.lastCard;
    Sol.cardstate.lastCard = null;
    setTimeout(function(){
      Sol.cardstate.toDeleteCard.classList.toggle("card--clicked");
      Sol.cardstate.toDeleteLastCard.classList.toggle("card--clicked");
    },500);
  }
  checkConditions();
}

// Un-highlight a card and forget it
function forgetLastCard () {
  Sol.cardstate.lastCard.classList.remove("card--clicked");
  Sol.cardstate.lastCard = null;
}

// Handle placing cards on empty fields
function handleEmptyFieldInteraction(field){
  var stack = field.id.slice(5);
  if (Sol.cardstate.lastCard != null && Sol.gamedata.stacks[stack].length === 0 && stack > 1)
  {
    var lastCardPos = findCardPos(Sol.cardstate.lastCard);
    if ((stack > 5 && numFromCard(Sol.cardstate.lastCard) % 13 === 12) || numFromCard(Sol.cardstate.lastCard) % 13 === 0){
      createGameState();
      moveElements(lastCardPos[0], parseInt(stack), Sol.gamedata.stacks[lastCardPos[0]].length - lastCardPos[1]);
    }
    Sol.cardstate.lastCard.classList.toggle("card--clicked");
    Sol.cardstate.lastCard = null;
  }
}

// Cycles the pile back onto the deck, while managing the count
function handleCycle(){
  if (Sol.settings.cycleTimes>0){
    createGameState();
    temp = Sol.gamedata.stacks[1].length;
    for (var i = 0; i < temp; i++) {
      moveElements(1, 0, 1, true, false);
    }
    Sol.settings.cycleTimes -= 1;
    if (Sol.settings.cycleTimes == 0)
      document.getElementById('stack0').classList.toggle("deck__stock--cycle");
  }
}

// Saves a certain amount of game states
function createGameState() {
  if (!Sol.stats.timerStarted){
    Sol.stats.timerStarted = true;
    startTimer();
  }
  if (Sol.settings.progressiveUndo){
    document.getElementsByClassName("controls__icon--undo")[0].classList.remove("invalid");
  }
  Sol.gamedata.gameStates.push([clone(Sol.gamedata.stacks), Sol.stats.score]);
  if (Sol.gamedata.gameStates.length > Sol.settings.maxGameStates){
    Sol.gamedata.gameStates.shift();
  }
  // TODO: CREATE COOKIES
}

  // Goes back to the previous game state
function handleUndo () {
  if (!Sol.settings.progressiveUndo){
    Sol.settings.maxGameStates -= 1;
  }
  if (Sol.gamedata.gameStates.length > 0){
    document.getElementsByClassName("controls__icon--undo")[0].classList.remove("invalid");
    var tempStacks = Sol.gamedata.gameStates.pop();
    Sol.gamedata.stacks = tempStacks[0];
    Sol.stats.score = tempStacks[1];
    clearDom();
    rebaseDom();
    // Scoring
    Sol.stats.score += Sol.scoring.undo;
    updateScore();
  }
  if (Sol.gamedata.gameStates.length == 0)
    document.getElementsByClassName("controls__icon--undo")[0].classList.add("invalid");
}

function checkConditions () {
  // Check if there is a possible move
  Sol.cardstate.possibleMove = false;
  for (var i = 6; i < Sol.gamedata.stacks.length; i++) {
    if (!Sol.cardstate.possibleMove){
      for (var j = 6; j < Sol.gamedata.stacks.length; j++) {
        if (!Sol.cardstate.possibleMove){
          for (var x = 0; x < Sol.gamedata.stacks[j].length; x++) { // FIX THIS SHIT
            if (info(last(i)).isFaceDown) {
              console.log("Hint: Uncover face-down card on stack " + (i - 5));
              Sol.cardstate.possibleMove = true; break;
            }
            else if ((j-4 > 1 && j-4 < 6 && last(i) - 1 === last(j-4)) || last(i) % 13 == 0) {
              console.log("Hint: Move card in column " + (i-5) + " to the foundation");
              Sol.cardstate.possibleMove = true; break;
            }
            else if (Sol.gamedata.stacks[i].length == 0 && Sol.gamedata.stacks[j][x] % 13 == 12) {
              console.log("Hint: Move card from column " + (j-5) + " to column " + (i-5));
              Sol.cardstate.possibleMove = true; break;
            }
            else if (info(last(1)).value + 1 == info(last(i)).value && info(last(1)).isBlack != info(last(i)).isBlack) {
              console.log("Hint: Move card from pile to column " + (i - 5));
              Sol.cardstate.possibleMove = true; break;
            }
            else if (last(i)<52 && Sol.gamedata.stacks[j][x]<52 && i != j &&
            info(last(i)).value - 1 === info(Sol.gamedata.stacks[j][x]).value &&
            info(last(i)).isBlack != info(Sol.gamedata.stacks[j][x]).isBlack) {
              console.log("Hint: Move card from column " + (j-5) + " (depth " + (Sol.gamedata.stacks[j].length-x) +") to column " + (i-5));
              Sol.cardstate.possibleMove = true; break;
            }
          } 
        } else break;
      }
    } else break;
  }

  if (!Sol.cardstate.possibleMove && (Sol.gamedata.stacks[0].length > 0 || Sol.settings.cycleTimes > 0)) {
        console.log("Hint: Shuffle deck");
        Sol.cardstate.possibleMove = true;
  }
  else if (!Sol.cardstate.possibleMove)
    console.log("Hmm. It seems there are no more possible moves.\nConsider starting a new game.");

  // Check if you can auto-complete
  if (!Sol.cardstate.autoCompletable){
    if (Sol.gamedata.stacks[0].length === 0 && Sol.gamedata.stacks[1].length < 2 && Sol.gamedata.stacks[2].length > 0 &&
        Sol.gamedata.stacks[3].length > 0 && Sol.gamedata.stacks[4].length > 0 && Sol.gamedata.stacks[5].length > 0){
      Sol.cardstate.autoCompletable = true;
      for (var u = 0; u < Sol.gamedata.stacks.length; u++) {
        for (var w = 0; w < Sol.gamedata.stacks[u].length; w++) {
          if (Sol.gamedata.stacks[u][w] >= 52)
            Sol.cardstate.autoCompletable = false;
        }
      }
      if (Sol.cardstate.autoCompletable){
        document.getElementsByClassName("autocomplete")[0].classList.toggle("autocomplete--visible");
      }
    }
  }

  // Check for win-condition
  if (Sol.gamedata.stacks[2].length + Sol.gamedata.stacks[3].length + Sol.gamedata.stacks[4].length + Sol.gamedata.stacks[5].length === 52){
    winGame();
  }
}

function winGame () {

    // Stop the timer
    stopTimer();
    
    // Scoring
    Sol.stats.score += Math.floor(700000/Sol.stats.gameTime);
    updateScore();

    // Calculate stats
    var statboard = document.getElementsByClassName("statistics__content");
    if (Sol.stats.gameTime < Sol.stats.bestTime){
      Sol.stats.bestTime = Sol.stats.gameTime;
    }
    if (Sol.stats.score > Sol.stats.bestScore){
      Sol.stats.bestScore = Sol.stats.score;
    }

    // Print stats
    statboard[0].innerHTML = Sol.stats.score;
    statboard[1].innerHTML = Sol.stats.bestScore;
    statboard[2].innerHTML = timeToString(Sol.stats.gameTime);
    statboard[3].innerHTML = timeToString(Sol.stats.bestTime);
    document.getElementsByClassName("statistics")[0].classList.toggle("modal--show");
}

function autoComplete() {
  var tempOrdering = [Sol.gamedata.stacks[2][0], Sol.gamedata.stacks[3][0], Sol.gamedata.stacks[4][0], Sol.gamedata.stacks[5][0]];
  var tempCardCount = 52 - (Sol.gamedata.stacks[2].length + Sol.gamedata.stacks[3].length + Sol.gamedata.stacks[4].length + Sol.gamedata.stacks[5].length);
  Sol.stats.score += tempCardCount * (Sol.scoring.tableauToFoundation);
  for (var t = 0; t < Sol.gamedata.stacks.length; t++) {
    Sol.gamedata.stacks[t] = [];
  }
  for (var i = 0; i < 13; i++) {
    for (var j = 0; j < 4; j++) {
      addElement(i + tempOrdering[j], j+2);
    }
  }
  clearDom();
  rebaseDom();
  checkConditions();
}

// Clones an array value by value with a depth of 2 (for gamestate copying)
function clone (arr) {
  n = [];
  for (var k = 0; k < arr.length; k++) {
    n.push([]);
  }
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      n[i].push(arr[i][j]);
    }
  }
  return n;
}

function last (stackNum) {
  return Sol.gamedata.stacks[stackNum][Sol.gamedata.stacks[stackNum].length-1];
}

function info (cardNum) {
  var down = false;
  if (cardNum >= 52){
    cardNum -= 52;
    down = true;
  }
  return {
    value: cardNum % 13,
    isBlack: cardNum >= 26 ? true : false,
    isFaceDown: down
  };
}

function timeToString (seconds) {
  return (seconds/3600>=1 ? (Math.floor(seconds/3600) + ":") : "") +
  (Math.floor(seconds/60)%60).toString().padStart(2, "0") + ":" +
  (seconds%60).toString().padStart(2, "0");
}

////////////////
// GAME SETUP //
////////////////

// Set up a fresh new board
function resetBoard(){

  stopTimer();
  clearTimer();
  Sol.settings.cycleTimes = 2;
  Sol.stats.score = 0;
  document.getElementById("stack0").classList.add("deck__stock--cycle");
  document.getElementById("score").innerHTML = Sol.stats.score;
  document.getElementsByClassName("controls__icon--undo")[0].classList.remove("invalid");

  // RESET ALL THE STACKS //
  // Reset Sol.gamedata.stacks
  for (var i = Sol.gamedata.stacks.length - 1; i >= 0; i--) {
    Sol.gamedata.stacks[i] = [];
  }
  // Push 52 new cards to the deck
  while (Sol.gamedata.stacks[0].length < 52){
    var tempLen = Sol.gamedata.stacks[0].length + 52;
    Sol.gamedata.stacks[0].push(tempLen);
  }
  // Shuffle the deck (works similar to insertion sort)
  var j, x;
  for (var k = 52; k; k--) {
      j = Math.floor(Math.random() * k);
      x = Sol.gamedata.stacks[0][k - 1];
      Sol.gamedata.stacks[0][k - 1] = Sol.gamedata.stacks[0][j];
      Sol.gamedata.stacks[0][j] = x;
  }
  // Redistribute deck cards across the tableau in both DOM and Sol.gamedata.stacks
  for (var h = 6; h < 13; h++){
    for (var l = h-6; l >= 0; l--){
      if (l == 0)
        Sol.gamedata.stacks[h].push(Sol.gamedata.stacks[0].pop() - 52);
      else
        Sol.gamedata.stacks[h].push(Sol.gamedata.stacks[0].pop());
    }
  }

  clearDom();
  rebaseDom();
  checkConditions();
}

// Empty all cards from the DOM
function clearDom () {
  for (var i = 0; i < Sol.gamedata.stacks.length; i++) {
    document.getElementById('stack'+i).innerHTML = "";
  }
}

// Apply all cards from Sol.gamedata.stacks to DOM
function rebaseDom () {
  clearDom();
  for (var i = 0; i < Sol.gamedata.stacks.length; i++) {
    for (var j = 0; j < Sol.gamedata.stacks[i].length; j++) {
      document.getElementById('stack'+i).append(cardFromNumber(Sol.gamedata.stacks[i][j]));
    }
  }
}

function startTimer() {
  Sol.stats.timerStarted = true;
  spanValue = document.getElementById('timer');
  Sol.stats.timerInterval = setInterval(function() {
    Sol.stats.gameTime += 1;
    // Scoring
    if (Sol.stats.gameTime % 10 === 0) {
      Sol.stats.score -= 2;
      document.getElementById("score").innerHTML = Sol.stats.score;
    }
    spanValue.innerHTML = Sol.stats.gameTime/3600>=1 ? (Math.floor(Sol.stats.gameTime/3600) + ":") :  "" + Math.floor(Sol.stats.gameTime/60)%60 + ":" + (Sol.stats.gameTime%60).toString().padStart(2, "0");
  }, 1000);
}

function stopTimer() {
  Sol.stats.timerStarted = false; 
  clearInterval(Sol.stats.timerInterval);
}

function clearTimer() {
  Sol.stats.gameTime = 0;
  document.getElementById('timer').innerText = '0:00';
}

function updateScore () {
   document.getElementById('score').innerHTML = Sol.stats.score;
}


/////////////////////
// EVENT LISTENERS //
/////////////////////

document.body.addEventListener("click", function(event){
  if (event.target.parentNode.classList.contains('card')){
    cardInteraction(event.target.parentNode);
  } else if (event.target.classList.contains('tableau__column')) {
    handleEmptyFieldInteraction(event.target);
  }
});

// Autocomplete on pressing the autocomplete button
document.getElementsByClassName("autocomplete")[0].addEventListener('click', autoComplete);
// Cyckle the deck on empty deck click
document.getElementById("cycleButton").addEventListener('click', handleCycle);
// Reset board on new game button click
document.getElementsByClassName("controls__link--new-game")[0].addEventListener('click', resetBoard);
// Undo a move on undo button click
document.getElementsByClassName("controls__link--undo")[0].addEventListener('click', handleUndo);
// Restart game from scorescreen
document.getElementsByClassName("new-game")[0].addEventListener('click', function(){
  document.getElementsByClassName("statistics")[0].classList.toggle("modal--show");
  resetBoard();
});

// Hotkeys
document.onkeypress = function(e){
  switch(e.which) {
    // U
    case 117: handleUndo();
    break; 
    // CTRL-Z
    case 26: handleUndo();
    break;
    // N
    case 110: resetBoard();
    break;
  }
};


////////////////////
// MAIN EXECUTION //
////////////////////

// TODO: LOAD COOKIES
resetBoard();
