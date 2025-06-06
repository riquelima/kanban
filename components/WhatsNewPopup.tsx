
import React from 'react';

interface WhatsNewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentHtml: string; 
}

const WhatsNewPopup: React.FC<WhatsNewPopupProps> = ({ isOpen, onClose, title, contentHtml }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
    >
      <div 
        className="bg-white dark:bg-[#2A2A2E] dark:border dark:border-[#3C3C43] p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-scale-in"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="whats-new-title" className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar novidades"
            className="text-gray-400 hover:text-gray-600 dark:text-[#9CA3AF] dark:hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div 
          className="prose prose-sm md:prose-base max-w-none text-gray-700 dark:text-[#E5E7EB]
                     [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: contentHtml }} 
        />

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#2A2A2E] dark:filter dark:brightness-110 dark:hover:brightness-125"
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
        /* Light theme prose styles */
        .prose a { color: #4f46e5; } 
        .prose a:hover { color: #4338ca; } 
        .prose strong { color: #6366f1; } 
        .prose code { color: #5b21b6; background-color: #f5f3ff; padding: 0.2em 0.4em; border-radius: 0.25rem;}
        .prose pre { background-color: #f8fafc; color: #334155; } 
        .prose blockquote { border-left-color: #818cf8; }

        /* Dark theme prose styles */
        html.dark .prose a { color: #818cf8; } /* indigo-400 */
        html.dark .prose a:hover { color: #a5b4fc; } /* indigo-300 */
        html.dark .prose strong { color: #a5b4fc; } /* indigo-300 */
        html.dark .prose code { color: #c084fc; background-color: #26262B; } /* purple-400, notion-input */
        html.dark .prose pre { background-color: #1B1B1F; color: #E5E7EB; } /* notion-bg, notion-textPrimary */
        html.dark .prose blockquote { border-left-color: #6366f1; } /* indigo-500 */
        html.dark .prose h1, html.dark .prose h2, html.dark .prose h3, html.dark .prose h4 { color: #F5F5F5; }
        html.dark .prose hr { border-color: #3C3C43; }
        html.dark .prose ul > li::before { background-color: #9CA3AF; }
      `}</style>
    </div>
  );
};

export default WhatsNewPopup;
