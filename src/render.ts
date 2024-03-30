import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { compileBlogpost, ParsedBlogpost } from "./blog.ts";

export function renderBlogpost(post: ParsedBlogpost): string {
  const templateRoot = import.meta.dirname + "/../templates";
  const eta = new Eta({ views: templateRoot, autoEscape: false });

  const postContent = compileBlogpost(post);
  const res = eta.render("main.eta", {
    post: postContent.content,
    toc: postContent.toc,
    title: post.config.title,
  });
  return res;
}
