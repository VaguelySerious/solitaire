// Plugin can remove function calls from final code
// We use it to remove all "console.log" calls in production
const WebpackStripLoader = require('strip-loader');

// Takes a template and puts the bundles in
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Copies files statically
const CopyWebpackPlugin = require('copy-webpack-plugin')


const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Clears a folder
const CleanWebpackPlugin = require('clean-webpack-plugin');

// Inline SVGs if you put "inline" as attribute in an image
// Hooks into the HtmlWebpackPlugin an executes after the "emit" hook
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');


module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  // Development Config
  const config = {
    entry: ["./src/js/sol.js"],
    output: {
      filename: "js/app.js"
    },
    module: {
      rules: [

        // Babel converts >ES6 to ES5 for compatibility
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: [
              [
                "@babel/env", {
                  "targets": {
                      'browsers': ['Chrome >=59']
                  },
                }
              ]
            ]
          }
        },

        {
          test: /\.scss$/,
          use:  [
            'style-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },

        // URL-Loader inlines images as base64 up to a certain size,
        // and defers to a different loader otherwise
        // {
        //   test: /\.(png|jpg|gif|svg)$/i,
        //   use: [
        //     {
        //       loader: 'url-loader',
        //       options: {
        //         // limit: 8192
        //       }
        //     }
        //   ]
        // }
      ]
    },
    plugins: [

      // Clear the dist folder
      new CleanWebpackPlugin(['dist'], {}),

      // Minify the extracted CSS
      new MiniCssExtractPlugin({
        filename: 'css/styles.css',
      }),

      // Put bundle links into the view
      new HtmlWebpackPlugin({
        title: 'Zentigon Solitaire',
        template: 'src/views/index.html',
        minify: true//isProd && {
          //maxLineLength: 120
        //}
      }),

      // See description at top
      new HtmlWebpackInlineSVGPlugin(),

      // Copy assets folder statically
      new CopyWebpackPlugin(['src/assets']),
    ]
  }



  // Changes in production
  if (isProd) {

    // Strip console.log statements
    config.module.rules.push({
      test: /\.js$/,
      enforce: 'post',
      exclude: /node_modules/,
      loader: WebpackStripLoader.loader('console.log')
    });

    // TBA

    // Remove copy plugin for images and add Image Processor plugin
  }

  return config;
}
