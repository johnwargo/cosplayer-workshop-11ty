import { EleventyHtmlBasePlugin } from '@11ty/eleventy';
import generateCategoryPages from 'eleventy-generate-category-pages';
import pluginDate from 'eleventy-plugin-date';
import pluginRss from '@11ty/eleventy-plugin-rss';
import markdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import htmlMinTransform from './src/transforms/html-min.js';

// local plugin(s)
import pluginImages from './eleventy.config.images.js';

// Create a helpful production flag
const isProduction = process.env.node_env === 'production';

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginDate);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginImages, { debugMode: false });

	// https://github.com/11ty/eleventy/issues/2301
	const mdOptions = { html: true, breaks: true, linkify: true };
	const markdownLib = markdownIt(mdOptions)
		.use(markdownItAttrs)
		.disable('code');

	eleventyConfig.setLibrary('md', markdownLib);

	var firstRun = true;
	eleventyConfig.on('eleventy.before', async ({ dir, runMode, outputMode }) => {
		if (firstRun) {
			firstRun = false;
			generateCategoryPages({
				dataFileName: 'categoryData.json',
				imageProperties: false,
				quitOnError: true,
				debugMode: false
			});
		}
	});

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

	eleventyConfig.addCollection('categories', function (collectionApi) {
		let categories = new Set();
		let posts = collectionApi.getFilteredByTag('post');
		posts.forEach(p => {
			let cats = p.data.categories;
			cats.forEach(c => categories.add(c));
		});
		return Array.from(categories);
	});

	eleventyConfig.addFilter('filterByCategory', function (posts, cat) {
		// case matters, so let's lowercase the desired category, cat	and we will 
		// lowercase our posts categories as well
		cat = cat.toLowerCase();
		let result = posts.filter(p => {
			let cats = p.data.categories.map(s => s.toLowerCase());
			return cats.includes(cat);
		});
		return result;
	});

	[
		'src/_data/*',
		'src/assets/css/',
		'src/assets/js/',
		'src/assets/sass/',
		'src/assets/webfonts/',
		'src/files/*',
		'src/images/*'
	].forEach((path) => {
		eleventyConfig.addPassthroughCopy(path);
	});
	// Assumes cascading folders per year
	let thisYear = new Date().getFullYear();
	for (let i = 2023; i <= thisYear; i++) {
		eleventyConfig.addPassthroughCopy(`src/images/${i}/*`);
	}

	// Only minify HTML if we are in production because it slows builds
	if (isProduction) {
		eleventyConfig.addTransform('htmlmin', htmlMinTransform);
	}

	return {
		dir: {
			input: 'src',
			output: '_site',
			includes: '_includes',
			layouts: '_layouts',
			data: '_data'
		}
	}
};