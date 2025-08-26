const sanitizeHtml = require('sanitize-html');

const policy = {
  allowedTags: [
    'p','h1','h2','h3','strong','em','ul','ol','li','a','img','blockquote','br','hr','code','pre','span'
  ],
  allowedAttributes: {
    a: ['href','title','target','rel'],
    img: ['src','alt','title','width','height'],
    span: ['class'],
    p: ['class']
  },
  allowedSchemes: ['http','https','data','mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' })
  }
};

function sanitize(input) {
  if (!input) return input;
  return sanitizeHtml(input, policy);
}

module.exports = { sanitize, policy };
