// This file deals with injecting specific head tags

// GNU  STP
hexo.extend.injector.register(
  "head_end",
  '\n<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />\n',
  "default",
);

hexo.extend.injector.register(
  "head_end",
  '\n<meta name="google-site-verification" content="ooX1QlwallH8qImpa8euW0XstkSm9FOSEr9gwiNiPg8" />\n',
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

// injector for goatcounter script
hexo.extend.filter.register("after_render:html", (str) => {
  const injected = str.replace(
    "</body>",
    `\n<!-- GoatCounter script inject -->
<script data-goatcounter="https://yjdoc2.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
<!-- GoatCounter script inject end-->
</body>`,
  );
  return injected;
});
