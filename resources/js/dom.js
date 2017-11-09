// TODO: Fix toggle timer

/////////////////////////
////// DOM HELPERS //////
/////////////////////////

function toggleHelp () {
	document.getElementsByClassName("help")[0].classList.toggle("modal--show");
}
function toggleStats () {
	document.getElementsByClassName("statistics")[0].classList.toggle("modal--show");
}
function toggleMenu () {
	document.getElementsByClassName("options")[0].classList.toggle("options--open");
}
function toggleTimer () {
	document.getElementById("timerWrapper").classList.toggle("statistics__item-hidden");
}
function setScore (str) {
	document.getElementById("score").innerHTML = str;
}
function setTime (num) {
	document.getElementById("timer").innerHTML = timeToString(num);
}

// function setMenuText
// function toggle autocompleteMenu
// function 

// Clears all stacks in DOM, returns number of stacks cleared
function clearDom () {
	var i = 0;
  var tempNode = document.getElementById("stack"+i);
  while (tempNode) {
    tempNode.innerHTML = "";
    i++;
    tempNode = document.getElementById("stack"+i);
  }
  return i;
}