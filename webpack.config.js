const terserWebpackPlugin = require('terser-webpack-plugin')
module.exports = {
  entry: {
    'persistence-store': './src/persistence-store.js',
    'persistence-store.min': './src/persistence-store.js'
  },
  output: {
    filename: '[name].js',
    library: 'persistenceStore',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  mode: 'none',
  optimization: {
    minimize: true,
    minimizer: [
      new terserWebpackPlugin({
        include: /\.min\.js$/
      })
    ]
  }
}
