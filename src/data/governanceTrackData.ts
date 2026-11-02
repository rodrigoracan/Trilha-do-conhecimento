import { KnowledgeTrack } from '../types';

export const governanceTrack: KnowledgeTrack = {
  id: 'track-governanca-seguranca-ia',
  slug: 'governanca-seguranca-ia',
  title: 'Governança e Segurança de IA',
  subtitle: 'Legislações Mundiais, Normas Técnicas e Certificações Globais',
  description: 'Trilha executiva completa baseada no documento oficial "Governança e Segurança de IA: Legislações, Normas e Certificações" (@Rodrigo Rahal Canado, posição em 31/10/2026). Abrange as 5 leis vinculantes em vigor no mundo, o quadro de ordens executivas e leis estaduais nos EUA, o marco legal no Brasil (PL 2.338/2023, SIA/ANPD, LGPD Art. 20, Resolução CNJ 615/2025), o catálogo ABNT (CB-021), a norma certificável ABNT NBR ISO/IEC 42001:2024, frameworks de GRC (IAPP AIGP, EXIN AICP, PECB), auditoria ISACA (AAIA/AAISM), segurança técnica (CompTIA SecAI+ lançada em 17/2/2026, CSA TAISE, OWASP, MITRE ATLAS) e reflexões estratégicas de mercado.',
  icon: 'ShieldCheck',
  colorTheme: 'sky',
  category: 'Governança & Regulação',
  tags: ['EU AI Act', 'PL 2338/2023', 'ISO 42001', 'IAPP AIGP', 'ISACA AAIA', 'CompTIA SecAI+', 'NIST AI RMF'],
  subcategories: [
    {
      id: 'sub-leg-vinculantes-globais',
      title: 'Tópico 1: Legislações Mundiais de IA - Leis Vinculantes, Regimes Nacionais & Soft Law',
      description: 'Panorama das 5 jurisdições com leis vinculantes em vigor, ordens executivas e estaduais nos EUA, marco regulatório no Brasil, regime em camadas da China e tratados internacionais.',
      colorTheme: 'sky',
      order: 1,
      attachments: [],
      items: [
        {
          id: 'item-leg-5-vinculantes',
          title: 'As 5 Jurisdições com Leis de IA Vinculantes em Vigor (Posição em 31/10/2026)',
          description: 'Apenas cinco jurisdições têm lei de IA em vigor com obrigações e sanções próprias: 1) União Europeia: AI Act (Reg. 2024/1689), em vigor desde 1/8/2024; proibições desde 2/2/2025; modelos de uso geral (GPAI) desde 2/8/2025. O Digital Omnibus (Reg. 2026/1744, em vigor desde 27/7/2026) adiou o alto risco: Anexo III para 2/12/2027 e Anexo I (produtos) para 2/8/2028; divergência no art. 50 (2/8/2026 vs 2/12/2026); 2) Coreia do Sul: AI Basic Act, em vigor desde 22/1/2026 (multas com teto de KRW 30 mi); 3) Vietnã: Lei de IA nº 134/2025/QH15, em vigor desde 1/3/2026 (sanções dependem de decreto); 4) Itália: Lei 132/2025, em vigor desde 10/10/2025 (alinhada ao AI Act); 5) Cazaquistão: Lei nacional de IA em vigor.',
          status: 'Em Andamento',
          priority: 'Alta',
          notes: 'Destaque crítico: O Digital Omnibus (Reg. 2026/1744) aprovado em julho/2026 na Europa adiou a exigência de conformidade para sistemas de alto risco do Anexo III para dezembro de 2027.',
          resources: [
            {
              id: 'res-eu-1',
              title: 'EUR-Lex: Regulamento (UE) 2024/1689 (EU AI Act)',
              url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            },
            {
              id: 'res-eu-omnibus',
              title: 'Digital Omnibus AI Act (Reg. 2026/1744) - Novos Prazos',
              url: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-vinc-1', text: 'Mapear a linha do tempo do AI Act: Proibições (fev/2025), GPAI (ago/2025) e Alto Risco (dez/2027)', done: true },
            { id: 'chk-vinc-2', text: 'Analisar o AI Basic Act da Coreia do Sul e a Lei 132/2025 italiana', done: false },
            { id: 'chk-vinc-3', text: 'Checar divergência de datas sobre obrigações de transparência e marca d’água (Art. 50)', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-leg-eua-estados',
          title: 'Estados Unidos: Sem Lei Federal Abrangente, Ordens Executivas & Regras Estaduais',
          description: 'Não há lei federal abrangente nos EUA. O quadro federal opera por ordens executivas: OE de 11/12/2025 (focada em preempção de leis estaduais e criação de força-tarefa do DOJ) e OE de 2/6/2026 (focada em segurança). A regulação efetiva é estadual: Califórnia: SB 53 (modelos de fronteira) e AB 2013 (transparência de dados de treino) em vigor desde 1/1/2026; SB 942/AB 853 (proveniência) adiada para 2/8/2026; Texas: TRAIGA (em vigor desde 1/1/2026); Illinois: HB 3773 (IA em emprego, em vigor 1/1/2026); Colorado: SB 24-205 revogada e substituída pela SB 26-189 (vigência 1/1/2027); Nova York: RAISE Act (dez/2025) e Local Law 144 (contratação); Utah: AI Policy Act (1/5/2024).',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'A fragmentação regulatória nos EUA exige que empresas monitorem leis estaduais específicas de contratação (Illinois/NYC) e dados de treinamento (Califórnia).',
          resources: [
            {
              id: 'res-us-tracker',
              title: 'Stack Cyber: State AI Laws Tracker',
              url: 'https://www.whitehouse.gov/briefing-room/presidential-actions/2023/10/30/executive-order-on-the-safe-secure-and-trustworthy-artificial-intelligence/',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-us-1', text: 'Analisar requisitos da Califórnia AB 2013 sobre transparência das bases de treinamento', done: false },
            { id: 'chk-us-2', text: 'Examinar o impacto da força-tarefa do DOJ contestando leis estaduais', done: false },
            { id: 'chk-us-3', text: 'Mapear obrigações de auditoria em RH da NYC Local Law 144 e Illinois HB 3773', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-leg-brasil-status',
          title: 'Brasil: Situação do PL 2.338/2023, SIA/ANPD, LGPD e Resolução CNJ 615/2025',
          description: 'O Brasil ainda NÃO tem lei geral de IA: o PL 2.338/2023 (Marco Legal da IA) foi aprovado no Senado em 10/12/2024 e segue em tramitação na Comissão Especial da Câmara dos Deputados (relatoria do dep. Aguinaldo Ribeiro, última movimentação em 2/9/2026). Prevê a criação do SIA (Sistema Nacional de Regulação e Governança de IA) coordenado pela ANPD, com PL do Executivo 6.237/2025 para estruturação. Em vigor hoje no país: LGPD (Lei 13.709/2018, art. 20 sobre revisão de decisões automatizadas), Marco Civil da Internet, Resolução CNJ 615/2025 (IA no Judiciário, que revogou a 332/2020), EBIA (Portaria MCTI 4.617/2021) e debates de Banco Central/Febraban.',
          status: 'Em Andamento',
          priority: 'Alta',
          notes: 'Atenção didática: Deixar claro para clientes e alunos que nada do PL 2.338/2023 está em vigor hoje no Brasil; o compliance atual baseia-se na LGPD, CDC e Resoluções específicas.',
          resources: [
            {
              id: 'res-senado-2338',
              title: 'Tramitação Oficial do PL 2.338/2023 no Senado Federal',
              url: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/157233',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            },
            {
              id: 'res-cnj-resolucao',
              title: 'Conjur: Resolução CNJ 615/2025 e Diretrizes de IA',
              url: 'https://www.conjur.com.br',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-br-1', text: 'Entender a arquitetura do SIA e a coordenação pela ANPD', done: true },
            { id: 'chk-br-2', text: 'Estudar os critérios de auditoria algorítmica da Resolução CNJ 615/2025', done: false },
            { id: 'chk-br-3', text: 'Aplicar os direitos do titular do Artigo 20 da LGPD para decisões automatizadas', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-leg-china-promocao',
          title: 'China (Regime em Camadas), Leis de Promoção & Demais Países',
          description: 'A China adota regime em camadas sem lei única: regras sobre algoritmos de recomendação e deep synthesis; Medidas Provisórias de IA Generativa (desde 15/8/2023); Medidas de rotulagem de conteúdo gerado por IA (1/9/2025); Emenda à Lei de Cibersegurança com cláusula de IA (1/1/2026); e Medidas para IA antropomórfica/companions (15/7/2026). Leis de promoção e voluntárias: Japão (AI Promotion Act 4/6/2025, sem penalidades); Taiwan (AI Basic Act 14/1/2026); Singapura (Model AI Governance Framework); Peru (regulamento 2025). Países sem lei específica: Reino Unido (reguladores setoriais FCA/CMA/MHRA); Índia (IT Amendment Rules 2026 para rotulagem sintética); Austrália (Plano Nacional e transparência Privacy Act 10/12/2026); Canadá; Chile (PL 16.821-19); México; Colômbia; Emirados e Arábia Saudita.',
          status: 'A Fazer',
          priority: 'Média',
          notes: 'A China inova ao regulamentar a IA antropomórfica (chatbots companheiros emocionais), prevendo mitigação de dependência psicológica.',
          resources: [
            {
              id: 'res-dla-china-doc',
              title: 'DLA Piper: Artificial Intelligence in China Governance',
              url: 'https://www.dlapiper.com',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-ch-1', text: 'Examinar as regras chinesas sobre rotulagem de conteúdo sintético e IA antropomórfica', done: false },
            { id: 'chk-ch-2', text: 'Compreender a estratégia setorial descentralizada do Reino Unido', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-leg-tratados-softlaw',
          title: 'Instrumentos Internacionais: Convenção do Conselho da Europa (CETS 225) & Soft Law',
          description: 'Convenção-Quadro do Conselho da Europa (CETS 225): primeiro tratado vinculante de IA do mundo. A UE ratificou em 15/5/2026, mas ainda não está em vigor (exige 5 ratificações, incluindo 3 membros do CoE). Instrumentos de Soft Law: Princípios da OCDE (2019, revisados em 2024), Recomendação da UNESCO sobre Ética da IA (2021) e Processo de Hiroshima do G7 (Código de Conduta para Desenvolvedores de IA Avançada).',
          status: 'A Fazer',
          priority: 'Média',
          notes: 'A Convenção CETS 225 é o primeiro instrumento de direito internacional público que impõe salvaguardas de direitos humanos e democracia para IA.',
          resources: [
            {
              id: 'res-coe-cets-doc',
              title: 'Council of Europe AI Convention (CETS 225)',
              url: 'https://www.coe.int/en/web/artificial-intelligence',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-coe-1', text: 'Analisar as cláusulas de proteção democrática da Convenção CETS 225', done: false },
            { id: 'chk-coe-2', text: 'Estudar os princípios atualizados da OCDE (2024) e do G7 Hiroshima', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        }
      ]
    },
    {
      id: 'sub-normas-iso-abnt',
      title: 'Tópico 2: Normas ISO/IEC e Disponibilidade no Catálogo ABNT (Brasil)',
      description: 'As 7 normas de IA confirmadas no catálogo ABNT (CB-021), normas publicadas pela ISO (comitê SC 42) e normas adjacentes de segurança.',
      colorTheme: 'purple',
      order: 2,
      attachments: [],
      items: [
        {
          id: 'item-abnt-confirmadas-7',
          title: 'As 7 Normas de IA Confirmadas no Catálogo da ABNT (Comitê Especial CB-021)',
          description: 'Sete normas de IA têm adoção confirmada no catálogo da ABNT: 1) ABNT NBR ISO/IEC 42001:2024 (Sistema de Gestão de IA - a certificável); 2) ABNT NBR ISO/IEC 23894:2023 (Gestão de riscos de IA); 3) ABNT NBR ISO/IEC 22989:2023 (Conceitos e terminologia oficial); 4) ABNT NBR ISO/IEC 38507:2023 (Implicações de governança corporativa no uso de IA); 5) ABNT ISO/IEC TR 24027:2024 (Viés em sistemas de IA e tomada de decisão automatizada); 6) ABNT NBR ISO/IEC 23053 (05/2025: Framework para IA com aprendizado de máquina); 7) ABNT ISO/IEC TR 24368 (06/2025: Preocupações éticas e sociais).',
          status: 'Em Andamento',
          priority: 'Alta',
          notes: 'A NBR ISO 42001:2024 é a peça central do portfólio corporativo de governança de IA no Brasil.',
          resources: [
            {
              id: 'res-abnt-cat',
              title: 'Catálogo de Normas ABNT/CB-021',
              url: 'https://www.abntcatalogo.com.br',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-abnt-1', text: 'Dominar as 10 cláusulas e os 38 controles do Anexo A da ABNT NBR ISO/IEC 42001:2024', done: true },
            { id: 'chk-abnt-2', text: 'Mapear os processos de gestão de risco da NBR 23894:2023', done: false },
            { id: 'chk-abnt-3', text: 'Aplicar as métricas de detecção de viés do TR 24027:2024', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-iso-sc42-publicadas',
          title: 'Publicadas pela ISO (Ainda sem Adoção ABNT Confirmada)',
          description: 'Normas publicadas pelo subcomitê global ISO/IEC JTC 1/SC 42 (que possui cerca de 44 publicações vigentes e ~50 projetos em andamento em 30/9/2026): 1) ISO/IEC 42005:2025 (maio/2025: Avaliação de impacto de sistemas de IA - AIIA); 2) ISO/IEC 42006:2025 (jul/2025: Requisitos para organismos que certificam sistemas de gestão de IA); 3) ISO/IEC 5338:2023 (Processos do ciclo de vida); 4) ISO/IEC 5339:2024 (Diretrizes para aplicações de IA); 5) ISO/IEC 12792:2025 (Taxonomia de transparência); 6) ISO/IEC 25059 (Modelo de qualidade para IA); 7) ISO/IEC 27090 (Ameaças de segurança específicas de IA, publicada em out/2026 ou FDIS).',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'A ISO 42005 padroniza a Avaliação de Impacto e a ISO 42006 dita como as certificadoras (TÜV, DQS, BSI) devem auditar seus clientes.',
          resources: [
            {
              id: 'res-iso-sc42-site',
              title: 'ISO/IEC SC 42 Artificial Intelligence Standards Overview',
              url: 'https://www.iso.org/committee/6794475.html',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-iso-1', text: 'Examinar o framework de Avaliação de Impacto da ISO/IEC 42005:2025', done: false },
            { id: 'chk-iso-2', text: 'Compreender os critérios de auditoria e acreditação da ISO/IEC 42006:2025', done: false },
            { id: 'chk-iso-3', text: 'Avaliar a ISO/IEC 27090 para defesas contra ameaças em IA', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-adjacentes-e-fora-iso',
          title: 'Normas Adjacentes Úteis & Frameworks Técnicos Fora da ISO',
          description: 'Normas ABNT adjacentes complementares: ABNT NBR ISO/IEC 27001 e 27002 (Segurança da Informação e Cibersegurança); ABNT NBR ISO 31000:2018 (Gestão de Riscos Corporativos); ABNT NBR ISO/IEC 38505-1 (Governança de Dados para IA). Frameworks fundamentais fora da ISO: NIST AI Risk Management Framework 1.0 (NIST AI RMF); ETSI prEN 304 223 e CEN-CENELEC prEN 18282 (normas de cibersegurança ligadas ao EU AI Act na Europa).',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'A conformidade em IA exige integração nativa com os controles de Segurança da Informação (ISO 27001) e Governança de Dados (ISO 38505).',
          resources: [
            {
              id: 'res-nist-rmf-link',
              title: 'NIST AI Risk Management Framework 1.0',
              url: 'https://www.nist.gov/itl/ai-risk-management-framework',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-adj-1', text: 'Conectar os controles da ISO 27001 aos controles específicos de IA da ISO 42001', done: false },
            { id: 'chk-adj-2', text: 'Mapear as 4 funções do NIST AI RMF: Govern, Map, Measure e Manage', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        }
      ]
    },
    {
      id: 'sub-certificacoes-profissionais-ia',
      title: 'Tópico 3: Certificações de Governança, Auditoria e Segurança de IA',
      description: 'Credenciais internacionais de GRC (IAPP/PECB/EXIN), auditoria gerencial ISACA com pré-requisitos, certificações técnicas (CompTIA SecAI+) e cenário brasileiro.',
      colorTheme: 'rose',
      order: 3,
      attachments: [],
      items: [
        {
          id: 'item-cert-grc-iapp-pecb',
          title: 'Governança, Risco e Conformidade (GRC): IAPP AIGP, EXIN AICP & PECB',
          description: 'IAPP AIGP (Artificial Intelligence Governance Professional): a credencial de governança mais difundida globalmente, sem pré-requisitos exigidos. EXIN AI Compliance Professional (AICP): integra na mesma certificação os requisitos do EU AI Act, ISO 42001 e NIST AI RMF. PECB ISO/IEC 42001: trilha completa com Foundation, Lead Implementer e Lead Auditor. PECB Certified EU AI Governance Professional e Certified AI Security Professional. ECPC-AI (Maastricht University): destaque por possuir edição em português com contexto adaptado à LGPD brasileira. BCS e IEEE CertifAIEd.',
          status: 'Em Andamento',
          priority: 'Alta',
          notes: 'A certificação IAPP AIGP e o curso PECB ISO 42001 Lead Auditor são os mais buscados por profissionais de privacidade, DPOs e líderes de tecnologia.',
          resources: [
            {
              id: 'res-iapp-aigp',
              title: 'IAPP AIGP Certification Guide',
              url: 'https://iapp.org/certify/aigp/',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            },
            {
              id: 'res-exin-aicp',
              title: 'EXIN AI Compliance Professional (AICP)',
              url: 'https://www.exin.com',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-grc-1', text: 'Dominar o Body of Knowledge do exame IAPP AIGP', done: true },
            { id: 'chk-grc-2', text: 'Compreender o processo de auditoria de conformidade PECB Lead Auditor', done: false },
            { id: 'chk-grc-3', text: 'Examinar o diferencial da ECPC-AI da Maastricht University em português', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-cert-isaca-gerencial',
          title: 'Auditoria e Segurança Gerencial (ISACA): AAIA, AAISM & AAIR (Com Pré-Requisitos)',
          description: 'As certificações da ISACA possuem altíssima reputação corporativa em auditoria, mas exigem credenciais prévias ativas: 1) AAIA (Artificial Intelligence Audit Certified) - foco em Auditoria de IA, exige ter CISA ou credencial equivalente; 2) AAISM (AI Security Management Certified) - foco em Gestão de Segurança de IA, exige ter CISM ou CISSP ativo; 3) AAIR (AI Risk Certified) - foco em Risco de IA, exige ter uma dentre 25 certificações qualificadoras listadas pela ISACA.',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'Fator decisivo de planejamento: AAIA e AAISM não podem ser prestadas diretamente por quem está iniciando, ao contrário do IAPP AIGP e CompTIA SecAI+.',
          resources: [
            {
              id: 'res-isaca-ai',
              title: 'ISACA AI Credentials Portal (AAIA & AAISM)',
              url: 'https://www.isaca.org/credentialing/artificial-intelligence-audit',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-isaca-1', text: 'Verificar elegibilidade e pré-requisitos para AAIA (CISA) e AAISM (CISM/CISSP)', done: false },
            { id: 'chk-isaca-2', text: 'Estudar os domínios de auditoria algorítmica e governança de dados da ISACA', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-cert-seguranca-tecnica',
          title: 'Segurança Técnica de IA: CompTIA SecAI+, CSA TAISE, GIAC & OffSec',
          description: 'CompTIA SecAI+ (exame CY0-001, lançada oficialmente em 17/2/2026): pioneira em cobrir segurança técnica em pipelines de IA sem pré-requisitos formais. CSA TAISE (Cloud Security Alliance Trusted AI Security Expert, com trilha Agentic AI). GIAC (SANS Institute): família GAIPS, GASAE, GOAA e GMLE. OffSec OSAI (Offensive Security AI). EC-Council C|OASP. Practical DevSecOps CAISP. Microsoft: credenciais de segurança em IA (Azure AI Security). ISC2: publicou guia em abril/2026 mapeando IA em todos os domínios do seu portfólio (não é prova nova).',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'A CompTIA SecAI+ lançada em 17 de fevereiro de 2026 é um dos exames técnicos mais acessíveis e relevantes para quem atua em engenharia e segurança de IA.',
          resources: [
            {
              id: 'res-comptia-secai',
              title: 'CompTIA SecAI+ (CY0-001) Body of Knowledge',
              url: 'https://www.comptia.org',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            },
            {
              id: 'res-csa-taise',
              title: 'Cloud Security Alliance TAISE & Agentic AI',
              url: 'https://cloudsecurityalliance.org',
              type: 'link',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-secai-1', text: 'Examinar o conteúdo programático do exame CY0-001 da CompTIA SecAI+', done: false },
            { id: 'chk-secai-2', text: 'Mapear os domínios de Agentic AI da Cloud Security Alliance (TAISE)', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-cenario-brasil-custos',
          title: 'Cenário no Brasil & Valores Indicativos de Mercado',
          description: 'Panorama no Brasil: Não há certificação pessoal de governança de IA de origem 100% brasileira. O que existe no país são entregas locais de certificações internacionais por parceiros (ex: Behaviour Brasil entregando PECB e curso de interpretação da ISO 42001 da Fundação Vanzolini - curso, não certificação). No nível organizacional, a ISO/IEC 42001 já é certificada no Brasil por organismos acreditados como TÜV Rheinland e DQS (caso público Dataside divulgado em nov/2025). Valores indicativos de exame: AAISM (US$ 459–599), CompTIA SecAI+ (US$ 359), CSA TAISE (US$ 795), cursos oficiais PECB Lead (US$ 2.500 a US$ 4.000).',
          status: 'A Fazer',
          priority: 'Média',
          notes: 'Compreender os valores e os organismos atuantes no Brasil ajuda na precificação de consultorias e na escolha de certificadoras para clientes corporativos.',
          resources: [
            {
              id: 'res-dataside-baguete',
              title: 'Dataside conquista ISO 42001 no Brasil (Notícia Baguete)',
              url: 'https://www.baguete.com.br',
              type: 'doc',
              addedAt: '2026-10-31T10:00:00.000Z'
            }
          ],
          checklist: [
            { id: 'chk-br-custos-1', text: 'Analisar o caso Dataside como referência nacional de certificação ISO 42001', done: false },
            { id: 'chk-br-custos-2', text: 'Comparar custos de certificação pessoal vs ROI para consultorias', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        }
      ]
    },
    {
      id: 'sub-reflexoes-videos-estrategia',
      title: 'Tópico 4: Perguntas para Reflexão, Roteiros de Vídeo & Prática Executiva',
      description: 'Análises críticas, ganchos fortes de conteúdo para o canal do YouTube e planejamento de portfólio corporativo.',
      colorTheme: 'amber',
      order: 4,
      attachments: [],
      items: [
        {
          id: 'item-reflexao-iso-vs-aiact',
          title: 'Pergunta Estratégica 1: Por que a ISO 42001 não dá Presunção de Conformidade com o AI Act?',
          description: 'Reflexão crítica profunda: A ISO/IEC 42001 é uma norma internacional de gestão auditável e o EU AI Act é uma lei vinculante europeia. Por que obter o selo da ISO 42001 NÃO garante presunção jurídica de conformidade automática com o AI Act? A ISO 42001 é neutra em jurisdição e foca no sistema de gestão (processos e liderança), enquanto o AI Act exige conformidade técnica estrita a artigos legais específicos (requisitos técnicos do Anexo III, testes de robustez e relatórios ao European AI Office). Este é um gancho forte para vídeos do YouTube, palestras e consultorias corporativas.',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'Clientes vão cobrar essa resposta. Quem souber explicar essa distinção se posiciona como autoridade sênior no mercado de governança de IA.',
          resources: [],
          checklist: [
            { id: 'chk-ref-1', text: 'Estruturar os argumentos técnicos que diferenciam conformidade normativa de conformidade legal', done: false },
            { id: 'chk-ref-2', text: 'Criar roteiro de vídeo de 5 minutos para o YouTube sobre o tema', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-reflexao-portfolio-roadmap',
          title: 'Pergunta Estratégica 2: Portfólio de Serviços, Vídeos ou Plano Pessoal de Certificações?',
          description: 'Como operacionalizar este conhecimento: 1) Para a empresa/consultoria: estruturação de catálogo de ofertas (Diagnóstico de Aderência ISO 42001, Avaliação de Impacto Algorítmico AIA/FRIA e Política de Uso Aceitável); 2) Para o Canal do YouTube: pautas didáticas de alto impacto para CTOs e engenheiros; 3) Para a trilha pessoal: seleção de certificações sem pré-requisitos imediatos (IAPP AIGP e CompTIA SecAI+) versus certificações de topo de funil com pré-requisitos rigorosos (ISACA AAIA e AAISM).',
          status: 'A Fazer',
          priority: 'Alta',
          notes: 'A clareza dos pré-requisitos evita desperdício de tempo e direciona os estudos para aprovação rápida nas provas de maior ROI.',
          resources: [],
          checklist: [
            { id: 'chk-ref-3', text: 'Definir o roadmap pessoal de 6 a 12 meses (AIGP -> SecAI+ -> PECB Lead Auditor)', done: false },
            { id: 'chk-ref-4', text: 'Estruturar o pitch comercial de consultoria em Governança de IA', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        },
        {
          id: 'item-fontes-rastreadores-oficiais',
          title: 'Repositório de Fontes Consultadas & Rastreadores Globais de Leis de IA',
          description: 'Catálogo de fontes e observatórios de acompanhamento contínuo em 31/10/2026: Global AI Regulation Tracker 2026; Artificial Intelligence Regulation: Country Tracker; Stack Cyber (leis estaduais dos EUA); Digital Omnibus AI Act (novos prazos); ABNT/CB-021; Council of Europe AI Convention; Conjur (Resolução CNJ 615/2025); Convergência Digital; Dataside ISO 42001 (Baguete); e guias oficiais da CompTIA, CSA, IAPP e ISACA.',
          status: 'A Fazer',
          priority: 'Média',
          notes: 'Lembrete metodológico do autor Rodrigo Rahal Canado: rastreadores são fontes secundárias; confira sempre nos textos oficiais antes de palestras ou propostas comerciais.',
          resources: [],
          checklist: [
            { id: 'chk-font-1', text: 'Salvar favoritos dos rastreadores de regulação para checagem mensal', done: false },
            { id: 'chk-font-2', text: 'Acompanhar as votações do PL 2338/2023 na Comissão Especial da Câmara', done: false }
          ],
          createdAt: '2026-10-31T10:00:00.000Z',
          updatedAt: '2026-10-31T10:00:00.000Z'
        }
      ]
    }
  ],
  schedule: {
    daysOfWeek: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    weeklyTargetHours: 11,
    preferredTimeSlot: '19:30 - 21:30',
    sessions: []
  },
  createdAt: '2026-10-31T10:00:00.000Z',
  updatedAt: '2026-10-31T10:00:00.000Z'
};
