import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Certifications tracks table
export const certificationsTable = pgTable('certifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Firebase Auth UID
  code: text('code').notNull(),
  title: text('title').notNull(),
  issuer: text('issuer').notNull(),
  category: text('category').notNull(),
  colorTheme: text('color_theme'),
  description: text('description'),
  status: text('status').notNull(),
  targetGate: text('target_gate'),
  targetMonths: text('target_months'),
  estimatedHours: integer('estimated_hours').default(60),
  hoursSpent: integer('hours_spent').default(0),
  officialUrl: text('official_url'),
  modules: text('modules'), // JSON stringified CertificationModule[]
  externalResources: text('external_resources'), // JSON stringified ExternalResource[]
  simulados: text('simulados'), // JSON stringified Simulado[]
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Study notes with tags, Feynman and attachments
export const notesTable = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Firebase Auth UID
  title: text('title').notNull(),
  content: text('content').notNull(),
  certificationId: text('certification_id'),
  technique: text('technique'),
  tags: text('tags'), // JSON stringified array
  attachments: text('attachments'), // JSON stringified array
  links: text('links'), // JSON stringified array
  feynmanDetails: text('feynman_details'), // JSON stringified object
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Study sessions and pomodoro history
export const studySessionsTable = pgTable('study_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Firebase Auth UID
  date: text('date').notNull(),
  minutes: integer('minutes').notNull(),
  certificationId: text('certification_id'),
  certificationTitle: text('certification_title'),
  mode: text('mode').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
