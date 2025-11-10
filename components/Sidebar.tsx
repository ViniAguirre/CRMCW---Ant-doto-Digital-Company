import React from 'react';
import { View } from '../types';
import { GanttChartSquare, PlusCircleIcon, LayoutDashboard, FileText } from './icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-brand-orange/10 text-brand-orange'
        : 'text-chatwoot-text_secondary hover:bg-gray-100 hover:text-brand-black'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <aside className="w-64 bg-white border-r border-chatwoot-border flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Dashboard"
          isActive={currentView === View.Dashboard}
          onClick={() => setCurrentView(View.Dashboard)}
        />
        <NavItem
          icon={<GanttChartSquare className="w-5 h-5" />}
          label="Pipeline"
          isActive={currentView === View.Pipeline}
          onClick={() => setCurrentView(View.Pipeline)}
        />
        <NavItem
          icon={<PlusCircleIcon className="w-5 h-5" />}
          label="Novo Lead"
          isActive={currentView === View.NewLead}
          onClick={() => setCurrentView(View.NewLead)}
        />
        <NavItem
          icon={<FileText className="w-5 h-5" />}
          label="Relatórios"
          isActive={currentView === View.Reports}
          onClick={() => setCurrentView(View.Reports)}
        />
      </nav>
      <div className="p-4 border-t border-chatwoot-border">
        {/* O rodapé ou informações do usuário podem ir aqui */}
      </div>
    </aside>
  );
};
