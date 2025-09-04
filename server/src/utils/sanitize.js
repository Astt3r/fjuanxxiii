const sanitizeHtml = require('sanitize-html');

// Política base (flexible para contenido enriquecido controlado)
const basePolicy = {
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

// Política estricta opcional (sin inline width/height, sin data: imágenes) activable con CONTENT_STRICT_MODE=true
function buildPolicy(){
  if(process.env.CONTENT_STRICT_MODE === 'true'){
    return {
      ...basePolicy,
      allowedAttributes: {
        a: ['href','title','rel','target'],
        img: ['src','alt','title']
      },
      allowedSchemes: ['http','https','mailto'],
    };
  }
  return basePolicy;
}

function sanitize(input) {
  if (!input) return input;
  const policy = buildPolicy();
  let out = sanitizeHtml(input, policy);
  // Limpieza secundaria: eliminar on* handlers que pudieran pasar por atributos no listados en edge cases
  out = out.replace(/\son[a-z]+="[^"]*"/gi,'');
  return out;
}

module.exports = { sanitize, policy: basePolicy };
