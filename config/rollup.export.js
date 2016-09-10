/* eslint import/no-extraneous-dependencies:0 */
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/js/export.js',
  format: 'cjs',
  plugins: [
    json(),
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
  moduleId: 'cesletter',
  moduleName: 'cesletter',
  dest: 'dist/js/export.js',
};
