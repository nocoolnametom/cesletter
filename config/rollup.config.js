/* eslint import/no-extraneous-dependencies:0 */
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';

const currentEnvironment = process.env.NODE_ENV || 'development';

export default {
  entry: 'src/js/index.js',
  format: 'iife',
  plugins: [
    json(),
    replace({
      ENV: JSON.stringify(currentEnvironment),
    }),
    babel(),
    commonjs(),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: true,
    }),
    uglify(),
    filesize(),
  ],
  external: [],
  sourceMap: (currentEnvironment !== 'production'),
  moduleId: 'cesletter',
  moduleName: 'cesletter',
  dest: 'dist/js/index.js',
};
