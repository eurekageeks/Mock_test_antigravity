const htmlContent = '<img alt="Question image 1" src="4b8ee1cd720e475389f4e6d3c0c884e8.png">';

const processHtmlImages = (htmlContent) => {
  if (!htmlContent) return '';
  return htmlContent.replace(/<img\s+([^>]*?)src=(?:["']([^"']+)["']|([^ >]+))([^>]*)>/gi, (match, before, srcQuoted, srcUnquoted, after) => {
    const src = srcQuoted || srcUnquoted;
    return `<img ${before}src="PREFIX_${src}"${after}>`;
  });
};

console.log(processHtmlImages(htmlContent));
