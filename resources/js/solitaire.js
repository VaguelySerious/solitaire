// TODO: Drag and drop
// TODO: Hints
// TODO: Different games
// TODO: Scoring
// TODO: Menu button code
// TODO: Sounds
// TODO: Tutorial and fancy win screen
// TODO: Create cookies for save states (document.cookie = "_x_=_y_; expires=Thu, 18 Dec 2018 12:00:00 UTC";)

// TODO: Fix too fast clicking leading to weird card movement (fixed by drag and drop)
// TODO: Make cards turn red after a wrong move
// TODO: Turn undo button red or "x" after undos are used up
// TODO: Double click moves card to available foundation
// TODO: Fix undo plz



//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var stacks = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
var gameStates = [];
var maxGameStates = 3;
var cardAmount = 52;
var lastCard = null;
var clickedUndo = false;
var cycleTimes = 2;
var undoTimes = 1;
var score = 0;
var colors = ["hearts", "diamonds", "clubs", "spades"];



////////////////////
// GAME FUNCTIONS //
////////////////////

// Create the DOM element for a given card number
function cardFromNumber(num){
  if (num == null || isNaN(num))
    alert("cardFromNumber(null) was called");
  var divs = [];
  classNames = ["card card--" + colors[Math.floor(num%52/13)]+ " card--" + num%13 + (num < 52 ? "" : " card--back"),
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
  var num = colors.indexOf(arr[1].slice(6)) * 13;
  num += +arr[2].slice(6);
  if (arr[3] === "card--back") num += 52;
  return num;
}

// Tells you where a card is on the board
function findCardPos(card){
  if (card == null) return null;
  var num = numFromCard(card);
  for (var i = 0; i < stacks.length; i++) {
    for (var j = 0; j < stacks[i].length; j++) {
      if (stacks[i][j] === num)
        return [i, j, num];
    }
  }
  alert("ERROR: Card can't be found in any stack.");
  return null;
}

// Cycle through the deck
function deckCycle () {
  addElement(removeElement(0), 1, true, false);
  return stacks[0].length;
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
    stacks[stack].push(num);
    $('#stack'+stack).append(cardFromNumber(num));
  } else {
    stacks[stack].unshift(num);
    $('#stack'+stack).prepend(cardFromNumber(num));
  }
}

// Removes a card from a stack and returns it
function removeElement(stack){
  if (stack != null){
    children = $('#stack'+stack).children("div");
    if (children.length == 0) return null;
    children[children.length - 1].remove();
  }
  return stacks[stack].pop();
}

// Moves a certain amount of cards from one stack to another
function moveElements(from, to, amount){
  var cards = [];
  for (var i = 0; i < amount; i++) {
    cards.push(removeElement(from));
  }
  for (var j = cards.length - 1; j >= 0; j--) {
    addElement(cards[j], to);
  }
}

// Handle card selection and game logic
function cardInteraction(card){

  var cardPos = findCardPos(card);  
  // Click on deck to cycle
  if (numFromCard(card) == stacks[0][stacks[0].length-1]){
    deckCycle();
    if (lastCard != null) forgetLastCard();
    createGameState();
  }
  // Uncover a face down card
  else if (numFromCard(card) >= 52){
    if (lastCard != null) forgetLastCard();
    if (cardPos[1] == stacks[cardPos[0]].length - 1){
      // change card in stack
      stacks[cardPos[0]][cardPos[1]] = numFromCard(card) - 52;
      // flip card in DOM
      $(card).toggleClass("card--back");
      createGameState();
    }
  }
  // Highlight a card
  else if (lastCard == null){
    $(card).toggleClass("card--clicked");
    lastCard = card;
  }
  // Interact with the current and last highlighted card
  else {
    var lastCardPos = findCardPos(lastCard);
    var num1 = numFromCard(card);
    var num2 = numFromCard(lastCard);

    $(card).toggleClass("card--clicked");

    if (lastCard != card && cardPos[0] >= 2){
        // IF the card is one above the other and a different color OR IF it's one above the other and on the foundation
        if ((num2%13 + 1 === num1%13 && (num1 >= 26 && num2 < 26 || num1 < 26 && num2 >= 26)) || 
            (num2 - 1 === num1 && cardPos[0] > 1 && cardPos[0] < 6)){
          moveElements(lastCardPos[0], cardPos[0], stacks[lastCardPos[0]].length - lastCardPos[1]);
          createGameState();
        } else {
          console.log("Clicked two incompatible cards");
          $(lastCard).toggleClass("card--flash");
          $(card).toggleClass("card--flash");
          setTimeout(function(){
            $(card).toggleClass("card--flash");
            $(lastCard).toggleClass("card--flash");
          },500);
        }
    } else {
      console.log("Clicked same card twice");      
    }

    // Un-highlight both cards
    setTimeout(function(){
      $(card).toggleClass("card--clicked");
      $(lastCard).toggleClass("card--clicked");
      lastCard = null;
    },500);
  }

  // Check for win-condition
  if (stacks[2].length + stacks[3].length + stacks[4].length + stacks[5].length === 52){
    alert("CONGRATULATIONS, YOU WON!");
  }
}

// Un-highlight a card and forget it
function forgetLastCard () {
  if ($(lastCard).hasClass("card--clicked"))
    $(lastCard).toggleClass("card--clicked");
  lastCard = null;
}

// Handle placing cards on empty fields
function handleEmptyFieldInteraction(field){
  var stack = field.id.slice(5);
  var lastCardPos = findCardPos(lastCard);
  if (lastCard != null && stacks[stack].length === 0 && stack > 1)
  {
    if ((stack > 5 && numFromCard(lastCard) % 13 === 12) || numFromCard(lastCard) % 13 === 0){
      moveElements(lastCardPos[0], parseInt(stack), stacks[lastCardPos[0]].length - lastCardPos[1]);
    }
    $(lastCard).toggleClass("card--clicked");
    lastCard = null;

    createGameState();
  }
}

// Cycles the pile back onto the deck, while managing the count
function handleCycle(){
  if (cycleTimes>0){
    temp = stacks[1].length;
    for (var i = 0; i < temp; i++) {
      addElement(removeElement(1), 0, true, false);
    }
    cycleTimes -= 1;
    if (cycleTimes == 0)
      $("#stack0").toggleClass("deck__stock--cycle");

    createGameState();
  }
}

// Saves a certain amount of game states
function createGameState() {
  gameStates.push(clone(stacks));
  console.log("Created gamestate.");
  if (gameStates.length > maxGameStates){
    gameStates.shift();
    console.log("shifted gamestate");
  }
  clickedUndo = false;
}

  // Goes back to the previous game state
function handleUndo () {
  if (!clickedUndo) {
    gameStates.pop();
  }
  clickedUndo = true;
  console.log("Clicked undo.");
  if (gameStates.length > 0 && undoTimes > 0){
    undoTimes -= 1;
    stacks = gameStates.pop();
    clearDom();
    rebaseDom();
    console.log("Reverted gamestate. " + gameStates.length + " gameStates remaining.");
  }
  else{
    alert("Undo limit reached. Gamesates: " + gameStates.length + " Undotimes: " + undoTimes);
    // Turn button red?
  }
}

// Clones an array value by value with a depth of 2
// Designed to clone the "stacks" array for gamestate saving
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



////////////////
// GAME SETUP //
////////////////


// Set up a fresh new board
function resetBoard(){

  timerReset();
  if (cycleTimes == 0)
    $("#stack0").toggleClass("deck__stock--cycle");
  cycleTimes = 2;
  $("#score").text(score);

  // RESET ALL THE STACKS //
  // Reset stacks
  for (var i = stacks.length - 1; i >= 0; i--) {
    stacks[i] = [];
  }
  // Push 52 new cards to the deck
  while (stacks[0].length < cardAmount){
    var tempLen = stacks[0].length + 52;
    stacks[0].push(tempLen);
  }
  // Shuffle the deck (works similar to insertion sort)
  var j, x;
  for (var k = cardAmount; k; k--) {
      j = Math.floor(Math.random() * k);
      x = stacks[0][k - 1];
      stacks[0][k - 1] = stacks[0][j];
      stacks[0][j] = x;
  }
  // Redistribute deck cards across the tableu in both DOM and stacks
  for (var h = 6; h < 13; h++){
    for (var l = h-6; l >= 0; l--){
      if (l == 0)
        stacks[h].push(stacks[0].pop() - 52);
      else
        stacks[h].push(stacks[0].pop());
    }
  }

  clearDom();
  rebaseDom();
  createGameState();
}

// Empty all cards from the DOM
function clearDom () {
  for (var i = 0; i < stacks.length; i++) {
    $('#stack'+i).empty();
  }
}

// Apply all cards from stacks to DOM
function rebaseDom () {
  clearDom();
  for (var i = 0; i < stacks.length; i++) {
    for (var j = 0; j < stacks[i].length; j++) {
      $('#stack'+i).append(cardFromNumber(stacks[i][j]));
    }
  }
}

resetBoard();



/////////////////////////
// BUTTON CLICK EVENTS //
/////////////////////////

$("body").on("click", ".card", function(){
  cardInteraction(this);
});

$(".card-placeholder").click(function(){
  handleEmptyFieldInteraction(this);
});

$("#cycleButton").click(function(){
  handleCycle();
});

// Reset board on new game button click
$(".controls__link--new-game").click(function(){
  resetBoard();
});

// Undo a move on undo button clikc
$(".controls__link--undo").click(function(){
  handleUndo();
});