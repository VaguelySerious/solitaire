module.exports = function(grunt, data) {
  return {
    watch: {
      tasks: ['watch:scss'],
      options: {
        logConcurrentOutput: true
      },
    },
  };
}
