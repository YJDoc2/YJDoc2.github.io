import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { capitalize } from "./utils.ts";
import { compileBlogpost, ParsedBlogpost } from "./blog.ts";
import { getAllblogposts, getAllTags } from "./db.ts";
import { getTagPostMap } from "./db.ts";

const TEMPLATE_DIR = import.meta.dirname + "/../templates";

export function renderBlogSections(buildRoot: string) {
  const posts = getAllblogposts();
  for (const post of posts) {
    const renderedPost = renderBlogpost(post);
    Deno.writeTextFileSync(
      buildRoot + `/blogs/${post.config.slug}.html`,
      renderedPost,
      {
        create: true,
      },
    );
  }
  const blogIndexPage = renderBlogIndexPage();
  Deno.writeTextFileSync(buildRoot + "/blogs/index.html", blogIndexPage, {
    create: true,
  });
  const tagIndexPage = renderTagIndexPage();
  Deno.writeTextFileSync(buildRoot + "/blogs/tags/index.html", tagIndexPage, {
    create: true,
  });
  renderTagPages(buildRoot + "/blogs/tags");
}

function renderBlogpost(post: ParsedBlogpost): string {
  const eta = new Eta({ views: TEMPLATE_DIR, autoEscape: false });

  const postContent = compileBlogpost(post);
  const res = eta.render("blog.eta", {
    post: postContent.content,
    toc: postContent.toc,
    title: post.config.title,
    tags: post.config.tags,
  });
  return res;
}

function renderBlogIndexPage(): string {
  const posts = getAllblogposts();
  const eta = new Eta({ views: TEMPLATE_DIR, autoEscape: true });

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

function renderTagIndexPage(): string {
  const allTags = getAllTags().map((t) => capitalize(t));
  const eta = new Eta({ views: TEMPLATE_DIR, autoEscape: true });
  const res = eta.render("tagIndex.eta", {
    title: "Tags",
    tags: allTags,
  });
  return res;
}

function renderTagPages(tagRootDir: string) {
  const tagMap = getTagPostMap();
  const eta = new Eta({ views: TEMPLATE_DIR, autoEscape: true });
  for (const tag of Object.keys(tagMap)) {
    const res = eta.render("tag.eta", {
      title: `Tag : ${capitalize(tag)}`,
      tagName: capitalize(tag),
      posts: tagMap[tag],
    });
    Deno.writeTextFileSync(tagRootDir + `/${tag}.html`, res, { create: true });
  }
}
