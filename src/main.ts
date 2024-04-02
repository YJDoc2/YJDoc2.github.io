import { getContentFiles } from "./utils.ts";
import { renderBlogIndexPage, renderBlogpost } from "./render.ts";
import { parseBlogFiles } from "./blog.ts";

const contentFiles = getContentFiles();
const posts = parseBlogFiles(contentFiles.blog);

const rootPath = import.meta.dirname + "/";
const buildDir = rootPath + "../build";

try {
  Deno.statSync(buildDir);
  for (const file of Deno.readDirSync(buildDir)) {
    Deno.removeSync(buildDir + "/" + file.name, { recursive: true });
  }
} catch (_e) {
  Deno.mkdirSync(buildDir);
}

Deno.mkdirSync(buildDir + "/blogs");

for (const post of posts) {
  const renderedPost = renderBlogpost(post);
  Deno.writeTextFileSync(
    buildDir + `/blogs/${post.config.slug}.html`,
    renderedPost,
    {
      create: true,
    },
  );
}
const blogIndexPage = renderBlogIndexPage();
Deno.writeTextFileSync(buildDir + "/blogs/index.html", blogIndexPage, {
  create: true,
});
for (const file of Deno.readDirSync(rootPath + "../static")) {
  if (file.isFile) {
    Deno.copyFileSync(
      rootPath + "../static/" + file.name,
      buildDir + "/" + file.name,
    );
  }
}
