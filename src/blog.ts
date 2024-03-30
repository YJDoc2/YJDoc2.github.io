import remarkFrontmatter from "https://esm.sh/remark-frontmatter@5";
import remarkGfm from "https://esm.sh/remark-gfm@4";
import remarkParse from "https://esm.sh/remark-parse@11";
import rehypeStringify from "https://esm.sh/rehype-stringify@10";
import { toc } from "https://esm.sh/mdast-util-toc@7";
import { toHast } from "https://esm.sh/mdast-util-to-hast@13";
import { unified } from "https://esm.sh/unified@11";
import rehypeSlug from "https://esm.sh/rehype-slug@6";
import rehypeExternalLinks from "https://esm.sh/rehype-external-links@3";

import * as yaml from "https://deno.land/std@0.221.0/yaml/mod.ts";
import { slug } from "https://deno.land/x/slug/mod.ts";

import { ParsedAST } from "./externalTypes.ts";

export type BlogpostConfig = {
  draft?: boolean;
  series?: string;
  title: string;
  slug: string;
};

export type ParsedBlogpost = {
  filepath: string;
  ast: ParsedAST;
  config: BlogpostConfig;
};

export type CompiledBlogpost = {
  content: string;
  toc: string;
};

export function parseBlogFiles(
  files: Array<string>,
): Array<ParsedBlogpost> {
  const ret: Array<ParsedBlogpost> = [];
  for (const file of files) {
    const fileData = Deno.readFileSync(file);
    const processed: ParsedAST = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ["yaml"])
      .use(remarkGfm)
      .use(rehypeSlug)
      .parse(fileData);

    // we can probably to a find + splice to get the frontmatter,
    // but taking the simpler approach of considering the 0th element
    // as the frontmatter
    const frontmatter = processed.children.shift();
    if (frontmatter?.type !== "yaml") {
      throw new Error(
        `first element of root-child-ast was not frontmatter in file ${file}`,
      );
    }
    const value = frontmatter.value || "";
    const parsedFrontmatter = yaml.parse(value) as BlogpostConfig;
    if (!parsedFrontmatter.title) {
      throw new Error(
        `title is required for all blogposts, missing in file ${file}`,
      );
    }
    if (!parsedFrontmatter.slug) {
      parsedFrontmatter.slug = slug(parsedFrontmatter.title);
    }
    ret.push({ filepath: file, ast: processed, config: parsedFrontmatter });
  }
  return ret;
}

export function compileBlogpost(post: ParsedBlogpost): CompiledBlogpost {
  const ast = post.ast;
  const slugger = rehypeSlug();
  const externLinks = rehypeExternalLinks();
  const _toc = toc(ast);
  const hast = toHast(ast);
  slugger(hast);
  externLinks(hast);

  const content = unified()
    .use(rehypeStringify)
    .stringify(hast);
  const renderedToc = unified().use(rehypeStringify).stringify(
    toHast(_toc.map),
  );
  return {
    content,
    toc: renderedToc,
  };
}
