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
];
var randomColor = Math.floor(Math.random() * cardColors.length);
$('.board').addClass('board--' + cardColors[randomColor]);

// off-canvas options menu
$(".options-toggle").click(function(){
  $(".options").toggleClass("options--open");
});

// var stats = {
//   games: 0,
//   wins: 0,
//   bestTime: 0,
//   avgTime: 0,
//   bestScore: 0,
//   avgScore: 0
// };