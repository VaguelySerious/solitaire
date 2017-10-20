module.exports = {

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
            'uglify'
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
    },
};