module.exports = function(grunt, data){
    return {
        options: {
            spawn: false,
            livereload: true
        },

        scripts: {
            files: [
                'resources/js/*.js'
            ],
            tasks: [
                'jshint',
                'copy'
            ]
        },

        styles: {
            files: [
                'resources/scss/**/*.scss'
            ],
            tasks: [
                'sass:dev',
                'postcss'
            ]
        }
    }
};