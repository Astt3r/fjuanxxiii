import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  NumberedListIcon,
  CodeBracketIcon,
  ChatBubbleLeftIcon,
  TableCellsIcon,
  PaintBrushIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const RichTextEditor = ({ 
  value, 
  onChange, 
  onImageUpload, // (file) => Promise<{ url, id?, width?, height?, variants? }>
  beforeImageUpload, // () => true | string | Promise<true|string> (opcional)
  initialImageWidthPct = 75,
  onSetFeatured, // (mediaId | imageElement) => void (opcional)
  placeholder = "Comienza a escribir tu contenido aquí...",
  className = "",
  showToolbar = true,
  minHeight = "400px"
}) => {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [imgAlt, setImgAlt] = useState('');
  const [imgWidth, setImgWidth] = useState(0);
  const [requestAltFocus, setRequestAltFocus] = useState(false); // solicitar focus tras insertar
  const altInputRef = useRef(null);

  // Gestionar selección (para insertar siempre dentro del editor)
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      try { savedRangeRef.current = sel.getRangeAt(0).cloneRange(); } catch(_){}
    }
  };
  const restoreSelectionIntoEditor = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    const r = savedRangeRef.current;
    if (r && editorRef.current.contains(r.commonAncestorContainer)) {
      sel.addRange(r);
    } else {
      const end = document.createRange();
      end.selectNodeContents(editorRef.current);
      end.collapse(false);
      sel.addRange(end);
    }
    editorRef.current.focus();
  };

  useEffect(() => {
    if (requestAltFocus) {
      // pequeño timeout para asegurar render
      setTimeout(() => {
        altInputRef.current?.focus();
      }, 30);
      setRequestAltFocus(false);
    }
  }, [requestAltFocus]);

  // Función simple para manejar cambios de contenido
  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      // Normalizar: si hay imágenes con style width explicit, copiar a atributo width para persistencia
      const clone = editorRef.current.cloneNode(true);
      clone.querySelectorAll('img').forEach(img => {
        const wMatch = /width:\s*(\d+)px/i.exec(img.getAttribute('style')||'');
        if(wMatch){ img.setAttribute('width', wMatch[1]); }
      });
      const content = clone.innerHTML;
      onChange(content);
    }
  };

  // useEffect para configurar el editor cuando se monta
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
      // Envolver imágenes sueltas para consistencia
      editorRef.current.querySelectorAll('img').forEach(img => {
        if(!img.closest('figure')){
          const fig = document.createElement('figure');
          fig.style.display='inline-block';
          fig.style.maxWidth='100%';
          fig.style.margin='10px 0';
          img.parentNode.insertBefore(fig, img);
          fig.appendChild(img);
          img.style.maxWidth = img.style.maxWidth || '100%';
          img.style.height='auto';
          img.style.borderRadius= img.style.borderRadius || '8px';
          img.setAttribute('draggable','true');
        } else {
          img.setAttribute('draggable','true');
        }
      });
    }
  }, [value]);

  // Imagen seleccionada + resize
  const [resizing, setResizing] = useState(null); // {img,startX,startWidth}

  const selectImage = (img) => {
    if(!editorRef.current) return;
    editorRef.current.querySelectorAll('img.rte-selected').forEach(i=>i.classList.remove('rte-selected'));
    if(img){
      img.classList.add('rte-selected');
      setImgAlt(img.getAttribute('alt') || '');
    } else {
      setImgAlt('');
    }
    if (img) {
      const w = parseInt(img.style.width || img.getAttribute('width') || img.getBoundingClientRect().width, 10) || 0;
      setImgWidth(w);
    } else {
      setImgWidth(0);
    }
  };

  const handleEditorClick = (e) => {
    if(e.target.tagName==='IMG') selectImage(e.target); else selectImage(null);
  };

  useEffect(()=>{
    const onMouseDown = (e) => {
      const img = e.target.closest('img.rte-selected');
      if(!img) return;
      const rect = img.getBoundingClientRect();
      if(e.clientX > rect.right - 14 && e.clientY > rect.bottom - 14){
        e.preventDefault();
        setResizing({ img, startX: e.clientX, startWidth: img.offsetWidth });
      }
    };
    const onMouseMove = (e) => {
      if(!resizing) return;
      e.preventDefault();
      const delta = e.clientX - resizing.startX;
      const newW = Math.max(60, resizing.startWidth + delta);
      resizing.img.style.width = newW+'px';
  resizing.img.setAttribute('width', newW);
      handleContentChange();
    };
    const onMouseUp = () => setResizing(null);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[resizing]);

  // Herramientas del editor
  const formatTools = [
    { command: 'bold', icon: BoldIcon, tooltip: 'Negrita (Ctrl+B)', shortcut: 'Ctrl+B' },
    { command: 'italic', icon: ItalicIcon, tooltip: 'Cursiva (Ctrl+I)', shortcut: 'Ctrl+I' },
    { command: 'underline', icon: UnderlineIcon, tooltip: 'Subrayado (Ctrl+U)', shortcut: 'Ctrl+U' },
    { command: 'separator' },
    { 
      command: 'formatBlock', 
      value: 'h1', 
      icon: () => <span className="text-xs font-bold">H1</span>, 
      tooltip: 'Título 1' 
    },
    { 
      command: 'formatBlock', 
      value: 'h2', 
      icon: () => <span className="text-xs font-bold">H2</span>, 
      tooltip: 'Título 2' 
    },
    { 
      command: 'formatBlock', 
      value: 'h3', 
      icon: () => <span className="text-xs font-bold">H3</span>, 
      tooltip: 'Título 3' 
    },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: ListBulletIcon, tooltip: 'Lista con viñetas' },
    { command: 'insertOrderedList', icon: NumberedListIcon, tooltip: 'Lista numerada' },
    { command: 'separator' },
    { 
      command: 'formatBlock', 
      value: 'blockquote', 
      icon: ChatBubbleLeftIcon, 
      tooltip: 'Cita' 
    },
    { 
      command: 'formatBlock', 
      value: 'pre', 
      icon: CodeBracketIcon, 
      tooltip: 'Código' 
    },
    { command: 'separator' },
    { command: 'createLink', icon: LinkIcon, tooltip: 'Insertar enlace', custom: true },
    { command: 'insertImage', icon: PhotoIcon, tooltip: 'Insertar imagen', custom: true },
    { command: 'foreColor', icon: PaintBrushIcon, tooltip: 'Color de texto', custom: true }
  ];

  const blockFormats = [
    { value: 'p', label: 'Párrafo' },
    { value: 'h1', label: 'Título 1' },
    { value: 'h2', label: 'Título 2' },
    { value: 'h3', label: 'Título 3' },
    { value: 'h4', label: 'Título 4' },
    { value: 'blockquote', label: 'Cita' },
    { value: 'pre', label: 'Código' }
  ];

  const predefinedColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#33CC00', '#0099CC',
    '#6633CC', '#CC0099', '#DC2626', '#059669', '#7C3AED'
  ];

  // Ejecutar comandos del editor
  const executeCommand = (command, value = null) => {
    if (command === 'createLink') {
      setShowLinkDialog(true);
      return;
    }
    
    if (command === 'insertImage') {
      // Guardar caret antes de abrir el selector de archivos
      saveSelection();
      if (!onImageUpload) {
        alert('Subida de imágenes deshabilitada en este contexto');
        return;
      }
      fileInputRef.current?.click();
      return;
    }

    if (command === 'foreColor') {
      setShowColorPicker(true);
      return;
    }

    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Aplicar color
  const applyColor = (color) => {
    document.execCommand('foreColor', false, color);
    setSelectedColor(color);
    setShowColorPicker(false);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Insertar enlace
  const insertLink = () => {
    if (linkUrl.trim()) {
      document.execCommand('createLink', false, linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
      editorRef.current?.focus();
      handleContentChange();
    }
  };

  // Función reutilizable para subir un archivo de imagen (input, pegado o DnD)
    const uploadImageFile = async (file) => {
    if (!file || !onImageUpload) return;
   // Guard previo: si devuelve true seguimos; si devuelve string, mostramos el msg
   if (typeof beforeImageUpload === 'function') {
     const ok = await beforeImageUpload();
     if (ok !== true) {
       alert(typeof ok === 'string' ? ok : 'No se puede subir la imagen todavía.');
       return; // 👈 Abortamos: NO insertamos placeholder
     }
   }
   


    const tempId = 'upl-' + Date.now() + Math.random();
    const reader = new FileReader();
  reader.onload = () => {
      const dataUrl = reader.result;
      const placeholder = `
        <figure data-temp="${tempId}" style="display:inline-block;position:relative;max-width:100%;margin:10px 0;">
      <img src="${dataUrl}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;opacity:.55;filter:grayscale(45%);" />
      <figcaption style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:500;background:rgba(0,0,0,.45);backdrop-filter:blur(2px);pointer-events:none;">Subiendo...</figcaption>
        </figure>`;
    // Asegurar inserción dentro del editor (respecta caret o al final)
    restoreSelectionIntoEditor();
    document.execCommand('insertHTML', false, placeholder);
      handleContentChange();
    };
    reader.readAsDataURL(file);

    const getNaturalSize = (src) => new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight });
      im.onerror = () => resolve({ w: undefined, h: undefined });
      im.src = src;
    });

    try {
      const result = await onImageUpload(file);
      const imageUrl = result?.url;
      if (!imageUrl) throw new Error('Respuesta de subida sin URL');
      const editor = editorRef.current;
      if (editor) {
        const ph = editor.querySelector(`figure[data-temp="${tempId}"]`);
        if (ph) {
          ph.removeAttribute('data-temp');
          const img = ph.querySelector('img');
          const capOverlay = ph.querySelector('figcaption');
          if (capOverlay) capOverlay.remove();
          if (img) {
            img.src = imageUrl;
            img.style.opacity = '1';
            img.style.filter = 'none';
            img.setAttribute('draggable', 'true');
            // Feedback si falla la carga final
            img.onerror = () => {
              img.style.opacity = '.55';
              img.style.filter = 'grayscale(45%)';
              const figWrap = img.closest('figure');
              if (figWrap && !figWrap.querySelector('.rte-error')) {
                const err = document.createElement('figcaption');
                err.className = 'rte-error';
                Object.assign(err.style, {
                  position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: '600', background: 'rgba(0,0,0,.45)'
                });
                err.textContent = 'Error cargando la imagen';
                figWrap.appendChild(err);
              }
            };
            if (result?.id != null) img.setAttribute('data-media-id', String(result.id));
            let w = result?.width; let h = result?.height;
            if (!w || !h) { const nat = await getNaturalSize(imageUrl); w = w || nat.w; h = h || nat.h; }
            if (w) img.setAttribute('width', String(w));
            if (h) img.setAttribute('height', String(h));
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
            if (result?.variants?.md || result?.variants?.lg) {
              const parts = []; parts.push(`${imageUrl} 640w`);
              if (result.variants.md) parts.push(`${result.variants.md} 1024w`);
              if (result.variants.lg) parts.push(`${result.variants.lg} 1600w`);
              img.setAttribute('srcset', parts.join(', '));
              img.setAttribute('sizes', '(max-width: 768px) 100vw, 768px');
            }
            // Tamaño inicial razonable (60% ancho editor, sin exceder natural ni contenedor)
            const containerW = editorRef.current?.clientWidth || 800;
            const natW = Number(w) || containerW;
            const initW = Math.min(natW, Math.round(containerW * (initialImageWidthPct/100)));
            if (!img.style.width) {
              img.style.width = initW + 'px';
              img.setAttribute('width', String(initW));
            }
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.classList.add('rte-img');
            const fig = img.closest('figure');
            if (fig && !fig.querySelector('figcaption')) {
              const cap = document.createElement('figcaption');
              cap.contentEditable = 'true';
              cap.style.fontSize = '0.875rem';
              cap.style.color = '#6b7280';
              fig.appendChild(cap);
            }
            selectImage(img);
            // Pedir foco en el input ALT
            setRequestAltFocus(true);
          }
        }
        handleContentChange();
      }
    } catch (e) {
      alert(e?.message || 'Error al subir la imagen');
      // 2) Limpieza del placeholder si algo falló
     const editor = editorRef.current;
     if (editor) {
       const ph = editor.querySelector(`figure[data-temp="${tempId}"]`);
       if (ph) { ph.remove(); handleContentChange(); }
     }
     alert(e?.message || 'Error al subir la imagen');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) { event.target.value=''; return; }
    await uploadImageFile(file);
    event.target.value='';
  };

  // Pegar imagen desde portapapeles
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items || [];
    for (const it of items) {
      if (it.kind === 'file') {
        const file = it.getAsFile();
        if (file && file.type.startsWith('image/')) {
          e.preventDefault();
          await uploadImageFile(file);
        }
      }
    }
  };

  // Arrastrar y soltar imagen
  const handleDrop = async (e) => {
    const files = e.dataTransfer?.files || [];
    if (files.length) {
      let consumed = false;
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          if (!consumed) { e.preventDefault(); consumed = true; }
          await uploadImageFile(file);
        }
      }
    }
  };


  // Atajos de teclado
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
        default:
          break;
      }
    }
    // Permitir eliminar imagen seleccionada con Backspace/Delete si está enfocada
    if(['Backspace','Delete'].includes(e.key)){
      const sel = window.getSelection();
      if(sel && sel.rangeCount){
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        // Si la selección está dentro de una imagen
        const img = node.nodeType===1 && node.tagName==='IMG' ? node : (node.parentElement && node.parentElement.tagName==='IMG' ? node.parentElement : null);
        if(img){
          e.preventDefault();
          img.remove();
          handleContentChange();
        }
      }
    }
    // Facilitar navegación con flechas alrededor de figuras/imágenes
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      const sel = window.getSelection();
      if(sel && sel.rangeCount){
        const range = sel.getRangeAt(0);
        let node = range.startContainer;
        if(node.nodeType===3) node = node.parentElement;
        if(node && node.tagName==='FIGURE'){
          e.preventDefault();
          const fig = node;
            const move = (dir)=>{
              if(!fig.parentNode) return;
              if(dir==='prev' && fig.previousSibling) fig.parentNode.insertBefore(fig, fig.previousSibling);
              if(dir==='next' && fig.nextSibling) fig.parentNode.insertBefore(fig.nextSibling, fig);
              handleContentChange();
            };
          if(e.key==='ArrowUp' || e.key==='ArrowLeft') move('prev');
          if(e.key==='ArrowDown' || e.key==='ArrowRight') move('next');
        }
      }
    }
  };

  // Drag & drop reordenar figuras
  const handleDragStart = (e) => {
    const fig = e.target.closest('figure');
    if(!fig) return;
    e.dataTransfer.setData('text/plain','drag-figure');
    fig.classList.add('dragging');
    window.__dragFigure = fig;
  };
  const handleDragOver = (e) => {
    const fig = window.__dragFigure;
    if(!fig) return;
    const over = e.target.closest('figure');
    if(!over || over===fig || !over.parentNode) return;
    e.preventDefault();
    const rect = over.getBoundingClientRect();
    const before = (e.clientY - rect.top) < rect.height/2;
    over.parentNode.insertBefore(fig, before ? over : over.nextSibling);
  };
  const handleDragEnd = () => {
    const fig = window.__dragFigure;
    if(fig){ fig.classList.remove('dragging'); delete window.__dragFigure; handleContentChange(); }
  };

  // Insertar tabla
  const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Columna 1</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Columna 2</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Columna 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Celda 1</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Celda 2</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Celda 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Celda 4</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Celda 5</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Celda 6</td>
          </tr>
        </tbody>
      </table>
    `;
    document.execCommand('insertHTML', false, tableHTML);
    handleContentChange();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input oculto para imágenes */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-1 flex-wrap gap-1">
            {/* Selector de formato */}
            <select 
              onChange={(e) => executeCommand('formatBlock', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 mr-2"
            >
              {blockFormats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>

            {/* Herramientas de formato */}
            {formatTools.map((tool, index) => {
              if (tool.command === 'separator') {
                return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
              }

              return (
                <button
                  key={tool.command + (tool.value || '')}
                  onClick={() => executeCommand(tool.command, tool.value)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                  title={tool.tooltip}
                >
                  {typeof tool.icon === 'function' ? (
                    <tool.icon />
                  ) : (
                    <tool.icon className="h-4 w-4" />
                  )}
                </button>
              );
            })}

            {/* Insertar tabla */}
            <button
              onClick={insertTable}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insertar tabla"
            >
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor de contenido */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        className={`w-full p-4 border border-gray-300 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent prose prose-lg max-w-none ${
          showToolbar ? 'rounded-b-lg' : 'rounded-lg'
        } ${isEditorFocused ? 'ring-2 ring-primary-500' : ''}`}
        style={{ 
          minHeight,
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'embed'
        }}
        dir="ltr"
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
  onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
  onClick={handleEditorClick}
        onPaste={handlePaste}
        onDrop={handleDrop}
        data-placeholder={placeholder}
      />

      {/* Mini popover ALT + acciones sobre imagen seleccionada */}
      {typeof document !== 'undefined' && editorRef.current?.querySelector('img.rte-selected') && (
        <div className="absolute right-2 bottom-2 bg-white border rounded shadow p-2 flex flex-col gap-2 w-60 z-20">
          <input
            ref={altInputRef}
            className="border px-2 py-1 text-sm rounded"
            placeholder="Texto alternativo"
            value={imgAlt}
            onChange={(e) => setImgAlt(e.target.value)}
            onBlur={() => {
              const sel = editorRef.current?.querySelector('img.rte-selected');
              if (sel) sel.setAttribute('alt', imgAlt.trim());
              handleContentChange();
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
              onMouseDown={(e)=>e.preventDefault()}
              onClick={() => {
                const sel = editorRef.current?.querySelector('img.rte-selected');
                if(!sel) return;
                const fig = sel.closest('figure');
                if(fig){ fig.style.float = fig.style.float === 'right' ? '' : 'right'; }
                handleContentChange();
              }}
            >Alinear der</button>
            {onSetFeatured && (
              <button
                type="button"
                className="flex-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded px-2 py-1"
                onMouseDown={(e)=>e.preventDefault()}
                title="Marcar como destacada"
                onClick={() => {
                  const sel = editorRef.current?.querySelector('img.rte-selected');
                  const mediaId = sel?.getAttribute('data-media-id');
                  if (onSetFeatured && (mediaId || sel)) onSetFeatured(mediaId || sel);
                }}
              >⭐ Destacar</button>
            )}
          </div>
                  <div className="text-xs text-gray-600">Ancho</div>
          <input
            type="range"
            min={120}
            max={Math.round((editorRef.current?.clientWidth || 800))}
            value={imgWidth || 120}
            onChange={(e) => {
              const w = parseInt(e.target.value, 10);
              setImgWidth(w);
              const sel = editorRef.current?.querySelector('img.rte-selected');
              if (sel) { sel.style.width = w + 'px'; sel.setAttribute('width', String(w)); handleContentChange(); }
            }}
          />
          <div className="flex gap-1">
            {[25,50,75,100].map(pct => (
              <button
                key={pct}
                type="button"
                className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
                onMouseDown={(e)=>e.preventDefault()}
                onClick={()=>{
                  const cont = editorRef.current?.clientWidth || 800;
                  const w = Math.round(cont * (pct/100));
                  setImgWidth(w);
                  const sel = editorRef.current?.querySelector('img.rte-selected');
                  if (sel) { sel.style.width = w + 'px'; sel.setAttribute('width', String(w)); handleContentChange(); }
                }}
              >{pct}%</button>
            ))}
          </div>
        </div>
      )}

      {/* Diálogo de enlace */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insertar enlace</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
            />
            <div className="flex space-x-3">
              <button
                onClick={insertLink}
                className="flex-1 bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700 transition-colors"
              >
                Insertar
              </button>
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Selector de color */}
      {showColorPicker && (
        <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Color de texto</span>
            <button
              onClick={() => setShowColorPicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1 mb-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => applyColor(color)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => applyColor(e.target.value)}
            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>
      )}

      {/* Información del editor */}
      {isEditorFocused && (
        <div className="text-xs text-gray-500 mt-2">
          Tip: Usa Ctrl+B para negrita, Ctrl+I para cursiva, Ctrl+K para enlaces
        </div>
      )}
    </div>
  );

  
};




// Estilos CSS para forzar comportamiento LTR
const editorStyles = `
  [contenteditable] {
    direction: ltr !important;
    text-align: left !important;
    unicode-bidi: embed !important;
  }
  
  [contenteditable] * {
    direction: ltr !important;
    text-align: left !important;
    unicode-bidi: embed !important;
  }
  
  [contenteditable]:focus {
    direction: ltr !important;
    text-align: left !important;
  }
  [contenteditable] figure { display:inline-block; max-width:100%; margin:10px 0; }
  [contenteditable] figure>img { display:block; max-width:100%; height:auto; border-radius:8px; }
  [contenteditable] figure>figcaption { font-size:.875rem; color:#6b7280; text-align:center; }
  [contenteditable] img.rte-img { max-height:60vh; }
  img.rte-selected { outline:2px solid #2563eb; position:relative; }
  img.rte-selected::after { content:''; position:absolute; width:12px; height:12px; background:#2563eb; right:-6px; bottom:-6px; border-radius:2px; box-shadow:0 0 0 2px #fff; cursor:ew-resize; }
`;

// Inyectar estilos si no existen
if (typeof document !== 'undefined' && !document.getElementById('rich-text-editor-styles')) {
  const style = document.createElement('style');
  style.id = 'rich-text-editor-styles';
  style.textContent = editorStyles;
  document.head.appendChild(style);
}



export default RichTextEditor;
