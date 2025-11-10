
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { getDashboardMetrics } from '../services/crmService';
import { User, Briefcase, TrendingUp, Ticket } from './icons';

interface Metric {
    leadCount: number;
    activeDeals: number;
    conversionRate: number;
    ticketsOpen: number;
    performance: any[];
}

const MetricCard: React.FC<{title: string, value: string, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-chatwoot-text_secondary">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-brand-black">{value}</div>
        </CardContent>
    </Card>
);

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="h-[400px]"><Spinner /></div>;
  }

  if (!metrics) {
    return <div>Erro ao carregar os dados.</div>;
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-brand-black">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Novos Leads" value={`${metrics.leadCount}`} icon={<User className="w-5 h-5 text-chatwoot-text_secondary"/>} />
        <MetricCard title="Negócios Ativos" value={`${metrics.activeDeals}`} icon={<Briefcase className="w-5 h-5 text-chatwoot-text_secondary"/>} />
        <MetricCard title="Taxa de Conversão" value={`${metrics.conversionRate}%`} icon={<TrendingUp className="w-5 h-5 text-chatwoot-text_secondary"/>} />
        <MetricCard title="Tickets Abertos" value={`${metrics.ticketsOpen}`} icon={<Ticket className="w-5 h-5 text-chatwoot-text_secondary"/>} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(254, 101, 0, 0.1)'}}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="leads" name="Leads" fill="#000000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negocios" name="Negócios Fechados" fill="#fe6500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
