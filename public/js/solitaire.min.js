// TODO: Tutorial and fancy win screen and loss screen
// TODO: Create cookies for save states and statistics
// TODO: Ditch jquery
// TODO: Refactor
// TODO: Merge drag and drop

// TODO: Fix moving to same stack prediction\
// TODO: Make hints highlight cards

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var stacks = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
var gameStates = [];
var colors = ["hearts", "diamonds", "clubs", "spades"];

var maxGameStates = 1;
var progressiveUndo = true;
var cycleTimes = 2;

var showTimer = false;
var showHelp = true;
var enableHints = false;
var vegasMode = false;
var score = 0;
var madeFirstMove = false;
var stats = {
  games: 0,
  wins: 0,
  bestTime: 0,
  avgTime: 0.0,
  bestScore: 0,
  avgScore: 0.0
};

var gameTime = 0;
var timerStarted = false;
var timerInterval = null;

var toDeleteCard = null;
var toDeleteLastCard = null;
var lastCard = null;
var autoCompletable = false;
var possibleMove = true;

var s_pileToTableau = 5;
var s_tableauToFoundation = 10;
var s_undo = -10;
var s_foundationToTableau = -15;
var s_uncoverFaceDown = 5;

// var dragObject = null;
// var cardUnderCursor = null;
// var mousePos = null;
// var onDownMousePos = null;



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
  if (from > 1 && from < 6) score += s_foundationToTableau;
  else if (to > 1 && to < 6) score += s_tableauToFoundation;
  else if (from === 1 && to > 5) score += s_pileToTableau;
  $("#score").text(score);
}

// Handle card selection and game logic
function cardInteraction(card){

  var cardPos = findCardPos(card);  
  // Click on deck to cycle
  if (numFromCard(card) == last(0)){
    createGameState();
    deckCycle();
    if (lastCard != null) forgetLastCard();
  }
  // Uncover a face down card
  else if (numFromCard(card) >= 52){
    if (lastCard != null) forgetLastCard();
    if (cardPos[1] == stacks[cardPos[0]].length - 1){
      createGameState();
      // change card in stack
      stacks[cardPos[0]][cardPos[1]] = numFromCard(card) - 52;
      // Scoring
      score += s_uncoverFaceDown;
      $("#score").text(score);
      // flip card in DOM
      $(card).toggleClass("card--back");
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
          },250);
        }
    } else {
      // CHECK IF AVAILABLE SLOT IN FOUNDATION
      for (var y = 2; y < 6; y++){
        if (last(y) === numFromCard(lastCard) - 1 ||
        (stacks[y].length === 0 && numFromCard(lastCard) % 13 === 0)){
          createGameState();
          moveElements(lastCardPos[0], y, 1);
          // Scoring
          if (lastCardPos[0] == 1) score += s_pileToTableau;
          $("#score").text(score);
          break;
        }
      }
    }

    // Un-highlight both cards
    toDeleteCard = card;
    toDeleteLastCard = lastCard;
    lastCard = null;
    setTimeout(function(){
      $(toDeleteCard).toggleClass("card--clicked");
      $(toDeleteLastCard).toggleClass("card--clicked");
    },500);
  }
  checkConditions();
  if (enableHints && !vegasMode){
    displayHint();
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
      moveElements(1, 0, 1, true, false);
    }
    cycleTimes -= 1;
    if (cycleTimes == 0)
      $("#stack0").toggleClass("deck__stock--cycle");
  }
}

// Saves a certain amount of game states
function createGameState() {
  if (!madeFirstMove){
    madeFirstMove = true;
    stats.games += 1;
  }
  if (progressiveUndo){
    $(".controls__icon--undo").removeClass("invalid");
  }
  gameStates.push([clone(stacks), score]);
  if (gameStates.length > maxGameStates){
    gameStates.shift();
  }
  // TODO: CREATE COOKIES
}

  // Goes back to the previous game state
function handleUndo () {
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
    // Scoring
    score += s_undo;
    $("#score").text(score);
  }
  if (gameStates.length == 0)
    $(".controls__icon--undo").addClass("invalid");
}

function checkConditions () {
  // Check if there is a possible move
  // if (stacks[0].length === 0 && cycleTimes == 0){
    possibleMove = false;
    for (var i = 6; i < stacks.length; i++) {
      if (!possibleMove){
        for (var j = 6; j < stacks.length; j++) {
          if (!possibleMove){
            for (var x = 0; x < stacks[j].length; x++) { // FIX THIS SHIT
              if (info(last(i)).isFaceDown) {
                console.log("Hint: Uncover face-down card on stack " + (i - 5));
                possibleMove = true; break;
              }
              else if ((j-4 > 1 && j-4 < 6 && last(i) - 1 === last(j-4)) || last(i) % 13 == 0) {
                console.log("Hint: Move card in column " + (i-5) + " to the foundation");
                possibleMove = true; break;
              }
              else if (stacks[i].length == 0 && stacks[j][x] % 13 == 12) {
                console.log("Hint: Move card from column " + (j-5) + " to column " + (i-5));
                possibleMove = true; break;
              }
              else if (info(last(1)).value + 1 == info(last(i)).value && info(last(1)).isBlack != info(last(i)).isBlack) {
                console.log("Hint: Move card from pile to column " + (i - 5));
                possibleMove = true; break;
              }
              else if (last(i)<52 && stacks[j][x]<52 && i != j &&
              info(last(i)).value - 1 === info(stacks[j][x]).value &&
              info(last(i)).isBlack != info(stacks[j][x]).isBlack) {
                console.log("Hint: Move card from column " + (j-5) + " (depth " + (stacks[j].length-x) +") to column " + (i-5));
                possibleMove = true; break;
              }
            } 
          } else break;
        }
      } else break;
    }

    if (!possibleMove && (stacks[0].length > 0 || cycleTimes > 0)) {
          console.log("Hint: Shuffle deck");
          possibleMove = true;
    }
    else if (!possibleMove)
      console.log("Hmm. It seems there are no more possible moves.\nConsider starting a new game.");
  // }

  // Check if you can auto-complete
  if (!autoCompletable){
    if (stacks[0].length === 0 && stacks[1].length < 2 && stacks[2].length > 0 &&
        stacks[3].length > 0 && stacks[4].length > 0 && stacks[5].length > 0){
      autoCompletable = true;
      for (var u = 0; u < stacks.length; u++) {
        for (var w = 0; w < stacks[u].length; w++) {
          if (stacks[u][w] >= 52)
            autoCompletable = false;
        }
      }
      if (autoCompletable){
        $(".autocomplete").toggleClass("autocomplete--visible");
      }
    }
  }

  // Check for win-condition
  if (stacks[2].length + stacks[3].length + stacks[4].length + stacks[5].length === 52){
    winGame();
  }
}

function displayHint () {
  console.log("Stuff");
}

function winGame () {

    // Stop the timer
    timerStarted = false;
    clearInterval(timerInterval);
    // Scoring
    score += Math.floor(700000/gameTime);
    $("#score").text(score);


    // Calculate stats
    var statboard = document.getElementsByClassName("statistics__content");

    if (gameTime < stats.bestTime || stats.games == 0){
      stats.bestTime = gameTime;
      if (!statboard[3].classList.toggle("statistics__content--new"))
        statboard[3].classList.toggle("statistics__content--new");
    }
    if (score > stats.bestScore || stats.games == 0){
      stats.bestScore = score;
      if (!statboard[6].classList.toggle("statistics__content--new"))
        statboard[6].classList.toggle("statistics__content--new");
    }
    stats.avgTime = stats.wins > 0 ? ((stats.wins * stats.avgTime + gameTime)/(stats.wins+1)) : gameTime;
    stats.avgScore = stats.wins > 0 ? ((stats.wins * stats.avgScore + score)/(stats.wins+1)) : score;

    stats.wins += 1;
    
    statboard[3].innerHTML = timeToString(gameTime);
    statboard[4].innerHTML = timeToString(stats.bestTime);
    statboard[5].innerHTML = stats.avgTime.toFixed(2);

    statboard[6].innerHTML = score;
    statboard[7].innerHTML = stats.bestScore;
    statboard[8].innerHTML = stats.avgScore.toFixed(2);

    statboard[9].innerHTML = stats.wins;
    statboard[10].innerHTML = stats.games - stats.wins;
    statboard[11].innerHTML = (1.0 * stats.games / (1.0 * stats.wins)).toFixed(2);

    // Print statistics
    document.getElementsByClassName("statistics")[0].classList.toggle("modal--show");
}

function autoComplete() {
  var tempOrdering = [stacks[2][0], stacks[3][0], stacks[4][0], stacks[5][0]];
  var tempCardCount = 52 - (stacks[2].length + stacks[3].length + stacks[4].length + stacks[5].length);
  score += tempCardCount * (s_tableauToFoundation);
  for (var t = 0; t < stacks.length; t++) {
    stacks[t] = [];
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
  return stacks[stackNum][stacks[stackNum].length-1];
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

function timeToString (time) {
  return (gameTime/3600>=1 ? (Math.floor(gameTime/3600) + ":") : "") + Math.floor(gameTime/60)%60 + ":" + (gameTime%60).toString().padStart(2, "0");
}


////////////////
// GAME SETUP //
////////////////

// Set up a fresh new board
function resetBoard(){

  madeFirstMove = false;
  vegasMode = document.getElementById("cumulative").checked;
  timerReset();
  if (cycleTimes == 0)
    $("#stack0").toggleClass("deck__stock--cycle");
  cycleTimes = 2;
  if (vegasMode) score -= 52; else score = 0;
  $("#score").text(score);
  $(".controls__icon--undo").removeClass("invalid");
  updateTimerVisibility();

  // RESET ALL THE STACKS //
  // Reset stacks
  for (var i = stacks.length - 1; i >= 0; i--) {
    stacks[i] = [];
  }
  // Push 52 new cards to the deck
  while (stacks[0].length < 52){
    var tempLen = stacks[0].length + 52;
    stacks[0].push(tempLen);
  }
  // Shuffle the deck (works similar to insertion sort)
  var j, x;
  for (var k = 52; k; k--) {
      j = Math.floor(Math.random() * k);
      x = stacks[0][k - 1];
      stacks[0][k - 1] = stacks[0][j];
      stacks[0][j] = x;
  }
  // Redistribute deck cards across the tableau in both DOM and stacks
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
  checkConditions();
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
  gameTime = 0;
  if (!timerStarted) {
    timerStarted = true;
    spanValue = $('#timer');
    timerInterval = setInterval(function() {
      gameTime += 1;
      // Scoring
      if (gameTime % 10 === 0)
        score -= 2;
        $("#score").text(score);
      spanValue.text((gameTime/3600>=1 ? (Math.floor(gameTime/3600) + ":") : 
        "") + Math.floor(gameTime/60)%60 + ":" + (gameTime%60).toString().padStart(2, "0"));
    }, 1000);
  }
}

function resetStats() {
  stats = {
    games: 0,
    wins: 0,
    bestTime: 0,
    avgTime: 0,
    bestScore: 0,
    avgScore: 0
  };
  resetBoard();
  this.parentElement.parentElement.classList.toggle("modal--show");
}

function updateTimerVisibility() {
  if (showTimer)
    $("#timerWrapper").removeClass("statistics__item--hidden");
  else
    $("#timerWrapper").addClass("statistics__item--hidden");
}



/////////////////////////
// BUTTON CLICK EVENTS //
/////////////////////////

$("body").on("click", ".card", function(){
  cardInteraction(this);
});

$(".card-placeholder").click(function(){
  handleEmptyFieldInteraction(this);
});

$(".autocomplete").click(autoComplete);

$("#cumulative").click(function(){
  score = 0;
  vegasMode = !vegasMode;
  resetBoard();
});

$("#cycleButton").click(handleCycle);

$("#statResetButton").click(resetStats);

$("#timerBox").click(function(){
  showTimer = !showTimer;
  updateTimerVisibility();
});

// Reset board on new game button click
$(".controls__link--new-game").click(resetBoard);

// Undo a move on undo button click
$(".controls__link--undo").click(handleUndo);

// Start screen tick box
$("#dismiss").click(function(){
  showHelp = !showHelp;
});

// Start screen start game
$(".new-game").click(function(){
  this.parentElement.parentElement.classList.toggle("modal--show");
  resetBoard();
});

// Hotkeys
document.onkeypress = function(e){
  switch(e.which) {
    case 117: handleUndo();
    break; 
    case 26: handleUndo();
    break;
    case 110: resetBoard();
    break;
    case 104: $(".help").toggleClass("modal--show");
    break;
    case 116: console.log("Pressed button to display hint");
    break;
    case 32: if (autoCompletable) autoComplete();
    break;
  }
};



////////////////////
// MAIN EXECUTION //
////////////////////

// TODO: LOAD COOKIES

if (!showHelp){
  resetBoard();
  $(".help").toggleClass("modal--show");
}
else {

}