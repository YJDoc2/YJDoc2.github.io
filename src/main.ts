import { toc } from "https://esm.sh/mdast-util-toc@7";
import { getContentFiles } from "./utils.ts";
import { renderBlogpost } from "./render.ts";
import { parseBlogFiles } from "./blog.ts";

const contentFiles = getContentFiles();
const posts = parseBlogFiles(contentFiles.blog);

const rootPath = import.meta.dirname + "/";
const buildDir = rootPath + "../build";

try {
  Deno.statSync(buildDir);
} catch (e) {
  Deno.mkdirSync(buildDir);
}

for (const post of posts) {
  const renderedPost = renderBlogpost(post);
  Deno.writeTextFileSync(buildDir + "/post.html", renderedPost, {
    create: true,
  });
}
for (const file of Deno.readDirSync(rootPath + "../static")) {
  if (file.isFile) {
    Deno.copyFileSync(
      rootPath + "../static/" + file.name,
      buildDir + "/" + file.name,
    );
  }
}
