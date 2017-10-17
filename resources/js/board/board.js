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

// add highlighting to focused cards
$(".card").click(function(){
  $(this).toggleClass("card--clicked");
});

// off-canvas options menu
$(".options-toggle").click(function(){
  $(".options").toggleClass("options--open");
});