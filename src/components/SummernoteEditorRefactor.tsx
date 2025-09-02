import React, { useEffect, useRef, useCallback } from 'react';

interface SummernoteEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  id?: string;
}

const SummernoteEditor: React.FC<SummernoteEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = 'Digite o conteúdo do contrato...',
  id = `summernote-${Math.random().toString(36).substr(2, 9)}`
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);

  // Função para inserir variável globalmente disponível
  const insertVariable = useCallback((variable: string) => {
    if (editorInstanceRef.current) {
      const variableHtml = `<span style="background-color: #e3f2fd; color: #1976d2; padding: 2px 4px; border-radius: 3px; font-weight: bold; margin: 0 2px;">{{${variable}}}</span>&nbsp;`;
      editorInstanceRef.current.summernote('pasteHTML', variableHtml);
    }
  }, []);

  // Inicializar Summernote
  useEffect(() => {
    if (!editorRef.current) return;

    const $ = (window as any).$;
    if (!$) {
      console.error('jQuery não encontrado');
      return;
    }

    const $editor = $(editorRef.current);
    
    // Configurar Summernote
    $editor.summernote({
      height: height,
      placeholder: placeholder,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link']],
        ['view', ['fullscreen', 'codeview', 'help']]
      ],
      fontNames: [
        'Arial', 'Arial Black', 'Courier New',
        'Helvetica', 'Times New Roman', 'Verdana'
      ],
      fontSizes: ['10', '11', '12', '14', '16', '18', '20', '24', '28', '36'],
      callbacks: {
        onChange: (content: string) => {
          if (!isUpdatingRef.current) {
            onChange(content);
          }
        },
        onInit: () => {
          editorInstanceRef.current = $editor;
          
          // Definir conteúdo inicial
          if (value) {
            isUpdatingRef.current = true;
            $editor.summernote('code', value);
            isUpdatingRef.current = false;
          }
        }
      }
    });

    // Disponibilizar função globalmente com ID único
    (window as any)[`insertVariable_${id}`] = insertVariable;
    (window as any).insertVariable = insertVariable; // Compatibilidade

    // Cleanup
    return () => {
      if ($editor.data('summernote')) {
        $editor.summernote('destroy');
      }
      delete (window as any)[`insertVariable_${id}`];
      if ((window as any).insertVariable === insertVariable) {
        delete (window as any).insertVariable;
      }
      editorInstanceRef.current = null;
    };
  }, [height, placeholder, id, insertVariable]);

  // Atualizar conteúdo quando value muda
  useEffect(() => {
    if (editorInstanceRef.current && !isUpdatingRef.current) {
      const currentContent = editorInstanceRef.current.summernote('code');
      const newValue = value || '';
      
      if (currentContent !== newValue) {
        isUpdatingRef.current = true;
        editorInstanceRef.current.summernote('code', newValue);
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  return (
    <div className="summernote-container">
      <textarea
        ref={editorRef}
        id={id}
        className="form-control"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SummernoteEditor;
