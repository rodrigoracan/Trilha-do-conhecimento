import { Certification, ScheduleGate, StudyNote, ActionReminder, ActiveRecallCard, AppConfig, KnowledgeTrack, NotebookBook } from '../types';

export const initialConfig: AppConfig = {
  googleDriveUrl: 'https://drive.google.com',
  targetHoursWeekly: 11,
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  soundEnabled: true,
  theme: 'light',
};

export const initialCertifications: Certification[] = [
  {
    id: 'iso-42001',
    code: 'ISO/IEC 42001',
    title: 'ISO/IEC 42001 - AI Management System (AIMS)',
    issuer: 'ISO / IEC / BSI',
    category: 'Governança',
    description: '',
    status: 'Planejada',
    targetGate: 'Gate 1',
    targetMonths: 'Meses 2 a 4',
    estimatedHours: 90,
    hoursSpent: 0,
    officialUrl: 'https://www.iso.org/standard/81230.html',
    modules: [
      {
        id: 'iso-m1',
        title: 'Cláusula 4: Contexto da Organização',
        description: 'Mapeamento de partes interessadas e escopo do AIMS',
        completed: false,
        subtopics: ['4.1 Organização', '4.2 Partes interessadas', '4.3 Escopo do AIMS']
      },
      {
        id: 'iso-m2',
        title: 'Cláusula 5: Liderança e Compromisso',
        description: 'Política corporativa de IA e responsabilidades',
        completed: false,
        subtopics: ['5.1 Liderança', '5.2 Política de IA', '5.3 Papéis organizacionais']
      },
      {
        id: 'iso-m3',
        title: 'Cláusula 6: Planejamento & AI Risk Assessment',
        description: 'Avaliação e tratamento de riscos de sistemas de IA',
        completed: false,
        subtopics: ['6.1 Riscos e oportunidades', '6.2 Objetivos do AIMS', '6.3 Mudanças']
      },
      {
        id: 'iso-m4',
        title: 'Cláusula 7: Suporte e Recursos',
        description: 'Competências, dados/compute e conscientização',
        completed: false,
        subtopics: ['7.1 Recursos', '7.2 Competências', '7.5 Informação documentada']
      },
      {
        id: 'iso-m5',
        title: 'Cláusula 8: Operação e Ciclo de Vida de IA',
        description: 'Controle operacional e avaliação de impacto (AIIA)',
        completed: false,
        subtopics: ['8.1 Controle operacional', '8.2 Avaliação de impacto', '8.3 Fornecedores']
      },
      {
        id: 'iso-m6',
        title: 'Cláusula 9 & 10: Auditoria e Melhoria',
        description: 'Auditoria interna e melhoria contínua dos modelos',
        completed: false,
        subtopics: ['9.2 Auditoria interna', '10.1 Não conformidade e ações']
      },
      {
        id: 'iso-m7',
        title: 'Anexo A: 38 Controles Normativos de IA',
        description: 'Controles normativos A.2 a A.10',
        completed: false,
        subtopics: ['A.2 Políticas', 'A.5 Governança de dados', 'A.8 Ciclo de vida', 'A.10 Terceiros']
      }
    ],
    colorTheme: 'sky',
    externalResources: []
  },
  {
    id: 'iapp-aigp',
    code: 'IAPP AIGP',
    title: 'IAPP AIGP - Artificial Intelligence Governance Professional',
    issuer: 'IAPP',
    category: 'Governança',
    description: '',
    status: 'Planejada',
    targetGate: 'Gate 2',
    targetMonths: 'Meses 5 a 8',
    estimatedHours: 80,
    hoursSpent: 0,
    officialUrl: 'https://iapp.org/certify/aigp/',
    modules: [
      {
        id: 'aigp-m1',
        title: 'Domínio 1: Fundamentos de IA & Tipologias',
        description: 'Machine Learning, LLMs, Agentes e limitações técnicas',
        completed: false,
        subtopics: ['Tipologias de IA', 'Supervisionado vs Não Supervisionado', 'Modelos Fundacionais']
      },
      {
        id: 'aigp-m2',
        title: 'Domínio 2: Leis e Padrões Globais (EU AI Act & NIST)',
        description: 'Classificação de risco do EU AI Act e NIST AI RMF',
        completed: false,
        subtopics: ['EU AI Act Artigos 5, 6, 50', 'NIST AI RMF Core', 'OECD AI Principles']
      },
      {
        id: 'aigp-m3',
        title: 'Domínio 3: Estratégia Organizacional de Governança',
        description: 'Comitês de ética, frameworks corporativos e alinhamento C-Level',
        completed: false,
        subtopics: ['Estruturas de Governança', 'Treinamento e Cultura', 'Responsabilidade']
      },
      {
        id: 'aigp-m4',
        title: 'Domínio 4: Ciclo de Vida Responsável de IA',
        description: 'Viés algorítmico, explicabilidade (XAI) e robustez',
        completed: false,
        subtopics: ['Auditoria de viés', 'Explicabilidade técnica', 'Red teaming']
      },
      {
        id: 'aigp-m5',
        title: 'Domínio 5: Monitoramento Contínuo e Terceiros',
        description: 'Due diligence de fornecedores de modelos e monitoramento pós-deploy',
        completed: false,
        subtopics: ['Avaliação de fornecedores', 'Monitoramento contínuo', 'Incidentes']
      }
    ],
    colorTheme: 'emerald',
    externalResources: []
  },
  {
    id: 'isaca-aaia',
    code: 'ISACA AAIA',
    title: 'ISACA AAIA - Artificial Intelligence Audit Certified',
    issuer: 'ISACA',
    category: 'Auditoria',
    description: '',
    status: 'Planejada',
    targetGate: 'Gate 3',
    targetMonths: 'Meses 9 a 13',
    estimatedHours: 85,
    hoursSpent: 0,
    officialUrl: 'https://www.isaca.org/credentialing/artificial-intelligence-audit',
    modules: [
      {
        id: 'aaia-m1',
        title: 'Domínio 1: Governança de Sistemas de IA & Estratégia',
        description: 'Auditoria de políticas corporativas e alinhamento estratégico',
        completed: false,
        subtopics: ['Controle interno', 'Responsabilização executiva', 'Linhas de defesa']
      },
      {
        id: 'aaia-m2',
        title: 'Domínio 2: Gestão de Riscos Tecnológicos e Algorítmicos',
        description: 'Matrizes de risco operacional, alucinação e vulnerabilidades',
        completed: false,
        subtopics: ['Taxonomia de riscos', 'Probabilidade e impacto', 'Limites de tolerância']
      },
      {
        id: 'aaia-m3',
        title: 'Domínio 3: Controles de Modelos, Dados e MLOps',
        description: 'Integridade de dados de treino, versionamento e CI/CD de modelos',
        completed: false,
        subtopics: ['Data lineage', 'Auditoria de MLOps', 'Validação de parâmetros']
      },
      {
        id: 'aaia-m4',
        title: 'Domínio 4: Auditoria de Segurança, Privacidade e Integridade',
        description: 'Proteção contra extração de modelos e privacidade diferencial',
        completed: false,
        subtopics: ['Segurança defensiva', 'Privacidade por design', 'Rastreabilidade']
      },
      {
        id: 'aaia-m5',
        title: 'Domínio 5: Monitoramento Pós-Deploy e Incidentes',
        description: 'Detecção de drift de conceito e contingência humana',
        completed: false,
        subtopics: ['Degradação de performance', 'Human-in-the-loop', 'Relatórios de auditoria']
      }
    ],
    colorTheme: 'purple',
    externalResources: []
  },
  {
    id: 'comptia-secplus',
    code: 'CompTIA Security+',
    title: 'CompTIA Security+ (SY0-701 / SY0-801)',
    issuer: 'CompTIA',
    category: 'Segurança',
    description: '',
    status: 'Planejada',
    targetGate: 'Gate 1',
    targetMonths: 'Meses 1 a 4',
    estimatedHours: 75,
    hoursSpent: 0,
    officialUrl: 'https://www.comptia.org/certifications/security',
    modules: [
      {
        id: 'sec-m1',
        title: 'Domínio 1: Ameaças, Ataques e Vulnerabilidades',
        description: 'Engenharia social, malwares, vetores em nuvem e APIs',
        completed: false,
        subtopics: ['Vetores de ameaça', 'Ataques a aplicações e APIs', 'Cadeia de suprimentos']
      },
      {
        id: 'sec-m2',
        title: 'Domínio 2: Arquitetura e Design de Segurança',
        description: 'Zero Trust, segmentação corporativa e segurança em nuvem',
        completed: false,
        subtopics: ['Princípios de Zero Trust', 'Segurança em contêineres', 'Resiliência']
      },
      {
        id: 'sec-m3',
        title: 'Domínio 3: Implementação de Segurança e Criptografia',
        description: 'Criptografia simétrica/assimétrica, PKI e controle de identidades (IAM)',
        completed: false,
        subtopics: ['Suites criptográficas', 'IAM e federação', 'Proteção de endpoints']
      },
      {
        id: 'sec-m4',
        title: 'Domínio 4: Operações de Segurança e Incidentes',
        description: 'SIEM, telemetria contínua e playbooks de contenção',
        completed: false,
        subtopics: ['Monitoramento e logs', 'Playbooks de resposta', 'Recuperação']
      },
      {
        id: 'sec-m5',
        title: 'Domínio 5: Governança, Risco e Conformidade (GRC)',
        description: 'Políticas de segurança, frameworks NIST CSF/ISO e gestão de risco',
        completed: false,
        subtopics: ['Gestão de risco', 'Conformidade legal', 'Políticas corporativas']
      }
    ],
    colorTheme: 'amber',
    externalResources: []
  },
  {
    id: 'cloud-ai-architect',
    code: 'Google Cloud ML / Stanford AI',
    title: 'Cloud AI Architect & Executive Leadership',
    issuer: 'Google Cloud / Stanford',
    category: 'Técnica',
    description: '',
    status: 'Planejada',
    targetGate: 'Gate 4',
    targetMonths: 'Meses 14 a 18',
    estimatedHours: 80,
    hoursSpent: 0,
    officialUrl: 'https://cloud.google.com/learn/certification/machine-learning-engineer',
    modules: [
      {
        id: 'ml-m1',
        title: 'Arquitetura de LLMs e Modelos Fundacionais',
        description: 'Model Garden, grounding com dados enterprise e otimização de custos',
        completed: false,
        subtopics: ['Vertex AI', 'Prompt Engineering', 'Arquitetura RAG enterprise']
      },
      {
        id: 'ml-m2',
        title: 'Segurança em RAG e Agentes Autônomos',
        description: 'Proteção contra Prompt Injection e sanitização de contexto',
        completed: false,
        subtopics: ['Guardrails', 'Sanitização de contexto', 'Bancos vetoriais']
      },
      {
        id: 'ml-m3',
        title: 'Liderança Transversal & Posicionamento CTO',
        description: 'ROI de IA, liderança multidisciplinar e comitê executivo',
        completed: false,
        subtopics: ['Apresentação para o Board', 'Métricas de negócio', 'Budget de tecnologia']
      }
    ],
    colorTheme: 'rose',
    externalResources: []
  },
  {
    id: 'mlops-governance',
    code: 'MLOps & Governança',
    title: 'MLOps - Pipelines CI/CD & Governança de Modelos',
    issuer: 'Linux Foundation / DeepLearning.AI',
    category: 'MLOps',
    description: '',
    status: 'Planejada',
    targetGate: 'Gate 2',
    targetMonths: 'Meses 5 a 8',
    estimatedHours: 85,
    hoursSpent: 0,
    officialUrl: 'https://lfaidata.foundation/',
    modules: [
      {
        id: 'mlops-m1',
        title: 'Arquitetura de Pipelines e Versionamento de Dados (DVC)',
        description: 'Versionamento reproduzível de datasets, código e pesos de modelos',
        completed: false,
        subtopics: ['DVC e Git for Data', 'Pipelines desacoplados', 'Armazenamento de artefatos']
      },
      {
        id: 'mlops-m2',
        title: 'CI/CD de Machine Learning & Testes Automatizados',
        description: 'Testes de regressão de acurácia, testes de viés e integração contínua',
        completed: false,
        subtopics: ['Testes de integridade de dados', 'CI/CD com GitHub Actions', 'Validação pré-deploy']
      },
      {
        id: 'mlops-m3',
        title: 'Feature Stores & Model Registries (MLflow)',
        description: 'Governança centralizada de features, linhagem e aprovação de modelos',
        completed: false,
        subtopics: ['MLflow Model Registry', 'Feast Feature Store', 'Transição Staging -> Prod']
      },
      {
        id: 'mlops-m4',
        title: 'Monitoramento Contínuo, Data Drift & Concept Drift',
        description: 'Detecção em tempo real de degradação estatística e alertas',
        completed: false,
        subtopics: ['Métricas de drift estatístico', 'Alertas de telemetria', 'Rotinas de retreinamento']
      },
      {
        id: 'mlops-m5',
        title: 'Governança, Lineage de Modelos e Compliance ISO 42001',
        description: 'Rastreabilidade total para auditoria executiva e conformidade',
        completed: false,
        subtopics: ['Model Cards enterprise', 'Rastreabilidade de treino', 'Auditoria regulatória']
      }
    ],
    colorTheme: 'teal',
    externalResources: []
  }
];

export const initialScheduleGates: ScheduleGate[] = [
  {
    gateNumber: 0,
    title: 'Gate 0: Diagnóstico & Fundação',
    period: 'Mês 1',
    phaseName: 'Fase de Preparação e Alinhamento',
    description: 'Setup da rotina de 11h/semana e mapeamento dos gaps executivos.',
    focusCertifications: ['CompTIA Security+', 'ISO/IEC 42001'],
    deliverables: [
      'Ambiente de estudos estruturado (Drive, Gemini Notebook, Banco Local)',
      'Plano de estudo semanal com blocos fixos de foco (11h)',
      'Leitura preliminar das Cláusulas 4 e 5 da ISO 42001'
    ],
    status: 'Em Andamento'
  },
  {
    gateNumber: 1,
    title: 'Gate 1: Hard Security & Governança Base',
    period: 'Meses 2 a 4',
    phaseName: 'Fase de Blindagem Técnica e ISO 42001',
    description: 'Obtenção do CompTIA Security+ e domínio das cláusulas e Anexo A da ISO 42001.',
    focusCertifications: ['CompTIA Security+', 'ISO/IEC 42001'],
    deliverables: [
      'Aprovação no exame CompTIA Security+ (SY0-701)',
      'Construção do modelo de Política de IA (ISO 42001 Cláusula 5.2)',
      'Matriz de Controles do Anexo A preenchida com caso prático'
    ],
    status: 'Futuro'
  },
  {
    gateNumber: 2,
    title: 'Gate 2: Governança Global & Regulação Europeia',
    period: 'Meses 5 a 8',
    phaseName: 'Fase de Regulação e Compliance Internacional',
    description: 'Imersão no EU AI Act, NIST AI RMF e certificação IAPP AIGP.',
    focusCertifications: ['IAPP AIGP'],
    deliverables: [
      'Aprovação na certificação IAPP AIGP',
      'Matriz comparativa: EU AI Act vs. NIST AI RMF vs. Legislação Brasileira',
      'Playbook de avaliação de impacto em direitos fundamentais (FRIA)'
    ],
    status: 'Futuro'
  },
  {
    gateNumber: 3,
    title: 'Gate 3: Auditoria Avançada & Liderança Transversal',
    period: 'Meses 9 a 13',
    phaseName: 'Fase de Auditoria de Modelos e MLOps',
    description: 'Auditoria técnica de modelos e pipelines de machine learning (ISACA AAIA).',
    focusCertifications: ['ISACA AAIA'],
    deliverables: [
      'Aprovação na certificação ISACA AAIA',
      'Artigo técnico/case executivo publicado sobre auditoria de IA',
      'Mentoria ou liderança transversal em projeto piloto corporativo'
    ],
    status: 'Futuro'
  },
  {
    gateNumber: 4,
    title: 'Gate 4: Consolidação CTO & Defesa de Portfólio',
    period: 'Meses 14 a 18',
    phaseName: 'Fase de Síntese Executiva e Transição para CTO',
    description: 'Arquitetura de soluções em nuvem e consolidação executiva.',
    focusCertifications: ['Google Cloud ML / Stanford AI'],
    deliverables: [
      'Portfólio executivo consolidado com governança, segurança e IA aplicada',
      'Simulação de comitê executivo e defesa de estratégia de IA para Board',
      'Celebração da meta das 850+ horas acumuladas de estudo'
    ],
    status: 'Futuro'
  }
];

export const initialNotes: StudyNote[] = [];

export const initialReminders: ActionReminder[] = [
  {
    id: 'rem-1',
    title: 'Iniciar leitura da Cláusula 4 da ISO 42001',
    dueDate: '2026-10-18',
    priority: 'Alta',
    completed: false,
    certificationId: 'iso-42001',
    createdAt: '2026-10-12'
  },
  {
    id: 'rem-2',
    title: 'Fazer primeiro bloco Pomodoro de CompTIA Security+',
    dueDate: '2026-10-15',
    priority: 'Alta',
    completed: false,
    certificationId: 'comptia-secplus',
    createdAt: '2026-10-12'
  },
  {
    id: 'rem-3',
    title: 'Mapear requisitos do Artigo 50 do EU AI Act',
    dueDate: '2026-10-20',
    priority: 'Média',
    completed: false,
    certificationId: 'iapp-aigp',
    createdAt: '2026-10-12'
  }
];

export const initialFlashcards: ActiveRecallCard[] = [
  {
    id: 'flash-1',
    certificationId: 'iso-42001',
    topic: 'ISO 42001',
    question: 'Qual é o objetivo principal do Anexo A da norma ISO/IEC 42001?',
    answer: 'Fornecer 38 objetivos e controles normativos de referência (A.2 a A.10) para a Declaração de Aplicabilidade (SoA).',
    box: 1,
    nextReviewDate: '2026-10-14'
  },
  {
    id: 'flash-2',
    certificationId: 'iapp-aigp',
    topic: 'EU AI Act',
    question: 'Quais são as 4 categorias de risco previstas no EU AI Act?',
    answer: '1. Risco Inaceitável (Proibido);\n2. Alto Risco (Regulado);\n3. Transparência Específica (Art. 50);\n4. Mínimo/Nulo.',
    box: 1,
    nextReviewDate: '2026-10-14'
  },
  {
    id: 'flash-3',
    certificationId: 'comptia-secplus',
    topic: 'Criptografia',
    question: 'Diferença entre criptografia simétrica e assimétrica:',
    answer: 'Simétrica: mesma chave para cifrar e decifrar (rápida, ex: AES). Assimétrica: par de chave pública e privada (ex: RSA, ECC).',
    box: 1,
    nextReviewDate: '2026-10-14'
  }
];

export const dailyTips: string[] = [
  "ISO 42001: A liderança executiva (Cláusula 5) não pode terceirizar a responsabilidade final da governança de IA.",
  "Técnica Feynman: Se não conseguir explicar em 3 frases simples, volte e identifique onde o entendimento travou.",
  "Consistência: 11 horas semanais divididas em 6 dias são menos de 1h50 por dia.",
  "EU AI Act: O Artigo 50 exige aviso transparente de que o usuário interage com IA conversacional.",
  "Transição para CTO: A liderança executiva busca mitigação de risco e ROI, não apenas acurácia isolada de modelo.",
  "Foco: Um ciclo Pomodoro de 25 minutos sem distrações supera 2 horas de estudo interrompido.",
  "Active Recall: Feche os olhos e tente recordar os pilares da certificação sem consultar as anotações."
];

export const initialKnowledgeTracks: KnowledgeTrack[] = [
  {
    id: 'track-certificacoes-ti',
    slug: 'certificacoes-ti',
    title: 'Certificações de TI',
    subtitle: 'Governança, IA, Segurança & MLOps (ISO 42001, AIGP, AAIA, Sec+)',
    description: 'Hub central de certificações internacionais de alto impacto. Cronograma estratégico de 18 meses, simulados de aprovação, técnica Feynman e conexões de governança.',
    icon: 'Award',
    colorTheme: 'sky',
    category: 'Certificações Oficiais',
    isCertificationHub: true,
    tags: ['ISO 42001', 'IAPP AIGP', 'ISACA AAIA', 'CompTIA Security+', 'MLOps'],
    subcategories: [],
    schedule: {
      daysOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      weeklyTargetHours: 11,
      preferredTimeSlot: '19:30 - 21:30',
      sessions: []
    },
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'track-data-science-ia',
    slug: 'data-science-ia',
    title: 'Data Science e IA',
    subtitle: 'Machine Learning, Deep Learning, LLMs, RAG e Visão Computacional',
    description: 'Trilha técnica aprofundada para domínio prático e conceitual de IA moderna: algoritmos de ML, arquiteturas Transformers, pipelines RAG e deploy com MLOps.',
    icon: 'BrainCircuit',
    colorTheme: 'purple',
    category: 'Inteligência Artificial',
    tags: ['Python', 'PyTorch', 'RAG', 'LangChain', 'LLMs', 'MLOps'],
    subcategories: [],
    schedule: {
      daysOfWeek: ['Segunda', 'Quarta', 'Sexta'],
      weeklyTargetHours: 4,
      preferredTimeSlot: '19:30 - 21:00',
      sessions: []
    },
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'track-ethical-hacker',
    slug: 'ethical-hacker',
    title: 'Ethical Hacker',
    subtitle: 'Offensive Security, Pentest, Active Directory, Red Teaming e CTFs',
    description: 'Metodologias práticas e seguras de teste de invasão em ambientes controlados: análise de vulnerabilidades, exploração web OWASP, pivoting e laboratórios práticos.',
    icon: 'ShieldAlert',
    colorTheme: 'rose',
    category: 'Cibersegurança',
    tags: ['Pentest', 'OWASP Top 10', 'Active Directory', 'Burp Suite', 'Linux'],
    subcategories: [],
    schedule: {
      daysOfWeek: ['Terça', 'Quinta'],
      weeklyTargetHours: 3,
      preferredTimeSlot: '20:00 - 21:30',
      sessions: []
    },
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'track-mentoria-racan',
    slug: 'mentoria-racan',
    title: 'Mentoria RACAN',
    subtitle: 'Metodologias de Ensino, Acompanhamento de Alunos e Liderança',
    description: 'Gestão executiva de programas de mentoria, estruturação dos planos de desenvolvimento individual (PDI), feedbacks estruturados e roadmaps de carreira para mentorados.',
    icon: 'Users',
    colorTheme: 'emerald',
    category: 'Mentoria & Liderança',
    tags: ['PDI', 'Soft Skills', 'Liderança Técnica', 'Feedbacks', 'Carreira'],
    subcategories: [],
    schedule: {
      daysOfWeek: ['Sábado'],
      weeklyTargetHours: 2,
      preferredTimeSlot: '09:00 - 11:00',
      sessions: []
    },
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'track-racan-business-technology',
    slug: 'racan-business-technology',
    title: 'RACAN Business Technology',
    subtitle: 'Governança Corporativa, FinOps Cloud, Gestão Ágil e Estratégia de TI',
    description: 'Gestão estratégica de tecnologia corporativa: alinhamento com os negócios, controle financeiro em nuvem (FinOps), métricas de engenharia e modernização de TI.',
    icon: 'Briefcase',
    colorTheme: 'amber',
    category: 'Negócios & Tecnologia',
    tags: ['FinOps', 'COBIT', 'Estratégia C-Level', 'OKRs', 'Cloud Economics'],
    subcategories: [],
    schedule: {
      daysOfWeek: ['Quarta'],
      weeklyTargetHours: 2,
      preferredTimeSlot: '19:00 - 21:00',
      sessions: []
    },
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'track-canal-youtube',
    slug: 'canal-youtube',
    title: 'Canal do YouTube',
    subtitle: 'Criação de Conteúdo, Roteiros, Tutoriais Técnicos e Calendário Editorial',
    description: 'Gestão completa da produção de vídeos técnicos de alto valor sobre IA, governança, segurança ofensiva e carreira em tecnologia. Pautas, roteiros, gravações e métricas de audiência.',
    icon: 'Youtube',
    colorTheme: 'teal',
    category: 'Mídia & Conteúdo',
    tags: ['YouTube', 'Roteiros', 'SEO para Vídeo', 'Gravação', 'Edição'],
    subcategories: [],
    schedule: {
      daysOfWeek: ['Domingo'],
      weeklyTargetHours: 2,
      preferredTimeSlot: '14:00 - 16:00',
      sessions: []
    },
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  }
];

export const initialNotebooks: NotebookBook[] = [
  {
    id: 'nb-gov-ia',
    title: 'Caderno Governança, ISO 42001 & Regulação de IA',
    category: 'Governança & TI',
    colorTheme: 'sky',
    description: 'Fontes normativas, manuais de compliance, EU AI Act e mapeamento de riscos para implementação do AIMS.',
    trackId: 'certificacoes-ti',
    sources: [
      {
        id: 'src-iso-1',
        title: 'Norma ISO/IEC 42001:2023 - Sistema de Gestão de IA (AIMS)',
        type: 'book',
        author: 'ISO / IEC JTC 1/SC 42',
        summary: 'Estrutura de governança, responsabilidade da liderança (Cláusula 5) e controles do Anexo A.',
        contentSnippet: 'A ISO 42001 estabelece requisitos auditáveis para governança responsável de IA em organizações.',
        addedAt: '2026-10-18T10:00:00.000Z'
      },
      {
        id: 'src-eu-act',
        title: 'Regulamento Europeu de Inteligência Artificial (EU AI Act)',
        type: 'doc',
        author: 'Parlamento Europeu',
        summary: 'Classificação de riscos: inaceitável, alto risco, transparência específica e risco mínimo.',
        contentSnippet: 'Sistemas de alto risco exigem avaliações de conformidade, registro prévio e supervisão humana.',
        addedAt: '2026-10-18T10:00:00.000Z'
      },
      {
        id: 'src-nist-rmf',
        title: 'NIST AI Risk Management Framework 1.0',
        type: 'web',
        author: 'NIST',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        summary: 'As 4 funções centrais: Govern, Map, Measure e Manage para mitigar riscos de IA.',
        addedAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    generatedScripts: [
      {
        id: 'sc-1',
        title: 'Roteiro Executivo: Como Explicar a ISO 42001 para o Board',
        type: 'script',
        content: '# Roteiro de Apresentação Executiva - ISO 42001\n\n1. **Abertura (1 min)**: Por que a governança de IA é agora uma exigência de mercado e compliance legal.\n2. **O Que Muda (3 min)**: Diferença entre projetos isolados e um Sistema de Gestão Estruturado (AIMS).\n3. **Pilares Críticos**: Cláusula 5 (Liderança não-terceirizável) e Anexo A (Políticas de Dados e Mitigação de Vieses).\n4. **Plano de Ação (18 meses)**: Roadmap RACAN de certificação e auditoria prévia.',
        createdAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'nb-ds-ia',
    title: 'Caderno Engenharia de Dados, LLMs & Arquiteturas RAG',
    category: 'IA & Engenharia de Dados',
    colorTheme: 'purple',
    description: 'Livros de referência, artigos de transformers, embeddings vetoriais e pipelines de fine-tuning.',
    trackId: 'data-science-ia',
    sources: [
      {
        id: 'src-ds-1',
        title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
        type: 'book',
        author: 'Aurélien Géron',
        summary: 'Fundamentos de ML clássico, redes neurais profundas, regularização e otimizadores.',
        addedAt: '2026-10-18T10:00:00.000Z'
      },
      {
        id: 'src-rag-1',
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        type: 'doc',
        author: 'Lewis et al. (Meta AI / arXiv)',
        summary: 'Arquitetura canônica de RAG combinando retriever denso (DPR) e gerador seq2seq.',
        addedAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    generatedScripts: [
      {
        id: 'sc-2',
        title: 'Síntese Didática: RAG Naive vs. Advanced RAG (Técnica Feynman)',
        type: 'feynman',
        content: '### Técnica Feynman: Entendendo RAG em 3 Níveis\n\n- **Nível 1 (Analogia simples)**: RAG é como uma prova com consulta. O LLM não precisa memorizar tudo; o retriever busca a página exata da apostila e entrega na mesa dele para responder.\n- **Nível 2 (Técnico)**: Divide documentos em chunks, gera embeddings e faz busca por similaridade de cosseno em banco vetorial (Chroma, Qdrant ou pgvector).\n- **Nível 3 (Armadilhas)**: Chunks muito grandes perdem precisão; chunks muito pequenos perdem contexto. Solução: Parent Document Retriever e re-ranking.',
        createdAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'nb-ethical-hacker',
    title: 'Caderno Ethical Hacking, TCP/IP & Pentest Prático',
    category: 'Segurança & Redes',
    colorTheme: 'rose',
    description: 'Protocolos de rede, metodologias OWASP, comandos de reconhecimento com Nmap e enumeração de vulnerabilidades.',
    trackId: 'ethical-hacker',
    sources: [
      {
        id: 'src-eh-1',
        title: 'Guia Oficial de Estudos CompTIA Security+ (SY0-701)',
        type: 'book',
        author: 'CompTIA Press',
        summary: 'Ameaças, vetores de ataque, criptografia, IAM e conformidade de segurança.',
        addedAt: '2026-10-18T10:00:00.000Z'
      },
      {
        id: 'src-eh-2',
        title: 'The Hacker Playbook 3: Practical Guide To Penetration Testing',
        type: 'book',
        author: 'Peter Kim',
        summary: 'Campanhas Red Team, evasão de EDR, post-exploitation e pivoting.',
        addedAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    generatedScripts: [],
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'nb-youtube',
    title: 'Caderno Roteiros & Pautas do Canal YouTube RACAN',
    category: 'Comunicação & Mídia',
    colorTheme: 'teal',
    description: 'Estruturação de ganchos nos primeiros 30s, tópicos de IA em alta e roteiros de gravação.',
    trackId: 'canal-youtube',
    sources: [
      {
        id: 'src-yt-1',
        title: 'Dossiê Técnico: DeepSeek-R1 vs OpenAI o1 - Arquitetura e Custos',
        type: 'text',
        summary: 'Análise detalhada de RL puro (Group Relative Policy Optimization) e economia de computação.',
        contentSnippet: 'O DeepSeek-R1 utiliza GRPO e destilação para modelos menores, reduzindo drasticamente custos de inferência.',
        addedAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    generatedScripts: [
      {
        id: 'sc-3',
        title: 'Roteiro de Vídeo: Por que a Governança de IA vai Dominar 2026',
        type: 'script',
        content: '**[00:00 - 00:30] O Gancho:** "Se a sua empresa já usa IA, você pode estar a uma auditoria de tomar uma multa milionária pelo EU AI Act ou perder grandes clientes por falta da ISO 42001..."\n\n**[00:30 - 02:00] O Problema:** O hype acabou; agora os diretores exigem comprovação de segurança e compliance.\n\n**[02:00 - 05:00] A Solução RACAN:** Apresentação dos 4 passos para implementar o AIMS e se preparar para as certificações.\n\n**[05:00 - 06:00] Call to Action:** Acompanhe a Trilha RACAN e baixe nossos roteiros.',
        createdAt: '2026-10-18T10:00:00.000Z'
      }
    ],
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z'
  }
];

