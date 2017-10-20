var path = require('path');

module.exports = function(grunt) {
  'use strict';

  // Config is stored in the grunt-tasks/ folder - check out aliases.json first, task list is stored in the package.json file
  require('load-grunt-config')(grunt, {
    data: {
      assetPath: 'public',
      buildPath: 'build',
      srcPath: 'testing'
    },
    configPath: path.join(process.cwd(), 'build/grunt-tasks'),
      loadGruntTasks: {
        pattern: ['grunt-*']
      }
  });
};
