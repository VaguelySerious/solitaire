// TODO: Drag and drop
// TODO: Undo button
// TODO: Hints
// TODO: Different games
// TODO: Scoring
// TODO: Menu button code
// TODO: Sounds
// TODO: Tutorial and fancy win screen

// TODO: Fix too fast clicking leading to weird card movement (fixed by drag and drop)
// TODO: Make cards turn red after a wrong move
// TODO: Add effect for flipping cards



//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var stacks = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
var cardAmount = 52;
var lastCard = null;
var cycleTimes = 2;
var score = 0;
var colors = ["hearts", "diamonds", "clubs", "spades"];



////////////////////
// GAME FUNCTIONS //
////////////////////

// Create the DOM element for a given card number
function cardFromNumber(num){
	num == null || num == NaN ? alert("cardFromNumber(null) was called") : null;
	var divs = [];
	classNames = ["card card--" + colors[Math.floor(num%52/13)]+ " card--" + num%13 + (num < 52 ? "" : " card--back"),
								 "card__front", "card__color", "card__color", "card__back"]
	for (var i = 0; i < classNames.length; i++){
		divs.push(document.createElement("div"));
		divs[i].className += classNames[i];
		i != 0 ? divs[i==2 || i==3 ? 1 : 0].appendChild(divs[i]) : null;
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
	if (num == null || num == NaN) return null;
	flip = flip | false;
	pos = pos | false;
	flip ? (num >= 52 ? num -= 52 : num += 52) : null;
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
	for (var i = cards.length - 1; i >= 0; i--) {
		addElement(cards[i], to);
	}
}

// Handle card selection and game logic
function cardInteraction(card){

	var cardPos = findCardPos(card);	

	// Click on deck to cycle
	if (numFromCard(card) == stacks[0][stacks[0].length-1]){
		// console.log(`cycled ${stacks[0][stacks[0].length-1]} from deck to pile`);
		deckCycle();
	}
	// Uncover a face down card
	else if (numFromCard(card) >= 52){
		if (lastCard != null){
			$(lastCard).toggleClass("card--clicked");
			lastCard = null;
		} else if (cardPos[1] == stacks[cardPos[0]].length - 1){
			// addElement(removeElement(cardPos[0]), cardPos[0], true, false);
			// change card in stack
			stacks[cardPos[0]][cardPos[1]] = numFromCard(card) - 52;
			// flip card in DOM
			$(card).toggleClass("card--back");
			console.log(card.className);
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
				if ((num2%13 + 1 === num1%13 && (num1 >= 26 && num2 < 26 || num1 < 26 && num2 >= 26))
					|| (num2 - 1 === num1 && cardPos[0] > 1 && cardPos[0] < 6)){
					moveElements(lastCardPos[0], cardPos[0], stacks[lastCardPos[0]].length - lastCardPos[1]);
				}
				else {
					// TURN RED
				}
		}

		// Un-highlight both cards
		setTimeout(function(){
			$(card).toggleClass("card--clicked");
			$(lastCard).toggleClass("card--clicked");
			lastCard = null;
		},500)
	}

	// Check for win-condition
	if (stacks[2].length + stacks[3].length + stacks[4].length + stacks[5].length === 52){
		alert("CONGRATULATIONS, YOU WON!");
	}
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
	}
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
  for (var i = cardAmount; i; i--) {
      j = Math.floor(Math.random() * i);
      x = stacks[0][i - 1];
      stacks[0][i - 1] = stacks[0][j];
      stacks[0][j] = x;
  }
  // Redistribute deck cards across the tableu in both DOM and stacks
  for (var i = 6; i < 13; i++){
    for (var j = i-6; j >= 0; j--){
      j == 0 ? stacks[i].push(stacks[0].pop() - 52) : stacks[i].push(stacks[0].pop());
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
  alert("Undo function not implemented.");
});