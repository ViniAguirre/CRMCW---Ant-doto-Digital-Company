

import React, { useState, useMemo } from 'react';
import { Deal, PipelineStageId, PipelineStage } from '../types';
import { Spinner } from './ui/Spinner';
import { Card, CardContent } from './ui/Card';
import { TrashIcon, PlusCircleIcon } from './icons';

const DealCard: React.FC<{ 
    deal: Deal; 
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, deal: Deal) => void;
    onDragEnd: (e: React.DragEvent) => void;
}> = ({ deal, isDragging, onDragStart, onDragEnd }) => (
  <Card 
    className={`mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${isDragging ? 'opacity-50 shadow-lg scale-105' : ''}`}
    draggable
    onDragStart={(e) => onDragStart(e, deal)}
    onDragEnd={onDragEnd}
  >
    <CardContent className="p-3">
      <h4 className="font-semibold text-sm text-brand-black">{deal.title}</h4>
      <p className="text-xs text-chatwoot-text_secondary mt-1">{deal.contactName}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-bold text-brand-orange">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(deal.lastContact).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </CardContent>
  </Card>
);

const PipelineColumn: React.FC<{ 
    stage: PipelineStage; 
    deals: Deal[];
    isDragOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, stage: PipelineStage) => void;
    draggedDeal: Deal | null;
    handleDealDragStart: (e: React.DragEvent, deal: Deal) => void;
    handleDragEnd: (e: React.DragEvent) => void;
    editingStageId: PipelineStageId | null;
    setEditingStageId: (id: PipelineStageId | null) => void;
    onStageTitleChange: (stageId: PipelineStageId, newTitle: string) => void;
    onDeleteStage: (stageId: PipelineStageId) => void;
    onStageDragStart: (e: React.DragEvent, stage: PipelineStage) => void;
    isBeingDragged: boolean;
    isLocked: boolean;
}> = ({ 
    stage, 
    deals, 
    isDragOver, 
    onDragOver, 
    onDragLeave, 
    onDrop, 
    draggedDeal, 
    handleDealDragStart, 
    handleDragEnd, 
    editingStageId, 
    setEditingStageId, 
    onStageTitleChange, 
    onDeleteStage,
    onStageDragStart,
    isBeingDragged,
    isLocked,
}) => {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  
  const handleTitleUpdate = (value: string) => {
    if (value.trim()) {
      onStageTitleChange(stage.id, value);
    }
    setEditingStageId(null);
  };

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, stage)}
      className={`flex-shrink-0 w-72 bg-gray-50 rounded-lg transition-all flex flex-col border ${isDragOver ? 'bg-brand-orange/10 border-brand-orange/50 shadow-md' : 'border-gray-200'} ${isBeingDragged ? 'opacity-50' : ''}`}
    >
      <div 
        draggable={!isLocked}
        onDragStart={(e) => onStageDragStart(e, stage)}
        onDragEnd={handleDragEnd}
        className={`group p-3 border-b border-chatwoot-border space-y-2 ${!isLocked ? 'cursor-move' : 'cursor-default'}`}
      >
        <div className="flex items-center justify-between">
            <div className="flex items-center w-full mr-2">
                <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${stage.color}`}></span>
                {editingStageId === stage.id && !isLocked ? (
                    <input
                        type="text"
                        defaultValue={stage.title}
                        autoFocus
                        onBlur={(e) => handleTitleUpdate(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTitleUpdate((e.target as HTMLInputElement).value);
                            else if (e.key === 'Escape') setEditingStageId(null);
                        }}
                        className="font-semibold text-sm text-brand-black bg-white border border-brand-orange rounded px-1 py-0.5 -ml-1 focus:outline-none focus:ring-1 focus:ring-brand-orange w-full"
                    />
                ) : (
                    <h3 onClick={() => !isLocked && setEditingStageId(stage.id)} className={`font-semibold text-sm text-brand-black ${!isLocked ? 'cursor-pointer hover:bg-gray-200' : ''} px-1 py-0.5 -ml-1 rounded truncate`} title={stage.title}>
                        {stage.title}
                    </h3>
                )}
            </div>
            <div className="flex items-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">{deals.length}</span>
                {!isLocked && (
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => onDeleteStage(stage.id)}
                        className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Excluir coluna"
                        title="Excluir coluna"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
        <p className="text-sm font-bold text-chatwoot-text_primary text-left">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {deals.map(deal => (
          <DealCard 
              key={deal.id} 
              deal={deal}
              isDragging={draggedDeal?.id === deal.id}
              onDragStart={handleDealDragStart}
              onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

const ConfirmationModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
      <h3 id="dialog-title" className="text-lg font-bold text-brand-black">{title}</h3>
      <p className="mt-2 text-sm text-chatwoot-text_secondary">{message}</p>
      <div className="mt-6 flex justify-end space-x-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
          Cancelar
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          Excluir
        </button>
      </div>
    </div>
  </div>
);

interface PipelineViewProps {
    stages: PipelineStage[];
    setStages: React.Dispatch<React.SetStateAction<PipelineStage[]>>;
    dealsByStage: { [key: string]: Deal[] };
    onDealStageChange: (deal: Deal, newStageId: PipelineStageId) => void;
    isLoading: boolean;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
    stages,
    setStages,
    dealsByStage,
    onDealStageChange,
    isLoading
}) => {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [draggedStage, setDraggedStage] = useState<PipelineStage | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStageId | null>(null);
  const [editingStageId, setEditingStageId] = useState<PipelineStageId | null>(null);
  const [stageToDelete, setStageToDelete] = useState<PipelineStage | null>(null);

  const lockedStageIds = useMemo(() => ['won', 'marketing', 'lost'], []);

  const orderedLockedStages = useMemo(() => lockedStageIds
    .map(id => stages.find(s => s.id === id))
    .filter((s): s is PipelineStage => s !== undefined), [stages, lockedStageIds]);

  const movableStages = useMemo(() => stages.filter(s => !lockedStageIds.includes(s.id)), [stages, lockedStageIds]);


  const handleStageTitleChange = (stageId: PipelineStageId, newTitle: string) => {
    setStages(prevStages =>
        prevStages.map(stage =>
            stage.id === stageId ? { ...stage, title: newTitle.trim() } : stage
        )
    );
    setEditingStageId(null);
  };
  
  const handleAddStage = () => {
    const newId = `stage_${new Date().getTime()}`;
    const newStage: PipelineStage = {
        id: newId,
        title: 'Nova Etapa',
        color: ['bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-gray-500'][Math.floor(Math.random() * 4)],
    };
    const newMovable = [...movableStages, newStage];
    setStages([...newMovable, ...orderedLockedStages]);
    setEditingStageId(newId);
  };

  const handleDeleteStageRequest = (stageId: PipelineStageId) => {
    if (lockedStageIds.includes(stageId)) return;
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      setStageToDelete(stage);
    }
  };

  const confirmDeleteStage = () => {
    if (!stageToDelete) return;

    const newMovableStages = movableStages.filter(stage => stage.id !== stageToDelete.id);
    setStages([...newMovableStages, ...orderedLockedStages]);
    setStageToDelete(null);
  };


  const handleDealDragStart = (e: React.DragEvent, deal: Deal) => {
    e.stopPropagation(); // Impede que o arrasto da coluna seja acionado
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
  };

  const handleStageDragStart = (e: React.DragEvent, stage: PipelineStage) => {
    if (lockedStageIds.includes(stage.id)) {
        e.preventDefault();
        return;
    }
    setDraggedStage(stage);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDraggedStage(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: PipelineStageId) => {
    e.preventDefault();
    if ((draggedDeal || draggedStage) && stageId !== dragOverStage) {
        setDragOverStage(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    
    // Lidar com a soltura do Negócio
    if (draggedDeal && draggedDeal.stage !== targetStage.id) {
        onDealStageChange(draggedDeal, targetStage.id);
    }

    // Lidar com a soltura da Coluna (Estágio)
    const isTargetLocked = lockedStageIds.includes(targetStage.id);
    if (draggedStage && draggedStage.id !== targetStage.id && !isTargetLocked) {
        const newMovable = [...movableStages];
        const draggedIndex = newMovable.findIndex(s => s.id === draggedStage.id);
        const targetIndex = newMovable.findIndex(s => s.id === targetStage.id);
        
        if (draggedIndex > -1 && targetIndex > -1) {
            const [removed] = newMovable.splice(draggedIndex, 1);
            newMovable.splice(targetIndex, 0, removed);
            setStages([...newMovable, ...orderedLockedStages]);
        }
    }

    handleDragEnd();
  };

  if (isLoading) {
    return <div className="h-full"><Spinner /></div>;
  }

  return (
    <div className="flex flex-col h-full">
       {stageToDelete && (
        <ConfirmationModal
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a coluna "${stageToDelete.title}"? Esta ação também removerá todos os negócios dentro dela.`}
          onConfirm={confirmDeleteStage}
          onCancel={() => setStageToDelete(null)}
        />
      )}
      <h1 className="text-2xl font-bold text-brand-black mb-6 flex-shrink-0">Pipeline de Vendas</h1>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-0">
        {movableStages.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            isDragOver={dragOverStage === stage.id && (!!draggedDeal || !!draggedStage) && (draggedDeal?.stage !== stage.id || draggedStage?.id !== stage.id)}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedDeal={draggedDeal}
            handleDealDragStart={handleDealDragStart}
            handleDragEnd={handleDragEnd}
            editingStageId={editingStageId}
            setEditingStageId={setEditingStageId}
            onStageTitleChange={handleStageTitleChange}
            onDeleteStage={handleDeleteStageRequest}
            onStageDragStart={handleStageDragStart}
            isBeingDragged={draggedStage?.id === stage.id}
            isLocked={false}
          />
        ))}
        {orderedLockedStages.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            isDragOver={dragOverStage === stage.id && !!draggedDeal && draggedDeal?.stage !== stage.id}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedDeal={draggedDeal}
            handleDealDragStart={handleDealDragStart}
            handleDragEnd={handleDragEnd}
            editingStageId={editingStageId}
            setEditingStageId={setEditingStageId}
            onStageTitleChange={handleStageTitleChange}
            onDeleteStage={handleDeleteStageRequest}
            onStageDragStart={handleStageDragStart}
            isBeingDragged={false}
            isLocked={true}
          />
        ))}
         <div className="flex-shrink-0 w-72">
            <button 
                onClick={handleAddStage}
                className="w-full h-12 flex items-center justify-center text-sm font-semibold text-chatwoot-text_secondary bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-brand-orange hover:text-brand-orange"
            >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Adicionar Coluna
            </button>
        </div>
      </div>
    </div>
  );
};