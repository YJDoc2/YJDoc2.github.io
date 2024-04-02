import * as path from "https://deno.land/std@0.221.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.221.0/fs/mod.ts";

type ContentFiles = {
  blog: Array<string>;
};

export function getContentFiles(): ContentFiles {
  const root = path.join(import.meta.dirname, "..", "content");
  const ret = [];
  for (const entry of fs.walkSync(root)) {
    if (entry.isFile) {
      ret.push(entry.path);
    }
  }
  return {
    blog: ret,
  };
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
