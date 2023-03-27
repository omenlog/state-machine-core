import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    // package.json properties
    name: "@state-machine/core",
    version: Deno.args[0],
    description: "Fully typesafe finite state machine",
    license: "MIT",
    keywords: ["finite", "state", "machine", "typesafe"],
    repository: {
      type: "git",
      url: "git+https://github.com/omenlog/state-machine-core.git",
    },
    bugs: {
      url: "git+https://github.com/omenlog/state-machine-core/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
