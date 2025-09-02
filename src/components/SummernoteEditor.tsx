import React, { useEffect, useRef } from 'react';

interface SummernoteEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const SummernoteEditor: React.FC<SummernoteEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = 'Digite o conteúdo do contrato...'
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Usar jQuery global
    const $ = (window as any).$;
    if (!$) return;

    const $editor = $(editorRef.current);
    
    // Inicializar Summernote
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
          onChange(content);
        },
        onInit: () => {
          // Definir valor inicial
          const initialValue = value || '';
          console.log('SummernoteEditor - Inicializando com valor:', initialValue.substring(0, 100) + '...');
          
          // Usar setTimeout para garantir que o editor esteja pronto
          setTimeout(() => {
            if ($editor.data('summernote') && initialValue) {
              $editor.summernote('code', initialValue);
            }
          }, 50);
        }
      }
    });

    // Método global para inserir variável
    (window as any).insertVariable = (variable: string) => {
      const variableHtml = `<span style="background-color: #e3f2fd; color: #1976d2; padding: 2px 4px; border-radius: 3px; font-weight: bold; margin: 0 2px;">{{${variable}}}</span>&nbsp;`;
      $editor.summernote('pasteHTML', variableHtml);
    };

    // Cleanup
    return () => {
      if ($editor.data('summernote')) {
        $editor.summernote('destroy');
      }
      delete (window as any).insertVariable;
    };
  }, [height, placeholder]); // Removido onChange da dependência para evitar loop

  // Atualizar conteúdo quando value muda externamente
  useEffect(() => {
    if (!editorRef.current) return;
    
    const $ = (window as any).$;
    if (!$) return;

    const $editor = $(editorRef.current);
    if ($editor.data('summernote')) {
      const currentContent = $editor.summernote('code');
      const newValue = value || '';
      
      // Debug log para verificar mudanças
      console.log('SummernoteEditor - Atualizando valor:', {
        currentContent: currentContent?.substring(0, 50) + '...',
        newValue: newValue.substring(0, 50) + '...',
        isEqual: currentContent === newValue
      });
      
      // Atualizar sempre que o valor for diferente
      if (currentContent !== newValue) {
        $editor.summernote('code', newValue);
      }
    }
  }, [value]);

  return (
    <div className="summernote-container">
      <textarea
        ref={editorRef}
        className="form-control"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SummernoteEditor;
