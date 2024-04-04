import { getContentFiles } from "./utils.ts";
import { renderBlogSections } from "./render.ts";
import { parseBlogFiles } from "./blog.ts";

const contentFiles = getContentFiles();
parseBlogFiles(contentFiles.blog);

const rootPath = import.meta.dirname + "/";
const buildDir = rootPath + "../build";
const blogsDir = buildDir + "/blogs";
const tagsDir = buildDir + "/blogs/tags";
const seriesDir = buildDir + "/blogs/series";

const requiredDirs = [buildDir, blogsDir, tagsDir, seriesDir];

for (const dir of requiredDirs) {
  try {
    Deno.statSync(dir);
  } catch (_e) {
    Deno.mkdirSync(dir);
  }
}

for (const file of Deno.readDirSync(rootPath + "../static")) {
  if (file.isFile) {
    Deno.copyFileSync(
      rootPath + "../static/" + file.name,
      buildDir + "/" + file.name,
    );
  }
}
renderBlogSections(buildDir);
