const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './client/src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      clean: true,
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb
            }
          },
          generator: {
            filename: 'images/[name].[contenthash][ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash][ext]'
          }
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './client/public/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        } : false
      }),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash].css' : 'css/[name].css',
        chunkFilename: isProduction ? 'css/[name].[contenthash].css' : 'css/[name].css'
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementPlus: {
            name: 'element-plus',
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
            priority: 20,
            chunks: 'all'
          }
        }
      }
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    stats: {
      children: false,
      modules: false
    }
  };
}; 