import * as pkg from './package.json'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

const buildDate = Date()
const banner = `/*
* project  : ${pkg.name}
* version  : ${pkg.version}
* author   : ${pkg.author.name}[${pkg.author.email}]
* license  : ${pkg.license}
* homepage : ${pkg.homepage}
* build    : ${buildDate}
*/`

export default [{
  external: ['@zip.js/zip.js'],
  input: './lib/index.js',
  output: [
    {
      file: './dist/ip2region.js',
      format: 'umd',
      name: 'Ip2Region',
      banner: banner,
      globals: {
        '@zip.js/zip.js': 'zip',
      },
    },
  ],
  plugins: [
    babel({babelHelpers: 'bundled'}),
  ]
}, {
  external: ['@zip.js/zip.js'],
  input: './lib/index.js',
  output: [
    {
      file: './dist/ip2region.min.js',
      format: 'umd',
      name: 'Ip2Region',
      globals: {
        '@zip.js/zip.js': 'zip',
      },
    },
  ],
  plugins: [
    terser({
      format: {
        preamble: banner
      }
    }),
  ]
}, {
  external: ['@zip.js/zip.js'],
  input: './lib/main.js',
  output: [
    {
      file: './dist/ip2region.esm.js',
      format: 'es',
      banner: banner,
    },
  ],
  plugins: [
    babel({babelHelpers: 'bundled'}),
  ]
}, {
  external: ['@zip.js/zip.js'],
  input: './lib/main.js',
  output: [
    {
      file: './dist/ip2region.node.js',
      format: 'cjs',
      banner: banner,
    },
  ],
  plugins: [
    babel({babelHelpers: 'bundled'}),
  ]
}]
