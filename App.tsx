import React, { useState, useEffect, useMemo } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { PipelineView } from './components/PipelineView';
import { Sidebar } from './components/Sidebar';
import { View, Deal, PipelineStage, PipelineStageId } from './types';
import { AntidotoLogo, User } from './components/icons';
import { NewLeadForm } from './components/NewLeadForm';
import { getDealsByStage, PIPELINE_STAGES, updateDealStage } from './services/crmService';
import { Toast, ToastData } from './components/ui/Toast';
import { Dashboard } from './components/Dashboard';
import { ReportsView } from './components/ReportsView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [contactId, setContactId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  // State lifted from PipelineView
  const [dealsByStage, setDealsByStage] = useState<{ [key: string]: Deal[] }>({});
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isPipelineLoading, setPipelineLoading] = useState(true);

  const fetchPipelineData = () => {
    setPipelineLoading(true);
    getDealsByStage().then(data => {
      setDealsByStage(data);
      setPipelineLoading(false);
    });
  };

  useEffect(() => {
    setStages(PIPELINE_STAGES);
    fetchPipelineData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactIdParam = params.get('contact_id');
    const accountIdParam = params.get('account_id');

    if (contactIdParam) {
      setContactId(contactIdParam);
      setAccountId(accountIdParam);
      setCurrentView(View.Customer);
    } else {
      setCurrentView(View.Dashboard); // Default view is now Dashboard
    }
  }, []);
  
  const showToast = (message: string, type: 'success' | 'error', duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };
  
  const handleLeadCreated = () => {
    showToast('Lead criado com sucesso!', 'success');
    fetchPipelineData(); // Refetch data to include the new lead
    setCurrentView(View.Pipeline);
  };

  const handleDealStageChange = (deal: Deal, newStageId: PipelineStageId) => {
      const sourceStageId = deal.stage;

      // Optimistic UI update
      setDealsByStage(prev => {
        const newDealsByStage = { ...prev };
        
        newDealsByStage[sourceStageId] = newDealsByStage[sourceStageId]?.filter(d => d.id !== deal.id) || [];
        
        const destinationDeals = [...(newDealsByStage[newStageId] || [])];
        destinationDeals.push({ ...deal, stage: newStageId });
        newDealsByStage[newStageId] = destinationDeals;
        
        return newDealsByStage;
      });

      // Simulate API call
      updateDealStage(deal.id, newStageId).catch(() => {
        showToast('Erro ao atualizar negócio.', 'error');
        // Revert UI on failure
        fetchPipelineData();
      });

      // Show specific toast for mirrored stages
      if (['marketing', 'won', 'lost'].includes(newStageId)) {
        const stageTitle = stages.find(s => s.id === newStageId)?.title || 'etapa';
        showToast(`Movido para "${stageTitle}" e espelhado nos relatórios.`, 'success');
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard />;
      case View.Pipeline:
        return <PipelineView 
                    stages={stages}
                    setStages={setStages}
                    dealsByStage={dealsByStage}
                    onDealStageChange={handleDealStageChange}
                    isLoading={isPipelineLoading}
                />;
      case View.Reports:
        return <ReportsView />;
      case View.Customer:
        if (contactId) {
          return <CustomerPanel contactId={contactId} accountId={accountId} />;
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-chatwoot-text_secondary p-8">
              <User className="w-16 h-16 mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-chatwoot-text_primary">Nenhum Contato Selecionado</h2>
              <p className="mt-2 max-w-md">Este painel foi projetado para ser aberto a partir de uma conversa no Chatwoot. Selecione uma conversa para ver os detalhes do contato aqui.</p>
          </div>
        );
      case View.NewLead:
        return <NewLeadForm onLeadCreated={handleLeadCreated} showToast={showToast} />;
      default:
        return <Dashboard />;
    }
  };
  
  const isChatwootView = useMemo(() => !!contactId, [contactId]);

  return (
    <div className="flex h-screen font-sans bg-chatwoot-background text-chatwoot-text_primary">
      {!isChatwootView && <Sidebar currentView={currentView} setCurrentView={setCurrentView} />}
      <main className="flex-1 flex flex-col min-w-0">
        {isChatwootView && (
             <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-chatwoot-border">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-brand-black rounded-md">
                        <AntidotoLogo className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-lg font-semibold text-brand-black">CRM Antídoto Digital</h1>
                </div>
            </header>
        )}
        <div className={`flex-1 overflow-y-auto ${isChatwootView ? "" : "p-4 md:p-6 lg:p-8"}`}>
            {renderContent()}
        </div>
        <footer className="flex-shrink-0 text-center p-4 border-t border-chatwoot-border text-xs text-chatwoot-text_secondary bg-white">
          Antídoto Digital Company - Todos os direitos reservados
        </footer>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;