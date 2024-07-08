// This file deals with injecting specific head tags

// GNU  STP
hexo.extend.injector.register(
  "head_end",
  '<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />',
  "default",
);

// canonical url for logrocket posts
// we have to do it using after_render filter, because the head_end injector
// does not have access to the frontmatter data, and thus we cannot get the url
hexo.extend.filter.register("after_render:html", (str, data) => {
  // only deal with posts , and only those which have the logrocket attr
  if (data.page.layout !== "post" || !data.page.logrocket) {
    return undefined;
  }
  const logrocketLink = data.page.logrocket;
  const injected = str.replace(
    "</head>",
    `\n<!-- Logrocket post specific link tag start -->
<link rel="canonical" href="${logrocketLink}" />
<!-- Logrocket post specific link tag end-->
</head>`,
  );
  return injected;
});
