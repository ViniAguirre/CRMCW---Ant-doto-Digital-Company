import { Contact, Deal, Activity, AgentStatus, ChatMessage, PipelineStageId, PipelineStage, ActivityType, AccountTag, Inbox, MirroredDeal } from '../types';

const MOCK_DELAY = 500;

let contacts: Contact[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@example.com', phone: '+55 11 98765-4321', tags: ['VIP', 'Marketing'], status: 'Ativo', avatarUrl: 'https://picsum.photos/seed/ana/100/100', atendimento_ia: true },
  { id: '2', name: 'Bruno Costa', email: 'bruno.costa@example.com', phone: '+55 21 91234-5678', tags: ['Lead'], status: 'Novo', avatarUrl: 'https://picsum.photos/seed/bruno/100/100', atendimento_ia: false },
  { id: '3', name: 'Carla Dias', email: 'carla.dias@example.com', phone: '+55 31 95555-8888', tags: ['Suporte'], status: 'Em Atendimento', avatarUrl: 'https://picsum.photos/seed/carla/100/100', atendimento_ia: true },
];

let deals: Deal[] = [
  { id: 'd1', contactId: '1', contactName: 'Ana Silva', title: 'Consultoria de Marketing Digital', value: 15000, stage: 'proposal', lastContact: '2024-07-28' },
  { id: 'd2', contactId: '2', contactName: 'Bruno Costa', title: 'Desenvolvimento de Website', value: 8000, stage: 'qualified', lastContact: '2024-07-29' },
  { id: 'd3', contactId: '1', contactName: 'Ana Silva', title: 'Gestão de Redes Sociais', value: 5000, stage: 'won', lastContact: '2024-07-15' },
  { id: 'd4', contactId: '3', contactName: 'Carla Dias', title: 'Plano de Suporte Premium', value: 2500, stage: 'lead', lastContact: '2024-07-30' },
];

// Mock "spreadsheet" tables for mirrored deals
let deals_marketing_return: MirroredDeal[] = [];
let deals_won: MirroredDeal[] = deals.filter(d => d.stage === 'won').map(d => ({...d, moved_at: d.lastContact}));
let deals_lost: MirroredDeal[] = [];


let activities: Activity[] = [
    { id: 'a1', contactId: '1', type: ActivityType.Meeting, title: 'Reunião de alinhamento de proposta', dueDate: '2024-08-02', completed: false },
    { id: 'a2', contactId: '1', type: ActivityType.Call, title: 'Ligar para follow-up', dueDate: '2024-08-05', completed: false },
    { id: 'a3', contactId: '2', type: ActivityType.Task, title: 'Enviar e-mail de qualificação', dueDate: '2024-07-31', completed: true },
    { id: 'a4', contactId: '3', type: ActivityType.Note, title: 'Cliente mencionou interesse em SEO', dueDate: '2024-07-30', completed: true },
];

const agentStatus: { [key: string]: AgentStatus } = {
    '1': { status: 'active', lastActivity: '2024-07-30 10:05:12', summary: 'Analisou o histórico de compras e sugeriu um novo produto com base no interesse em marketing de conteúdo.' },
    '2': { status: 'idle', lastActivity: '2024-07-29 15:20:01', summary: 'Aguardando resposta do cliente para agendar demonstração.' },
    '3': { status: 'processing', lastActivity: '2024-07-30 11:00:00', summary: 'Processando a solicitação de suporte técnico sobre a integração da API.' },
};

const chatMessages: { [key: string]: ChatMessage[] } = {
    '1': [
        { id: 'm1', type: 'bot', message: 'Olá Ana, percebi que você se interessou por nossos serviços de SEO. Posso ajudar com mais informações?', timestamp: '2024-07-30 10:05:00' },
        { id: 'm2', type: 'user', message: 'Sim, gostaria de saber mais sobre os pacotes.', timestamp: '2024-07-30 10:05:30' },
    ],
    '2': [
        { id: 'm3', type: 'bot', message: 'Bem-vindo, Bruno! Como posso ajudar você hoje?', timestamp: '2024-07-29 15:19:00' },
        { id: 'm4', type: 'user', message: 'Queria um orçamento para um site novo.', timestamp: '2024-07-29 15:19:45' },
    ],
    '3': [
        { id: 'm5', type: 'user', message: 'Estou com um problema na minha conta.', timestamp: '2024-07-30 10:59:30' },
        { id: 'm6', type: 'bot', message: 'Claro, Carla. Estou verificando seu histórico para entender melhor. Um momento.', timestamp: '2024-07-30 10:59:55' },
    ],
};

let ACCOUNT_TAGS: AccountTag[] = [
    { title: 'VIP', color: '#7c3aed' },
    { title: 'Marketing', color: '#db2777' },
    { title: 'Lead', color: '#2563eb' },
    { title: 'Suporte', color: '#f59e0b' },
    { title: 'Interesse-SEO', color: '#10b981' },
    { title: 'Reclamacao', color: '#ef4444' },
];

const MOCK_INBOXES: Inbox[] = [
    { id: 1, name: 'WhatsApp' },
    { id: 2, name: 'Website Chat' },
    { id: 3, name: 'Instagram' },
];

export const getInboxes = (): Promise<Inbox[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_INBOXES), MOCK_DELAY / 2);
    });
};

export const checkDuplicate = (email?: string, phone?: string): Promise<{ isDuplicate: boolean; contactId: string | null }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const existingContact = contacts.find(c => 
                (email && c.email.toLowerCase() === email.toLowerCase()) || 
                (phone && c.phone === phone)
            );
            resolve({
                isDuplicate: !!existingContact,
                contactId: existingContact?.id || null,
            });
        }, MOCK_DELAY);
    });
};

interface CreateLeadPayload {
    fullName: string;
    email?: string;
    phoneNumber?: string;
    value?: number;
    inboxId: number;
    startConversation: boolean;
}
interface CreateLeadResponse {
    ok: boolean;
    chatwoot_contact_id: number;
    conversation_id?: number;
    crm_contact_id: string;
    deal_id: string;
}

export const createLead = (payload: CreateLeadPayload): Promise<CreateLeadResponse> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const crm_contact_id = `c${Date.now()}`;
            const newContact: Contact = {
                id: crm_contact_id,
                name: payload.fullName,
                email: payload.email || '',
                phone: payload.phoneNumber || '',
                tags: ['Lead'],
                status: 'Novo',
                avatarUrl: `https://picsum.photos/seed/${payload.fullName}/100/100`,
                atendimento_ia: false,
            };
            contacts.push(newContact);

            const deal_id = `d${Date.now()}`;
            const newDeal: Deal = {
                id: deal_id,
                contactId: crm_contact_id,
                contactName: newContact.name,
                title: `Negócio para ${newContact.name}`,
                value: payload.value || 0,
                stage: 'lead',
                lastContact: new Date().toISOString().split('T')[0],
            };
            deals.push(newDeal);
            
            const response: CreateLeadResponse = {
                ok: true,
                chatwoot_contact_id: Math.floor(Math.random() * 1000) + 100,
                crm_contact_id,
                deal_id,
            };

            if (payload.startConversation) {
                response.conversation_id = Math.floor(Math.random() * 1000) + 500;
            }

            resolve(response);
        }, MOCK_DELAY);
    });
};


export const getContactDetails = (contactId: string): Promise<{ contact: Contact; deals: Deal[]; activities: Activity[]; agentStatus: AgentStatus; chatMessages: ChatMessage[] }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const contact = contacts.find(c => c.id === contactId) || contacts[0];
      resolve({
        contact,
        deals: deals.filter(d => d.contactId === contact.id),
        activities: activities.filter(a => a.contactId === contact.id),
        agentStatus: agentStatus[contact.id],
        chatMessages: chatMessages[contact.id],
      });
    }, MOCK_DELAY);
  });
};

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'lead', title: 'Lead', color: 'bg-blue-500' },
  { id: 'qualified', title: 'Qualificado', color: 'bg-purple-500' },
  { id: 'proposal', title: 'Proposta', color: 'bg-yellow-500' },
  { id: 'marketing', title: 'Voltar ao Marketing', color: 'bg-pink-500' },
  { id: 'won', title: 'Ganho (Virou cliente)', color: 'bg-green-500' },
  { id: 'lost', title: 'Perdido', color: 'bg-red-500' },
];

export const getDealsByStage = (): Promise<{ [key: string]: Deal[] }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const dealsByStage = deals.reduce((acc, deal) => {
        if (!acc[deal.stage]) {
          acc[deal.stage] = [];
        }
        acc[deal.stage].push(deal);
        return acc;
      }, {} as { [key: string]: Deal[] });
      
      PIPELINE_STAGES.forEach(stage => {
        if (!dealsByStage[stage.id]) {
          dealsByStage[stage.id] = [];
        }
      });
      
      resolve(dealsByStage);
    }, MOCK_DELAY);
  });
};

// --- Deal Stage Update & Mirroring Logic ---

// Simulates the database trigger `fn_sync_deal_stage_to_sheets`
const syncDealToSheet = (deal: Deal) => {
    // 1. Delete from all "sheet" tables to ensure no duplicates
    deals_marketing_return = deals_marketing_return.filter(d => d.id !== deal.id);
    deals_won = deals_won.filter(d => d.id !== deal.id);
    deals_lost = deals_lost.filter(d => d.id !== deal.id);

    const mirroredDeal: MirroredDeal = {
        id: deal.id,
        title: deal.title,
        contactName: deal.contactName,
        value: deal.value,
        moved_at: new Date().toISOString(),
    };

    // 2. Insert into the correct table based on the new stage
    if (deal.stage === 'marketing') {
        deals_marketing_return.push(mirroredDeal);
    } else if (deal.stage === 'won') {
        deals_won.push(mirroredDeal);
    } else if (deal.stage === 'lost') {
        deals_lost.push(mirroredDeal);
    }
};

export const updateDealStage = (dealId: string, newStageId: PipelineStageId): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const dealIndex = deals.findIndex(d => d.id === dealId);
            if (dealIndex > -1) {
                deals[dealIndex].stage = newStageId;
                deals[dealIndex].lastContact = new Date().toISOString().split('T')[0];
                syncDealToSheet(deals[dealIndex]); // Simulate the trigger
                resolve();
            } else {
                reject(new Error("Deal not found"));
            }
        }, MOCK_DELAY / 2);
    });
};


// FIX: Export getDashboardMetrics function to provide data for the Dashboard component.
export const getDashboardMetrics = (): Promise<{ leadCount: number; activeDeals: number; conversionRate: number; ticketsOpen: number; performance: any[] }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const leadCount = contacts.filter(c => c.tags.includes('Lead')).length;
            const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
            const wonDealsCount = deals.filter(d => d.stage === 'won').length;
            const conversionRate = deals.length > 0 ? Math.round((wonDealsCount / deals.length) * 100) : 0;
            const ticketsOpen = 12; // Mock value

            const performance = [
                { name: 'Seg', leads: 4, negocios: 1 },
                { name: 'Ter', leads: 3, negocios: 2 },
                { name: 'Qua', leads: 5, negocios: 1 },
                { name: 'Qui', leads: 2, negocios: 3 },
                { name: 'Sex', leads: 6, negocios: 2 },
                { name: 'Sáb', leads: 1, negocios: 0 },
                { name: 'Dom', leads: 2, negocios: 1 },
            ];

            resolve({
                leadCount,
                activeDeals,
                conversionRate,
                ticketsOpen,
                performance,
            });
        }, MOCK_DELAY);
    });
};


// --- Reports Service Functions ---
export interface ReportsData {
    marketingReturn: { count: number; totalValue: number };
    won: { count: number; totalValue: number };
    lost: { count: number; totalValue: number };
}

export const getReportsData = (): Promise<ReportsData> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const marketingReturn = {
                count: deals_marketing_return.length,
                totalValue: deals_marketing_return.reduce((sum, d) => sum + d.value, 0),
            };
            const won = {
                count: deals_won.length,
                totalValue: deals_won.reduce((sum, d) => sum + d.value, 0),
            };
            const lost = {
                count: deals_lost.length,
                totalValue: deals_lost.reduce((sum, d) => sum + d.value, 0),
            };
            resolve({ marketingReturn, won, lost });
        }, MOCK_DELAY);
    });
}


// --- Tag Management Service Functions ---

export const getAccountTags = (): Promise<AccountTag[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...ACCOUNT_TAGS]);
    }, MOCK_DELAY / 2);
  });
};

export const updateContactTags = (contactId: string, newTags: string[]): Promise<Contact> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const contactIndex = contacts.findIndex(c => c.id === contactId);
            if (contactIndex > -1) {
                contacts[contactIndex].tags = newTags;
                resolve(contacts[contactIndex]);
            } else {
                reject(new Error("Contact not found"));
            }
        }, MOCK_DELAY / 2)
    })
};

export const createAccountTag = (tag: AccountTag): Promise<AccountTag> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (ACCOUNT_TAGS.some(t => t.title.toLowerCase() === tag.title.toLowerCase())) {
                reject(new Error("Tag already exists"));
            } else {
                ACCOUNT_TAGS.push(tag);
                resolve(tag);
            }
        }, MOCK_DELAY / 2);
    });
};

export const deleteAccountTag = (tagTitle: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            ACCOUNT_TAGS = ACCOUNT_TAGS.filter(t => t.title !== tagTitle);
            // Also remove from all contacts
            contacts = contacts.map(c => ({
                ...c,
                tags: c.tags.filter(t => t !== tagTitle),
            }));
            resolve();
        }, MOCK_DELAY / 2);
    });
};

export const updateAccountTag = (oldTitle: string, updatedTag: AccountTag): Promise<AccountTag> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const tagIndex = ACCOUNT_TAGS.findIndex(t => t.title === oldTitle);
            if (tagIndex > -1) {
                ACCOUNT_TAGS[tagIndex] = updatedTag;
                // Update in all contacts
                contacts = contacts.map(c => ({
                    ...c,
                    tags: c.tags.map(t => (t === oldTitle ? updatedTag.title : t)),
                }));
                resolve(updatedTag);
            } else {
                reject(new Error("Tag not found"));
            }
        }, MOCK_DELAY / 2);
    });
};