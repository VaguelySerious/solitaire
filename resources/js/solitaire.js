// Playground for me to mess around with the game code
// Later this should be easily implementable by doing that <script src="public/js/solitaire.js"></script> thingy

// Cards are intentified by numbers: 0, 13, 26 and 39 are aces and 1, 14, 27 and 40 are 2s etc.
// Types: 0-12 are hearts, 13-25 are diamonds, 26-38 are clubs, and 39-51 are spades
// Advantage of the system: card % 13 = typeless version of iteself, floor(card / 13) gives you the type of the card,
// card >= 26 is true if the card is black, false if it's red

// If I want to check if a card (x) can be dragged onto another card (y) in the tableu,
// I can simply check if (x+1)%13 == y%13 && (x>=26)!=(y>=26)

// 13 arrays for all the cards to go in.
// At game start the cards will be shuffled into the deck (stack[0]) and then distributed according to game rules
var stacks = [[],[],[],[],[],[],[],[],[],[],[],[],[]];
var cardAmount = 52;
var denoms = ["Deck:    ", "Pile:    ", "Top1:    ", "Top2:    ", "Top3:    ", "Top4:    ", "Column1:    ",
"Column2:    ", "Column3:    ", "Column4:    ", "Column5:    ", "Column6:    ", "Column7:    "];
var colors = ["hearts", "diamonds", "clubs", "spades"];
var names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", ];

// Set up a fresh new board
function resetBoard(){

  // Reset stacks
  for (var i = stacks.length - 1; i >= 0; i--) {
    stacks[i] = [];
  }

  // Push 52 new cards to the deck
  while (stacks[0].length < cardAmount)
    stacks[0].push(stacks[0].length+53);

  // Shuffle the deck (works similar to insertion sort)
  var j, x;
  for (i = cardAmount; i; i--) {
    j = Math.floor(Math.random() * i);
    x = stacks[0][i - 1];
    stacks[0][i - 1] = stacks[0][j];
    stacks[0][j] = x;
  }

  // Redistribute deck cards across the tableu
  for (i = 6; i < 13; i++){
    for (j = 0; j <= i-6; j++){
      stacks[i].push(stacks[0].pop());
    }
  }

  // Put the last card of every stack face up
  for (i = 6; i < 13; i++){
    stacks[i].push(stacks[i].pop() - 52);
  }

  refreshBoard();
}

// Apply the card distribution to the DOM
function refreshBoard(){
	$('#stack0').append(createCard(51));
}

// Create the html for a given card number
function createCard(num){
	var divs = [];
	classNames = ["card card--" + colors[Math.floor(num%52/13)]+ " card--" + num%13 + (num < 52 ? "" : " card--back"),
								 "card__front", "card__color", "card__color", "card__back"];
	for (var i = 0; i < classNames.length; i++){
		divs.push(document.createElement("div"));
		divs[i].className += classNames[i];
		i != 0 ? (divs[i==2 || i==3 ? 1 : 0].appendChild(divs[i])) : null;
	}
	return divs[0];
}

function deconstructCard(div){
	var arr = div.className.split(" ");
	var num = colors.indexOf(arr[1].slice(6)) * 13; //TODO: FIX THIS LATER PLS
	num += +arr[2].slice(6);
	if (arr.length > 3) {num += 52;}
	return num;
}

// This function takes a "drag and drop" input and executed the necessary game logic
function boardInteraction(num1, num2){
	var foo = 'test';
}

function cardFromNumber(num){
	if (num < 0 || num >= cardAmount)
		return "Error: Invalid number!";
	if (num >= 52)
		return num + " is face down.";
	else
		return num + " is a " + (num >= 26 ? "black " : "red ") + (names[num%13]) + " of " + colors[Math.floor(num/13)] + ".";
}

resetBoard();

// Create a string representation of the board (for debugging)
var boardstring = "";
for (var i = 0; i < stacks.length; i++) {
  boardstring += denoms[i] + stacks[i] + "\n";
}

// Print the full board as an alert
console.log(boardstring);
