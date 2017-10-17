// temporary timer solution for fancy
(function() {
  startDate = +new Date();
  spanValue = $('.statistics__value').last();
  setInterval(function() {
    diff = Math.floor((new Date() - startDate) / 1000);
    mins = Math.floor(diff/60);
    secs = diff % 60;
    spanValue.text(mins.toString() + ":" + secs.toString().padStart(2, "0"));
  }, 1000);
})();