module.exports = function(grunt, data) {
  var srcDir = 'resources/js/';
  var board = srcDir + 'board/*.js';

  return {
    all: {
      files: {
        'public/js/board.min.js':      board,
        'public/js/solitaire.min.js': [srcDir + 'solitaire.js', board],
        'public/js/spider.min.js':    [srcDir + 'spider.js', board]
      }
    }
  }
}