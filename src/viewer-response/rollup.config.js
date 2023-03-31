import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

const DESTINATION = '../../dist/viewer-response';

export default {
  input: 'index.js',
  output: {
    format: 'es',
    dir: DESTINATION
  },
  preserveModules: false,
  plugins: [
    nodeResolve({
      browser: true
    }),
    commonjs(),
    copy({
      targets: [
        {
          src: 'package.json',
          dest: DESTINATION
        }
      ]
    }),
    terser({
      format: {
        comments: false,
        preamble: '/* Viewer Response function */'
      }
    })
  ]
};
