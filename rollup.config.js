import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/main.mjs',
    output: {
      file: 'dist/bundle.js',
      format: 'cjs',
    },
    plugins: [terser({
      mangle: {
        toplevel: true,
        properties: "keep_quoted"
      }
    })]
};