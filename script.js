// Inicialização de Ícones
lucide.createIcons();

// --- DADOS MOCKADOS (Estado do App) ---
let agenda = [
    {id:1, nome:'João Silva', hora:'08:00', data:'Hoje', motivo:'Dor de cabeça', status:'aguardando'},
    {id:2, nome:'Maria Souza', hora:'08:30', data:'Hoje', motivo:'Retorno', status:'aguardando'},
    {id:3, nome:'Pedro Paulo', hora:'09:00', data:'Hoje', motivo:'Febre', status:'finalizado'}
];

let solicitacoesServicos = [
    {id: 10, tipo: 'Exame Laboratorial', detalhe: 'Hemograma Completo', status: 'pendente', data: '12/12'}
];

let prontuarios = [
    {id:1, nome:'Maria Oliveira', idade:45, tipo:'O+', alergia:'Penicilina', condicao:'Hipertensão', historico:[{data:'20/11/23', medico:'Dr. Carlos', nota:'Paciente estável'}]},
    {id:2, nome:'João Silva', idade:32, tipo:'A+', alergia:'Nenhuma', condicao:'Cefaleia', historico:[]}
];

let basePacientes = [
    {id:1, nome:'Maria Oliveira', cpf:'123.456.789-00', email:'maria@email.com', convenio:'Unimed', tel:'(11) 9999-9999', status:'Ativo'},
    {id:2, nome:'João Silva', cpf:'987.654.321-11', email:'joao@email.com', convenio:'Particular', tel:'(11) 8888-8888', status:'Ativo'}
];

let unidadesHospitalares = [
    {id: 1, nome: "Hospital Central VidaPlus", tipo: "Hospital Geral", end: "Av. Paulista, 1000", tel: "(11) 3333-0000", status: "Ativo"},
    {id: 2, nome: "Clínica VidaPlus Sul", tipo: "Clínica de Especialidades", end: "Rua das Flores, 200", tel: "(11) 3333-0001", status: "Ativo"}
];

let profissionaisRegistry = [
    {id: 1, nome: "Dr. Carlos Silva", cpf:"111.222.333-44", cargo: "Médico", reg: "CRM 12345", unidade: "Hospital Central VidaPlus", turno: "Manhã", email: "carlos@vidaplus.com", tel: "(11) 9777-1111", status: "Ativo"},
    {id: 2, nome: "Enf. Julia Mendes", cpf:"555.666.777-88", cargo: "Enfermeira", reg: "COREN 9876", unidade: "Clínica VidaPlus Sul", turno: "Tarde", email: "julia@vidaplus.com", tel: "(11) 9777-2222", status: "Ativo"}
];

let estoqueData = [
    {id: 1, item: 'Seringas 5ml', cat: 'Descartáveis', qtd: 150, min: 200},
    {id: 2, item: 'Dipirona 500mg', cat: 'Medicamentos', qtd: 500, min: 100},
    {id: 3, item: 'Luvas Cirúrgicas (M)', cat: 'EPI', qtd: 15, min: 50},
    {id: 4, item: 'Gaze Estéril', cat: 'Curativos', qtd: 300, min: 150},
    {id: 5, item: 'Máscaras N95', cat: 'EPI', qtd: 80, min: 100}
];


// Variáveis de Controle
let pacAtualId = null;
let prontuarioEmEdicaoId = null;
let editingPatientId = null;
let editingProfessionalId = null;
let videoInterval = null;

// --- SISTEMA DE LOGIN ---
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    if(pass !== '123456') { 
        document.getElementById('loginError').style.display='block'; 
        return; 
    }
    
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('app-layout').classList.remove('hidden');
    
    if(email.includes('medico')) {
        configurarAmbienteProfissional('Dr. Carlos Silva', 'Médico', 'medico');
    } else if(email.includes('enf')) {
        // PERFIL ENFERMEIRO
        configurarAmbienteProfissional('Enf. Julia Mendes', 'Enfermeira Chefe', 'enfermeiro');
    } else if(email.includes('admin')) {
        // ... (código admin existente mantido) ...
        document.getElementById('userName').innerText = 'Administrador';
        document.getElementById('userRole').innerText = 'Gestão Hospitalar';
        document.getElementById('view-admin').classList.remove('hidden');
        switchAdminView('dashboard');
        loadNotifications('admin');
        
    } else {
        // ... (código paciente existente mantido) ...
        const usuarioEncontrado = basePacientes.find(u => u.email === email);
        const nomeUsuario = usuarioEncontrado ? usuarioEncontrado.nome : 'Ana Souza'; 
        document.getElementById('userName').innerText = nomeUsuario;
        document.getElementById('userRole').innerText = 'Paciente';
        switchPacienteView('inicio'); 
        document.getElementById('view-paciente').classList.remove('hidden');
        loadNotifications('paciente');
    }
});

// FUNÇÃO HELPER PARA CONFIGURAR UI DE PROFISSIONAIS
function configurarAmbienteProfissional(nome, cargo, tipo) {
    document.getElementById('userName').innerText = nome;
    document.getElementById('userRole').innerText = cargo;
    
    // Mostra a view genérica de médico/profissional
    document.getElementById('view-medico').classList.remove('hidden');
    
    // Customizações baseadas no tipo
    if(tipo === 'enfermeiro') {
        // Altera itens da sidebar
        document.getElementById('btn-agenda').innerHTML = '<i data-lucide="clipboard-list"></i> Triagem';
        
        // Altera Dashboard
        document.querySelector('#content-painel h2').innerText = "Painel de Enfermagem";
        
        // Esconde cards de financeiro/kpis médicos e mostra de enfermagem (Simulação via DOM)
        const kpis = document.querySelectorAll('.doc-card p');
        if(kpis[0]) kpis[0].innerText = "Triagens Pendentes";
        if(kpis[1]) kpis[1].innerText = "Medicação / Hora";
        
        // Carrega notificações específicas
        loadNotifications('medico');
    } else {
        // Reseta para Médico
        document.getElementById('btn-agenda').innerHTML = '<i data-lucide="calendar"></i> Agenda';
        document.querySelector('#content-painel h2').innerText = "Visão Geral do Dia";
        const kpis = document.querySelectorAll('.doc-card p');
        if(kpis[0]) kpis[0].innerText = "Total Pacientes";
        if(kpis[1]) kpis[1].innerText = "Aguardando";
        loadNotifications('medico');
    }
    
    switchMedicoView('painel');
}

// --- FUNCIONALIDADES DO PACIENTE (MODAIS) ---

function abrirCarteirinha() {
    // Pega o nome atual exibido no cabeçalho
    const nomeAtual = document.getElementById('userName').innerText;
    document.getElementById('card-nome-titular').innerText = nomeAtual.toUpperCase();
    openModal('modal-carteirinha');
}

function abrirReceitas() {
    openModal('modal-receitas');
}

function abrirExames() {
    openModal('modal-exames');
}

// --- LÓGICA DE CADASTRO (SIGN UP) ---

function prepararCadastroPaciente() {
    // Limpa os campos de texto
    ['reg-nome', 'reg-cpf', 'reg-tel', 'reg-email', 'reg-senha'].forEach(id => document.getElementById(id).value = '');
    
    // Reseta o checkbox LGPD e bloqueia o botão
    const chk = document.getElementById('reg-lgpd');
    if(chk) {
        chk.checked = false;
        toggleBotaoCadastro(); // Chama a função para aplicar o estilo visual de bloqueio
    }
    
    openModal('modal-cadastro-paciente');
}

function registrarPaciente() {
    const nome = document.getElementById('reg-nome').value;
    const cpf = document.getElementById('reg-cpf').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;
    const tel = document.getElementById('reg-tel').value;

    if (!nome || !email || !senha) {
        alert("Por favor, preencha pelo menos Nome, Email e Senha.");
        return;
    }

    // Adiciona ao "banco de dados" simulado
    basePacientes.push({
        id: Date.now(),
        nome: nome,
        cpf: cpf || '000.000.000-00',
        email: email,
        convenio: 'Particular', // Padrão
        tel: tel,
        status: 'Ativo'
    });

    // Feedback visual
    closeModal('modal-cadastro-paciente');
    
    // Preenche o formulário de login automaticamente para facilitar
    document.getElementById('email').value = email;
    document.getElementById('password').value = '123456'; // No mock, a validação exige 123456, avisamos o usuário
    
    alert(`Cadastro realizado com sucesso, ${nome}!\n\nNota da Simulação: Para este protótipo, a senha de login padrão continua sendo '123456'.`);
}

function logout() { location.reload(); }

// --- NOTIFICAÇÕES ---
function toggleNotificacoes() {
    const drop = document.getElementById('notif-dropdown');
    drop.classList.toggle('hidden');
    if(!drop.classList.contains('hidden')) document.getElementById('notif-badge').classList.add('hidden');
}

function loadNotifications(role) {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    list.innerHTML = '';
    let items = [];
    if(role === 'medico') items = [{text:'Exames de Maria Oliveira prontos', time:'10 min atrás', unread:true}];
    else if(role === 'admin') items = [{text:'Backup realizado', time:'3h atrás', unread:true}];
    else items = [{text:'Consulta confirmada', time:'Agora', unread:true}];

    items.forEach(i => {
        let cls = i.unread ? 'unread' : '';
        list.innerHTML += `<li class="notif-item ${cls}"><div>${i.text}<span class="notif-time">${i.time}</span></div></li>`;
    });
    if(items.some(i=>i.unread)) badge.classList.remove('hidden');
}

// --- VIEW SWITCHERS (NAVEGAÇÃO) ---
function switchMedicoView(view) {
    const cargo = document.getElementById('userRole').innerText;

    // LÓGICA DE REDIRECIONAMENTO: 
    if(view === 'agenda' && cargo.includes('Enfermeir')) {
        view = 'triagem';
    }

    document.querySelectorAll('#view-medico .sidebar-item').forEach(el => el.classList.remove('active'));

    const btnId = (view === 'triagem') ? 'btn-agenda' : 'btn-' + view;
    if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('active');

    document.querySelectorAll('.medico-content > div').forEach(div => div.classList.add('hidden'));
    
    const targetDiv = document.getElementById('content-' + view);
    if(targetDiv) targetDiv.classList.remove('hidden');

    if(view === 'triagem') renderTriagem();
    if(view === 'agenda') renderAgenda('dia');
    if(view === 'prontuarios') renderProntuarios();
    if(view === 'pacientes') renderPacientes();
    
    setTimeout(() => lucide.createIcons(), 50);
}

//Renderizar Lista de Triagem (Para Enfermeiros)
function renderTriagem() {
    const tbody = document.getElementById('lista-triagem');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    // Filtra pacientes que precisam de triagem (status 'aguardando')
    let dados = agenda.filter(p => p.status === 'aguardando'); 

    if(dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Nenhum paciente na fila de triagem.</td></tr>';
        return;
    }

    dados.forEach(p => {
        // Simula prioridade (par = Alta, ímpar = Normal)
        const prioridade = p.id % 2 === 0 ? 
            '<span class="badge badge-alert">Alta</span>' : 
            '<span class="badge badge-info">Normal</span>';
        
        tbody.innerHTML += `
            <tr>
                <td>${p.hora}</td>
                <td><strong>${p.nome}</strong></td>
                <td>${p.motivo}</td>
                <td>${prioridade}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="atender(${p.id})">
                        <i data-lucide="clipboard-list"></i> Classificar
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

function switchAdminView(view) {
    document.querySelectorAll('#view-admin .sidebar-item').forEach(el => el.classList.remove('active'));
    
    const btnId = 'btn-admin-' + (view === 'dashboard' ? 'dash' : view);
    if(document.getElementById(btnId)) {
        document.getElementById(btnId).classList.add('active');
    }
    
    document.querySelectorAll('#view-admin .content-area > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('admin-content-'+view).classList.remove('hidden');
    
    if(view === 'dashboard') renderAdminDashboard();
    if(view === 'users') renderAdminUsers();
    if(view === 'pacientes') renderAdminPacientes();
    if(view === 'unidades') renderUnidadesTable();
    if(view === 'estoque') renderEstoque();
    
    
    setTimeout(() => lucide.createIcons(), 50);
}

// --- FUNÇÕES DE LÓGICA DO PACIENTE (AGENDAMENTO E FILTRO) ---



function filtrarHistorico(categoria, btn) {
    // 1. Atualiza visual dos botões
    const containerBotoes = btn.parentElement;
    containerBotoes.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Filtra as linhas da timeline
    const itens = document.querySelectorAll('.timeline-row');
    
    itens.forEach(item => {
        const itemCategoria = item.getAttribute('data-categoria');
        
        // Efeito de fade para transição suave
        item.style.opacity = '0';
        
        setTimeout(() => {
            if (categoria === 'tudo' || itemCategoria === categoria) {
                item.style.display = 'flex';
                setTimeout(() => item.style.opacity = '1', 50);
            } else {
                item.style.display = 'none';
            }
        }, 200); // Pequeno delay para a animação
    });
}

// --- LÓGICA DE UI DE AGENDAMENTO ---
function selectSpec(el) {
    document.querySelectorAll('.spec-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function selectSlot(el) {
    if(el.classList.contains('disabled')) return;
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
}

function salvarAgendamentoPaciente() {
    // 1. Coleta os dados
    const especialidadeEl = document.querySelector('.spec-card.selected');
    const horarioEl = document.querySelector('.slot-btn.selected');
    const dataInput = document.querySelector('#paciente-content-agendar input[type="date"]');
    
    // NOVO: Captura o checkbox de telemedicina
    const isTele = document.getElementById('check-tele-paciente').checked;

    // 2. Validação
    if (!especialidadeEl) { alert('Por favor, selecione uma Especialidade.'); return; }
    if (!dataInput || !dataInput.value) { alert('Por favor, selecione uma Data.'); return; }
    if (!horarioEl) { alert('Por favor, selecione um Horário.'); return; }

    // 3. Processamento
    const especialidade = especialidadeEl.innerText.trim();
    const horario = horarioEl.innerText.trim();
    const data = dataInput.value.split('-').reverse().join('/'); 

    // 4. Salvar na Agenda Mockada (Com a flag de TIPO)
    agenda.push({
        id: Date.now(),
        nome: document.getElementById('userName').innerText, 
        hora: horario,
        data: data,
        motivo: especialidade,
        status: 'aguardando',
        tipo: isTele ? 'tele' : 'presencial'
    });

    alert(`✅ Agendamento Confirmado!\nModo: ${isTele ? 'Online (Vídeo)' : 'Presencial'}\nData: ${data} às ${horario}`);
    
    // 5. Retorna e Renderiza
    switchPacienteView('inicio');
    // Força limpeza do checkbox para a próxima
    document.getElementById('check-tele-paciente').checked = false; 
}

function switchPacienteView(view) {
    // 1. Menu Lateral
    document.querySelectorAll('#view-paciente .sidebar-item').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-paciente-'+view).classList.add('active');
    
    // 2. Ocultar TUDO
    ['paciente-content-inicio', 'paciente-content-agendar', 'paciente-content-historico'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('hidden');
            el.classList.remove('fade-in-up');
        }
    });
    
    // 3. Mostrar e Animar a tela alvo
    const target = document.getElementById('paciente-content-'+view);
    if (target) {
        target.classList.remove('hidden');
        void target.offsetWidth; 
        target.classList.add('fade-in-up');
    }
    
    // 4. Lógica específica da Home
    if(view === 'inicio') {
        const nomeAtual = document.getElementById('userName').innerText;
        const heroTitle = document.getElementById('paciente-welcome');
        if(heroTitle) heroTitle.innerText = `Olá, ${nomeAtual.split(' ')[0]}.`;

        renderizarDashboardPaciente();
    }

    setTimeout(() => lucide.createIcons(), 50);
}

// --- LÓGICA DO MÉDICO ---
function renderAgenda(filtro) {
    const tbody = document.getElementById('lista-pacientes');
    tbody.innerHTML = '';
    
    let dados = [];

    // Lógica de filtragem simulada
    if (filtro === 'dia') {
        document.getElementById('agenda-periodo-texto').innerText = 'Hoje';
        dados = agenda.filter(p => p.data === 'Hoje');
    } else if (filtro === 'semana') {
        document.getElementById('agenda-periodo-texto').innerText = 'Esta Semana';
        dados = [...agenda];
        dados.push({id:101, nome:'Ana Clara', hora:'10:00', data:'Amanhã', motivo:'Exames', status:'aguardando'});
        dados.push({id:102, nome:'Roberto G.', hora:'14:00', data:'Quinta', motivo:'Consulta', status:'aguardando'});
    } else if (filtro === 'mes') {
        document.getElementById('agenda-periodo-texto').innerText = 'Este Mês';
        dados = [...agenda];
        dados.push({id:101, nome:'Ana Clara', hora:'10:00', data:'Amanhã', motivo:'Exames', status:'aguardando'});
        dados.push({id:102, nome:'Roberto G.', hora:'14:00', data:'28/11', motivo:'Consulta', status:'aguardando'});
        dados.push({id:103, nome:'Fernanda L.', hora:'09:30', data:'05/12', motivo:'Retorno', status:'aguardando'});
        dados.push({id:104, nome:'Paulo M.', hora:'16:00', data:'12/12', motivo:'Check-up', status:'aguardando'});
    }

    dados.forEach(p => {
        let badge = p.status==='aguardando' ? 'badge-aguardando' : 'badge-finalizado';
        let btn = p.status==='aguardando' ? `<button class="btn btn-primary btn-sm" onclick="atender(${p.id})">Atender</button>` : `<button class="btn btn-secondary btn-sm" disabled>Feito</button>`;
        let dataDisplay = p.data === 'Hoje' ? p.hora : `${p.data} - ${p.hora}`;
        tbody.innerHTML += `<tr><td>${dataDisplay}</td><td>${p.nome}</td><td>${p.motivo}</td><td><span class="badge ${badge}">${p.status}</span></td><td>${btn}</td></tr>`;
    });
}
function filtrarAgenda(f, b) { document.querySelectorAll('.agenda-controls .btn').forEach(btn => btn.classList.remove('active')); b.classList.add('active'); renderAgenda(f); }


// --- LOGICA DE PRESCRIÇÃO ESTRUTURADA ---
let prescricaoAtual = [];

function atender(id) {
    pacAtualId = id;
    prescricaoAtual = []; 
    renderizarPrescricaoAtual(); 

    let p = agenda.find(x => x.id === id);
    if(!p) p = {nome: 'Paciente Simulado'}; 
    
    document.getElementById('md-nome').innerText = p.nome;
    
    // Carrega dados do prontuário
    let pront = prontuarios.find(x => x.nome === p.nome);
    if(pront) {
        document.getElementById('atend-idade').value = pront.idade;
        document.getElementById('atend-alergia').value = pront.alergia;
    } else {
        document.getElementById('atend-idade').value = '';
        document.getElementById('atend-alergia').value = '';
    }
    
    // Limpa campos comuns
    document.getElementById('atend-evolucao').value = '';
    
    // --- LÓGICA DE PERFIL (Enfermeiro vs Médico) ---
    const cargo = document.getElementById('userRole').innerText;
    const isEnfermeiro = cargo.includes('Enfermeir');

    if (isEnfermeiro) {
        // Modo Triagem: Mostra Sinais Vitais, Esconde Prescrição
        document.getElementById('sec-triagem').classList.remove('hidden');
        document.getElementById('sec-prescricao').classList.add('hidden');
        
        // Limpa campos de triagem
        ['tri-pa', 'tri-temp', 'tri-bpm', 'tri-sat'].forEach(id => document.getElementById(id).value = '');
        
        // Ajusta texto do título do modal (opcional, visualmente agradável)
        document.querySelector('#modal-atendimento h3').innerText = "Triagem & Classificação";
    } else {
        // Modo Consulta: Esconde Sinais Vitais, Mostra Prescrição
        document.getElementById('sec-triagem').classList.add('hidden');
        document.getElementById('sec-prescricao').classList.remove('hidden');
        
        // Limpa campos de prescrição
        ['presc-med', 'presc-dose', 'presc-freq'].forEach(id => document.getElementById(id).value = '');
        
        document.querySelector('#modal-atendimento h3').innerText = "Atendimento Médico";
    }
    
    openModal('modal-atendimento');
}

function adicionarItemPrescricao() {
    const med = document.getElementById('presc-med').value;
    const dose = document.getElementById('presc-dose').value;
    const freq = document.getElementById('presc-freq').value;

    if(med && dose) {
        prescricaoAtual.push({med, dose, freq});
        renderizarPrescricaoAtual();
        // Limpa inputs para o próximo
        ['presc-med', 'presc-dose', 'presc-freq'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('presc-med').focus();
    } else {
        alert('Preencha pelo menos Medicamento e Dosagem.');
    }
}

function renderizarPrescricaoAtual() {
    const lista = document.getElementById('lista-prescricao-visual');
    lista.innerHTML = '';
    
    if(prescricaoAtual.length === 0) {
        lista.innerHTML = '<li style="color:#999; text-align:center; padding:10px;">Nenhum medicamento adicionado.</li>';
        return;
    }

    prescricaoAtual.forEach((item, index) => {
        lista.innerHTML += `
            <li style="padding:5px 0; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                <span><strong>${item.med}</strong> ${item.dose} - <small>${item.freq}</small></span>
                <button onclick="removerItemPrescricao(${index})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
            </li>
        `;
    });
}

function removerItemPrescricao(index) {
    prescricaoAtual.splice(index, 1);
    renderizarPrescricaoAtual();
}

function gerarPDFSimulado() {
    if(prescricaoAtual.length === 0) {
        alert('Adicione medicamentos antes de gerar a receita.');
        return;
    }
    const nomePac = document.getElementById('md-nome').innerText;
    alert(`🖨️ GERANDO PDF ASSINADO DIGITALMENTE...\n\nPACIENTE: ${nomePac}\nITENS: ${prescricaoAtual.length}\nASSINATURA: Token #A8F9-2201 (Válido)`);
}

function finalizarAtendimento() {
    let pAgenda = agenda.find(x => x.id === pacAtualId);
    
    // Verifica cargo para definir lógica
    const cargo = document.getElementById('userRole').innerText;
    const isEnfermeiro = cargo.includes('Enfermeir');

    // Atualiza status na agenda
    if(pAgenda) {
        // Se for enfermeiro, muda para 'aguardando' (pronto para o médico) mas com nota de triagem
        // Se for médico, muda para 'finalizado'
        pAgenda.status = isEnfermeiro ? 'aguardando' : 'finalizado';
    }
    
    const nome = document.getElementById('md-nome').innerText;
    let pront = prontuarios.find(x => x.nome === nome);
    
    if(!pront) {
        pront = {id:Date.now(), nome, idade:document.getElementById('atend-idade').value, alergia:document.getElementById('atend-alergia').value, condicao:'Em análise', historico:[]};
        prontuarios.push(pront);
    }
    
    const evolucao = document.getElementById('atend-evolucao').value;
    let notaFinal = evolucao;
    
    if (isEnfermeiro) {
        // Adiciona dados da triagem na nota
        const pa = document.getElementById('tri-pa').value;
        const temp = document.getElementById('tri-temp').value;
        const bpm = document.getElementById('tri-bpm').value;
        notaFinal = `[TRIAGEM] PA: ${pa} | Temp: ${temp}°C | BPM: ${bpm} | Obs: ${evolucao}`;
    } else {
        // Adiciona prescrição na nota (Lógica do Médico)
        if(prescricaoAtual.length > 0) {
            const receitaTexto = prescricaoAtual.map(i => `${i.med} ${i.dose} (${i.freq})`).join(', ');
            notaFinal += ` | [Receita Digital: ${receitaTexto}]`;
        }
    }

    // Salva no histórico
    pront.historico.unshift({
        data: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0,5), 
        medico: document.getElementById('userName').innerText, 
        nota: notaFinal
    });
    
    // Atualiza a visualização correta
    if(isEnfermeiro) {
        renderTriagem();
        alert('Triagem realizada! Paciente pronto para o médico.');
    } else {
        renderAgenda('dia'); 
        alert('Atendimento médico finalizado!');
    }
    
    closeModal('modal-atendimento');
}


function renderProntuarios() {
    const tbody = document.getElementById('lista-prontuarios');
    tbody.innerHTML = '';
    prontuarios.forEach(p => {
        let last = p.historico.length > 0 ? p.historico[0].data : '-';
        tbody.innerHTML += `<tr><td><strong>${p.nome}</strong><br><small>${p.idade} anos</small></td><td>${p.condicao}</td><td>${last}</td><td><span class="badge badge-ativo">Ativo</span></td><td><button class="btn btn-sm btn-outline" onclick="verProntuario(${p.id})">Ver</button></td></tr>`;
    });
}

function verProntuario(id) {
    const p = prontuarios.find(x => x.id === id);
    if(p) {
        document.getElementById('pront-nome').innerText = p.nome;
        document.getElementById('pront-info').innerText = `Idade: ${p.idade} | Tipo: ${p.tipo} | Alergias: ${p.alergia}`;
        const histDiv = document.getElementById('pront-historico');
        histDiv.innerHTML = '';
        if(p.historico.length === 0) histDiv.innerHTML = '<p>Sem histórico.</p>';
        else {
            p.historico.forEach(h => {
                histDiv.innerHTML += `<div class="timeline-item"><div class="timeline-date">${h.data} - ${h.medico}</div><p>${h.nota}</p></div>`;
            });
        }
        const btnEdit = document.getElementById('btn-editar-prontuario');
        btnEdit.onclick = function() { abrirEditorProntuario(id); };
        openModal('modal-prontuario-detalhes');
    }
}

function abrirEditorProntuario(id) {
    const p = prontuarios.find(x => x.id === id);
    if(p) {
        closeModal('modal-prontuario-detalhes');
        prontuarioEmEdicaoId = id;
        document.getElementById('edit-pront-id').value = id;
        document.getElementById('edit-pront-nome').value = p.nome;
        document.getElementById('edit-pront-idade').value = p.idade;
        document.getElementById('edit-pront-tipo').value = p.tipo;
        document.getElementById('edit-pront-alergia').value = p.alergia;
        document.getElementById('edit-pront-condicao').value = p.condicao;
        openModal('modal-editar-prontuario');
    }
}

function salvarEdicaoProntuario() {
    const id = parseInt(document.getElementById('edit-pront-id').value);
    const p = prontuarios.find(x => x.id === id);
    if(p) {
        p.idade = document.getElementById('edit-pront-idade').value;
        p.tipo = document.getElementById('edit-pront-tipo').value;
        p.alergia = document.getElementById('edit-pront-alergia').value;
        p.condicao = document.getElementById('edit-pront-condicao').value;
        renderProntuarios();
        closeModal('modal-editar-prontuario');
        verProntuario(id);
    }
}

function renderPacientes() {
    const tbody = document.getElementById('lista-pacientes-base');
    tbody.innerHTML = '';
    basePacientes.forEach(p => {
        tbody.innerHTML += `<tr><td><strong>${p.nome}</strong></td><td>${p.cpf}</td><td>${p.email}</td><td>${p.convenio}</td><td><button class="btn btn-sm btn-outline" onclick="editarPaciente(${p.id})"><i data-lucide="edit"></i></button></td></tr>`;
    });
    lucide.createIcons();
}

// --- LÓGICA DO PROFISSIONAL ---
function populateUnitSelect() {
    const select = document.getElementById('pro-unidade');
    select.innerHTML = '';
    unidadesHospitalares.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.nome; opt.innerText = u.nome;
        select.appendChild(opt);
    });
}

function prepararNovoCadastroProfissional() {
    editingProfessionalId = null;
    document.getElementById('modal-titulo-profissional').innerText = "Novo Profissional";
    ['pro-nome','pro-cpf','pro-reg','pro-tel','pro-email'].forEach(id => document.getElementById(id).value = '');
    populateUnitSelect();
    openModal('modal-novo-profissional');
}

function editarProfissional(id) {
    const p = profissionaisRegistry.find(x => x.id === id);
    if(!p) return;
    editingProfessionalId = id;
    document.getElementById('modal-titulo-profissional').innerText = "Editar Profissional";
    document.getElementById('pro-nome').value = p.nome;
    document.getElementById('pro-cpf').value = p.cpf || '';
    document.getElementById('pro-cargo').value = p.cargo;
    document.getElementById('pro-reg').value = p.reg;
    populateUnitSelect();
    document.getElementById('pro-unidade').value = p.unidade;
    document.getElementById('pro-turno').value = p.turno;
    document.getElementById('pro-tel').value = p.tel;
    document.getElementById('pro-email').value = p.email || '';
    openModal('modal-novo-profissional');
}

function salvarProfissional() {
    const nome = document.getElementById('pro-nome').value;
    const dados = {
        nome, cpf: document.getElementById('pro-cpf').value,
        cargo: document.getElementById('pro-cargo').value,
        reg: document.getElementById('pro-reg').value,
        unidade: document.getElementById('pro-unidade').value,
        turno: document.getElementById('pro-turno').value,
        tel: document.getElementById('pro-tel').value,
        email: document.getElementById('pro-email').value,
        status: 'Ativo'
    };
    if(nome) {
        if(editingProfessionalId) {
            const idx = profissionaisRegistry.findIndex(x => x.id === editingProfessionalId);
            if(idx !== -1) profissionaisRegistry[idx] = { ...profissionaisRegistry[idx], ...dados };
        } else {
            profissionaisRegistry.push({ id: Date.now(), ...dados });
        }
        renderAdminUsers();
        closeModal('modal-novo-profissional');
        alert('Profissional salvo!');
    }
}

// --- LÓGICA DO PACIENTE (CRUD) ---
function prepararNovoCadastro() {
    editingPatientId = null;
    document.getElementById('modal-titulo-paciente').innerText = "Cadastro Paciente";
    document.getElementById('cad-nome').value = '';
    openModal('modal-novo-paciente');
}

function editarPaciente(id) {
    const p = basePacientes.find(x => x.id === id);
    if(!p) return;
    editingPatientId = id;
    document.getElementById('modal-titulo-paciente').innerText = "Editar Paciente";
    document.getElementById('cad-nome').value = p.nome;
    document.getElementById('cad-cpf').value = p.cpf;
    document.getElementById('cad-email').value = p.email;
    document.getElementById('cad-convenio').value = p.convenio;
    openModal('modal-novo-paciente');
}

function salvarPaciente() {
    const nome = document.getElementById('cad-nome').value;
    if(nome) {
        if(editingPatientId) {
            const idx = basePacientes.findIndex(x => x.id === editingPatientId);
            if(idx!==-1) basePacientes[idx] = {...basePacientes[idx], nome, cpf:document.getElementById('cad-cpf').value, email:document.getElementById('cad-email').value, convenio:document.getElementById('cad-convenio').value};
        } else {
            basePacientes.push({id:Date.now(), nome, cpf:document.getElementById('cad-cpf').value, email:document.getElementById('cad-email').value, convenio:document.getElementById('cad-convenio').value || 'Particular', status: 'Ativo'});
        }
        renderPacientes();
        if(document.getElementById('lista-admin-pacientes')) renderAdminPacientes();
        closeModal('modal-novo-paciente');
    }
}

// --- LÓGICA DO ADMIN ---

function renderAdminDashboard() {
    const list = document.getElementById('admin-audit-list');
    list.innerHTML = '';

    // Dados Mockados de Auditoria
    const logs = [
        {icon: 'shield-alert', color: '#dc3545', title: 'Tentativa de Acesso Negado', desc: 'IP 192.168.1.55 tentou acessar Prontuário #8821', time: '10 min atrás'},
        {icon: 'user-plus', color: '#28a745', title: 'Novo Paciente Cadastrado', desc: 'Recepcionista Julia cadastrou Lucas Martins', time: '35 min atrás'},
        {icon: 'file-edit', color: '#ffc107', title: 'Prontuário Editado', desc: 'Dr. Carlos Silva atualizou histórico de Maria Oliveira', time: '1h atrás'},
        {icon: 'package', color: '#17a2b8', title: 'Alerta de Estoque', desc: 'Luvas Cirúrgicas atingiram nível crítico', time: '2h atrás'}
    ];

    logs.forEach(log => {
        list.innerHTML += `
            <li class="activity-item">
                <div class="act-icon" style="color:${log.color}"><i data-lucide="${log.icon}" size="16"></i></div>
                <div class="act-content">
                    <h4>${log.title}</h4>
                    <p>${log.desc}</p>
                </div>
                <div class="act-time">${log.time}</div>
            </li>
        `;
    });
    lucide.createIcons();
}

function renderEstoque() {
    const tbody = document.getElementById('lista-estoque');
    tbody.innerHTML = '';
    
    estoqueData.forEach(item => {
        // Lógica visual: Se qtd < min, status é Crítico (Vermelho)
        const isCritico = item.qtd < item.min;
        const statusLabel = isCritico ? 'Crítico' : 'Ok';
        const badgeClass = isCritico ? 'badge-alert' : 'badge-ativo'; // badge-alert (vermelho) já existe no seu CSS
        const qtdStyle = isCritico ? 'color:var(--danger); font-weight:bold;' : '';

        tbody.innerHTML += `
            <tr>
                <td><strong>${item.item}</strong></td>
                <td>${item.cat}</td>
                <td style="${qtdStyle}">${item.qtd} un</td>
                <td style="color:#888; font-size:0.9rem;">Mín: ${item.min}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="reporEstoque(${item.id})" title="Adicionar +50 unidades">
                        <i data-lucide="plus-circle"></i> Repor
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

function reporEstoque(id) {
    const item = estoqueData.find(i => i.id === id);
    if(item) {
        // Simula a chegada de um lote padrão (+50 unidades)
        item.qtd += 50;
        
        // Efeito visual simples (opcional) e re-renderização
        renderEstoque();
        
        // Feedback simples
        // Se a quantidade nova superou o mínimo e estava crítico antes, o usuário verá o badge mudar para verde instantaneamente.
    }
}

function renderAdminUsers() {
    const tbody = document.getElementById('lista-profissionais');
    tbody.innerHTML = '';
    profissionaisRegistry.forEach(p => {
        tbody.innerHTML += `<tr><td><strong>${p.nome}</strong></td><td>${p.cargo}</td><td>${p.reg}</td><td>${p.unidade}</td><td>${p.tel}</td><td><span class="badge badge-ativo">Ativo</span></td><td><button class="btn btn-sm btn-outline" onclick="editarProfissional(${p.id})"><i data-lucide="edit"></i></button></td></tr>`;
    });
    lucide.createIcons();
}

function renderAdminPacientes() {
    const tbody = document.getElementById('lista-admin-pacientes');
    tbody.innerHTML = '';
    basePacientes.forEach(p => {
        tbody.innerHTML += `<tr><td><strong>${p.nome}</strong><br><small>${p.cpf}</small></td><td>${p.tel || '-'}</td><td>${p.convenio}</td><td><span class="badge badge-ativo">${p.status}</span></td><td><button class="btn btn-sm btn-outline" onclick="editarPaciente(${p.id})"><i data-lucide="edit"></i></button></td></tr>`;
    });
    lucide.createIcons();
}
function renderUnidadesTable() {
    const tbody = document.getElementById('lista-unidades');
    tbody.innerHTML = '';
    unidadesHospitalares.forEach(u => {
        tbody.innerHTML += `<tr><td><strong>${u.nome}</strong></td><td>${u.tipo}</td><td>${u.end}</td><td>${u.tel}</td><td><span class="badge badge-ativo">${u.status}</span></td></tr>`;
    });
}
function salvarNovaUnidade() {
    const nome = document.getElementById('uni-nome').value;
    if(nome) {
        unidadesHospitalares.push({id:Date.now(), nome, tipo:document.getElementById('uni-tipo').value, end:document.getElementById('uni-end').value, tel:document.getElementById('uni-tel').value, status:'Ativo'});
        renderUnidadesTable();
        closeModal('modal-nova-unidade');
    }
}
function exportarRelatorioGlobal() { 
    const btn = event.target.closest('button');
    const original = btn.innerHTML;
    btn.innerHTML = 'Gerando...';
    setTimeout(() => { alert('Relatório PDF exportado!'); btn.innerHTML = original; }, 1000); 
}
function filtrarRelatorios(val) {
    // 1. Simula carregamento
    const fields = ['bi-receita', 'bi-despesa', 'bi-lucro', 'bi-ticket'];
    fields.forEach(f => document.getElementById(f).style.opacity = '0.5');

    setTimeout(() => {
        // 2. Define novos valores baseados na seleção
        if (val === '7') {
            document.getElementById('bi-receita').innerText = 'R$ 98.500';
            document.getElementById('bi-despesa').innerText = '-R$ 65.200';
            document.getElementById('bi-lucro').innerText = 'R$ 33.300';
            document.getElementById('bi-ticket').innerText = 'R$ 345,00';
        } else if (val === '90') {
            document.getElementById('bi-receita').innerText = 'R$ 1.250.000';
            document.getElementById('bi-despesa').innerText = '-R$ 980.000';
            document.getElementById('bi-lucro').innerText = 'R$ 270.000';
            document.getElementById('bi-ticket').innerText = 'R$ 360,00';
        } else {
            // Padrão 30 dias
            document.getElementById('bi-receita').innerText = 'R$ 452.000';
            document.getElementById('bi-despesa').innerText = '-R$ 320.000';
            document.getElementById('bi-lucro').innerText = 'R$ 132.000';
            document.getElementById('bi-ticket').innerText = 'R$ 350,00';
        }
        
        // 3. Restaura opacidade
        fields.forEach(f => document.getElementById(f).style.opacity = '1');
        
        // 4. Anima as barras do gráfico (efeito visual)
        document.querySelectorAll('.s-bar').forEach(b => {
            const originalHeight = b.style.height;
            b.style.height = '0%';
            setTimeout(() => b.style.height = originalHeight, 100);
        });
        
    }, 300); // Pequeno delay artificial
}
function filtrarProntuarios() { const t=document.getElementById('search-prontuario').value.toLowerCase(); document.querySelectorAll('#lista-prontuarios tr').forEach(r=>{r.style.display=r.innerText.toLowerCase().includes(t)?'':'none'}); }
function filtrarPacientes() { const t=document.getElementById('search-pacientes').value.toLowerCase(); document.querySelectorAll('#lista-pacientes-base tr').forEach(r=>{r.style.display=r.innerText.toLowerCase().includes(t)?'':'none'}); }
function filtrarAdminPacientes() { const t=document.getElementById('search-admin-pacientes').value.toLowerCase(); document.querySelectorAll('#lista-admin-pacientes tr').forEach(r=>{r.style.display=r.innerText.toLowerCase().includes(t)?'':'none'}); }

// --- LÓGICA DO PACIENTE (VIEW) - TELEMEDICINA MELHORADA ---
let callTimerInterval = null;
let callSeconds = 0;

function iniciarSimulacaoVideo() {
    document.getElementById('video-call-interface').classList.remove('hidden');
    
    // Resetar estado visual
    document.getElementById('call-status-text').innerText = 'Conectando...';
    document.querySelector('.status-dot').classList.remove('connected');
    document.getElementById('doctor-talking').classList.add('hidden');
    document.getElementById('chat-messages').innerHTML = '<div class="chat-msg system">Conectando ao servidor seguro...</div>';
    
    // Simular conexão após 2 segundos
    setTimeout(() => {
        document.getElementById('call-status-text').innerText = 'Em consulta';
        document.querySelector('.status-dot').classList.add('connected');
        document.getElementById('chat-messages').innerHTML += '<div class="chat-msg system">Dr. Carlos entrou na sala.</div>';
        
        // Simular áudio do médico falando
        document.getElementById('doctor-talking').classList.remove('hidden');
        
        iniciarCronometro();
    }, 2000);
}

function encerrarVideo() {
    clearInterval(callTimerInterval);
    callSeconds = 0;
    document.getElementById('call-timer').innerText = "00:00";
    document.getElementById('video-call-interface').classList.add('hidden');
    document.getElementById('video-chat-panel').classList.add('hidden');
}

function iniciarCronometro() {
    clearInterval(callTimerInterval);
    callSeconds = 0;
    callTimerInterval = setInterval(() => {
        callSeconds++;
        const mins = Math.floor(callSeconds / 60).toString().padStart(2, '0');
        const secs = (callSeconds % 60).toString().padStart(2, '0');
        document.getElementById('call-timer').innerText = `${mins}:${secs}`;
    }, 1000);
}

// Controles da Chamada
function toggleMute(btn) {
    btn.classList.toggle('active-red');
    const isMuted = btn.classList.contains('active-red');
    const icon = btn.querySelector('i'); // Para lucide icons pode precisar de re-render
    // Simulação visual apenas
    if(isMuted) {
        // Logica de ícone cortado (opcional)
        btn.style.background = '#ea4335';
    } else {
        btn.style.background = '#3c4043';
    }
}

function toggleCam(btn) {
    btn.classList.toggle('active-red');
    const isOff = btn.classList.contains('active-red');
    const selfPreview = document.querySelector('.video-self-preview');
    
    if(isOff) {
        btn.style.background = '#ea4335';
        selfPreview.style.background = '#000';
        selfPreview.innerHTML = '<i data-lucide="video-off" style="color:white"></i>';
    } else {
        btn.style.background = '#3c4043';
        selfPreview.style.background = '#333';
        selfPreview.innerHTML = '<div class="self-avatar">Você</div>';
    }
    lucide.createIcons();
}

function toggleChat() {
    const panel = document.getElementById('video-chat-panel');
    panel.classList.toggle('hidden');
    document.getElementById('chat-badge').classList.add('hidden');
}

// Chat
function handleChatKey(e) {
    if(e.key === 'Enter') enviarMensagemChat();
}

function enviarMensagemChat() {
    const input = document.getElementById('chat-input');
    const text = input.value;
    if(!text) return;

    const chatBody = document.getElementById('chat-messages');
    chatBody.innerHTML += `<div class="chat-msg me">${text}</div>`;
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Resposta automática simulada do médico
    setTimeout(() => {
        chatBody.innerHTML += `<div class="chat-msg doc">Ok, entendi. Pode me mostrar onde dói?</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Se chat estiver fechado, mostrar notificação
        if(document.getElementById('video-chat-panel').classList.contains('hidden')) {
            document.getElementById('chat-badge').classList.remove('hidden');
        }
    }, 1500);
}

// Ao final do seu arquivo, chame isso para recriar ícones dinâmicos se necessário
// lucide.createIcons();

// --- UTILITÁRIOS DE MODAL ---
function openModal(id) { document.getElementById(id).classList.add('active'); lucide.createIcons(); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function salvarNovoAgendamentoMedico() { 
    const nome = document.getElementById('new-appoint-name').value;
    const dataVal = document.getElementById('new-appoint-date').value;
    const motivo = document.getElementById('new-appoint-reason').value;
    
    if(nome && dataVal){ 
        const d = new Date(dataVal);
        const hora = d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
        const hoje = new Date();
        const isHoje = d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
        const dataStr = isHoje ? 'Hoje' : d.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
        
        agenda.push({
            id: Date.now(), 
            nome: nome, 
            hora: hora, 
            data: dataStr, 
            motivo: motivo || 'Consulta', 
            status: 'aguardando'
        }); 
        
        renderAgenda('dia'); 
        closeModal('modal-novo-agendamento-medico'); 
        alert('Agendamento criado com sucesso!');
    } else {
        alert('Por favor, preencha o nome do paciente e a data.');
    }
}

function salvarNovoProntuario() { 
    const n = document.getElementById('new-pront-nome').value; 
    if(n){ 
        prontuarios.push({
            id:Date.now(), 
            nome:n, 
            idade:document.getElementById('new-pront-idade').value, 
            tipo:document.getElementById('new-pront-tipo').value, 
            condicao:document.getElementById('new-pront-condicao').value, 
            historico:[]
        }); 
        renderProntuarios(); 
        closeModal('modal-novo-prontuario'); 
    } 
}

// --- LÓGICA DO DASHBOARD PACIENTE (Agendamento + Serviços) ---

function renderizarDashboardPaciente() {
    const nomeUsuario = document.getElementById('userName').innerText;
    
    // 1. RENDERIZAR PRÓXIMO AGENDAMENTO (Com botão Cancelar)
    const containerAgenda = document.getElementById('container-proximo-agendamento');
    // Pega o último agendamento 'aguardando'
    const agendamento = [...agenda].reverse().find(a => a.nome === nomeUsuario && a.status === 'aguardando');
    

    if (!agendamento) {
        containerAgenda.innerHTML = `
            <div class="card" style="text-align:center; padding:30px; color:var(--secondary); border: 2px dashed #eee;">
                <i data-lucide="calendar-check" size="40" style="margin-bottom:10px; opacity:0.3;"></i>
                <p>Você não tem consultas agendadas.</p>
                <button class="btn btn-sm btn-outline" style="margin-top:10px;" onclick="switchPacienteView('agendar')">Agendar Nova</button>
            </div>`;
    } else {
        const isTele = agendamento.tipo === 'tele';
        containerAgenda.innerHTML = `
            <div class="next-appointment-card highlight-card">
                <div class="app-date-box">
                    <span class="app-day">${agendamento.data.split('/')[0]}</span>
                    <span class="app-month">DIA</span>
                </div>
                <div class="app-details">
                    <h3>${agendamento.motivo}</h3>
                    <p><i data-lucide="clock" size="14"></i> ${agendamento.hora} - Dr. Carlos Silva</p>
                    <div class="app-badges">
                        ${isTele ? '<span class="badge badge-online">Vídeo</span>' : '<span class="badge badge-info">Presencial</span>'}
                        <span class="badge badge-info">Confirmado</span>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                    ${isTele ? `<button class="btn btn-white-outline" onclick="iniciarSimulacaoVideo()">Entrar na Sala</button>` : ''}
                    <button class="btn btn-sm" style="background:rgba(255,255,255,0.2); color:white; border:none; font-size:0.8rem;" 
                            onclick="cancelarAgendamento(${agendamento.id})">
                        <i data-lucide="x-circle" size="14"></i> Cancelar
                    </button>
                </div>
            </div>
        `;
    }

    // 2. RENDERIZAR SOLICITAÇÕES (Laboratório / Home Care)
    const containerServicos = document.getElementById('container-servicos-pendentes');
    if(containerServicos) {
        containerServicos.innerHTML = '';
        
        if (solicitacoesServicos.length === 0) {
            containerServicos.innerHTML = '<div style="color:#999; font-size:0.9rem; font-style:italic;">Nenhuma solicitação pendente.</div>';
        } else {
            solicitacoesServicos.forEach(sol => {
                // Define ícone baseado no tipo
                let icon = sol.tipo.includes('Laboratorial') ? 'flask-conical' : 'ambulance';
                
                containerServicos.innerHTML += `
                    <div class="card" style="padding:15px; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid var(--warning); margin-bottom:10px;">
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div style="background:#fff3cd; padding:10px; border-radius:50%; color:#856404;">
                                <i data-lucide="${icon}"></i>
                            </div>
                            <div>
                                <h4 style="margin:0; font-size:1rem;">${sol.tipo}</h4>
                                <div style="font-size:0.85rem; color:var(--secondary);">${sol.detalhe}</div>
                                <div style="font-size:0.75rem; color:var(--info); margin-top:2px;">Solicitado em: ${sol.data}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <span class="badge badge-aguardando">Em Análise</span>
                            <div style="margin-top:5px; font-size:0.75rem; color:var(--secondary); cursor:pointer; text-decoration:underline;" 
                                 onclick="alert('Nossa equipe entrará em contato em breve para confirmar o agendamento.')">Detalhes</div>
                        </div>
                    </div>
                `;
            });
        }
    }
    
    lucide.createIcons();
}

// Lógica de Cancelamento
function cancelarAgendamento(id) {
    if(confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const index = agenda.findIndex(a => a.id === id);
        if(index > -1) {
            agenda.splice(index, 1); // Remove do array
            renderizarDashboardPaciente(); // Atualiza a tela
            alert('Agendamento cancelado com sucesso.');
        }
    }
}

// Lógica para Salvar Solicitação de Serviço
function prepararSolicitacaoServico() {
    openModal('modal-solicitar-servico');
}

function salvarSolicitacaoServico() {
    const tipo = document.getElementById('solic-tipo').value;
    const detalhe = document.getElementById('solic-detalhe').value;
    
    if(!detalhe) {
        alert('Por favor, descreva o que você precisa.');
        return;
    }

    solicitacoesServicos.push({
        id: Date.now(),
        tipo: tipo,
        detalhe: detalhe,
        status: 'pendente',
        data: new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})
    });

    closeModal('modal-solicitar-servico');
    renderizarDashboardPaciente(); // Atualiza o dashboard para mostrar o novo card
    alert('Solicitação enviada! A equipe de triagem entrará em contato.');
}

function toggleBotaoCadastro() {
    const chk = document.getElementById('reg-lgpd');
    const btn = document.getElementById('btn-confirmar-cadastro');
    
    if (chk.checked) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}