import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, X, Send, CheckCircle2 } from 'lucide-react';
import { GifComment, UserProfile } from '../types';
import { reportComment } from '../services/commentsService';

interface ReportModalProps {
  isOpen: boolean;
  comment: GifComment | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onReportSubmitted: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  comment,
  currentUser,
  onClose,
  onReportSubmitted
}) => {
  const [reason, setReason] = useState<'difamacao' | 'ofensa' | 'spam' | 'inadequado' | 'outro'>('difamacao');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !comment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onReportSubmitted('Você precisa estar logado com o Google para enviar uma denúncia.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const { commentRemoved, userBanned } = reportComment(
        comment.id,
        comment.gifId,
        comment.userId,
        comment.username,
        comment.content,
        currentUser,
        reason,
        details
      );

      if (commentRemoved) {
        onReportSubmitted('Denúncia processada: Comentário removido por violação de diretrizes.');
      } else {
        onReportSubmitted('Denúncia enviada com sucesso para a equipe de moderação.');
      }
      onClose();
    } catch (err: any) {
      onReportSubmitted(err?.message || 'Erro ao registrar denúncia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#17212b] border border-[#253241] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#253241] bg-[#121922] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center text-[#ef4444]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Denunciar Comentário
                </h3>
                <p className="text-[11px] text-[#8293a4]">
                  Autor: <span className="text-[#2aabee] font-bold">{comment.username}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#1c2733] hover:bg-[#253241] text-[#8293a4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Comment Preview */}
            <div className="bg-[#0e1621] p-3 rounded-2xl border border-[#253241] text-xs">
              <span className="text-[10px] font-bold text-[#708499] uppercase block mb-1">
                Conteúdo denunciado:
              </span>
              <p className="text-white/90 italic font-medium">
                "{comment.content}"
              </p>
            </div>

            {/* Motivo da Denúncia */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Motivo da Violação:
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { id: 'difamacao', label: 'Difamação / Calúnia / Falando mal', desc: 'Acusações falsas ou ataques à honra (remoção imediata)' },
                  { id: 'ofensa', label: 'Ofensa Pessoal / Discurso de Ódio', desc: 'Insultos diretos ou preconceito' },
                  { id: 'spam', label: 'Spam ou Divulgação Não Autorizada', desc: 'Links maliciosos ou mensagens repetitivas' },
                  { id: 'inadequado', label: 'Conteúdo Explícito ou Impróprio', desc: 'Linguagem obscena ou material proibido' },
                  { id: 'outro', label: 'Outro Motivo', desc: 'Descreva abaixo' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      reason === item.id 
                        ? 'bg-[#ef4444]/15 border-[#ef4444] text-white ring-1 ring-[#ef4444]/50' 
                        : 'bg-[#121922] border-[#253241] text-[#8293a4] hover:border-[#354556]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={item.id}
                      checked={reason === item.id}
                      onChange={() => setReason(item.id as any)}
                      className="mt-0.5 text-[#ef4444] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white block text-xs">{item.label}</span>
                      <span className="text-[10px] text-[#708499] block">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Detalhes Adicionais */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8293a4] block">
                Detalhes adicionais (opcional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explique o que aconteceu..."
                rows={2}
                className="w-full p-2.5 bg-[#121922] rounded-xl text-xs text-white border border-[#253241] focus:outline-none focus:border-[#ef4444] resize-none"
              />
            </div>

            {/* Aviso de Moderação */}
            <div className="flex items-center gap-2 text-[11px] text-[#fca5a5] bg-[#ef4444]/10 p-2.5 rounded-xl border border-[#ef4444]/20">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#ef4444]" />
              <span>Denúncias por difamação removem o comentário e podem suspender a conta do autor.</span>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3.5 rounded-xl text-xs font-bold text-[#8293a4] hover:text-white hover:bg-[#232e3c] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-[#ef4444]/30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Confirmar Denúncia'}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
