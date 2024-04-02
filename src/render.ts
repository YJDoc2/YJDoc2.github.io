import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { compileBlogpost, ParsedBlogpost } from "./blog.ts";
import { getAllblogposts } from "./db.ts";

export function renderBlogpost(post: ParsedBlogpost): string {
  const templateRoot = import.meta.dirname + "/../templates";
  const eta = new Eta({ views: templateRoot, autoEscape: false });

  const postContent = compileBlogpost(post);
  const res = eta.render("blog.eta", {
    post: postContent.content,
    toc: postContent.toc,
    title: post.config.title,
  });
  return res;
}

export function renderBlogIndexPage(): string {
  const posts = getAllblogposts();
  const templateRoot = import.meta.dirname + "/../templates";
  const eta = new Eta({ views: templateRoot, autoEscape: false });

  const postRenderData: Array<{ date: string; posts: Array<ParsedBlogpost> }> =
    [];

  const sortedPosts = posts.toSorted((a, b) => {
    return b.config.publishedDate - a.config.publishedDate;
  });

  const existingKeys = new Set<string>();

  for (const post of sortedPosts) {
    const publishedDate = post.config.publishedDate;
    if (!publishedDate || post.config.draft) {
      continue;
    }
    const month = publishedDate.toLocaleString("en-US", { month: "long" })
      .toUpperCase();
    const year = publishedDate.getFullYear();
    const key = `${month} ${year}`;
    if (!existingKeys.has(key)) {
      postRenderData.push({ date: key, posts: [post] });
      existingKeys.add(key);
    } else {
      postRenderData.at(-1)?.posts.push(post);
    }
  }

  const res = eta.render("blogIndex.eta", {
    title: "Blogs",
    postMap: postRenderData,
  });
  return res;
}
