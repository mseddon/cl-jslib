# CL-JSLIB

A small Javascript runtime for the Common Lisp standard library.

## About

`CL-JSLIB` is an experimental implementation of the Common Lisp standard library. It's purpose is to provide a small, native implementation suitable for interfacing with a JS hosted Common Lisp environment.  It is deliberately hand written ECMAScript, which can then be minified into a single obfuscated bundle. Currently about 25% of the Common Lisp standard is implemented, and the minified / gzipped bundle size sits under 4k.

## Quickstart

First, clone the respository.

Download all the dependences with `npm i` (or `yarn install`, if you prefer).

Next invoke `npm run start` to execute the main stub program (in `src/main.mjs`). It doesn't do much.

Invoke `npm run build` to generate a minified / mangled bundle into `dist\bundle.js`.

## Notes

`main.mjs` specifically performs a `console.log(env)` in order to ensure nothing is tree-shaken, and that we definitely have included all the code.  If you comment out this line, you will find bundle sizes are extremely smaller, since you are now emitting only what is required.

Currently no support for keyword arguments or multiple return values.  When these are included, these will not be fun to program in directly, but will allow idiomatic CL to be trivially compiled with decent performance.

_This is not a compiler_. There are no implementations of macros, etc. The purpose is to leverage this library to implement macros via an external compiler, such as JACL, to ensure that compiled distributions are tiny.
