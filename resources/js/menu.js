// temporary timer solution for fancy
// function a() {
//   startDate = + new Date();
//   spanValue = $('.statistics__value').last();
//   setInterval(function() {
//     diff = Math.floor((new Date() - startDate) / 1000);
//     mins = Math.floor(diff/60);
//     secs = diff % 60;
//     spanValue.text(mins.toString() + ":" + secs.toString().padStart(2, "0"));
//   }, 1000);
// }

// better timer solution
var gameTime = 0;
var timerStarted = false;
function timerReset() {
  if (!timerStarted) {
    timerStarted = true;
    spanValue = $('.statistics__value').last();
    setInterval(function() {
      gameTime += 1;
      spanValue.text((gameTime/3600>=1 ? (Math.floor(gameTime/3600) + ":") : 
        "") + Math.floor(gameTime/60)%60 + ":" + (gameTime%60).toString().padStart(2, "0"));
    }, 1000);
  } else {
    gameTime = -1;
  }
}

var cardColors = [
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
var randomColor = Math.floor(Math.random() * cardColors.length);
$('.board').addClass('board--' + cardColors[randomColor]);

// off-canvas options menu
$(".options-toggle").click(function(){
  $(".options").toggleClass("options--open");
});