import React from 'react';
import { ACCENT_COLOR_CLASS } from '../constants';

interface WhatsNewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentHtml: string; // Conteúdo como string HTML
}

const WhatsNewPopup: React.FC<WhatsNewPopupProps> = ({ isOpen, onClose, title, contentHtml }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Fecha ao clicar fora
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
    >
      <div 
        className="bg-neutral-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-scale-in"
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="whats-new-title" className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar novidades"
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div 
          className="prose prose-sm md:prose-base prose-invert max-w-none text-neutral-300 [&_strong]:text-purple-300 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: contentHtml }} 
        />

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 text-sm font-medium text-white ${ACCENT_COLOR_CLASS} rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-800`}
          >
            Entendido!
          </button>
        </div>
      </div>
      <style>{`
        .animate-fade-scale-in {
          animation: fadeScaleIn 0.3s ease-out forwards;
        }
        @keyframes fadeScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        /* Tailwind CSS Prose Invert Customization */
        .prose-invert h1, .prose-invert h2, .prose-invert h3, .prose-invert h4, .prose-invert h5, .prose-invert h6 { color: #e5e5e5; }
        .prose-invert p, .prose-invert li, .prose-invert blockquote { color: #d4d4d4; }
        .prose-invert a { color: #c084fc; }
        .prose-invert a:hover { color: #a855f7; }
        .prose-invert strong { color: #a78bfa; }
        .prose-invert code { color: #f5d0fe; background-color: #3f3f46; padding: 0.2em 0.4em; border-radius: 0.25rem;}
        .prose-invert pre { background-color: #27272a; color: #e5e5e5; }
        .prose-invert blockquote { border-left-color: #7c3aed; }
        .prose-invert hr { border-color: #52525b; }
      `}</style>
    </div>
  );
};

export default WhatsNewPopup;
