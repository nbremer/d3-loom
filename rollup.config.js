import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
  entry: 'index.js',
  plugins: [babel(babelrc())],
  external: external,
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'd3',
      sourceMap: true
    }
  ],
  globals: {
    'd3-collection': 'd3',
    'd3-array': 'd3',
    'd3-interpolate': 'd3',
    'd3-path': 'd3'
  }
};
