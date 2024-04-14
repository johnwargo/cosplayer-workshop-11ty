// ==============================================
// Image Shortcode
// ==============================================
// https://www.aleksandrhovhannisyan.com/blog/eleventy-image-plugin/

const Image = require('@11ty/eleventy-img');
const outdent = require('outdent');

module.exports = function (eleventyConfig, options = {}) {

  const moduleName = "eleventy.config.images";
  const debugMode = options.debugMode ? options.debugMode : false;
  if (debugMode) console.log(`[${moduleName}] Debug mode enabled`);

  /**
   *  Maps a config of attribute-value pairs to an HTML string representing 
   * those same attribute-value pairs. 
   **/
  const stringifyAttributes = (attributeMap) => {
    return Object.entries(attributeMap)
      .map(([attribute, value]) => {
        if (typeof value === 'undefined') return '';
        return `${attribute}="${value}"`;
      })
      .join(' ');
  };

  const imageShortcode = async (
    src,
    alt,
    className = undefined,
    widths = [400, 800, 1280],
    formats = ['webp', 'jpeg'],
    sizes = '100vw'
  ) => {

    if (debugMode) console.log(`[${moduleName}] Generating image: ${src}`);

    const imageMetadata = await Image(src, {
      widths: [...widths, null],
      formats: [...formats, null],
      outputDir: '_site/img',
      urlPath: '/img',
    });

    const sourceHtmlString = Object.values(imageMetadata)
      // Map each format to the source HTML markup
      .map((images) => {
        // The first entry is representative of all the others 
        // since they each have the same shape
        const { sourceType } = images[0];
        // Use our util from earlier to make our lives easier
        const sourceAttributes = stringifyAttributes({
          type: sourceType,
          // srcset must be a comma-separated attribute
          srcset: images.map((image) => image.srcset).join(','),
          sizes,
        });
        // Return one <source> per format
        return `<source ${sourceAttributes}>`;
      }).join('');

    const getLargestImage = (format) => {
      const images = imageMetadata[format];
      return images[images.length - 1];
    }

    const largestUnoptimizedImg = getLargestImage(formats[0]);
    const imgAttributes = stringifyAttributes({
      src: largestUnoptimizedImg.url,
      // Added classname here because the scott.css file needs it on the img tag
      class: className,
      width: largestUnoptimizedImg.width,
      // removed because it was messing with the aspect ratio
      // height: largestUnoptimizedImg.height,
      alt,
      loading: 'lazy',
      decoding: 'async',
    });
    const imgHtmlString = `<img ${imgAttributes}>`;
    const pictureAttributes = stringifyAttributes({ class: className });
    const picture = `<picture ${pictureAttributes}>${sourceHtmlString} ${imgHtmlString}</picture>`;

    return outdent`${picture}`;
  };

  eleventyConfig.addShortcode('image', imageShortcode);

};