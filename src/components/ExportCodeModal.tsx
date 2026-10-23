import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Folder, ExternalLink, Terminal, Shield } from 'lucide-react';

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // The direct URL on the dev server container
  const directUrl = `${window.location.origin}/gym-tracker-codigo.zip`;

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const res = await fetch('/gym-tracker-codigo.zip');
      if (!res.ok) throw new Error('No se pudo obtener el archivo');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'gym-tracker-codigo.zip';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        setDownloading(false);
        setDownloadSuccess(true);
      }, 800);
    } catch (e) {
      console.error(e);
      // Fallback: direct window location
      window.location.href = '/gym-tracker-codigo.zip';
      setDownloading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl space-y-6 text-neutral-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <FileCode className="w-3.5 h-3.5" />
            <span>Código Fuente Completo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Descargar Archivo ZIP del Proyecto
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Incluye todos los archivos React, TypeScript, Tailwind CSS, reglas de base de datos Firestore y el archivo README con instrucciones de despliegue.
          </p>
        </div>

        {/* Main Action 1: In-App Blob Download */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Opción 1: Descarga directa desde esta app</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              2.4 MB .ZIP
            </span>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Generando descarga...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>¡Descarga iniciada con éxito!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar gym-tracker-codigo.zip ahora</span>
              </>
            )}
          </button>
        </div>

        {/* Main Action 2: Direct URL Copy for New Tab */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Opción 2: Abrir en una pestaña nueva de tu navegador</span>
          </span>
          <p className="text-[11px] text-neutral-400">
            Si tu navegador bloquea descargas dentro de pantallas embebidas, copia este enlace y pégalo en una pestaña nueva del mismo navegador:
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directUrl}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5 text-xs text-neutral-400">
          <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Pasos tras descomprimir:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
            <li>Descomprime el archivo en cualquier carpeta de tu computadora.</li>
            <li>Ejecuta <code className="text-amber-300 font-mono">npm install</code> para instalar dependencias.</li>
            <li>Inicia con <code className="text-amber-300 font-mono">npm run dev</code> para probar en local.</li>
            <li>O sube la carpeta a GitHub y conéctala a Vercel para tener tu web pública gratis.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
