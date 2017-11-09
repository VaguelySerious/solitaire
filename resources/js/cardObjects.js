/*
----------------------
Open Solitaire Project
----------------------
*/

// TODO: Card distribution doesn't work quite that well yet
//				with irregualar card/color count
// TODO: Fix cards getting ID from constructor on board.build

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var colors = ["diamonds", "hearts", "spades", "clubs"];

////////////////////////
// OBJECT DEFINITIONS //
////////////////////////

// A playing card //
function Card (color, value, id, faceDown) {
	this.id = id;
	this.color = color;
	this.value = value;
	this.faceDown = faceDown || false;

	// Contructs the self-corresponding DOM element
	this.build = function(){
		var cardBuild = [];
		var classNames = [
			"card card--" + this.color + " card--" + this.value,
			"card__front", "card__color", "card__color", "card__back"
		];

		for (var i = 0; i < classNames.length; i++){
			cardBuild.push(document.createElement("div"));
			cardBuild[i].className += classNames[i];
			if (i != 0) {
				cardBuild[i==2||i==3?1:0].appendChild(cardBuild[i]);
			} else if (this.faceDown) {
				cardBuild[i].className += " card--back";
			}
		}
		return cardBuild[0];
	};

	this.flip = function(){
		this.faceDown = !this.faceDown;
		return this;
	};
}

// A collection of playing cards //
function Board (size, count, colorCount, distribution, isRandom) {
	this.count = count;
	this.colorCount = colorCount;
	this.isRandom = isRandom || false;
	this.distribution = distribution || [[1,0],[1,0],[1,0],[1,0]];

	// Initializing the board
	this.stacks = [];
	for (var i = 0; i < size; i++) {
		this.stacks.push([]);
	}
	tempArr = [];
	count = count / colorCount;
	// for (var x = 0; x < (count * colorCount / 52)){
		for (var h = 0; h < count; h++) {
			for (var j = 0; j < this.colorCount; j++){
				tempArr.push(new Card(colors[j%this.colorCount], h));
			}
		}
	// } // TODO (mostly broken)
	tempArr = shuffleArray(tempArr);
	for (var m = 0; m < this.distribution.length; m++) {
		for (var l = 0; l < this.distribution[m].length; l++) {
			this.stacks[m].push(this.distribution[m][l] == 0 ? tempArr.pop() : tempArr.pop().flip());
		}
	}

	// Mirrors the stacks array to the DOM, returns this object
	this.applyToDom = function () {
		clearDom();
		for (var i = 0; i < this.stacks.length; i++) {
    	for (var j = 0; j < this.stacks[i].length; j++) {
      	document.getElementById("stack"+i).appendChild(this.stacks[i][j].build());
    	}
  	}
  	return this;
	};

	// Adds a card from a stack
	// Returns the new size of the chosen stack
	this.add = function (card, stack, toFront, flip, toDom) {
		if (card==null) return null;
		toFront = toFront || false;
		flip = flip || false;
		toDom = toDom || true;
		if (flip) card.faceDown = ! card.faceDown;
		if (!toFront) {
			if (toDom) document.getElementById("stack"+stack).appendChild(card.build());
			return this.stacks[stack].push(card);
		}
		else {
			if (toDom) document.getElementById("stack"+stack).prepend(card.build());
			return this.stacks[stack].unshift(card);
		}
	};

	// Removes a card from a stack
	// Returns the element that was removed
	this.remove = function (stack, fromFront, noDom) {
		fromFront = fromFront || false;

		children = document.getElementById("stack"+stack).children;
    if (children.length == 0) return null;
    
    if (!fromFront) {
    	children[children.length - 1].remove();
    	return this.stacks[stack].pop();
    } else {
    	children[0].remove();
    	return this.stacks[stack].shift();
    }
	};

	// Moves a certain amount of cards from one stack to another
	// Return true if the correct amount of cards could be moved
	this.move = function (from, to, amount, flipCards, reverseOrder) {
		var cards = [];
		for (var i = 0; i < amount; i++) {
	    cards.push(this.remove(from));
	  }
	  for (var j = cards.length - 1; j >= 0; j--) {
	    this.add(cards[j], to, reverseOrder, flipCards);
	  }
	  return cards[cards.length-1] != null;
	};

	// Finds the position of the card in the stacks
	// Returns the stack and inside-stack-position of the card
	this.findCardPosition = function(card){
		for (var i = 0; i < this.stacks.length; i++) {
	    for (var j = 0; j < this.stacks[i].length; j++) {
	      if (this.stacks[i][j] == card)
	        return {stack: i, pos: j};
	    }
	  }
	  return null;
	};

	// Return a _clone_ of the stacks array
	this.copyStack = function () {
		var n = [];
	  for (var k = 0; k < this.stacks.length; k++) {
	    n.push([]);
	  }
	  for (var i = 0; i < this.stacks.length; i++) {
	    for (var j = 0; j < this.stacks[i].length; j++) {
	      n[i].push(this.stacks[i][j]);
	    }
	  }
	  return n;
	};
}

function Stats(maxStates) { // TODO
	this.values = [
		[0, 0, 0],		// Games / Wins / Undos
		[0, 0, 0],		// Current, Best, AVG - SCORE
		[0, 0, 0],		// Current, Best, AVG - MOVES
		[0, 0, 0]			// Current, Best, AVG - TIME
	];
	this.valueChanges = [0, 0, 0, 0];
	this.newBest = [false, false, false];
	this.scoreChanges = [];

	this.addStats = function () {
		this.newBest = [false, false, false];
		var oldValues = [[this.values[1][2]],[this.values[2][2]],[this.values[3][2]]];
		// Calculate new averages
		for (var i = 1; i < this.values.length; i++) {
			this.values[i][2] = (this.values[i][2] * this.values[0][1] +
				this.values[i][0]) / (this.values[0][1]+1);
		}
		// Calculate change in averages
		this.valueChanges[0] = this.values[0][0] / (1.0 *this.values[0][1]) - this.values[0][0] / (this.values[0][1] + 1.00);
		for (var k = 1; k < this.valueChanges.length; k++) {
			this.valueChanges[k] = this.values[k][2] - oldValues[k-1];
		}

		// SEE IF CHANGES ARE POSITIVE OR NOT

		// Set new best score
		if (this.values[1][2] > this.values[1][1]){
			this.values[1][2] = this.values[1][1];
			this.newBest[0] = true;
		}
		// Set new best moves
		if (this.values[2][2] < this.values[2][1]) {
			this.values[2][2] = this.values[2][1];
			this.newBest[1] = true;
		}
		// Set new best time
		if (this.values[3][2] < this.values[3][1]) {
			this.values[3][2] = this.values[3][1];
			this.newBest[2] = true;
		}
		// Increment wins
		this.wins += 1;
	};

	this.updateGames = function (val) {
		this.values[0][0] += val;
	};
	this.updateUndos = function (val) {
		this.values[0][2] += val;
	};
	this.updateScore = function (val) {
		this.values[1][0] += val;
		setScore(this.values[1][0]);
		this.scoreChanges.push(val);
		if (this.scoreChanges > this.maxStates)
			this.scoreChanges.shift();
	};
	this.revertScore = function () {
		this.values[1][0] -= scoreChanges.pop();
	};
	this.updateMoves = function (val) {
		this.values[2][0] += val;
	};

	this.print = function () {
		var elements = document.getElementsByClassName("statistics__content");
		for (var i = 3; i < 15; i++) { // Set the scoreboard values
			console.log([Math.floor((i-3)/3), (i-3)%3]);
			elements[i].innerHTML = this.values[Math.floor((i-3)/3)][(i-3)%3];
		}
		for (var j = 0; j < 4; j++) {
			document.getElementsByClassName("statistics__change")[j].innerHTML =
				this.valueChanges[j];
			// TODO SET IF CHANGE POSITIVE OR NEGATIVE
		}

	};

	this.somethingsomethingTimer = function () {
		//TODO
	};

}

// A handler for a single game type, i.e. Klondike
// Keeps track of statistics and everything for _that_ game
// Handles cookies, save states and undos
function Game (maxGameStates) { // TODO Pass params of board?
	this.maxGameStates = maxGamesStates;
	this.stats = new Stats(maxGameStates);
	// Control text of menus
	
	// Track score
}



////////////////////////
//  MAIN  GAME  CODE  //
////////////////////////

var currentGame = null;
// This is so that a click on "start playing" button
// will always just execute the function currentGame.newGame()
// independent of which game is being played



/////////////////////////////
// TEST GAME CODE TO DEBUG //
/////////////////////////////

var exampleDistribution = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
	[],
	[],
	[],
	[],
	[],
	[0],
	[1,0],
	[1,1,0],
	[1,1,1,0],
	[1,1,1,1,0],
	[1,1,1,1,1,0],
	[1,1,1,1,1,1,0],
];

toggleHelp();
var b = new Board(13, 52, 4, exampleDistribution);
var a = new Stats(1);
a.print();
// b.applyToDom();