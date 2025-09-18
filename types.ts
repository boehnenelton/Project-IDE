import type { Tool } from '@google/genai';

export type Page = 'editor' | 'documents' | 'staging' | 'history' | 'downloads' | 'gemini-api';

export interface EditorFile {
  id: string;
  path: string; // e.g., "src/components/Button.tsx"
  content: string;
  language: string;
}

export interface GeneratedFile {
  id: string;
  projectName: string;
  fileName: string;
  version: string;
  content: string;
}

export interface AIProfile {
  Name: string;
  Archetype: string;
  Persona: string;
  SystemInstruction: string;
  TaskSpecialization:string;
  Tone: string[];
  GoogleSearch_Enabled: boolean;
  CodeInterpreter_Enabled: boolean;
}

export interface Interaction {
  id: string;
  timestamp: string;
  profileName: string;
  prompt: string;
  response: string;
  attachedImageName: string | null;
}