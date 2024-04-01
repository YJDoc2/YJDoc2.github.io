import { refractor } from "https://esm.sh/refractor@4/lib/core.js";
import rust from "https://esm.sh/refractor@4/lang/rust.js";
import javascript from "https://esm.sh/refractor@4/lang/javascript.js";
import c from "https://esm.sh/refractor@4/lang/c.js";
import bash from "https://esm.sh/refractor@4/lang/bash.js";
import toml from "https://esm.sh/refractor@4/lang/toml.js";

import rehypePrism from "npm:@mapbox/rehype-prism";

const languages = [rust, javascript, c, bash, toml];

for (const lang of languages) {
  refractor.register(lang);
}

export function highlight(ast: any) {
  const highlighter = rehypePrism({ alias: { bash: ["sh"] } });
  highlighter(ast);
}
