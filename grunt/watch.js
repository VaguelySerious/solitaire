module.exports = {

    options: {
        spawn: false,
        livereload: true
    },

    scripts: {
        files: [
            'src/js/*.js'
        ],
        tasks: [
            'jshint',
            'uglify'
        ]
    },

    styles: {
        files: [
            'src/scss/**/*.scss'
        ],
        tasks: [
            'sass:dev',
            'postcss'
        ]
    },
};