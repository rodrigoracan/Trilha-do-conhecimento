import React, { useState } from 'react';
import {
  X,
  Network,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Scale,
  ShieldCheck,
  FileCode,
  Terminal,
  HelpCircle,
  Globe,
  BookOpen,
  Send,
  Zap,
  Bot
} from 'lucide-react';

interface LegislationItem {
  id: string;
  name: string;
  jurisdiction: string;
  category: 'Legislação Oficial' | 'Norma Técnica / Framework' | 'Segurança Ofensiva / IA';
  officialUrl: string;
  secondaryUrl?: string;
  mcpStrategy: string;
  description: string;
  badgeColor: string;
}

const LEGISLATION_LIST: LegislationItem[] = [
  {
    id: 'eu-ai-act',
    name: 'EU AI Act (Regulamento 2024/1689)',
    jurisdiction: 'União Europeia',
    category: 'Legislação Oficial',
    officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689',
    secondaryUrl: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office',
    mcpStrategy: 'Fetch MCP Server (@modelcontextprotocol/server-fetch) para ler os 180 Considerandos e 113 Artigos em formato Markdown direto.',
    description: 'Primeira lei abrangente de IA do mundo, baseada em 4 níveis de risco (Inaceitável, Alto Risco, Transparência Específica e Risco Mínimo), governança de modelos GPAI com risco sistêmico e multas de até 35M€ ou 7% do faturamento global.',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'pl-2338',
    name: 'PL 2338/2023 - Marco Legal de IA',
    jurisdiction: 'Brasil (Congresso Nacional)',
    category: 'Legislação Oficial',
    officialUrl: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/157233',
    secondaryUrl: 'https://legis.senado.leg.br/dadosabertos/docs/',
    mcpStrategy: 'Puppeteer MCP ou OpenAPI MCP da API de Dados Abertos do Senado Federal para acompanhar emendas e relatórios da CTIA.',
    description: 'Projeto de Lei no Senado Federal regulamentando direitos de explicação e contestação, Avaliação de Impacto Algorítmico (AIA) obrigatória para alto risco e o Sistema Nacional de Regulação e Governança de IA (SIA).',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'us-eo14110',
    name: 'US Executive Order 14110 & OMB M-24-10',
    jurisdiction: 'Estados Unidos',
    category: 'Legislação Oficial',
    officialUrl: 'https://www.whitehouse.gov/briefing-room/presidential-actions/2023/10/30/executive-order-on-the-safe-secure-and-trustworthy-artificial-intelligence/',
    secondaryUrl: 'https://leg.colorado.gov/bills/sb24-205',
    mcpStrategy: 'Fetch MCP Server para ler relatórios da Casa Branca e leis estaduais (Colorado SB 24-205 e Califórnia SB 1047).',
    description: 'Diretrizes federais para IA confiável, testes de Red-Teaming obrigatórios para modelos de fundação de grande porte, e nomeação de Chief AI Officers (CAIOs) em órgãos públicos federais.',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
  },
  {
    id: 'nist-ai-rmf',
    name: 'NIST AI Risk Management Framework 1.0 & AI 600-1',
    jurisdiction: 'EUA / Global (NIST)',
    category: 'Norma Técnica / Framework',
    officialUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
    secondaryUrl: 'https://github.com/usnistgov',
    mcpStrategy: 'GitHub MCP Server (@modelcontextprotocol/server-github) para ler os repositórios oficiais e playbooks técnicos do NIST.',
    description: 'Framework voluntário mais respeitado mundialmente, estruturado em 4 funções essenciais: Govern (Governar), Map (Mapear), Measure (Medir) e Manage (Gerenciar) riscos socio-técnicos de sistemas de IA.',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    id: 'iso-42001',
    name: 'ISO/IEC 42001:2023 - Sistema de Gestão de IA (AIMS)',
    jurisdiction: 'Internacional (ISO / IEC JTC 1/SC 42)',
    category: 'Norma Técnica / Framework',
    officialUrl: 'https://www.iso.org/standard/81230.html',
    secondaryUrl: 'https://www.iso.org/committee/6794475.html',
    mcpStrategy: 'Fetch MCP Server ou busca semântica no banco de fontes do Notebook RACAN com as cláusulas 4 a 10 e controles do Anexo A.',
    description: 'Primeira norma internacional certificável para auditoria e gestão da governança de Inteligência Artificial em organizações empresariais, compatível com a estrutura de alto nível das normas ISO 9001 e ISO 27001.',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    id: 'owasp-llm',
    name: 'OWASP Top 10 for LLMs & GenAI v2.0',
    jurisdiction: 'Global (OWASP Foundation)',
    category: 'Segurança Ofensiva / IA',
    officialUrl: 'https://genai.owasp.org/llm-top-10/',
    secondaryUrl: 'https://github.com/OWASP/www-project-top-10-for-large-language-model-applications',
    mcpStrategy: 'GitHub MCP Server conectando diretamente ao repositório público Markdown do OWASP GenAI para ler vulnerabilidades LLM01 a LLM10.',
    description: 'Guia definitivo de segurança ofensiva e defensiva para aplicações que utilizam Large Language Models: Prompt Injection, Insecure Output Handling, Training Data Poisoning, Model Denial of Service e outros.',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  },
  {
    id: 'mitre-atlas',
    name: 'MITRE ATLAS (Adversarial Threat Matrix for AI Systems)',
    jurisdiction: 'Global (MITRE Org)',
    category: 'Segurança Ofensiva / IA',
    officialUrl: 'https://atlas.mitre.org',
    secondaryUrl: 'https://github.com/mitre-atlas/atlas-data',
    mcpStrategy: 'GitHub MCP Server no repositório mitre-atlas/atlas-data para extrair a matriz tática completa de ameaças a modelos de IA em formato JSON.',
    description: 'Base de conhecimento de táticas, técnicas e estudos de caso de adversários reais em sistemas de Inteligência Artificial (exalting o framework MITRE ATT&CK para o domínio de Machine Learning).',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30'
  },
  {
    id: 'oecd-g7',
    name: 'OCDE AI Policy Observatory & Código de Conduta G7 Hiroshima',
    jurisdiction: 'Multilateral (OCDE & G7)',
    category: 'Norma Técnica / Framework',
    officialUrl: 'https://oecd.ai',
    secondaryUrl: 'https://oecd.ai/en/dashboards/ai-principles',
    mcpStrategy: 'Fetch MCP Server para consultar as políticas nacionais cadastradas em mais de 70 países no observatório da OCDE.',
    description: 'Princípios da OCDE que servem de base para as legislações do G7, G20 e Brasil: transparência, explicabilidade, robustez, segurança e responsabilidade.',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  }
];

const MCP_SERVERS_ECOSYSTEM = [
  {
    name: 'Smithery.ai (Instalação em 1 Clique)',
    url: 'https://smithery.ai',
    description: 'O maior marketplace de servidores MCP do mundo. Permite buscar conectores de dados, web scrapers e APIs e instalar no Cursor ou Claude Desktop com um único comando.',
    category: 'Marketplace'
  },
  {
    name: 'Glama MCP Directory',
    url: 'https://glama.co/mcp/servers',
    description: 'Catálogo curado e verificado de servidores MCP de código aberto categorizados por banco de dados, busca, ferramentas de desenvolvimento e scrapers.',
    category: 'Diretório'
  },
  {
    name: 'Repositório Oficial do MCP no GitHub',
    url: 'https://github.com/modelcontextprotocol/servers',
    description: 'Coleção de servidores oficiais de referência mantida pela organização Model Context Protocol (@modelcontextprotocol/server-fetch, puppeteer, github, sqlite, postgres).',
    category: 'GitHub Oficial'
  },
  {
    name: 'Documentação Oficial do Protocolo MCP',
    url: 'https://modelcontextprotocol.io',
    description: 'Especificação técnica aberta do Model Context Protocol: arquitetura Client-Host-Server, tipos de primitivas (Resources, Prompts e Tools) e tutoriais de implementação.',
    category: 'Documentação'
  }
];

const SAMPLE_MCP_CONFIG = {
  mcpServers: {
    fetch: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-fetch"]
    },
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "SEU_TOKEN_GITHUB_OPCIONAL"
      }
    },
    puppeteer: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
};

interface McpLegislationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAiAboutLegislation?: (legislationTitle: string) => void;
  theme?: 'light' | 'dark';
}

export const McpLegislationModal: React.FC<McpLegislationModalProps> = ({
  isOpen,
  onClose,
  onAskAiAboutLegislation,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'legislation' | 'mcp_ecosystem' | 'mcp_config'>('legislation');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLegislation = LEGISLATION_LIST.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_MCP_CONFIG, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#182849] border-blue-500/30 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1d38] border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Legislações & Conexões MCP
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Nativo & 0 Tokens
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
                Portais oficiais para conexão via Model Context Protocol e consulta direta com IA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner: Native vs Personal Tokens */}
        <div
          className={`px-5 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-3 ${
            isLight
              ? 'bg-blue-50 border-blue-100 text-blue-900'
              : 'bg-blue-950/40 border-blue-800/40 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Conexão Nativa Ativa:</strong> O sistema está conectado diretamente ao Gemini Flash pelo servidor. Você pode consultar qualquer uma dessas legislações sem gastar seus créditos pessoais ou tokens de API.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-[11px]">
              <Check className="w-3.5 h-3.5" />
              Chave Pessoal Dispensada
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-5 py-2.5 flex items-center justify-between border-b gap-2 overflow-x-auto shrink-0 ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#11203e] border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('legislation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'legislation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Legislações & Normas ({LEGISLATION_LIST.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('mcp_ecosystem')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'mcp_ecosystem'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Sites do Ecossistema MCP</span>
            </button>

            <button
              onClick={() => setActiveTab('mcp_config')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'mcp_config'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Configuração MCP Pronta</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: LEGISLATION & NORMS LIST */}
          {activeTab === 'legislation' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Filtrar:
                </span>
                {[
                  { id: 'all', label: 'Todas as Fontes' },
                  { id: 'Legislação Oficial', label: 'Legislações Oficiais' },
                  { id: 'Norma Técnica / Framework', label: 'Normas & Frameworks' },
                  { id: 'Segurança Ofensiva / IA', label: 'Segurança & Ameaças' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      filterCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : isLight
                        ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Legislation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredLegislation.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isLight
                        ? 'bg-slate-50/80 border-slate-200 hover:shadow-md hover:border-blue-300'
                        : 'bg-[#0f1d38] border-slate-700/70 hover:border-blue-400/50 hover:bg-[#122244]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${item.badgeColor}`}>
                          {item.jurisdiction}
                        </span>
                        <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-black tracking-tight mb-1.5 leading-snug">
                        {item.name}
                      </h3>

                      <p className={`text-xs line-clamp-3 mb-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {item.description}
                      </p>

                      {/* MCP Strategy Tip */}
                      <div
                        className={`p-2.5 rounded-xl text-[11px] mb-3 leading-relaxed flex items-start gap-2 ${
                          isLight
                            ? 'bg-indigo-50/70 text-indigo-900 border border-indigo-100'
                            : 'bg-indigo-950/40 text-indigo-200 border border-indigo-800/40'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-indigo-300 font-bold mb-0.5">Conector MCP Indicado:</strong>
                          <span>{item.mcpStrategy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-slate-700/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Abrir Site Oficial</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleCopyUrl(item.id, item.officialUrl)}
                          className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
                            isLight
                              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                          title="Copiar URL para o MCP"
                        >
                          {copiedUrlId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {onAskAiAboutLegislation && (
                        <button
                          onClick={() => {
                            onAskAiAboutLegislation(item.name);
                            onClose();
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isLight
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                          }`}
                          title="Consultar com o Assistente Gemini Nativo (0 Tokens)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Perguntar à IA</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MCP SITES ECOSYSTEM */}
          {activeTab === 'mcp_ecosystem' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1d38] border-slate-700/60'
                }`}
              >
                <h3 className="text-sm font-black mb-1.5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  O que é o Model Context Protocol (MCP) e como conectar sites?
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  O <strong>MCP</strong> é um protocolo aberto que permite a qualquer aplicativo de IA se comunicar com servidores locais ou remotos que fornecem dados. Sites governamentais como o EUR-Lex ou o Senado Federal <strong>não são servidores MCP por si mesmos</strong> (são portais web normais). Para lê-los via MCP, você utiliza um servidor conector (como o <code>@modelcontextprotocol/server-fetch</code> ou <code>@modelcontextprotocol/server-puppeteer</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {MCP_SERVERS_ECOSYSTEM.map((site, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                        : 'bg-[#0f1d38] border-slate-700/70 hover:border-blue-400/50 hover:bg-[#122244]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {site.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-black mb-1.5">{site.name}</h4>
                      <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {site.description}
                      </p>
                    </div>

                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center gap-2 w-full shadow-sm"
                    >
                      <span>Acessar {site.name.split(' ')[0]}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MCP CONFIGURATION BLOCK */}
          {activeTab === 'mcp_config' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1d38] border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-black">
                      Arquivo de Configuração MCP Pronto (Copiar com 1 Clique)
                    </h3>
                  </div>
                  <button
                    onClick={handleCopyConfig}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedConfig ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <p className={`text-xs leading-relaxed mb-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Cole este bloco no arquivo <code>claude_desktop_config.json</code> ou nas configurações do Cursor / VS Code para habilitar leitura instantânea de qualquer URL de legislação e repositórios do NIST e OWASP:
                </p>

                <pre
                  className={`p-3.5 rounded-xl font-mono text-xs overflow-x-auto border ${
                    isLight
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-[#080f1d] text-emerald-300 border-slate-800'
                  }`}
                >
                  {JSON.stringify(SAMPLE_MCP_CONFIG, null, 2)}
                </pre>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-blue-950/40 border-blue-800/40 text-blue-200'
                }`}
              >
                <h4 className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Dica de Eficiência RACAN
                </h4>
                <p className="text-xs leading-relaxed">
                  Se você deseja consultar essas normas sem configurar arquivos locais, utilize o <strong>Assistente Gemini Nativo</strong> integrado à nossa aplicação. Ele já pesquisa os dados em tempo real através do servidor, gerando simulados, mapas conceituais e análises comparativas sem consumir sua cota.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f1d38] border-slate-700/60'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>
              Trilha Governança e Segurança de IA • RACAN 2026
            </span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
