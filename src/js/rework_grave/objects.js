/*
----------------------
Open Solitaire Project
----------------------
*/

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var colors = ["diamonds", "hearts", "spades", "clubs"];
var game = null;
var time = 0;
var timer = null;

///////////////////////
//  CARD DEFINITION  //
///////////////////////

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

///////////////////////////
// BOARD/GAME DEFINITION //
///////////////////////////

// A collection of playing cards //
function Game (size, count, colorCount, distribution, isRandom, maxStates) {
	this.maxStates = maxStates || 1;
	this.count = count;
	this.colorCount = colorCount;
	this.isRandom = isRandom || false;
	this.distribution = distribution || [[1,0],[1,0],[1,0],[1,0]];
	// TODO Set text of menus
	// TODO Track score
	this.stats = new Stats();

	// Initializing the board
	this.newGame = function () {

		// RESET EVERYTHING
		// (EVERYTHING!!!)

		// Close all menus
		if (toggleHelp()) toggleHelp();
		if (toggleStats()) toggleStats();

		toggleTimer(true, 0);
		// TODO scoring

		// TODO fix board being stupid and not refreshing on button click

		this.stacks = [];
		for (var i = 0; i < size; i++) {
			this.stacks.push([]);
		}
		var tempArr = [];
		var tempCount = this.count / this.colorCount;
		// for (var x = 0; x < (count * colorCount / 52)){
			for (var h = 0; h < tempCount; h++) {
				for (var j = 0; j < this.colorCount; j++){
					tempArr.push(new Card(colors[j%this.colorCount], h));
				}
			}
		// }
		tempArr = shuffleArray(tempArr);
		for (var m = 0; m < this.distribution.length; m++) {
			for (var l = 0; l < this.distribution[m].length; l++) {
				this.stacks[m].push(this.distribution[m][l] == 0 ? tempArr.pop() : tempArr.pop().flip());
			}
		}
		
		this.applyToDom();
	};

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

////////////////////////
//  STATS DEFINITION  //
////////////////////////

function Stats(maxStates, cumulative) {
	this.maxStates = maxStates || 1;
	this.cumulative = cumulative || false;
	this.values = [
		[0, 0, 0],		// Games / Wins / Undos
		[0, 0, 0],		// Current, Best, AVG - SCORE
		[0, 0, 0],		// Current, Best, AVG - MOVES
		[0, 0, 0]			// Current, Best, AVG - TIME
	];
	this.valueChanges = [0, 0, 0, 0];
	this.newBest = [false, false, false];
	this.scoreChanges = [];

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
	this.undoScore = function () {
		this.values[1][0] -= scoreChanges.pop();
	};
	this.updateMoves = function (val) {
		this.values[2][0] += val;
	};


	// Called after a win
	// Commits current stats to averages and bests
	// Then cleans all the "current" values
	this.commitStats = function () {

		// Edge case for first game
		if (this.values[0][1] === 0){
			this.newBest = [true, true, true];
			for (var l = 1; l < this.values.length; l++) {
				this.values[l][1] = this.values[l][0];
				this.values[l][2] = this.values[l][0];
			}
		}
		// Normal case
		else {
			var oldValues = [[this.values[1][2]],[this.values[2][2]],[this.values[3][2]]];
			this.newBest = [false, false, false];
			for (var i = 1; i < this.values.length; i++) {
				// Calculate averages
				this.values[i][2] = (this.values[i][2] * this.values[0][1] +
					this.values[i][0]) / (this.values[0][1]+1);
				// Calculate best scores
				if (this.values[i][i==1?0:1] > this.values[i][i==1?1:0]) {
					this.values[i][1] = this.values[i][0];
					this.newBest[i] = true;
				}
				// Calculate change in averages
				this.valueChanges[i] = this.values[i][2] - oldValues[i-1];
			}
			this.valueChanges[0] = (this.values[0][1] / (1.0 *this.values[0][1]) - this.values[0][0] / (this.values[0][1] + 1.00))*100 + "%";
		}

		// Increment wins and print scoreboard
		this.values[0][1] += 1;
		this.print();

		// Clean current values
		for (var j = 1; j < this.values.length; j++) {
			if (!this.cumulative && j != 1) this.values[j][0] = 0;
		}
	};

	// Sets the DOM of the Statistics-Board
	this.print = function () {
		var elements1 = document.getElementsByClassName("statistics__content");
		var elements2 = document.getElementsByClassName("statistics__change");
		
		// Set values
		for (var i = 3; i < 15; i++) {
			elements1[i].innerHTML = this.values[Math.floor((i-3)/3)][(i-3)%3];
		}
		// Set value changes
		for (var j = 0; j < 4; j++) {
			elements2[j].innerHTML = this.valueChanges[j];
			
			// Check if change is positive or negative
			if (j > 1 ? (this.valueChanges[j] < 0) : (this.valueChanges[j] >= 0)){
				elements2[j].classList.add("statistics__change--positive");
				elements2[j].classList.remove("statistics__change--negative");
			}
			else{
				elements2[j].classList.add("statistics__change--negative");
				elements2[j].classList.remove("statistics__change--positive");
			}
		}
	};
}

function toggleTimer (reset, scoreReduction) {
	var res = reset || false;
	var scoreRed = scoreReduction || 0;

	if (reset) setTime(0);
	if (timer != null){
		clearInterval(timer);
		timer = null;
	} else {
		timer = setInterval(function() {
			time += 1;
			setTime(time);
			if (time % 10 == 0){
				game.stats.updateScore(-scoreReduction);
			}
		}, 1000);
	}
}