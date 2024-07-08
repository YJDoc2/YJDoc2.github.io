const validTags = ['rust','javascript','c','assembly','compiler','tutorial','mongodb'];

hexo.extend.filter.register('before_post_render', function(data){
  if(data.tags?.data?.length > 0 &&data.tags.data[0].name){
    const tags = data.tags.data[0].name.split(',');
    const src = data.source;
    for(const tag of tags){
      if (!validTags.includes(tag)){
        console.error(`Invalid tag '${tag}' found in ${src}`);
        throw new Error(`invalid tag '${tag}' found in ${src}`);
      }
    }
  }
  // we don't want to change data
  return undefined;
});
