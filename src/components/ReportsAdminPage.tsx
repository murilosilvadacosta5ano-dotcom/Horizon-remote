import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  AlertTriangle, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Scale, 
  Ban, 
  MessageSquare,
  Send,
  Clock
} from 'lucide-react';
import { UserProfile, CommentReport } from '../types';
import { getAllReports } from '../services/commentsService';

interface ReportsAdminPageProps {
  currentUser: UserProfile | null;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const ReportsAdminPage: React.FC<ReportsAdminPageProps> = ({
  currentUser,
  onNavigate,
  onShowToast
}) => {
  const [reports, setReports] = useState<CommentReport[]>(() => getAllReports());

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex flex-col items-center py-6 px-4 selection:bg-[#2481cc]/30">
      
      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between pb-5 border-b border-[#1c2733] mb-6">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-[#1c2733] hover:bg-[#253241] text-xs font-bold text-[#8293a4] hover:text-white transition-all cursor-pointer border border-[#253241]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Galeria</span>
        </button>

        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#ef4444]" />
          <h1 className="text-base font-extrabold text-white uppercase tracking-tight">
            Central de Denúncias e Moderação
          </h1>
        </div>

        <button
          onClick={() => onNavigate('/perfil')}
          className="text-xs font-bold text-[#2aabee] hover:underline"
        >
          Meu Perfil
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl space-y-6">
        
        {/* Guidelines Hero Banner (2016-era styling) */}
        <div className="bg-[#17212b] border border-[#ef4444]/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef4444]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2.5 text-[#ef4444]">
              <Scale className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">
                Diretrizes de Convivência & Moderação Automática
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white">
              Política Contra Difamação e Ofensas Pessoais
            </h2>

            <p className="text-xs sm:text-sm text-[#8293a4] leading-relaxed">
              O ambiente da <strong>Kaise Figurinhas</strong> preza pelo respeito e liberdade saudável. Denúncias envolvendo calúnia, difamação ou ataques direcionados são analisadas com rigor:
            </p>

            {/* Rule Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0e1621] p-3.5 rounded-2xl border border-[#232e3c] space-y-1">
                <div className="flex items-center gap-2 text-[#ef4444] text-xs font-black">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Remoção Imediata do Comentário</span>
                </div>
                <p className="text-[11px] text-[#708499]">
                  Comentários com denúncias procedentes são apagados e substituídos por aviso de infração.
                </p>
              </div>

              <div className="bg-[#0e1621] p-3.5 rounded-2xl border border-[#232e3c] space-y-1">
                <div className="flex items-center gap-2 text-[#ef4444] text-xs font-black">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>Suspensão / Perda de Conta</span>
                </div>
                <p className="text-[11px] text-[#708499]">
                  Usuários que praticarem difamação perdem o acesso à conta e ao ecossistema Kaise.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* How to Report Instructions */}
        <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2aabee]" />
            <span>Como Denunciar um Comentário nos GIFs?</span>
          </h3>

          <ol className="space-y-3 text-xs text-[#8293a4]">
            <li className="flex items-start gap-2.5 bg-[#0e1621] p-3 rounded-xl border border-[#232e3c]">
              <span className="w-5 h-5 rounded-full bg-[#2481cc] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
              <span>Abra a figurinha ou GIF que contém o comentário ofensivo.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-[#0e1621] p-3 rounded-xl border border-[#232e3c]">
              <span className="w-5 h-5 rounded-full bg-[#2481cc] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
              <span>Ao lado do comentário, clique no ícone de <strong>"Denunciar"</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-[#0e1621] p-3 rounded-xl border border-[#232e3c]">
              <span className="w-5 h-5 rounded-full bg-[#2481cc] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
              <span>Escolha a opção <strong>Difamação / Calúnia / Falando mal</strong> e confirme o envio.</span>
            </li>
          </ol>
        </div>

        {/* Registered Reports List */}
        <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232e3c]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2aabee]" />
              <h3 className="text-sm font-black text-white">
                Histórico de Denúncias Processadas ({reports.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-lg">
              Sistema Ativo
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8293a4]">
              Nenhuma denúncia registrada no momento. O ambiente está 100% em conformidade! 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-[#0e1621] border border-[#232e3c] rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#ef4444] uppercase text-[10px] bg-[#ef4444]/15 px-2 py-0.5 rounded border border-[#ef4444]/30">
                        {rep.reason}
                      </span>
                      <span className="text-[#8293a4]">
                        Autor denunciado: <strong className="text-white">{rep.reportedUsername}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] text-[#708499]">
                      {new Date(rep.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-[#fca5a5] italic bg-[#ef4444]/5 p-2 rounded-lg border border-[#ef4444]/20">
                    "{rep.commentContent}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-[#708499]">
                      Denunciado por: <strong className="text-white">{rep.reportedByUsername}</strong>
                    </span>
                    <span className="text-[#10b981] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{rep.status === 'removed_content' ? 'Comentário Removido' : rep.status === 'user_banned' ? 'Usuário Banido' : 'Em Análise'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
