const path = require('path');

module.exports = (env, argv) => ({
  entry: './src/index.ts',
  // Inline source maps are ~1.6 MB and would be embedded in the bundle that
  // every Home Assistant page loads, so keep them out of production builds.
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  mode: argv.mode || 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'sip_core.js',
    path: path.resolve(__dirname, 'custom_components', 'sip_core', 'www'),
  },
});
