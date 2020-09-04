# CL-JSLIB

A small JavaScript runtime for the Common Lisp standard library.

## About

`CL-JSLIB` is an implementation of the Common Lisp standard library.
It's purpose is to provide a small, fast, standard compliant native implementation suitable for interfacing with a JS hosted Common Lisp environment. Currently the minified / gzipped bundle size sits under 8k.

## Rationale

A highly influential precursor to Common Lisp was MacLisp, from 1966 to well into the early 80s. Memory and cpu cycles at the time were not cheap, and so it was built in two layers. A small, fast assembly core,
and a higher level compiler.

Common Lisp, though subtle, is not a big language by today's standards. By leveraging as much as possible from JavaScript, while maintaining absolute compatibility, the majority of the language can be implemented performantly, and idiomatically.

`CL-JSLIB` aims to be the smallest, fastest, (nonblocking) ANSI compliant Common Lisp runtime library in JavaScript. It is suitable for integration into interpreters and compilers. It's goal is to act as the backbone to some of the smallest Common Lisp
systems in JavaScript, and inspiration for future, faster implementations.

## Status

`CL-JSLIB` is currently in alpha development. While there is support for a lot of the Common Lisp runtime, it is not yet ready for production. PRs welcome!.

## Quickstart

First, clone the respository.

Download all the dependences with `npm i` (or `yarn install`, if you prefer).

Next invoke `npm run start` to execute the main stub program (in `src/main.mjs`). It doesn't do much.

Invoke `npm run build` to generate a minified / mangled bundle into `dist\bundle.js`.

## Notes

`main.mjs` specifically performs a `global["CL-JSLIB"] = env` in order to ensure nothing is tree-shaken, and that we definitely have included all the code.  If you comment out this line, you will find bundle sizes are extremely smaller, since you are now emitting only what is required.

Currently no support for keyword arguments.

At any given time in a JavaScript isolate (using Dart's terminology), the value of `lispInstance` in `lisp-instance.mjs` is bound to a running Lisp thread.

When calling a function, if `lispInstance.wantMV` is not 1, then any function returning multiple values will return the first value normally, and extra values in `lispInstance.values`. This lets implementations of `multiple-value-bind` find the extra values.