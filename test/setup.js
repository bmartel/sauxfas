const browserEnv = require("browser-env");

browserEnv(["window", "document", "navigator"]);

global.fetch = (uri, options) =>
  new Promise((resolve) =>
    resolve({
      ok: true,
      json: () =>
        new Promise((resolve) => resolve({ spy: { data: { uri, options } } })),
    })
  );
