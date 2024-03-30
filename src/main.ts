import { toc } from "https://esm.sh/mdast-util-toc@7";
import { getContentFiles } from "./utils.ts";
import { renderBlogpost } from "./render.ts";
import { compileBlogpost, parseBlogFiles } from "./blog.ts";

const contentFiles = getContentFiles();
const posts = parseBlogFiles(contentFiles.blog);

const buildDir = import.meta.dirname + "/../build";

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
