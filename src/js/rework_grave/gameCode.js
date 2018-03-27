
////////////////////////
//  MAIN  GAME  CODE  //
////////////////////////


// Use currentGame here
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

// TODO Load these from cookies if possible
var klondike = new Game(13, 52, 4, exampleDistribution, true, 1);
//var spider
//var freecell

// TODO If loaded from cookies applyDom and fix implements

game = klondike;
// game.newGame();

// EXAMPLE GAMES FOR STATS
// Game 1
klondike.stats.updateGames(1);
klondike.stats.updateScore(600);
klondike.stats.updateMoves(200);
klondike.stats.updateUndos(4);
klondike.stats.values[3][0] = 120;
klondike.stats.commitStats();
// Game 2/3 (one loss)
klondike.stats.updateGames(2);
klondike.stats.updateScore(1200);
klondike.stats.updateMoves(100);
klondike.stats.updateUndos(4);
klondike.stats.values[3][0] = 60;
klondike.stats.commitStats();