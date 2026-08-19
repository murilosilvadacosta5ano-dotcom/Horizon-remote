import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  FileText, 
  User, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface TermsConsentModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onAccept: (user: UserProfile) => void;
  onDecline: () => void;
}

export const TermsConsentModal: React.FC<TermsConsentModalProps> = ({
  isOpen,
  user,
  onAccept,
  onDecline
}) => {
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [agreeRedirect, setAgreeRedirect] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    if (!agreeTerms) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAccept(user);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      <div 
        id="terms-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-[#17212b] border border-[#232e3c] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#232e3c] bg-[#121922] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#2481cc]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">
                  Termos de Uso e Autorização
                </h3>
                <p className="text-xs text-[#8293a4]">
                  Confirme seus dados Google para ativar sua conta
                </p>
              </div>
            </div>
            <button
              onClick={onDecline}
              className="p-1.5 text-[#8293a4] hover:text-white rounded-xl hover:bg-[#232e3c] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Google Card with Real Profile Picture */}
          <div className="p-5 overflow-y-auto space-y-4">
            
            {/* Authenticated Google Account Info */}
            <div className="bg-[#0e1621] border border-[#253241] rounded-2xl p-4 flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2481cc&color=fff&size=150`;
                  }}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#2481cc] shadow-md shadow-[#2481cc]/20"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold px-1.5 py-0.5 rounded-md border border-[#10b981]/30">
                    Google Conectado
                  </span>
                </div>
                <p className="text-xs text-[#8293a4] truncate font-medium">
                  {user.email}
                </p>
                <p className="text-[11px] text-[#708499] mt-0.5">
                  Conta autenticada com sucesso
                </p>
              </div>
            </div>

            {/* Terms Content Box */}
            <div className="bg-[#121922] border border-[#232e3c] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-[#2aabee]" />
                <span>Termos de Serviço e Privacidade da Kaise</span>
              </div>

              <div className="space-y-2.5 text-xs text-[#8293a4] leading-relaxed max-h-40 overflow-y-auto pr-1">
                <div className="flex items-start gap-2">
                  <span className="text-[#2481cc] font-bold">1.</span>
                  <p>
                    <strong className="text-white">Uso da Plataforma:</strong> Você terá acesso a todas as coleções de GIFs e Figurinhas animadas em HD, podendo salvar favoritos na sua nuvem.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2481cc] font-bold">2.</span>
                  <p>
                    <strong className="text-white">Sincronização Kaise.space:</strong> Sua sessão autenticada será autorizada e integrada com o ecossistema <strong>www.kaise.space</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2481cc] font-bold">3.</span>
                  <p>
                    <strong className="text-white">Privacidade e Proteção:</strong> Seus dados de perfil do Google (foto, nome e e-mail) são utilizados estritamente para identificar seu acesso e sincronizar suas preferências.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2481cc] font-bold">4.</span>
                  <p>
                    <strong className="text-white">Diretrizes de Comunidade:</strong> É proibido o uso de mídias que infrinjam direitos autorais de terceiros ou contenham conteúdos abusivos.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-1">
              <label 
                htmlFor="agreeTermsCheck"
                className="flex items-start gap-3 p-3 bg-[#121922] rounded-xl border border-[#253241] cursor-pointer hover:border-[#2481cc]/50 transition-colors"
              >
                <input
                  id="agreeTermsCheck"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#253241] text-[#2481cc] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#cfd8dc] leading-tight select-none">
                  Li e concordo com os <strong>Termos de Uso</strong> e a <strong>Política de Privacidade</strong> da Kaise.
                </span>
              </label>

              <label 
                htmlFor="agreeRedirectCheck"
                className="flex items-start gap-3 p-3 bg-[#121922] rounded-xl border border-[#253241] cursor-pointer hover:border-[#2481cc]/50 transition-colors"
              >
                <input
                  id="agreeRedirectCheck"
                  type="checkbox"
                  checked={agreeRedirect}
                  onChange={(e) => setAgreeRedirect(e.target.checked)}
                  className="mt-0.5 rounded border-[#253241] text-[#2481cc] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#cfd8dc] leading-tight select-none">
                  Autorizo a integração e o redirecionamento automático da sessão para <strong>www.kaise.space</strong>.
                </span>
              </label>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-[#232e3c] bg-[#121922] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onDecline}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#8293a4] hover:text-white hover:bg-[#232e3c] transition-colors cursor-pointer"
            >
              Recusar e Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!agreeTerms || isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-[#2481cc] hover:bg-[#1f70b0] disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#2481cc]/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>{isSubmitting ? 'Salvando termos...' : 'Aceitar e Concluir Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
