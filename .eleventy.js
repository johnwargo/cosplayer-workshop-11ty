const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = eleventyConfig => {

	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addShortcode('excerpt', post => extractExcerpt(post));

	function extractExcerpt(post) {
		if (!post.templateContent) return '';
		if (post.templateContent.indexOf('</p>') > 0) {
			let end = post.templateContent.indexOf('</p>');
			return post.templateContent.substr(0, end + 4);
		}
		return post.templateContent;
	}

	eleventyConfig.addCollection("categories", function (collectionApi) {
		let categories = new Set();
		let posts = collectionApi.getFilteredByTag('post');
		posts.forEach(p => {
			let cats = p.data.categories;
			cats.forEach(c => categories.add(c));
		});
		return Array.from(categories);
	});

	// eleventyConfig.addCollection("categoryList", function (collectionApi) {
	// 	let catList = new Set();
	// 	let posts = collectionApi.getFilteredByTag('post');
	// 	posts.forEach(p => {
	// 		let cats = p.data.categories;
	// 		cats.forEach(c => catList.add(c));
	// 	});
	// 	return Array.from(catList);
	// });

	eleventyConfig.addFilter("filterByCategory", function (posts, cat) {
		// case matters, so let's lowercase the desired category, cat	and we will 
		// lowercase our posts categories as well
		cat = cat.toLowerCase();
		let result = posts.filter(p => {
			let cats = p.data.categories.map(s => s.toLowerCase());
			return cats.includes(cat);
		});
		return result;
	});

	const english = new Intl.DateTimeFormat("en");
	eleventyConfig.addFilter("niceDate", function (d) {
		return english.format(d);
	});

	function currentYear() {
    const today = new Date();
    return today.getFullYear();
  }

	eleventyConfig.addPassthroughCopy("blog/images/*");
	eleventyConfig.addPassthroughCopy("blog/css/*");

	return {
		dir: {
			input: 'blog'
		}
	}

};