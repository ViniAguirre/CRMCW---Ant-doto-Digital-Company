import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { getReportsData, ReportsData } from '../services/crmService';
import { RotateCcw, TrendingUp, TrendingDown, DollarSign } from './icons';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ReportCard: React.FC<{
  title: string,
  data: { count: number, totalValue: number },
  icon: React.ReactNode,
  colorClass: string
}> = ({ title, data, icon, colorClass }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-chatwoot-text_secondary">{title}</CardTitle>
            <div className={`${colorClass} text-white rounded-full p-2`}>
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-brand-black">{data.count}</div>
            <p className="text-sm text-chatwoot-text_secondary flex items-center mt-1">
                <DollarSign className="w-4 h-4 mr-1"/>
                {formatCurrency(data.totalValue)}
            </p>
        </CardContent>
    </Card>
);

export const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReportsData().then(data => {
      setReports(data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-full"><Spinner /></div>;
  }

  if (!reports) {
    return <div className="text-center p-8 text-chatwoot-text_secondary">Erro ao carregar os relatórios.</div>;
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-brand-black">Relatórios de Negócios</h1>
       <p className="text-chatwoot-text_secondary">Visão geral dos negócios que foram movidos para estágios finais no funil.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ReportCard 
          title="Voltou ao Marketing" 
          data={reports.marketingReturn} 
          icon={<RotateCcw className="w-5 h-5"/>} 
          colorClass="bg-pink-500"
        />
        <ReportCard 
          title="Ganhos (Virou Cliente)" 
          data={reports.won} 
          icon={<TrendingUp className="w-5 h-5"/>} 
          colorClass="bg-green-500"
        />
        <ReportCard 
          title="Perdidos" 
          data={reports.lost} 
          icon={<TrendingDown className="w-5 h-5"/>} 
          colorClass="bg-red-500"
        />
      </div>
    </div>
  );
};
