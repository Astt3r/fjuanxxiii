// Footer.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, animate } from 'framer-motion';

const ASTT3R_URL = 'astt3r.github.io'; 

// Huevo con física (inercia + rebote usando Framer Motion)
function DevEgg() {
  const size = 64; // diámetro del huevo en px
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [skin] = useState(() => Math.floor(Math.random() * 3)); // 0..2

  // Física
  const velRef = useRef({ vx: 200 + Math.random() * 120, vy: 0 });
  const lastRef = useRef(null);
  const rafRef = useRef(null);
  const boundsRef = useRef({ minX: 8, minY: 8, maxX: 0, maxY: 0 });

  // Click / tap
  const downRef = useRef({ t: 0, x: 0, y: 0 });
  const lastTapRef = useRef(0);

  // Confetti canvas
  const canvasRef = useRef(null);
  const confettiRef = useRef([]);
  const confettiRAF = useRef(null);
  const uid = useRef(Math.random().toString(36).slice(2, 8)).current;
  const ASTT3R_URL = 'https://astt3r.github.io/';

  // ---------- Confetti ----------
  const colors = [['#7c3aed', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'], // paleta 1
                  ['#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'], // paleta 2
                  ['#fb7185', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa']][skin];

  const ensureCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const confettiLoop = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const arr = confettiRef.current;
    if (!arr.length) {
      confettiRAF.current = null;
      ctx.clearRect(0, 0, c.width, c.height);
      return;
    }
    ctx.clearRect(0, 0, c.width, c.height);
    const g = 1800; // gravedad confetti
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      const dt = 1 / 60;
      p.vy += g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y > window.innerHeight + 40) {
        arr.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.ttl));
      ctx.fillStyle = p.color;
      const w = p.size * (p.shape === 'rect' ? 1 : 0.9);
      const h = p.size * (p.shape === 'rect' ? 0.6 : 0.9);
      if (p.shape === 'rect') ctx.fillRect(-w / 2, -h / 2, w, h);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    confettiRAF.current = requestAnimationFrame(confettiLoop);
  };

  const burstConfetti = () => {
    ensureCanvas();
    const cx = x.get() + size / 2;
    const cy = y.get() + size / 2;
    const n = 80;
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      const spd = 400 + Math.random() * 900;
      confettiRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 400,
        size: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (-4 + Math.random() * 8) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.2 + Math.random() * 0.8,
        ttl: 2.0,
        shape: Math.random() > 0.5 ? 'rect' : 'dot',
      });
    }
    if (!confettiRAF.current) confettiRAF.current = requestAnimationFrame(confettiLoop);
  };
  // --------------------------------

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calcBounds = () => {
      boundsRef.current = {
        minX: 8,
        minY: 8,
        maxX: Math.max(8, window.innerWidth - size - 8),
        maxY: Math.max(8, window.innerHeight - size - 8),
      };
      // corrige si quedó fuera
      x.set(Math.max(boundsRef.current.minX, Math.min(boundsRef.current.maxX, x.get())));
      y.set(Math.max(boundsRef.current.minY, Math.min(boundsRef.current.maxY, y.get())));
      ensureCanvas();
    };

    calcBounds();

    // posición inicial
    const startX = Math.min(boundsRef.current.maxX, window.innerWidth - size - 24);
    x.set(startX);
    y.set(-size * 1.2);

    lastRef.current = performance.now();
    const g = 2000;             // gravedad px/s^2
    const restitution = 0.68;   // rebote
    const airDrag = 0.0005;     // rozamiento aire
    const floorFriction = 0.015;// fricción suelo

    const loop = (t) => {
      const last = lastRef.current;
      lastRef.current = t;
      const dt = Math.min(0.032, (t - last) / 1000) || 0.016;

      if (!dragging) {
        let { vx, vy } = velRef.current;
        let nx = x.get();
        let ny = y.get();

        // Física
        vy += g * dt;
        vx *= (1 - airDrag);
        vy *= (1 - airDrag);

        nx += vx * dt;
        ny += vy * dt;

        const { minX, minY, maxX, maxY } = boundsRef.current;

        // Colisiones laterales
        if (nx <= minX) {
          nx = minX; vx = -vx * restitution; burstConfetti();
        } else if (nx >= maxX) {
          nx = maxX; vx = -vx * restitution; burstConfetti();
        }
        // Techo/suelo
        if (ny <= minY) {
          ny = minY; vy = -vy * restitution; burstConfetti();
        } else if (ny >= maxY) {
          ny = maxY; vy = -vy * restitution;
          vx *= (1 - floorFriction);
          burstConfetti();
        }

        x.set(nx);
        y.set(ny);
        velRef.current = { vx, vy };

        // Rotación proporcional a vx
        const spinPerSec = (vx / size) * 180; // º/s
        rotate.set(rotate.get() + spinPerSec * dt);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      calcBounds();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      if (confettiRAF.current) cancelAnimationFrame(confettiRAF.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e) => {
    downRef.current = { t: performance.now(), x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e) => {
    const d = downRef.current;
    const dt = performance.now() - d.t;
    const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);

    // Doble tap móvil
    const now = performance.now();
    if (now - lastTapRef.current < 300) {
      burstConfetti();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Click “seco” (abre URL)
    if (!dragging && dt < 200 && dist < 6) {
      window.open(ASTT3R_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const onDoubleClick = () => {
    burstConfetti();
  };

  // ---------- SVG del huevo (3 skins de Pascua, sin fondo) ----------
  const EggSVG = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 130"
      className="drop-shadow-[0_3px_8px_rgba(0,0,0,0.25)]"
      aria-label="Easter egg"
    >
      <defs>
        <linearGradient id={`eggrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skin === 0 ? '#ff9a9e' : skin === 1 ? '#a7f3d0' : '#bae6fd'} />
          <stop offset="100%" stopColor={skin === 0 ? '#fad0c4' : skin === 1 ? '#fef3c7' : '#e9d5ff'} />
        </linearGradient>

        <pattern id={`zigzag-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 L5 5 L10 15 L15 5 L20 10" stroke="#7c3aed" strokeWidth="3" fill="none" />
        </pattern>
        <pattern id={`dots-${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2.2" fill="#10b981" />
        </pattern>
        <pattern id={`sprinkles-${uid}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="none" />
          <rect x="2" y="2" width="2" height="6" fill="#ef4444" transform="rotate(20 3 5)" />
          <rect x="6" y="1" width="2" height="6" fill="#f59e0b" transform="rotate(-20 7 4)" />
          <rect x="8" y="5" width="2" height="6" fill="#3b82f6" transform="rotate(15 9 8)" />
        </pattern>
        <pattern id={`stars-${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
          <polygon points="9,1 11,7 17,7 12,11 14,17 9,13 4,17 6,11 1,7 7,7" fill="#f59e0b"/>
        </pattern>

        <clipPath id={`eggshape-${uid}`}>
          <path d="M50 5 C 30 5, 15 25, 15 50 C 15 80, 35 110, 50 125 C 65 110, 85 80, 85 50 C 85 25, 70 5, 50 5 Z" />
        </clipPath>
      </defs>

      {/* Base */}
      <path d="M50 5 C 30 5, 15 25, 15 50 C 15 80, 35 110, 50 125 C 65 110, 85 80, 85 50 C 85 25, 70 5, 50 5 Z" fill={`url(#eggrad-${uid})`} />

      {/* Skins */}
      <g clipPath={`url(#eggshape-${uid})`}>
        {skin === 0 && (
          <>
            <rect x="0" y="36" width="100" height="14" fill={`url(#zigzag-${uid})`} opacity="0.95" />
            <rect x="0" y="60" width="100" height="16" fill="#fde68a" opacity="0.95" />
            <rect x="0" y="86" width="100" height="18" fill={`url(#dots-${uid})`} opacity="0.95" />
          </>
        )}
        {skin === 1 && (
          <>
            <rect x="0" y="34" width="100" height="18" fill={`url(#sprinkles-${uid})`} opacity="0.95" />
            <rect x="0" y="62" width="100" height="16" fill="#fca5a5" opacity="0.9" />
            <rect x="0" y="86" width="100" height="18" fill="#93c5fd" opacity="0.95" />
          </>
        )}
        {skin === 2 && (
          <>
            <rect x="0" y="34" width="100" height="18" fill={`url(#stars-${uid})`} opacity="0.9" />
            <rect x="0" y="62" width="100" height="16" fill="#86efac" opacity="0.9" />
            <rect x="0" y="86" width="100" height="18" fill="#f9a8d4" opacity="0.9" />
          </>
        )}
      </g>

      {/* Contorno */}
      <path
        d="M50 5 C 30 5, 15 25, 15 50 C 15 80, 35 110, 50 125 C 65 110, 85 80, 85 50 C 85 25, 70 5, 50 5 Z"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* lienzo del confetti (debajo) */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />
      <motion.div
        className="pointer-events-auto select-none fixed"
        style={{ x, y, rotate, width: size, height: size }}
        drag
        dragMomentum={false}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        onDragStart={() => setDragging(true)}
        onDrag={(e, info) => {
          velRef.current.vx = info.velocity.x;
          velRef.current.vy = info.velocity.y;
        }}
        onDragEnd={(e, info) => {
          velRef.current.vx = info.velocity.x;
          velRef.current.vy = info.velocity.y;
          setTimeout(() => setDragging(false), 50);
        }}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
      >
        <div className="relative">
          {/* halo suave, sin fondo blanco */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ filter: 'blur(18px)', opacity: 0.15, background: 'radial-gradient(closest-side, rgba(0,0,0,0.25), transparent)' }}
          />
          <EggSVG />
          {hover && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-gray-900 text-white text-[11px] shadow whitespace-nowrap">
              página hecha por Astt3r
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    institucional: [{ label: 'Nosotros', to: '/nuestra-historia' }],
    servicios: [
      { label: 'Pastoral Educativa', to: '/pastoral' },
      { label: 'Noticias', to: '/noticias' },
      { label: 'Colegios', to: '/colegios' },
      { label: 'Protocolos', to: '/pastoral#protocolos' },
    ],
    contacto: [
      { label: 'Contacto', to: '/contacto' },
      { label: 'Ubicación', to: '/contacto#ubicacion' },
      { label: 'Horarios', to: '/contacto#horarios' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/FundacionJuanXXIII/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/fundacionjuanxxiiila/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.39-3.26-1.03-.812-.64-1.218-1.542-1.218-2.706 0-1.164.406-2.066 1.218-2.706.812-.64 1.963-1.03 3.26-1.03 1.297 0 2.448.39 3.26 1.03.812.64 1.218 1.542 1.218 2.706 0 1.164-.406 2.066-1.218 2.706-.812.64-1.963 1.03-3.26 1.03zm7.718-9.674h-1.297v-1.297h1.297v1.297zm-3.917 2.45c-.918 0-1.663.745-1.663 1.663s.745 1.663 1.663 1.663 1.663-.745 1.663-1.663-.745-1.663-1.663-1.663z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UC8UBYBwR1NFtAk2S3QZPXIQ',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  const contactInfo = {
    address: 'Valdivia 300, 4to piso, Oficina 401, Los Ángeles',
    phone: '43-2314006',
    email: 'secretaria@fundacionjuanxxiii.cl',
    website: 'www.fjuanxxiii.cl',
  };

  // --- Trigger secreto del huevo: Alt+Shift+Click o triple click ---
  const [showEgg, setShowEgg] = useState(false);
  const clicksRef = useRef(0);
  const timerRef = useRef(null);

  const secretTrigger = (e) => {
    if (e.altKey && e.shiftKey) {
      setShowEgg(true);
      return;
    }
    // triple click en < 600ms
    clicksRef.current += 1;
    clearTimeout(timerRef.current);
    if (clicksRef.current >= 3) {
      clicksRef.current = 0;
      setShowEgg(true);
    } else {
      timerRef.current = setTimeout(() => {
        clicksRef.current = 0;
      }, 600);
    }
  };

  return (
    <footer className="bg-primary-900 text-white">
      {/* Sección principal del footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la fundación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FJ</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Fundación Juan XXIII</h3>
                <p className="text-gray-400 text-sm">Educación con valores</p>
              </div>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Comprometidos con la educación integral y la formación en valores
              cristianos, acompañamos a las comunidades educativas en su misión
              de formar personas íntegras y solidarias.
            </p>

            {/* Información de contacto */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary-400 transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary-400 transition-colors">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Enlaces institucionales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Enlaces de servicios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Redes sociales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h4 className="text-lg font-semibold mb-2">Síguenos</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-800 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-secondary-600 transition-all duration-200"
                    aria-label={`Seguir en ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copyright + trigger secreto */}
      <div className="bg-primary-800 py-4">
        <div className="container-custom">
          <div
            className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 select-none"
            onClick={secretTrigger}
            title="©"
          >
            <p>
              © {currentYear} Fundación Juan XXIII. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link to="/privacidad" className="hover:text-primary-400 transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="hover:text-primary-400 transition-colors">
                Términos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Render del huevo si fue activado */}
      {showEgg && <DevEgg />}
    </footer>
  );
};

export default Footer;
