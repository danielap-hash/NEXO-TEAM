import React, { useRef } from 'react';
import { Attachment } from '../types';
import { Paperclip, X, FileText, Image as ImageIcon, Download } from 'lucide-react';

interface FileUploaderProps {
  attachments: Attachment[];
  onAddAttachment: (att: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  readOnly?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  readOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newAtt: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          url,
          createdAt: new Date().toISOString()
        };
        onAddAttachment(newAtt);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer border border-slate-200"
          >
            <Paperclip className="w-3.5 h-3.5 text-slate-500" />
            <span>Adjuntar archivo</span>
          </button>
          <span className="text-[11px] text-slate-400">PDF, Imágenes, Docs (Máx 15MB)</span>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map(att => {
            const isImage = att.type.startsWith('image/') || att.url.startsWith('data:image/');
            return (
              <div
                key={att.id}
                className="group relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 pr-2 text-xs text-slate-700 max-w-xs shadow-xs hover:border-slate-300 transition"
              >
                {isImage ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-8 h-8 object-cover rounded border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0 pr-1">
                  <p className="font-medium text-slate-800 truncate text-[12px]">{att.name}</p>
                  <p className="text-[10px] text-slate-400">{formatSize(att.size)}</p>
                </div>

                <a
                  href={att.url}
                  download={att.name}
                  title="Descargar archivo"
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(att.id)}
                    title="Eliminar adjunto"
                    className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
