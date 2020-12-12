import ts from "typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const build = (output = {}) => ({
  input: "src/index.ts",
  output,
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      typescript: ts,
    }),
    terser({
      output: {
        comments: false,
      },
    }),
  ],
});

export default [
  build({
    format: "umd",
    name: "sofa",
    file: pkg.browser,
  }),
  build({
    format: "cjs",
    file: pkg.main,
  }),
  build({
    format: "es",
    file: pkg.module,
  }),
];
