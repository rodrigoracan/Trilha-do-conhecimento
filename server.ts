import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { db } from './src/db/index.ts';
import { certificationsTable, notesTable, studySessionsTable } from './src/db/schema.ts';
import { eq, and } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateGeminiAnswer, generateNotebookScript } from './src/services/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'certificacoes-ia-cloudsql' });
});

// Sync / Upsert user profile
app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || 'user@example.com';
    if (!uid) {
      return res.status(400).json({ error: 'UID missing from token' });
    }
    const user = await getOrCreateUser(uid, email);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Erro ao sincronizar usuário no Cloud SQL' });
  }
});

// GET user certifications from Cloud SQL
app.get('/api/certifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const rows = await db.select().from(certificationsTable).where(eq(certificationsTable.userId, uid));
    const parsed = rows.map((r) => ({
      ...r,
      modules: r.modules ? JSON.parse(r.modules) : [],
      externalResources: r.externalResources ? JSON.parse(r.externalResources) : [],
      simulados: r.simulados ? JSON.parse(r.simulados) : [],
    }));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Erro ao buscar trilhas do banco de dados' });
  }
});

// POST save/update certification in Cloud SQL
app.post('/api/certifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const cert = req.body;
    if (!cert?.id || !cert?.title) {
      return res.status(400).json({ error: 'Dados da trilha incompletos' });
    }

    await db
      .insert(certificationsTable)
      .values({
        id: cert.id,
        userId: uid,
        code: cert.code || 'TRILHA',
        title: cert.title,
        issuer: cert.issuer || '',
        category: cert.category || 'Governança',
        colorTheme: cert.colorTheme || 'teal',
        description: cert.description || '',
        status: cert.status || 'Planejada',
        targetGate: cert.targetGate || 'Gate 1',
        targetMonths: cert.targetMonths || '',
        estimatedHours: cert.estimatedHours || 60,
        hoursSpent: cert.hoursSpent || 0,
        officialUrl: cert.officialUrl || '',
        modules: JSON.stringify(cert.modules || []),
        externalResources: JSON.stringify(cert.externalResources || []),
        simulados: JSON.stringify(cert.simulados || []),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: certificationsTable.id,
        set: {
          code: cert.code || 'TRILHA',
          title: cert.title,
          issuer: cert.issuer || '',
          category: cert.category || 'Governança',
          colorTheme: cert.colorTheme || 'teal',
          description: cert.description || '',
          status: cert.status || 'Planejada',
          targetGate: cert.targetGate || 'Gate 1',
          targetMonths: cert.targetMonths || '',
          estimatedHours: cert.estimatedHours || 60,
          hoursSpent: cert.hoursSpent || 0,
          officialUrl: cert.officialUrl || '',
          modules: JSON.stringify(cert.modules || []),
          externalResources: JSON.stringify(cert.externalResources || []),
          simulados: JSON.stringify(cert.simulados || []),
          updatedAt: new Date(),
        },
      });

    res.json({ success: true, id: cert.id });
  } catch (error: any) {
    console.error('Error saving certification:', error);
    res.status(500).json({ error: 'Erro ao salvar trilha no Cloud SQL' });
  }
});

// DELETE certification from Cloud SQL
app.delete('/api/certifications/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const certId = req.params.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    await db
      .delete(certificationsTable)
      .where(and(eq(certificationsTable.id, certId), eq(certificationsTable.userId, uid)));

    res.json({ success: true, deleted: certId });
  } catch (error: any) {
    console.error('Error deleting certification:', error);
    res.status(500).json({ error: 'Erro ao excluir trilha do Cloud SQL' });
  }
});

// GET notes from Cloud SQL
app.get('/api/notes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const rows = await db.select().from(notesTable).where(eq(notesTable.userId, uid));
    const parsed = rows.map((r) => ({
      ...r,
      tags: r.tags ? JSON.parse(r.tags) : [],
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      links: r.links ? JSON.parse(r.links) : [],
      feynmanDetails: r.feynmanDetails ? JSON.parse(r.feynmanDetails) : undefined,
    }));
    res.json(parsed);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Erro ao buscar notas no Cloud SQL' });
  }
});

// POST save/update note in Cloud SQL
app.post('/api/notes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const note = req.body;
    if (!note?.id || !note?.title) {
      return res.status(400).json({ error: 'Dados da nota incompletos' });
    }

    await db
      .insert(notesTable)
      .values({
        id: note.id,
        userId: uid,
        title: note.title,
        content: note.content || '',
        certificationId: note.certificationId || null,
        technique: note.technique || 'geral',
        tags: JSON.stringify(note.tags || []),
        attachments: JSON.stringify(note.attachments || []),
        links: JSON.stringify(note.links || []),
        feynmanDetails: note.feynmanDetails ? JSON.stringify(note.feynmanDetails) : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: notesTable.id,
        set: {
          title: note.title,
          content: note.content || '',
          certificationId: note.certificationId || null,
          technique: note.technique || 'geral',
          tags: JSON.stringify(note.tags || []),
          attachments: JSON.stringify(note.attachments || []),
          links: JSON.stringify(note.links || []),
          feynmanDetails: note.feynmanDetails ? JSON.stringify(note.feynmanDetails) : null,
          updatedAt: new Date(),
        },
      });

    res.json({ success: true, id: note.id });
  } catch (error: any) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Erro ao salvar nota no Cloud SQL' });
  }
});

// DELETE note from Cloud SQL
app.delete('/api/notes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const noteId = req.params.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    await db.delete(notesTable).where(and(eq(notesTable.id, noteId), eq(notesTable.userId, uid)));
    res.json({ success: true, deleted: noteId });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Erro ao excluir nota no Cloud SQL' });
  }
});

// POST save study session in Cloud SQL
app.post('/api/study-sessions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const session = req.body;
    await db.insert(studySessionsTable).values({
      id: session.id || `session-${Date.now()}`,
      userId: uid,
      date: session.date || new Date().toISOString(),
      minutes: session.minutes || 25,
      certificationId: session.certificationId || null,
      certificationTitle: session.certificationTitle || '',
      mode: session.mode || 'focus',
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving study session:', error);
    res.status(500).json({ error: 'Erro ao registrar sessão de estudo no Cloud SQL' });
  }
});

// Bulk sync all database items from client to Cloud SQL
app.post('/api/cloudsql/sync-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { certifications, notes, studySessions } = req.body;

    if (Array.isArray(certifications)) {
      for (const cert of certifications) {
        await db
          .insert(certificationsTable)
          .values({
            id: cert.id,
            userId: uid,
            code: cert.code || 'TRILHA',
            title: cert.title,
            issuer: cert.issuer || '',
            category: cert.category || 'Governança',
            colorTheme: cert.colorTheme || 'teal',
            description: cert.description || '',
            status: cert.status || 'Planejada',
            targetGate: cert.targetGate || 'Gate 1',
            targetMonths: cert.targetMonths || '',
            estimatedHours: cert.estimatedHours || 60,
            hoursSpent: cert.hoursSpent || 0,
            officialUrl: cert.officialUrl || '',
            modules: JSON.stringify(cert.modules || []),
            externalResources: JSON.stringify(cert.externalResources || []),
            simulados: JSON.stringify(cert.simulados || []),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: certificationsTable.id,
            set: {
              code: cert.code,
              title: cert.title,
              issuer: cert.issuer,
              category: cert.category,
              colorTheme: cert.colorTheme,
              description: cert.description,
              status: cert.status,
              targetGate: cert.targetGate,
              targetMonths: cert.targetMonths,
              estimatedHours: cert.estimatedHours,
              hoursSpent: cert.hoursSpent,
              officialUrl: cert.officialUrl,
              modules: JSON.stringify(cert.modules || []),
              externalResources: JSON.stringify(cert.externalResources || []),
              simulados: JSON.stringify(cert.simulados || []),
              updatedAt: new Date(),
            },
          });
      }
    }

    if (Array.isArray(notes)) {
      for (const note of notes) {
        await db
          .insert(notesTable)
          .values({
            id: note.id,
            userId: uid,
            title: note.title,
            content: note.content || '',
            certificationId: note.certificationId || null,
            technique: note.technique || 'geral',
            tags: JSON.stringify(note.tags || []),
            attachments: JSON.stringify(note.attachments || []),
            links: JSON.stringify(note.links || []),
            feynmanDetails: note.feynmanDetails ? JSON.stringify(note.feynmanDetails) : null,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: notesTable.id,
            set: {
              title: note.title,
              content: note.content || '',
              certificationId: note.certificationId || null,
              technique: note.technique || 'geral',
              tags: JSON.stringify(note.tags || []),
              attachments: JSON.stringify(note.attachments || []),
              links: JSON.stringify(note.links || []),
              feynmanDetails: note.feynmanDetails ? JSON.stringify(note.feynmanDetails) : null,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (Array.isArray(studySessions)) {
      for (const s of studySessions) {
        await db
          .insert(studySessionsTable)
          .values({
            id: s.id,
            userId: uid,
            date: s.date || new Date().toISOString(),
            minutes: s.minutes || 25,
            certificationId: s.certificationId || null,
            certificationTitle: s.certificationTitle || '',
            mode: s.mode || 'focus',
          })
          .onConflictDoNothing();
      }
    }

    res.json({ success: true, message: 'Dados sincronizados com o Cloud SQL PostgreSQL com sucesso!' });
  } catch (error: any) {
    console.error('Error during full sync:', error);
    res.status(500).json({ error: 'Erro ao sincronizar com Cloud SQL' });
  }
});

// --- GEMINI AI INTEGRATION ENDPOINTS ---

// 1. Gemini Chat / Q&A endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, history, context, apiKey, systemInstruction } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'O prompt da pergunta é obrigatório.' });
    }

    const answer = await generateGeminiAnswer({
      prompt,
      history,
      context,
      apiKey,
      systemInstruction,
    });

    res.json({ success: true, text: answer });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    const errorMessage = error?.message || 'Erro ao consultar a API do Gemini.';
    res.status(500).json({
      error: errorMessage,
      details: 'Certifique-se de configurar a variável de ambiente GEMINI_API_KEY ou fornecer sua chave de API nas configurações do assistente.',
    });
  }
});

// 2. Notebook Gemini / NotebookLM Books & Sources Synthesis endpoint
app.post('/api/gemini/notebook-synthesis', async (req: Request, res: Response) => {
  try {
    const { bookTitle, sources, query, mode, apiKey } = req.body;

    if (!bookTitle) {
      return res.status(400).json({ error: 'O título do caderno / book é obrigatório.' });
    }

    const result = await generateNotebookScript({
      bookTitle,
      sources: sources || [],
      query: query || '',
      mode: mode || 'qa',
      apiKey,
    });

    res.json({ success: true, text: result });
  } catch (error: any) {
    console.error('Gemini notebook synthesis error:', error);
    const errorMessage = error?.message || 'Erro ao gerar síntese do caderno com Gemini.';
    res.status(500).json({
      error: errorMessage,
      details: 'Certifique-se de configurar a variável de ambiente GEMINI_API_KEY ou fornecer sua chave de API.',
    });
  }
});

// Setup dev server / static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
