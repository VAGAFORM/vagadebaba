/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  CheckCircle2,
  Lock,
  Heart
} from 'lucide-react';
import { ApplicationData, AppStepName, STEPS_ORDER } from './types';
import {
  WelcomeStep,
  AboutJobStep,
  ResponsibilitiesStep,
  PunctualityStep,
  ConductStep,
  FormPersonalDataStep,
  FormContactStep,
  FormExperienceStep,
  FormTransportStep,
  FormActivitiesStep,
  FormHealthStep,
  FormSalaryStep,
  FormConfirmationStep
} from './components/StepViews';

const INITIAL_DATA: ApplicationData = {
  termsAcceptedVaga: false,
  termsAcceptedResponsabilidades: false,
  termsAcceptedPontualidade: false,
  termsAcceptedConduta: false,
  nome: '',
  idade: '',
  bairro: '',
  possuiFilhos: '',
  quantidadeFilhos: '',
  whatsapp: '',
  redeSocial: '',
  trabalhouComoBaba: '',
  tempoExperiencia: '',
  possuiTransporteProprio: '',
  transporteUtilizado: '',
  dispostaAtividades: '',
  possuiProblemaSaude: '',
  descricaoLimitacao: '',
  pretensaoSalarial: '',
  revisaoConfirmada: false
};

export default function App() {
  // Load state or load default initial state
  const [data, setData] = useState<ApplicationData>(() => {
    const saved = localStorage.getItem('nanny_application_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved application data', e);
      }
    }
    return INITIAL_DATA;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const saved = localStorage.getItem('nanny_application_step_index');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < STEPS_ORDER.length) {
        return parsed;
      }
    }
    return 0;
  });

  const [isStepValid, setIsStepValid] = useState<boolean>(true);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = back
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const currentStep = STEPS_ORDER[currentStepIndex];

  // Save state back to localStorage
  useEffect(() => {
    localStorage.setItem('nanny_application_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('nanny_application_step_index', currentStepIndex.toString());
  }, [currentStepIndex]);

  const updateData = (fields: Partial<ApplicationData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (!isStepValid) return;

    if (currentStepIndex === STEPS_ORDER.length - 1) {
      // Final confirmation step -> Send to WhatsApp
      sendApplicationToWhatsApp();
      return;
    }

    setDirection(1);
    setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS_ORDER.length - 1));
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza de que deseja apagar todas as respostas e recomeçar do zero?')) {
      setData(INITIAL_DATA);
      setCurrentStepIndex(0);
      setIsStepValid(true);
      setDirection(-1);
      localStorage.removeItem('nanny_application_data');
      localStorage.removeItem('nanny_application_step_index');
    }
  };

  const sendApplicationToWhatsApp = () => {
    const number = '5593991580195';

    // Formatting fields for clean display in WhatsApp
    const fNome = data.nome.trim();
    const fIdade = data.idade.trim();
    const fBairro = data.bairro.trim();
    const fFilhos = data.possuiFilhos;
    const fQtdFilhos = data.possuiFilhos === 'Sim' ? data.quantidadeFilhos : 'Não se aplica';
    const fWhatsapp = data.whatsapp.trim();
    const fSocial = data.redeSocial.trim() || 'Não informada';
    const fTrabBaba = data.trabalhouComoBaba;
    const fTempoExp = data.trabalhouComoBaba === 'Sim' ? data.tempoExperiencia : 'Não se aplica';
    const fTranspProprio = data.possuiTransporteProprio;
    const fTranspUtilizado = data.transporteUtilizado;
    const fDispostaAtiv = data.dispostaAtividades;
    const fProbSaude = data.possuiProblemaSaude;
    const fDescLimitacao = data.possuiProblemaSaude === 'Sim' ? data.descricaoLimitacao.trim() : 'Não se aplica';
    const fPretensao = data.pretensaoSalarial;

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Build the beautiful template message
    const message = `*NOVA CANDIDATURA PARA BABÁ*

*DADOS PESSOAIS*

*Nome:* ${fNome}
*Idade:* ${fIdade}
*Bairro:* ${fBairro}
*Possui filhos:* ${fFilhos}
*Quantidade de filhos:* ${fQtdFilhos}

*CONTATO*

*WhatsApp:* ${fWhatsapp}
*Rede social:* ${fSocial}

*EXPERIÊNCIA*

*Já trabalhou como babá:* ${fTrabBaba}
*Tempo de experiência:* ${fTempoExp}

*TRANSPORTE*

*Possui transporte próprio:* ${fTranspProprio}
*Transporte utilizado:* ${fTranspUtilizado}

*ATIVIDADES DA VAGA*

*Disposta a realizar todas as atividades relacionadas aos cuidados da criança:* ${fDispostaAtiv}

*SAÚDE*

*Possui limitação de saúde:* ${fProbSaude}
*Descrição:* ${fDescLimitacao}

*PRETENSÃO SALARIAL*

*Pretensão salarial:* ${fPretensao}

*CONFIRMAÇÕES*

✓ Leu e compreendeu as informações da vaga
✓ Leu e concordou com as responsabilidades da vaga
✓ Leu e compreendeu as regras de pontualidade e compromisso
✓ Leu e concordou com as regras de conduta
✓ Confirmou que as informações fornecidas são verdadeiras

*Data do envio:* ${dateStr}
*Hora do envio:* ${timeStr}`;

    const encodedMessage = encodeURIComponent(message.toUpperCase());
    const waUrl = `https://wa.me/${number}?text=${encodedMessage}`;

    // Prompt the success modal on return, and execute the WhatsApp launch
    setShowSuccessModal(true);
    window.open(waUrl, '_blank');
  };

  // Stepper descriptions/categories
  const isTermStep = currentStepIndex < 5;
  const progressPercent = Math.round((currentStepIndex / (STEPS_ORDER.length - 1)) * 100);

  const getStepSubtitle = (): string => {
    if (currentStepIndex === 0) return 'Iniciando Processo';
    if (isTermStep) return `Termos e Condições — Parte ${currentStepIndex} de 4`;
    return `Formulário de Entrada — Etapa ${currentStepIndex - 4} de 8`;
  };

  const nextButtonLabel = (): string => {
    if (currentStepIndex === 0) return 'Começar';
    if (currentStepIndex === 4) return 'Iniciar candidatura';
    if (currentStepIndex === STEPS_ORDER.length - 1) return 'Enviar';
    return 'Avançar';
  };

  const renderActiveStep = () => {
    const props = { data, onChange: updateData, onValidate: setIsStepValid };
    switch (currentStep) {
      case 'WELCOME':
        return <WelcomeStep {...props} />;
      case 'ABOUT_JOB':
        return <AboutJobStep {...props} />;
      case 'RESPONSIBILITIES':
        return <ResponsibilitiesStep {...props} />;
      case 'PUNCTUALITY':
        return <PunctualityStep {...props} />;
      case 'CONDUCT':
        return <ConductStep {...props} />;
      case 'FORM_PERSONAL_DATA':
        return <FormPersonalDataStep {...props} />;
      case 'FORM_CONTACT':
        return <FormContactStep {...props} />;
      case 'FORM_EXPERIENCE':
        return <FormExperienceStep {...props} />;
      case 'FORM_TRANSPORT':
        return <FormTransportStep {...props} />;
      case 'FORM_ACTIVITIES':
        return <FormActivitiesStep {...props} />;
      case 'FORM_HEALTH':
        return <FormHealthStep {...props} />;
      case 'FORM_SALARY':
        return <FormSalaryStep {...props} />;
      case 'FORM_CONFIRMATION':
        return <FormConfirmationStep {...props} />;
      default:
        return <WelcomeStep {...props} />;
    }
  };

  // Framer Motion custom slide/fade presets
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0
    })
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-between p-4 md:p-6 bg-[#F5F5F5]">
      {/* Centered Master Layout wrapper */}
      <div className="w-full max-w-lg mx-auto my-auto flex flex-col justify-center min-h-[80vh]">
        
        {/* Discrete Top brand indicator */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-1.5 py-1 text-sage-800 font-medium text-xs">
            <Baby className="w-4 h-4 text-sage-500" />
            <span className="font-poppins">Fomulario para babá</span>
          </div>

          {currentStepIndex > 0 && (
            <button
              onClick={handleReset}
              className="text-[11px] text-neutral-400 hover:text-red-500 font-semibold flex items-center gap-1 cursor-pointer transition-colors duration-150 py-1"
              title="Apagar respostas e recomeçar"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Recomeçar</span>
            </button>
          )}
        </div>

        {/* Central Elegance Card Container */}
        <div className="bg-white rounded-none shadow-sm border border-neutral-200 overflow-hidden flex flex-col transition-all duration-300">
          
          {/* Top Progress Bar - Spans entirely left to right */}
          <div className="w-full bg-neutral-100 h-1.5 relative">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-sage-400 h-1.5"
            ></motion.div>
          </div>

          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
            {/* Header Steps indicator */}
            <header className="mb-6 flex justify-between items-center text-xs text-neutral-400 font-semibold border-b border-neutral-50 pb-3">
              <span className="uppercase tracking-wider text-sage-600 font-semibold">
                {isTermStep ? 'Termos e Condições' : 'Formulário de Entrada'}
              </span>
              <span>
                {getStepSubtitle()}
              </span>
            </header>

            {/* Dynamic Step Content view rendering with slider animations */}
            <div className={`flex-1 flex flex-col justify-center ${currentStepIndex === 0 ? 'min-h-0' : 'min-h-[280px] md:min-h-[300px]'}`}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStepIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="w-full"
                >
                  {renderActiveStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Form Action Buttons Navigation */}
            <footer className={`pt-4 border-t border-neutral-100 flex items-center justify-between gap-3 ${currentStepIndex === 0 ? 'mt-4' : 'mt-8'}`}>
              
              {/* Back Button */}
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-11 px-4 rounded-none border border-neutral-250 text-neutral-600 font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-neutral-50 active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              ) : (
                <div className="w-5"></div> /* Placeholder spacer */
              )}

              {/* Next Button */}
              <button
                type="button"
                id="nextStepButton"
                onClick={handleNext}
                disabled={!isStepValid}
                className={`h-11 px-5 rounded-none text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-xs active:scale-97 flex-1 xs:flex-initial ${
                  isStepValid
                    ? 'bg-sage-400 hover:bg-sage-500 shadow-sage-200/50'
                    : 'bg-neutral-250 text-neutral-400 cursor-not-allowed border-none'
                }`}
              >
                <span>{nextButtonLabel()}</span>
                {currentStepIndex === STEPS_ORDER.length - 1 ? (
                  <Send className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0" />
                )}
              </button>
            </footer>

          </div>
        </div>

        {/* Dynamic Trust footer with metadata or notices */}
        <p className="text-center text-[11px] text-neutral-400 mt-5 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-neutral-400" />
          <span>Suas respostas são enviadas diretamente de ponta a ponta pelo WhatsApp.</span>
        </p>

      </div>

      {/* Modern, Elegant Full Page Congratulations Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="bg-white rounded-none p-6 md:p-8 max-w-sm w-full text-center shadow-xl border border-neutral-200"
            >
              <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-sage-100">
                <CheckCircle2 className="w-9 h-9 text-sage-500 animate-wiggle" />
              </div>

              <h3 className="text-lg font-semibold text-neutral-800 font-poppins mb-2">
                Quase lá!
              </h3>
              
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                Estamos abrindo o seu WhatsApp para que você possa enviar o formulário preenchido. Caso a conversa não abra automaticamente, clique no botão abaixo.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sendApplicationToWhatsApp();
                  }}
                  className="w-full h-11 bg-sage-400 hover:bg-sage-500 text-white font-medium rounded-none text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Reabrir WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Reset or let the user choose
                  }}
                  className="w-full h-10 border border-neutral-250 hover:bg-neutral-50 text-neutral-650 font-medium rounded-none text-xs transition-all duration-150 cursor-pointer"
                >
                  Voltar ao site
                </button>
              </div>

              <div className="mt-5 pt-3.5 border-t border-neutral-100 justify-center flex items-center gap-1 text-[10px] text-neutral-400">
                <span>Feito com</span>
                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                <span>para facilitar seu cadastro</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full text-center text-[10px] text-neutral-350 py-1 font-inter">
        © 2026 VAGAFORM
      </footer>
    </main>
  );
}
