// Abstracción ligera de verificación de CAPTCHA.
// Actual: soporte hCaptcha o reCAPTCHA v2/enterprise según env.
// Si CAPTCHA_OPTIONAL=true y no se envía, no bloquea (para transición gradual).
// ENV:
//  CAPTCHA_PROVIDER=recaptcha|hcaptcha
//  CAPTCHA_SECRET=clave
//  CAPTCHA_FIELD=captchaToken (nombre del campo en body)
//  CAPTCHA_MIN_SCORE=0.5 (para reCAPTCHA v3 futuro)
//  CAPTCHA_ENABLE=true
//  CAPTCHA_OPTIONAL=true (permite omitir token temporalmente)

const https = require('https');

function verifyCaptcha(token){
  return new Promise((resolve)=>{
    if(process.env.CAPTCHA_ENABLE !== 'true') return resolve({ ok:true, skipped:true });
    const provider = process.env.CAPTCHA_PROVIDER || 'recaptcha';
    const secret = process.env.CAPTCHA_SECRET;
    if(!secret){ return resolve({ ok:false, error:'No CAPTCHA secret configured'}); }
    if(!token){
      if(process.env.CAPTCHA_OPTIONAL==='true') return resolve({ ok:true, skipped:true });
      return resolve({ ok:false, error:'Missing token' });
    }
    let data;
    let options;
    if(provider === 'hcaptcha'){
      data = `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`;
      options = { hostname:'hcaptcha.com', path:'/siteverify', method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(data)} };
    } else { // recaptcha
      data = `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`;
      options = { hostname:'www.google.com', path:'/recaptcha/api/siteverify', method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(data)} };
    }
    const req = https.request(options,(res)=>{
      let body='';
      res.on('data',d=> body+=d);
      res.on('end',()=>{
        try {
          const parsed = JSON.parse(body);
          if(parsed.success){
            return resolve({ ok:true, provider, raw: parsed });
          }
          return resolve({ ok:false, error:'Provider validation failed', raw: parsed });
  } catch(_e){
          return resolve({ ok:false, error:'Bad provider response'});
        }
      });
    });
    req.on('error',()=> resolve({ ok:false, error:'Captcha request error'}));
    req.write(data);
    req.end();
  });
}

module.exports = { verifyCaptcha };
