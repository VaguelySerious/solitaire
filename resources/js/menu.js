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