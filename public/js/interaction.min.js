/////////////////////////
// BUTTON CLICK EVENTS //
/////////////////////////

// $("body").on("click", ".card", function(){
//   cardInteraction(this);
// });

// $(".card-placeholder").click(function(){
//   handleEmptyFieldInteraction(this);
// });

// $(".autocomplete").click(autoComplete);

// $("#cumulative").click(function(){
//   score = 0;
//   vegasMode = !vegasMode;
//   resetBoard();
// });

// $("#cycleButton").click(handleCycle);

// $("#statResetButton").click(resetStats);

// $("#timerBox").click(function(){
//   toggleTimer();
// });

// Reset board on new game button click
// $(".controls__link--new-game").click(resetBoard);

// Undo a move on undo button click
// $(".controls__link--undo").click(handleUndo);

// Start screen tick box
// $("#dismiss").click(function(){
  // showHelp = !showHelp;
// });

// Start screen start game
// $(".new-game").click(function(){
  // this.parentElement.parentElement.classList.toggle("modal--show");
  // resetBoard();
// });

// Hotkeys
document.onkeypress = function(e){
  switch(e.which) {
    // case 117: handleUndo();
    // break; 
    // case 26: handleUndo();
    // break;
    // case 110: resetBoard();
    // break;
    case 104: toggleHelp();
    break;
    // case 116: console.log("Pressed button to display hint");
    // break;
    // case 32: if (autoCompletable) autoComplete();
    // break;
  }
};
