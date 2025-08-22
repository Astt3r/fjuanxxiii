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
  onImageUpload, // (file) => Promise<{ url }>
  placeholder = "Comienza a escribir tu contenido aquí...",
  className = "",
  showToolbar = true,
  minHeight = "400px"
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');

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
    if(img){ img.classList.add('rte-selected'); }
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

  // Manejar carga de imagen
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && onImageUpload) {
      // Insertar placeholder temporal
      const tempId = 'upl-'+Date.now()+Math.random();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const placeholder = `<figure data-temp="${tempId}" style="display:inline-block;position:relative;max-width:100%;margin:10px 0;">
          <img src="${dataUrl}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:8px;display:block;opacity:.55;filter:grayscale(45%);" />
          <figcaption style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:500;background:rgba(0,0,0,.45);backdrop-filter:blur(2px);">Subiendo...</figcaption>
        </figure>`;
        document.execCommand('insertHTML', false, placeholder);
        handleContentChange();
      };
      reader.readAsDataURL(file);
      try {
        const result = await onImageUpload(file);
        const imageUrl = result?.url;
        if (!imageUrl) throw new Error('Respuesta de subida sin URL');
        // Reemplazar placeholder
        const editor = editorRef.current;
        if(editor){
          const ph = editor.querySelector(`figure[data-temp="${tempId}"]`);
          if(ph){
            ph.removeAttribute('data-temp');
            const img = ph.querySelector('img');
            const cap = ph.querySelector('figcaption');
            if(cap) cap.remove();
            if(img){
              img.src=imageUrl;
              img.style.opacity='1';
              img.style.filter='none';
              img.setAttribute('draggable','true');
              selectImage(img);
            }
          }
          handleContentChange();
        }
      } catch (e) {
        alert(e.message || 'Error al subir la imagen');
      }
    }
    event.target.value='';
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
        data-placeholder={placeholder}
      />

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
