export default () => {
  return {
    verbose: true,
    extensions: {
      ts: "module",
    },
    nonSemVerExperiments: {
      configurableModuleFormat: true,
    },
    nodeArguments: [
      "--experimental-modules",
      "--loader=ts-node/esm",
      "--experimental-specifier-resolution=node",
    ],
    files: ["src/**/*.spec.ts"],
    require: ["./test/setup.js"],
  };
};
