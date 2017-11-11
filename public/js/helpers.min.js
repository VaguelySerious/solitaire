////////////////////////
/// HELPER FUNCTIONS ///
////////////////////////

function timeToString (seconds) {
	return (seconds/3600>=1 ? (Math.floor(seconds/3600) + ":") : "") +
	(Math.floor(seconds/60)%60).toString().padStart(2, "0") + ":" +
	(seconds%60).toString().padStart(2, "0");
}

function shuffleArray (arr) {
	var j, x;
  for (var k = 52; k; k--) {
      j = Math.floor(Math.random() * k);
      x = arr[k - 1];
      arr[k - 1] = arr[j];
      arr[j] = x;
  }
  return arr;
}