/**
 * Core Controller for "Candidatura para Vaga de Babá"
 * Pure Vanilla JavaScript for ultra-fast, zero-build deployment.
 */

const STEPS_ORDER = [
  'WELCOME',                  // 0
  'ABOUT_JOB',                // 1
  'RESPONSIBILITIES',         // 2
  'PUNCTUALITY',              // 3
  'CONDUCT',                  // 4
  'FORM_PERSONAL_DATA',       // 5
  'FORM_CONTACT',             // 6
  'FORM_EXPERIENCE',          // 7
  'FORM_TRANSPORT',           // 8
  'FORM_ACTIVITIES',          // 9
  'FORM_HEALTH',              // 10
  'FORM_SALARY',              // 11
  'FORM_CONFIRMATION'         // 12
];

// Initial default state
const INITIAL_DATA = {
  termsAcceptedVaga: false,
  termsAcceptedResponsabilidades: false,
  termsAcceptedPontualidade: false,
  termsAcceptedConduta: false,
  nome: '',
  idade: '',
  bairro: '',
  possuiFilhos: '', // "Sim", "Não"
  quantidadeFilhos: '', // "1", "2", "3", "4 ou mais"
  whatsapp: '',
  redeSocial: '',
  trabalhouComoBaba: '', // "Sim", "Não"
  tempoExperiencia: '', // e.g., "Menos de 6 meses"
  possuiTransporteProprio: '', // "Sim", "Não"
  transporteUtilizado: '', // "Moto", "Carro" etc
  dispostaAtividades: '', // "Sim", "Não"
  possuiProblemaSaude: '', // "Sim", "Não"
  descricaoLimitacao: '',
  pretensaoSalarial: '', // "R$ 800", "R$ 900" etc
  revisaoConfirmada: false
};

// Global active states loaded from LocalStorage or default
let data = { ...INITIAL_DATA };
let currentStepIndex = 0;

// Initialize state from LocalStorage if present
function loadSavedState() {
  const savedData = localStorage.getItem('nanny_application_data');
  if (savedData) {
    try {
      data = { ...INITIAL_DATA, ...JSON.parse(savedData) };
    } catch (e) {
      console.error('Error parsing stored progress', e);
    }
  }

  const savedIndex = localStorage.getItem('nanny_application_step_index');
  if (savedIndex) {
    const parsed = parseInt(savedIndex, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed < STEPS_ORDER.length) {
      currentStepIndex = parsed;
    }
  }
}

// Persist data locally
function persistState() {
  localStorage.setItem('nanny_application_data', JSON.stringify(data));
  localStorage.setItem('nanny_application_step_index', currentStepIndex.toString());
}

// Validate current step questions status
function validateCurrentStep() {
  switch (currentStepIndex) {
    case 0: // WELCOME
      return true;
    case 1: // ABOUT_JOB
      return !!data.termsAcceptedVaga;
    case 2: // RESPONSIBILITIES
      return !!data.termsAcceptedResponsabilidades;
    case 3: // PUNCTUALITY
      return !!data.termsAcceptedPontualidade;
    case 4: // CONDUCT
      return !!data.termsAcceptedConduta;
    case 5: // FORM_PERSONAL_DATA
      {
        const isNameValid = data.nome.trim().length >= 3;
        const isAgeValid = data.idade.trim().length > 0 && parseInt(data.idade, 10) > 0;
        const isBairroValid = data.bairro.trim().length >= 2;
        const isKidsValid = data.possuiFilhos === 'Não' || (data.possuiFilhos === 'Sim' && data.quantidadeFilhos !== '');
        return isNameValid && isAgeValid && isBairroValid && isKidsValid;
      }
    case 6: // FORM_CONTACT
      {
        const digits = data.whatsapp.replace(/\D/g, '');
        return digits.length >= 10;
      }
    case 7: // FORM_EXPERIENCE
      return data.trabalhouComoBaba === 'Não' || (data.trabalhouComoBaba === 'Sim' && data.tempoExperiencia !== '');
    case 8: // FORM_TRANSPORT
      return data.possuiTransporteProprio !== '' && data.transporteUtilizado !== '';
    case 9: // FORM_ACTIVITIES
      return data.dispostaAtividades !== '';
    case 10: // FORM_HEALTH
      return data.possuiProblemaSaude === 'Não' || (data.possuiProblemaSaude === 'Sim' && data.descricaoLimitacao.trim().length >= 3);
    case 11: // FORM_SALARY
      return data.pretensaoSalarial !== '';
    case 12: // FORM_CONFIRMATION
      return !!data.revisaoConfirmada;
    default:
      return false;
  }
}

// Enable or disable the Next Step button visually and logically
function toggleNextButtonState() {
  const isValid = validateCurrentStep();
  const nextBtn = document.getElementById('nextBtn');
  
  if (isValid) {
    nextBtn.disabled = false;
    nextBtn.classList.remove('bg-neutral-250', 'text-neutral-400', 'cursor-not-allowed', 'pointer-events-none');
    nextBtn.classList.add('bg-sage-400', 'hover:bg-sage-500', 'text-white', 'shadow-sage-200/50');
  } else {
    nextBtn.disabled = true;
    nextBtn.classList.remove('bg-sage-400', 'hover:bg-sage-500', 'text-white', 'shadow-sage-200/50');
    nextBtn.classList.add('bg-neutral-250', 'text-neutral-400', 'cursor-not-allowed', 'pointer-events-none');
  }
}

// Helper to style highlighted option selector buttons
function highlightActiveButton(el, isActive) {
  if (!el) return;
  if (isActive) {
    el.classList.remove('border-neutral-200', 'border-neutral-250', 'bg-white', 'text-neutral-600', 'text-neutral-650', 'hover:border-neutral-300');
    el.classList.add('border-sage-400', 'bg-sage-50', 'text-sage-800', 'font-semibold', 'shadow-xs');
  } else {
    el.classList.remove('border-sage-400', 'border-sage-500', 'bg-sage-50', 'bg-sage-100', 'text-sage-800', 'text-sage-900', 'font-semibold', 'shadow-xs', 'border-2');
    el.classList.add('border-neutral-200', 'bg-white', 'text-neutral-650', 'hover:border-neutral-300');
  }
}

// Phone digits template formatter: (XX) XXXXX-XXXX
function formatWhatsappDigits(digitsIn) {
  const digits = digitsIn.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Sync the values of DOM Elements with current state data object
function syncFormFieldsWithData() {
  // Step 1 Checkbox
  document.getElementById('termsAcceptedVaga').checked = !!data.termsAcceptedVaga;
  
  // Step 2 Checkbox
  document.getElementById('termsAcceptedResponsabilidades').checked = !!data.termsAcceptedResponsabilidades;

  // Step 3 Checkbox
  document.getElementById('termsAcceptedPontualidade').checked = !!data.termsAcceptedPontualidade;

  // Step 4 Checkbox
  document.getElementById('termsAcceptedConduta').checked = !!data.termsAcceptedConduta;

  // Step 5 Input Texts & Buttons
  document.getElementById('nome').value = data.nome;
  document.getElementById('idade').value = data.idade;
  document.getElementById('bairro').value = data.bairro;

  const possuiFilhosSim = document.getElementById('possuiFilhosSim');
  const possuiFilhosNao = document.getElementById('possuiFilhosNao');
  highlightActiveButton(possuiFilhosSim, data.possuiFilhos === 'Sim');
  highlightActiveButton(possuiFilhosNao, data.possuiFilhos === 'Não');

  const painelQtdFilhos = document.getElementById('painelQtdFilhos');
  if (data.possuiFilhos === 'Sim') {
    painelQtdFilhos.classList.remove('hidden');
    // Highlight correct count option
    document.querySelectorAll('.btnQtdFilhos').forEach(btn => {
      const isMatch = btn.getAttribute('data-count') === data.quantidadeFilhos;
      highlightActiveButton(btn, isMatch);
    });
  } else {
    painelQtdFilhos.classList.add('hidden');
  }

  // Step 6 Input Contato
  document.getElementById('whatsapp').value = data.whatsapp;
  document.getElementById('redeSocial').value = data.redeSocial;

  // Step 7 Experience
  const workedBabaSim = document.getElementById('workedBabaSim');
  const workedBabaNao = document.getElementById('workedBabaNao');
  highlightActiveButton(workedBabaSim, data.trabalhouComoBaba === 'Sim');
  highlightActiveButton(workedBabaNao, data.trabalhouComoBaba === 'Não');

  const painelTempoExperiencia = document.getElementById('painelTempoExperiencia');
  if (data.trabalhouComoBaba === 'Sim') {
    painelTempoExperiencia.classList.remove('hidden');
    document.querySelectorAll('.btnTempoExp').forEach(btn => {
      const isMatch = btn.getAttribute('data-time') === data.tempoExperiencia;
      highlightActiveButton(btn, isMatch);
      // checkmarks
      const checkIcon = btn.querySelector('i');
      if (checkIcon) {
        if (isMatch) checkIcon.classList.remove('hidden');
        else checkIcon.classList.add('hidden');
      }
    });
  } else {
    painelTempoExperiencia.classList.add('hidden');
  }

  // Step 8 Transport Mobilidade
  const transportProprioSim = document.getElementById('transportProprioSim');
  const transportProprioNao = document.getElementById('transportProprioNao');
  highlightActiveButton(transportProprioSim, data.possuiTransporteProprio === 'Sim');
  highlightActiveButton(transportProprioNao, data.possuiTransporteProprio === 'Não');

  document.querySelectorAll('.btnTransporte').forEach(btn => {
    const isMatch = btn.getAttribute('data-trans') === data.transporteUtilizado;
    highlightActiveButton(btn, isMatch);
  });

  // Step 9 Atividades
  const dispostaAtividadesSim = document.getElementById('dispostaAtividadesSim');
  const dispostaAtividadesNao = document.getElementById('dispostaAtividadesNao');
  highlightActiveButton(dispostaAtividadesSim, data.dispostaAtividades === 'Sim');
  highlightActiveButton(dispostaAtividadesNao, data.dispostaAtividades === 'Não');

  // Step 10 Health
  const healthProblemSim = document.getElementById('healthProblemSim');
  const healthProblemNao = document.getElementById('healthProblemNao');
  highlightActiveButton(healthProblemSim, data.possuiProblemaSaude === 'Sim');
  highlightActiveButton(healthProblemNao, data.possuiProblemaSaude === 'Não');

  const painelLimitacaoSaude = document.getElementById('painelLimitacaoSaude');
  if (data.possuiProblemaSaude === 'Sim') {
    painelLimitacaoSaude.classList.remove('hidden');
    document.getElementById('limitDescription').value = data.descricaoLimitacao;
  } else {
    painelLimitacaoSaude.classList.add('hidden');
  }

  // Step 11 Salary pretensão
  document.querySelectorAll('.btnPretensao').forEach(btn => {
    const isMatch = btn.getAttribute('data-salary') === data.pretensaoSalarial;
    highlightActiveButton(btn, isMatch);
  });

  // Step 12 Confirmation Checkbox & Summary Pane
  document.getElementById('revisaoConfirmada').checked = !!data.revisaoConfirmada;

  if (currentStepIndex === 12) {
    document.getElementById('resNome').textContent = data.nome || '-';
    document.getElementById('resIdade').textContent = data.idade ? `${data.idade} anos` : '-';
    document.getElementById('resBairro').textContent = data.bairro || '-';
    
    let filhosStr = data.possuiFilhos === 'Sim' ? `Sim (${data.quantidadeFilhos || 'não informado'})` : (data.possuiFilhos || 'Não');
    document.getElementById('resFilhos').textContent = filhosStr;
    
    document.getElementById('resWhatsapp').textContent = data.whatsapp || '-';
    document.getElementById('resRedeSocial').textContent = data.redeSocial || 'Não informada';
    
    let expStr = data.trabalhouComoBaba === 'Sim' ? `Sim (${data.tempoExperiencia || 'não informado'})` : (data.trabalhouComoBaba || 'Não');
    document.getElementById('resExpBaba').textContent = expStr;
    
    document.getElementById('resTranspProprio').textContent = data.possuiTransporteProprio || '-';
    document.getElementById('resTranspUtilizado').textContent = data.transporteUtilizado || '-';
    document.getElementById('resDispostaAtiv').textContent = data.dispostaAtividades || '-';
    
    let saudeStr = data.possuiProblemaSaude === 'Sim' ? `Sim - ${data.descricaoLimitacao || 'sem detalhes'}` : (data.possuiProblemaSaude || 'Não');
    document.getElementById('resProbSaude').textContent = saudeStr;
    
    document.getElementById('resPretensaoSalarial').textContent = data.pretensaoSalarial || '-';
  }
}

// Navigates and refreshes step elements
function navigateToStep(targetIndex) {
  if (targetIndex < 0 || targetIndex >= STEPS_ORDER.length) return;
  
  // Hide current active steps
  document.querySelectorAll('.step-view').forEach(view => {
    view.classList.add('hidden');
  });

  currentStepIndex = targetIndex;
  
  // Display target view
  const targetStepEl = document.getElementById(`step-${currentStepIndex}`);
  if (targetStepEl) {
    targetStepEl.classList.remove('hidden');
  }

  // Adjust headers
  const isTermStep = currentStepIndex < 5;
  document.getElementById('stepHeaderLabel').textContent = isTermStep ? 'Termos e Condições' : 'Formulário de Entrada';

  let subHeader = '';
  if (currentStepIndex === 0) {
    subHeader = 'Iniciando Processo';
  } else if (currentStepIndex < 5) {
    subHeader = `Termos e Condições — Parte ${currentStepIndex} de 4`;
  } else {
    subHeader = `Formulário de Entrada — Etapa ${currentStepIndex - 4} de 8`;
  }
  document.getElementById('stepSubHeaderLabel').textContent = subHeader;

  // Toggle footer structures
  const backBtn = document.getElementById('backBtn');
  const backSpacer = document.getElementById('backSpacer');
  const resetBtn = document.getElementById('resetBtn');

  if (currentStepIndex === 0) {
    backBtn.classList.add('hidden');
    backSpacer.classList.remove('hidden');
    resetBtn.classList.add('hidden');
  } else {
    backBtn.classList.remove('hidden');
    backSpacer.classList.add('hidden');
    resetBtn.classList.remove('hidden');
  }

  // Next Button customization
  const nextBtnText = document.getElementById('nextBtnText');
  const btnIcon = document.getElementById('btnIcon');

  if (currentStepIndex === 0) {
    nextBtnText.textContent = 'Começar';
  } else if (currentStepIndex === 4) {
    nextBtnText.textContent = 'Iniciar candidatura';
  } else if (currentStepIndex === 12) {
    nextBtnText.textContent = 'Enviar';
  } else {
    nextBtnText.textContent = 'Avançar';
  }

  // Update dynamic UMD icons on modification
  if (currentStepIndex === 12) {
    btnIcon.setAttribute('data-lucide', 'send');
  } else {
    btnIcon.setAttribute('data-lucide', 'chevron-right');
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Progress Bar scale
  const percent = Math.round((currentStepIndex / (STEPS_ORDER.length - 1)) * 100);
  document.getElementById('progressBar').style.width = `${percent}%`;

  // Bind step specifics to inputs
  syncFormFieldsWithData();
  toggleNextButtonState();
  persistState();

  // Smooth top window alignment for mobile devices
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Constructs final summary template and opens Whatsapp link
function sendApplicationToWhatsApp() {
  const number = '5593991580195';

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

  // Highlight completed status and trigger Whatsapp window
  document.getElementById('successModal').classList.remove('hidden');
  window.open(waUrl, '_blank');
}

// Binds native events to inputs and buttons
function setupEventListeners() {
  
  // Navigation footer
  document.getElementById('backBtn').addEventListener('click', () => {
    navigateToStep(currentStepIndex - 1);
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (!validateCurrentStep()) return;

    if (currentStepIndex === STEPS_ORDER.length - 1) {
      sendApplicationToWhatsApp();
    } else {
      navigateToStep(currentStepIndex + 1);
    }
  });

  // Reset/Restart button
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Tem certeza de que deseja apagar todas as respostas e recomeçar do zero?')) {
      data = { ...INITIAL_DATA };
      localStorage.removeItem('nanny_application_data');
      localStorage.removeItem('nanny_application_step_index');
      navigateToStep(0);
    }
  });

  // Terms Acceptance check events
  document.getElementById('termsAcceptedVaga').addEventListener('change', (e) => {
    data.termsAcceptedVaga = e.target.checked;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('termsAcceptedResponsabilidades').addEventListener('change', (e) => {
    data.termsAcceptedResponsabilidades = e.target.checked;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('termsAcceptedPontualidade').addEventListener('change', (e) => {
    data.termsAcceptedPontualidade = e.target.checked;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('termsAcceptedConduta').addEventListener('change', (e) => {
    data.termsAcceptedConduta = e.target.checked;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('revisaoConfirmada').addEventListener('change', (e) => {
    data.revisaoConfirmada = e.target.checked;
    toggleNextButtonState();
    persistState();
  });

  // Step 5 inputs
  document.getElementById('nome').addEventListener('input', (e) => {
    data.nome = e.target.value;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('idade').addEventListener('input', (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, '');
    e.target.value = numbersOnly;
    data.idade = numbersOnly;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('bairro').addEventListener('input', (e) => {
    data.bairro = e.target.value;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('possuiFilhosSim').addEventListener('click', () => {
    data.possuiFilhos = 'Sim';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('possuiFilhosNao').addEventListener('click', () => {
    data.possuiFilhos = 'Não';
    data.quantidadeFilhos = '';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.querySelectorAll('.btnQtdFilhos').forEach(btn => {
    btn.addEventListener('click', () => {
      data.quantidadeFilhos = btn.getAttribute('data-count');
      syncFormFieldsWithData();
      toggleNextButtonState();
      persistState();
    });
  });

  // Step 6 Contact input triggers
  document.getElementById('whatsapp').addEventListener('input', (e) => {
    const formatted = formatWhatsappDigits(e.target.value);
    e.target.value = formatted;
    data.whatsapp = formatted;
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('redeSocial').addEventListener('input', (e) => {
    data.redeSocial = e.target.value;
    toggleNextButtonState();
    persistState();
  });

  // Step 7 Experience Professional Inputs
  document.getElementById('workedBabaSim').addEventListener('click', () => {
    data.trabalhouComoBaba = 'Sim';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('workedBabaNao').addEventListener('click', () => {
    data.trabalhouComoBaba = 'Não';
    data.tempoExperiencia = '';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.querySelectorAll('.btnTempoExp').forEach(btn => {
    btn.addEventListener('click', () => {
      data.tempoExperiencia = btn.getAttribute('data-time');
      syncFormFieldsWithData();
      toggleNextButtonState();
      persistState();
    });
  });

  // Step 8 Transport input selectors
  document.getElementById('transportProprioSim').addEventListener('click', () => {
    data.possuiTransporteProprio = 'Sim';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('transportProprioNao').addEventListener('click', () => {
    data.possuiTransporteProprio = 'Não';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.querySelectorAll('.btnTransporte').forEach(btn => {
    btn.addEventListener('click', () => {
      data.transporteUtilizado = btn.getAttribute('data-trans');
      syncFormFieldsWithData();
      toggleNextButtonState();
      persistState();
    });
  });

  // Step 9 Activities
  document.getElementById('dispostaAtividadesSim').addEventListener('click', () => {
    data.dispostaAtividades = 'Sim';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('dispostaAtividadesNao').addEventListener('click', () => {
    data.dispostaAtividades = 'Não';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  // Step 10 Health Conditions
  document.getElementById('healthProblemSim').addEventListener('click', () => {
    data.possuiProblemaSaude = 'Sim';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('healthProblemNao').addEventListener('click', () => {
    data.possuiProblemaSaude = 'Não';
    data.descricaoLimitacao = '';
    syncFormFieldsWithData();
    toggleNextButtonState();
    persistState();
  });

  document.getElementById('limitDescription').addEventListener('input', (e) => {
    data.descricaoLimitacao = e.target.value;
    toggleNextButtonState();
    persistState();
  });

  // Step 11 Pretensão salarial
  document.querySelectorAll('.btnPretensao').forEach(btn => {
    btn.addEventListener('click', () => {
      data.pretensaoSalarial = btn.getAttribute('data-salary');
      syncFormFieldsWithData();
      toggleNextButtonState();
      persistState();
    });
  });

  // Success Modal closing/reopening
  document.getElementById('reopenWaBtn').addEventListener('click', () => {
    sendApplicationToWhatsApp();
  });

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('successModal').classList.add('hidden');
  });
}

// Main initializer
window.addEventListener('load', () => {
  loadSavedState();
  setupEventListeners();
  navigateToStep(currentStepIndex);
});
