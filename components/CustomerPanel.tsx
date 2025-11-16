import React, { useState, useEffect } from 'react';
import { getContactDetails, getAccountTags, updateContactTags, createAccountTag, deleteAccountTag, updateAccountTag } from '../services/crmService';
import { Contact, Deal, Activity, AgentStatus, ChatMessage, ActivityType, AccountTag } from '../types';
import { Spinner } from './ui/Spinner';
import { Card, CardContent } from './ui/Card';
import { Info, Briefcase, CalendarCheck, Sparkles } from './icons';
import { TagManager } from './TagManager';

interface CustomerPanelProps {
  contactId: string;
  accountId: string | null;
}

type ActiveTab = 'info' | 'deals' | 'tasks' | 'ia';

interface CustomerData {
    contact: Contact;
    deals: Deal[];
    activities: Activity[];
    agentStatus: AgentStatus;
    chatMessages: ChatMessage[];
}

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors border-b-2 ${
        isActive ? 'text-brand-orange border-brand-orange' : 'text-chatwoot-text_secondary border-transparent hover:bg-gray-50'
    }`}>
        {icon}
        <span className="mt-1">{label}</span>
    </button>
);


const ActivityItem: React.FC<{activity: Activity}> = ({ activity }) => {
    const getIcon = () => {
        switch (activity.type) {
            case ActivityType.Meeting: return '🤝';
            case ActivityType.Call: return '📞';
            case ActivityType.Task: return '✔️';
            case ActivityType.Note: return '📝';
            default: return '📌';
        }
    };

    return (
        <div className="flex items-start space-x-3 py-2 border-b border-chatwoot-border last:border-b-0">
            <div className="text-lg">{getIcon()}</div>
            <div className="flex-1">
                <p className={`text-sm ${activity.completed ? 'line-through text-gray-400' : 'text-chatwoot-text_primary'}`}>{activity.title}</p>
                <p className="text-xs text-chatwoot-text_secondary">{new Date(activity.dueDate).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
            </div>
            <input type="checkbox" checked={activity.completed} readOnly className="mt-1 form-checkbox h-4 w-4 text-brand-orange rounded focus:ring-brand-orange" />
        </div>
    );
};


export const CustomerPanel: React.FC<CustomerPanelProps> = ({ contactId }) => {
  const [data, setData] = useState<CustomerData | null>(null);
  const [allTags, setAllTags] = useState<AccountTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');

  useEffect(() => {
    setLoading(true);
    Promise.all([
        getContactDetails(contactId),
        getAccountTags()
    ]).then(([contactData, tagsData]) => {
      setData(contactData);
      setAllTags(tagsData);
      setLoading(false);
    });
  }, [contactId]);

  const handleTagsUpdate = async (newTags: string[]) => {
    if (!data) return;
    // Optimistic update
    const oldContact = data.contact;
    setData({ ...data, contact: { ...data.contact, tags: newTags } });
    try {
        await updateContactTags(contactId, newTags);
    } catch (error) {
        console.error("Failed to update tags:", error);
        // Revert on failure
        setData({ ...data, contact: oldContact });
    }
  };
  
  const handleTagCreate = async (tag: AccountTag) => {
    try {
        await createAccountTag(tag);
        setAllTags([...allTags, tag]);
    } catch (error) {
        console.error("Failed to create tag:", error);
        // Optionally show an error message to the user
    }
  };

  const handleTagDelete = async (tagTitle: string) => {
     try {
        await deleteAccountTag(tagTitle);
        setAllTags(allTags.filter(t => t.title !== tagTitle));
        // The service mock also removes the tag from the contact, so we refetch or update locally
        if (data && data.contact.tags.includes(tagTitle)) {
             setData({ ...data, contact: { ...data.contact, tags: data.contact.tags.filter(t => t !== tagTitle) } });
        }
    } catch (error) {
        console.error("Failed to delete tag:", error);
    }
  };
  
  const handleTagUpdate = async (oldTitle: string, updatedTag: AccountTag) => {
      try {
        await updateAccountTag(oldTitle, updatedTag);
        setAllTags(allTags.map(t => t.title === oldTitle ? updatedTag : t));
         if (data && data.contact.tags.includes(oldTitle)) {
             setData({ ...data, contact: { ...data.contact, tags: data.contact.tags.map(t => t === oldTitle ? updatedTag.title : t) } });
        }
    } catch (error) {
        console.error("Failed to update tag:", error);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-white">
            <Spinner />
            <p className="mt-4 text-sm text-chatwoot-text_secondary">Carregando informações do cliente...</p>
        </div>
    );
  }

  if (!data) {
    return <div>Erro ao carregar dados do contato.</div>;
  }

  const { contact, deals, activities, agentStatus, chatMessages } = data;

  const renderTabContent = () => {
    switch (activeTab) {
        case 'info': return (
            <CardContent>
                <h4 className="font-semibold text-brand-black mb-2">Detalhes do Contato</h4>
                <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Telefone:</strong> {contact.phone}</p>
                    <p><strong>Status:</strong> <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{contact.status}</span></p>
                    <p><strong>Atendimento IA:</strong> <span className={`font-semibold ${contact.atendimento_ia ? 'text-green-600' : 'text-red-600'}`}>{contact.atendimento_ia ? 'Ativo' : 'Inativo'}</span></p>
                </div>
            </CardContent>
        );
        case 'deals': return (
            <CardContent>
                {deals.length > 0 ? deals.map(deal => (
                    <div key={deal.id} className="py-2 border-b border-chatwoot-border last:border-b-0">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{deal.title}</span>
                            <span className="font-bold text-brand-orange">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}</span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{deal.stage}</span>
                    </div>
                )) : <p className="text-sm text-chatwoot-text_secondary text-center py-4">Nenhum negócio encontrado.</p>}
            </CardContent>
        );
        case 'tasks': return (
            <CardContent>
                 {activities.length > 0 ? activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                 )) : <p className="text-sm text-chatwoot-text_secondary text-center py-4">Nenhuma atividade agendada.</p>}
            </CardContent>
        );
        case 'ia': return (
            <CardContent className="space-y-4">
                 <div>
                    <h4 className="font-semibold text-brand-black mb-1">Status do Agente IA</h4>
                    <p className="text-sm"><strong>Status:</strong> <span className="capitalize">{agentStatus.status}</span></p>
                    <p className="text-sm text-chatwoot-text_secondary mt-1">{agentStatus.summary}</p>
                 </div>
                 <div>
                    <h4 className="font-semibold text-brand-black mb-2">Respostas Recentes</h4>
                    <div className="space-y-2">
                        {chatMessages.map(msg => (
                             <div key={msg.id} className={`p-2 rounded-lg text-sm ${msg.type === 'bot' ? 'bg-orange-50' : 'bg-gray-100'}`}>
                                <p>{msg.message}</p>
                                <p className="text-xs text-right text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            </CardContent>
        );
    }
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="p-4 flex items-start space-x-4 border-b border-chatwoot-border flex-shrink-0">
        <img src={contact.avatarUrl} alt={contact.name} className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-brand-black">{contact.name}</h2>
          <div className="mt-2">
             <TagManager
                contactTags={contact.tags}
                allTags={allTags}
                onTagsUpdate={handleTagsUpdate}
                onTagCreate={handleTagCreate}
                onTagDelete={handleTagDelete}
                onTagUpdate={handleTagUpdate}
             />
          </div>
        </div>
      </div>

      <div className="flex border-b border-chatwoot-border flex-shrink-0">
        <TabButton icon={<Info className="w-5 h-5"/>} label="Info" isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
        <TabButton icon={<Briefcase className="w-5 h-5"/>} label="Negócios" isActive={activeTab === 'deals'} onClick={() => setActiveTab('deals')} />
        <TabButton icon={<CalendarCheck className="w-5 h-5"/>} label="Tarefas" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <TabButton icon={<Sparkles className="w-5 h-5"/>} label="IA" isActive={activeTab === 'ia'} onClick={() => setActiveTab('ia')} />
      </div>

      <div className="overflow-y-auto flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};
