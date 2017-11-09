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
document.getElementById("board").className += cardColors[randomColor];

document.getElementsByClassName("options-toggle")[0].onclick =
function () {document.getElementById("options").classList.toggle("options--open");};
document.getElementsByClassName("options-toggle")[1].onclick =
function () {document.getElementById("options").classList.toggle("options--open");};
