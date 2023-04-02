const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginRss = require("@11ty/eleventy-plugin-rss");

// Transforms
// https://learneleventyfromscratch.com/lesson/31.html#minifying-html-output
const htmlMinTransform = require('./src/transforms/html-min.js');

// Create a helpful production flag
const isProduction = process.env.node_env === 'production';

module.exports = eleventyConfig => {

	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginRss);

	// From ray camden's blog, first paragraph as excerpt
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

	eleventyConfig.addPassthroughCopy("src/assets/css/*");
	eleventyConfig.addPassthroughCopy("src/assets/js/*");
	eleventyConfig.addPassthroughCopy("src/assets/sass/*");
	eleventyConfig.addPassthroughCopy("src/assets/webfonts/*");

	eleventyConfig.addPassthroughCopy("src/images/*");
	eleventyConfig.addPassthroughCopy("src/images/2023/*.jpg");

	// Only minify HTML if we are in production because it slows builds
	if (isProduction) {
		eleventyConfig.addTransform('htmlmin', htmlMinTransform);
	}

	return {
		dir: {
			input: 'src',
			output: "_site",
		}
	}

};