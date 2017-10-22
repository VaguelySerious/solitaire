// TODO: Hints
// TODO: Different games
// TODO: Loss conditions
// TODO: Tutorial and fancy win screen
// TODO: Create cookies for save states (document.cookie = "_x_=_y_; expires=Thu, 18 Dec 2018 12:00:00 UTC";)

// TODO: Add more sounds
// TODO: Hotkeys for undo and new game and auto-complete
// TODO: Fix too fast clicking leading to weird card movement (fixed by drag and drop)
// TODO: Check if card flash could cause weird behaviour



//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var stacks = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
var gameStates = [];
var maxGameStates = 1;      // Controls the amount of undo times too
var progressiveUndo = true; // If true you can "always" undo the last x steps
var accumulativeScore = false;
var cardAmount = 52;
var lastCard = null;
var dragObject = null;
var cycleTimes = 2;
var score = 0;
var gameTime = 0;
var timerStarted = false;
var timerInterval = null;
var colors = ["hearts", "diamonds", "clubs", "spades"];

var cardUnderCursor = null;
var mousePos = null;
var onDownMousePos = null;



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
  // addElement(removeElement(0), 1, true, false);
  moveElements(0, 1, 1, true, false);
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
  if (from > 1 && from < 6) score -= 15;
  else if (to > 1 && to < 6) score += 10;
  else if (from === 1 && to > 5) score += 5;
  $("#score").text(score);
}

// // Handle card selection and game logic
// function cardInteraction(card){

//   var cardPos = findCardPos(card);  
//   // Click on deck to cycle
//   if (numFromCard(card) == stacks[0][stacks[0].length-1]){
//     createGameState();
//     deckCycle();
//     if (lastCard != null) forgetLastCard();
//   }
//   // Uncover a face down card
//   else if (numFromCard(card) >= 52){
//     if (lastCard != null) forgetLastCard();
//     if (cardPos[1] == stacks[cardPos[0]].length - 1){
//       createGameState();
//       // change card in stack
//       stacks[cardPos[0]][cardPos[1]] = numFromCard(card) - 52;
//       // Scoring
//       score += 5;
//       $("#score").text(score);
//       // flip card in DOM
//       $(card).toggleClass("card--back");
//     }
//   }
//   // Highlight a card
//   else if (lastCard == null){
//     $(card).toggleClass("card--clicked");
//     lastCard = card;
//   }
//   // Interact with the current and last highlighted card
//   else {
//     var lastCardPos = findCardPos(lastCard);
//     var num1 = numFromCard(card);
//     var num2 = numFromCard(lastCard);

//     $(card).toggleClass("card--clicked");

//     if (lastCard != card ){
//         // IF the card is one above the other and a different color OR IF it's one above the other and on the foundation
//         if (((num2%13 + 1 === num1%13 && (num1 >= 26 && num2 < 26 || num1 < 26 && num2 >= 26)) || 
//             (num2 - 1 === num1 && cardPos[0] > 1 && cardPos[0] < 6)) && cardPos[0] >= 2){
//           createGameState();
//           moveElements(lastCardPos[0], cardPos[0], stacks[lastCardPos[0]].length - lastCardPos[1]);
//         } else {
//           $(lastCard).toggleClass("card--flash");
//           $(card).toggleClass("card--flash");
//           var audio = document.getElementById("audio");
//           audio.play();
//           setTimeout(function(){
//             $(card).toggleClass("card--flash");
//             $(lastCard).toggleClass("card--flash");
//           },500);
//         }
//     } else {
//       // CHECK IF AVAILABLE SLOT IN FOUNDATION
//       for (var y = 2; y < 6; y++){
//         if (stacks[y][stacks[y].length-1] === numFromCard(lastCard) - 1 ||
//             (stacks[y].length === 0 && numFromCard(lastCard) % 13 === 0)){
//           createGameState();
//           moveElements(lastCardPos[0], y, 1);
//           break;
//         }
//       }
//     }

//     // Un-highlight both cards
//     setTimeout(function(){
//       $(card).toggleClass("card--clicked");
//       $(lastCard).toggleClass("card--clicked");
//       lastCard = null;
//     },500);
//   }
//   checkConditions();
// }

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
      createGameState();
      moveElements(lastCardPos[0], parseInt(stack), stacks[lastCardPos[0]].length - lastCardPos[1]);
    }
    $(lastCard).toggleClass("card--clicked");
    lastCard = null;
  }
}

// Cycles the pile back onto the deck, while managing the count
function handleCycle(){
  if (cycleTimes>0){
    createGameState();
    temp = stacks[1].length;
    for (var i = 0; i < temp; i++) {
      // addElement(removeElement(1), 0, true, false);
      moveElements(1, 0, 1, true, false);
    }
    cycleTimes -= 1;
    if (cycleTimes == 0)
      $("#stack0").toggleClass("deck__stock--cycle");
  }
}

// Saves a certain amount of game states
function createGameState() {
  if (progressiveUndo){
    $(".controls__icon--undo").removeClass("invalid");
  }
  gameStates.push([clone(stacks), score]);
  if (gameStates.length > maxGameStates){
    gameStates.shift();
  }
}

  // Goes back to the previous game state
function handleUndo () {
  console.log("Clicked undo.");
  if (!progressiveUndo){
    maxGameStates -= 1;
  }
  if (gameStates.length > 0){
    $(".controls__icon--undo").removeClass("invalid");
    var tempStacks = gameStates.pop();
    stacks = tempStacks[0];
    score = tempStacks[1];
    clearDom();
    rebaseDom();
    score -= 10 ;
    $("#score").text(score);
  }
  if (gameStates.length == 0)
    $(".controls__icon--undo").addClass("invalid");
}

function checkConditions () {
  // Check for win-condition
  if (stacks[2].length + stacks[3].length + stacks[4].length + stacks[5].length === 52){
    // Stop the timer
    clearInterval(timerInterval);
    // Scoring
    score += Math.floor(700000/gameTime);
  }
  // Check for loss-condition
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



///////////////////
// DRAG AND DROP //
///////////////////

// Deselect everything on mouse up
document.onmouseup = (function (e) {
  if (dragObject){
    dragObject.style.top = "auto";
    dragObject.style.left = "auto";
    dragObject = null;
    cardInteraction(cardUnderCursor);   
  }
  // $(dragObject).toggleClass("card--dragged");
});

// Select a card on mouse down
$("body").on("mousedown", ".card", function(){
  if (findCardPos(this)[0] != 0) {
    onDownMousePos = mousePos;
    lastCard = this;
    dragObject = this;
  }
  // $(dragObject).toggleClass("card--dragged");
  // CREATE A NEW ELEMENT THAT'S DRAGGED
});

// Track mouse movement
document.onmousemove = (function (e) {
  e = e || window.event;
  mousePos = {
    x: e.pageX,
    y: e.pageY
  };
  if(dragObject){
    dragObject.style.top = (mousePos.y - onDownMousePos.y) + "px"; 
    dragObject.style.left = (mousePos.x - onDownMousePos.x) + "px";
  }
});

// Handle card selection and game logic
function cardInteraction(card){

  console.log("-------------");
  console.log(lastCard);
  console.log(cardUnderCursor);
  console.log("-------------");
  if (lastCard == null) return;
  var cardPos = findCardPos(card);  
  // Click on deck to cycle
  if (numFromCard(card) == stacks[0][stacks[0].length-1]){
    createGameState();
    deckCycle();
  }
  // Uncover a face down card
  else if (numFromCard(card) >= 52){
    if (lastCard != null) forgetLastCard();
    if (cardPos[1] == stacks[cardPos[0]].length - 1){
      createGameState();
      stacks[cardPos[0]][cardPos[1]] = numFromCard(card) - 52;
      score += 5;
      $("#score").text(score);
      $(card).toggleClass("card--back");
    }
  }
  else {
    var lastCardPos = findCardPos(lastCard);
    var num1 = numFromCard(card);
    var num2 = numFromCard(lastCard);

    console.log("Dragged " + num2 + " onto " + num1);

    if (lastCard != card ){
      // IF the card is one above the other and a different color OR IF it's one above the other and on the foundation
      if (((num2%13 + 1 === num1%13 && (num1 >= 26 && num2 < 26 || num1 < 26 && num2 >= 26)) || 
          (num2 - 1 === num1 && cardPos[0] > 1 && cardPos[0] < 6)) && cardPos[0] >= 2){
        createGameState();
        moveElements(lastCardPos[0], cardPos[0], stacks[lastCardPos[0]].length - lastCardPos[1]);
      } else {
        $(lastCard).toggleClass("card--flash");
        $(card).toggleClass("card--flash");
        var audio = document.getElementById("audio");
        audio.play();
        setTimeout(function(){
          $(card).toggleClass("card--flash");
          $(lastCard).toggleClass("card--flash");
        },400);
      }
    }
  }
  lastCard = null;
  checkConditions();
}



////////////////
// GAME SETUP //
////////////////

// Set up a fresh new board
function resetBoard(){

  accumulativeScore = document.getElementById("cumulative").checked;
  timerReset();
  if (cycleTimes == 0)
    $("#stack0").toggleClass("deck__stock--cycle");
  cycleTimes = 2;
  if (accumulativeScore) score -= 52; else score = 0;
  $("#score").text(score);
  $(".controls__icon--undo").removeClass("invalid");

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

function timerReset() {
  if (!timerStarted) {
    timerStarted = true;
    spanValue = $('.statistics__value').last();
    timerInterval = setInterval(function() {
      gameTime += 1;
      // Scoring
      if (gameTime % 10 === 0)
        score -= 2;
        $("#score").text(score);
      spanValue.text((gameTime/3600>=1 ? (Math.floor(gameTime/3600) + ":") : 
        "") + Math.floor(gameTime/60)%60 + ":" + (gameTime%60).toString().padStart(2, "0"));
    }, 1000);
  } else {
    gameTime = 0;
  }
}

resetBoard();



/////////////////////////
// BUTTON CLICK EVENTS //
/////////////////////////

$("body").on("click", ".card", function(){
  // cardInteraction(this);
});

$("body").on("mouseover", ".card", function(){
  cardUnderCursor = this;
});

$(".card-placeholder").click(function(){
  handleEmptyFieldInteraction(this);
});

$("#cumulative").click(function(){
  score = 0;
  if (!accumulativeScore)
    accumulativeScore = true;
  else
    accumulativeScore = false;
  resetBoard();
});

$("#cycleButton").click(handleCycle);

$("#timerBox").click(function(){
  $("#timerWrapper").toggleClass("statistics__item--hidden");
});

// Reset board on new game button click
$(".controls__link--new-game").click(resetBoard);

// Undo a move on undo button clikc
$(".controls__link--undo").click(handleUndo);