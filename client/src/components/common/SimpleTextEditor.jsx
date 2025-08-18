import React, { useState, useRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const SimpleTextEditor = ({ 
  value, 
  onChange, 
  onImageUpload, 
  placeholder = "Comienza a escribir tu contenido aquí...",
  className = "",
  minHeight = "400px"
}) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Función para obtener texto seleccionado
  const getSelectedText = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    return textarea.value.substring(start, end);
  };

  // Función para insertar texto en la posición del cursor
  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    
    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    onChange(newValue);
    
    // Restaurar la posición del cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  // Función para envolver texto seleccionado
  const wrapSelectedText = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      const newText = prefix + selectedText + suffix;
      const currentValue = textarea.value;
      const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end);
      onChange(newValue);
      
      // Mantener selección
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + newText.length);
      }, 0);
    } else {
      // Si no hay texto seleccionado, insertar las etiquetas
      insertTextAtCursor(prefix + suffix);
    }
  };

  // Funciones de formato
  const makeBold = () => wrapSelectedText('**', '**');
  const makeItalic = () => wrapSelectedText('*', '*');
  const makeUnderline = () => wrapSelectedText('<u>', '</u>');
  const makeBulletList = () => {
    const selected = getSelectedText();
    if (selected) {
      const lines = selected.split('\n');
      const listItems = lines.map(line => line.trim() ? `• ${line}` : line).join('\n');
      wrapSelectedText('', '');
      insertTextAtCursor(listItems);
    } else {
      insertTextAtCursor('• ');
    }
  };
  
  const makeNumberedList = () => {
    const selected = getSelectedText();
    if (selected) {
      const lines = selected.split('\n');
      const listItems = lines.map((line, index) => line.trim() ? `${index + 1}. ${line}` : line).join('\n');
      wrapSelectedText('', '');
      insertTextAtCursor(listItems);
    } else {
      insertTextAtCursor('1. ');
    }
  };

  const insertLink = () => {
    const selected = getSelectedText();
    if (selected) {
      setSelectedText(selected);
      setShowLinkDialog(true);
    } else {
      setSelectedText('');
      setShowLinkDialog(true);
    }
  };

  const confirmLink = () => {
    if (linkUrl) {
      if (selectedText) {
        wrapSelectedText(`<a href="${linkUrl}">`, '</a>');
      } else {
        insertTextAtCursor(`<a href="${linkUrl}">Enlace</a>`);
      }
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setSelectedText('');
  };

  const insertImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      try {
        const result = await onImageUpload(file);
        const imageUrl = result?.url || result; // compat retro
        if (!imageUrl) throw new Error('Respuesta sin URL');
        insertTextAtCursor(`<img src="${imageUrl}" alt="Imagen" style="max-width:100%;height:auto;" />`);
      } catch (error) {
        console.error('Error al cargar imagen:', error);
      }
    }
  };

  const handleTextareaChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={makeBold}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Negrita"
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={makeItalic}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Cursiva"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={makeUnderline}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Subrayado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={makeBulletList}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Lista con viñetas"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={makeNumberedList}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Lista numerada"
        >
          <NumberedListIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={insertLink}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Insertar enlace"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={insertImage}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Insertar imagen"
        >
          <PhotoIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor de texto */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="w-full p-4 border-0 outline-none resize-none rounded-b-lg"
        style={{ 
          minHeight,
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'normal',
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6'
        }}
        dir="ltr"
      />

      {/* Input oculto para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Dialog para enlaces */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Insertar enlace</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setSelectedText('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLink}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTextEditor;
