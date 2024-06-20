// This file is for specific types of posts that need
// some special stuff injected in them.
// For example, series posts should have a info abot series injected,
// LogRocket posts should have a disclaimer injected etc.


// Inject 'this post is part of the series...' for series posts
hexo.extend.filter.register("before_post_render", function (data) {
  // only deal with posts
  if (data.layout !== "post" || !data.series) {
    return undefined;
  }
  if (data.series && data.categories.length < 1) {
    console.error(
      `series is specified, but no category is found in ${data.source}`,
    );
    throw new Error(
      `series is specified, but no category is found in ${data.source}`,
    );
  }
  const series = data.series;
  const category = data.categories.data[0].name;
  data.content =
    `_This post is part of a series called **${series}** . You can find other posts [here](/categories/${category})._\n\n` +
    data.content;

  return data;
});

// Inject 'this post was originally published...' for LogRocket posts
hexo.extend.filter.register("before_post_render", function (data) {
  // only deal with posts
  if (data.layout !== "post" || !data.logrocket) {
    return undefined;
  }
  if (data.logrocket && data.categories.length < 1) {
    console.error(
      `logrocket is specified, but no category is found in ${data.source}`,
    );
    throw new Error(
      `logrocket is specified, but no category is found in ${data.source}`,
    );
  }
  const logrocketLink = data.logrocket;
  const category = data.categories.data[0].name;

  if(category !== 'logrocket'){
    console.error(
      `logrocket is specified, but first category is not 'logrocket' in ${data.source}`,
    );
    throw new Error(
      `series is specified, but first category is not 'logrocket' in ${data.source}`,
    );
  }

  data.content =
    `_This post was originally posted on the LogRocket blog. You can see it [here](${logrocketLink})._\n\n` +
    data.content;

  return data;
});
