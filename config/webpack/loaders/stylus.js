const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  test: /\.styl$/i,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader', 'postcss-loader', 'stylus-loader']
  })
}
