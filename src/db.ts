// A glorified object as a central data store, with associated helper methods

import { ParsedBlogpost } from "./blog.ts";

type db = {
  posts: Array<ParsedBlogpost>;
};

const DB: db = {
  posts: [],
};

export function getAllblogposts(): Array<ParsedBlogpost> {
  return DB.posts;
}

export function getAllTags() {
  const temp = new Set<string>();
  for (const post of DB.posts) {
    post.config.tags.forEach((t) => temp.add(t));
  }
  return Array.from(temp);
}

export function getTagPostMap(): { [key: string]: Array<ParsedBlogpost> } {
  const ret: { [key: string]: Array<ParsedBlogpost> } = {};
  for (const post of DB.posts) {
    post.config.tags.forEach((t) => {
      if (!ret[t]) {
        ret[t] = [];
      }
      ret[t].push(post);
    });
  }
  return ret;
}

export function getDatePostMap(): { [key: string]: Array<ParsedBlogpost> } {
  const ret: { [key: string]: Array<ParsedBlogpost> } = {};
  return ret;
}

export function insertPost(post: ParsedBlogpost) {
  DB.posts.push(post);
}
