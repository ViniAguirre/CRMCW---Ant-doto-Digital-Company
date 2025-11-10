export enum View {
  Pipeline = 'PIPELINE',
  Customer = 'CUSTOMER',
  NewLead = 'NEW_LEAD',
  Dashboard = 'DASHBOARD',
  Reports = 'REPORTS',
}

export type PipelineStageId = string;

export interface PipelineStage {
  id: PipelineStageId;
  title: string;
  color: string;
}

export interface AccountTag {
  title: string;
  color: string; // e.g., '#fe6500'
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[]; // Array of tag titles
  status: string;
  avatarUrl: string;
  atendimento_ia: boolean;
}

export interface Deal {
  id: string;
  contactId: string;
  contactName: string;
  title: string;
  value: number;
  stage: PipelineStageId;
  lastContact: string;
}

export enum ActivityType {
    Task = 'task',
    Call = 'call',
    Meeting = 'meeting',
    Note = 'note',
}

export interface Activity {
  id: string;
  contactId: string;
  type: ActivityType;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface AgentStatus {
    status: 'active' | 'idle' | 'processing';
    lastActivity: string;
    summary: string;
}

export interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    message: string;
    timestamp: string;
}

// Added for the new lead creation form
export interface Inbox {
    id: number;
    name: string;
}

// Added for reports
export interface MirroredDeal {
  id: string;
  contactName: string;
  title: string;
  value: number;
  moved_at: string;
}
