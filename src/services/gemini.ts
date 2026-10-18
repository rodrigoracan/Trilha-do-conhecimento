import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface GenerateAnswerParams {
  prompt: string;
  history?: ChatMessage[];
  context?: string;
  apiKey?: string;
  systemInstruction?: string;
}

interface GenerateNotebookScriptParams {
  bookTitle: string;
  sources: { title: string; type: string; summary?: string; contentSnippet?: string; author?: string }[];
  query?: string;
  mode: 'qa' | 'summary' | 'script' | 'faq' | 'feynman';
  apiKey?: string;
}

function getAiClient(customApiKey?: string) {
  const apiKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Chave de API do Gemini não configurada. Por favor, adicione sua chave de API nas configurações ou defina a variável de ambiente GEMINI_API_KEY.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Perguntas e Respostas com Gemini Flash
 */
export async function generateGeminiAnswer({
  prompt,
  history = [],
  context = '',
  apiKey,
  systemInstruction,
}: GenerateAnswerParams): Promise<string> {
  const ai = getAiClient(apiKey);

  const defaultSystem = `Você é o Assistente Especialista de Estudos e Preparação da "Trilha de Estudos RACAN".
Sua missão é responder com máxima clareza, rigor conceitual, didática impecável e aplicação prática nos tópicos de:
- Governança de IA (ISO/IEC 42001, EU AI Act, NIST AI RMF, AIMS);
- Engenharia de Dados & IA (Python, PyTorch, LLMs, RAG, Bancos Vetoriais);
- Ethical Hacking & Cibersegurança (Redes TCP/IP, Linux, Metasploit, Security+);
- Mentoria RACAN & Liderança Executiva em Tecnologia;
- RACAN Business Technology & FinOps;
- Roteirização e Estratégia de Conteúdo para o Canal do YouTube.

Orientações:
1. Responda em português do Brasil de forma estruturada usando Markdown (títulos, bullet points, caixas de código quando relevante).
2. Se o usuário pedir explicação Feynman, use analogias simples primeiro e aprofunde no nível técnico em seguida.
3. Se o usuário pedir simulado, formate perguntas numeradas com 4 alternativas e justifique o gabarito.
${context ? `Contexto do Módulo/Trilha Atual:\n${context}` : ''}`;

  // Build contents array supporting chat history
  const contents: any[] = [];

  if (history && history.length > 0) {
    for (const msg of history) {
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction: systemInstruction || defaultSystem,
    },
  });

  return response.text || 'Não foi possível gerar uma resposta com o Gemini.';
}

/**
 * Geração de Scripts, Sínteses e Análise de Fontes/Books para o Notebook RACAN
 */
export async function generateNotebookScript({
  bookTitle,
  sources = [],
  query = '',
  mode,
  apiKey,
}: GenerateNotebookScriptParams): Promise<string> {
  const ai = getAiClient(apiKey);

  const sourcesContext = sources.map((s, idx) => `
[Fonte ${idx + 1}] ${s.title} (${s.type.toUpperCase()}${s.author ? ` - ${s.author}` : ''})
${s.summary ? `Resumo: ${s.summary}` : ''}
${s.contentSnippet ? `Trecho: ${s.contentSnippet}` : ''}
`).join('\n');

  let instruction = '';
  let userPrompt = '';

  switch (mode) {
    case 'script':
      instruction = `Você é um roteirista especializado em educação tecnológica e produção de conteúdo executivo para a RACAN.
Gere um roteiro completo de gravação (vídeo ou aula estruturada) ancorado EXCLUSIVAMENTE nas fontes e livros cadastrados neste caderno.
Inclua:
- Gancho de abertura (primeiros 30 segundos);
- Desenvolvimento em 3 blocos lógicos;
- Exemplos práticos do mundo corporativo/técnico;
- Conclusão com call to action e perguntas para reflexão.`;
      userPrompt = query
        ? `Gere um roteiro de vídeo/aula baseado no tema: "${query}". Use as seguintes fontes do caderno "${bookTitle}":\n${sourcesContext}`
        : `Gere um roteiro de vídeo de alto impacto sintetizando os principais ensinamentos das fontes do caderno "${bookTitle}":\n${sourcesContext}`;
      break;

    case 'summary':
      instruction = `Você é um sintetizador executivo da RACAN.
Crie um resumo analítico abrangente, estruturado em tópicos essenciais, destacando termos técnicos, definições normativas e lições fundamentais das fontes informadas.`;
      userPrompt = `Crie uma síntese completa e integrada das seguintes fontes do caderno "${bookTitle}":\n${sourcesContext}${query ? `\n\nFoco especial solicitado pelo usuário: ${query}` : ''}`;
      break;

    case 'feynman':
      instruction = `Aplique a Técnica Feynman às fontes deste caderno:
1. Explicação em linguagem simples (como se estivesse ensinando para alguém inteligente sem conhecimento prévio na área).
2. Identificação dos nós conceituais e lacunas comuns de entendimento.
3. Síntese refinada em 3 regras de ouro aplicáveis na prática.`;
      userPrompt = `Aplique a Técnica Feynman para explicar os conceitos centrais do caderno "${bookTitle}" ancorado nestas fontes:\n${sourcesContext}${query ? `\n\nFoco: ${query}` : ''}`;
      break;

    case 'faq':
      instruction = `Gere uma lista de 5 a 8 Perguntas Frequentes (FAQ) de nível avançado baseadas nas fontes do caderno, acompanhadas de respostas detalhadas e fundamentadas.`;
      userPrompt = `Gere um FAQ de estudo das fontes do caderno "${bookTitle}":\n${sourcesContext}${query ? `\n\nPergunta específica a incluir: ${query}` : ''}`;
      break;

    case 'qa':
    default:
      instruction = `Você é o motor de inteligência do Notebook RACAN, funcionando como um assistente de pesquisa que responde dúvidas embasadas nas fontes e livros anexados ao caderno.`;
      userPrompt = `Com base nas seguintes fontes do caderno "${bookTitle}":\n${sourcesContext}\n\nPergunta do usuário:\n${query}`;
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction: instruction,
    },
  });

  return response.text || 'Não foi possível gerar a síntese do caderno.';
}
