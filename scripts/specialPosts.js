// This file is for specific types of posts that need
// some special stuff injected in them.
// For example, series posts should have a info abot series injected,
// LogRocket posts should havea disclaimer injected etc.

hexo.extend.filter.register("before_post_render", function (data) {
  // only deal with posts
  if (data.layout !== "post") {
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
