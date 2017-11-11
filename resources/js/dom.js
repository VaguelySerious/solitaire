/////////////////////////
////// DOM HELPERS //////
/////////////////////////

function toggleHelp () {
	return document.getElementsByClassName("help")[0].classList.toggle("modal--show");
}
function toggleStats () {
	return document.getElementsByClassName("statistics")[0].classList.toggle("modal--show");
}
function toggleMenu () {
	return document.getElementsByClassName("options")[0].classList.toggle("options--open");
}
function toggleAutoCompleteMenu () {
	// TODO
}
function toggleTimerView () { // TODO
	return document.getElementById("timerWrapper").classList.toggle("stats__item--hidden");
}
function setScore (str) {
	document.getElementById("score").innerHTML = str;
}
function setTime (num) {
	document.getElementById("timer").innerHTML = timeToString(num);
}
function setMenuText(str) {
	// TODO
}

// TODO maybe more functions

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