const path = require('path')

module.exports = {
  entry: {
    'built-in': path.join(__dirname, 'built-in/index.ts'),
    myPlugin: path.join(__dirname, 'plugin-create/plugin.ts'),
    react: path.join(__dirname, 'with-react/pages/index.tsx'),
    angular1: path.join(__dirname, 'with-angular1/main.ts'),
    angular: path.join(__dirname, 'with-angular/main.ts'),
    vue: path.join(__dirname, 'with-vue/index.ts')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  devtool: 'cheap-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      vue$: 'vue/dist/vue.common.js',
      'vue-router$': 'vue-router/dist/vue-router.common.js'
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    openPage: '/simple/'
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader' }]
  }
}
