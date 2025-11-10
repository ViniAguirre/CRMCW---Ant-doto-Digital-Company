import React, { useState, useEffect } from 'react';
import { getInboxes, checkDuplicate, createLead } from '../services/crmService';
import { Inbox } from '../types';
import { Spinner } from './ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { User } from './icons';

interface NewLeadFormProps {
    onLeadCreated: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-black mb-1">{label}</label>
        <input
            id={id}
            className="w-full px-3 py-2 text-sm bg-white border border-chatwoot-border rounded-md focus:ring-brand-orange focus:border-brand-orange"
            {...props}
        />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-black mb-1">{label}</label>
        <select
            id={id}
            className="w-full px-3 py-2 text-sm bg-white border border-chatwoot-border rounded-md focus:ring-brand-orange focus:border-brand-orange"
            {...props}
        >
            {children}
        </select>
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center">
        <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`${enabled ? 'bg-brand-orange' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange`}
            role="switch"
            aria-checked={enabled}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
        <span className="ml-3 text-sm font-medium text-brand-black">{label}</span>
    </div>
);

export const NewLeadForm: React.FC<NewLeadFormProps> = ({ onLeadCreated, showToast }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [value, setValue] = useState('');
    const [inboxId, setInboxId] = useState<number | undefined>(undefined);
    const [startConversation, setStartConversation] = useState(true);

    const [inboxes, setInboxes] = useState<Inbox[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingInboxes, setLoadingInboxes] = useState(true);

    useEffect(() => {
        getInboxes().then(data => {
            setInboxes(data);
            if (data.length > 0) {
                setInboxId(data[0].id);
            }
            setLoadingInboxes(false);
        });
    }, []);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || (!email && !phone) || !inboxId) {
            showToast('Preencha o nome and e-mail ou telefone.', 'error');
            return;
        }
        setLoading(true);

        try {
            const { isDuplicate } = await checkDuplicate(email, phone);
            if (isDuplicate) {
                showToast('Já existe um contato com este e-mail ou telefone.', 'error');
                setLoading(false);
                return;
            }

            await createLead({
                fullName,
                email,
                phoneNumber: phone,
                value: value ? parseFloat(value) : 0,
                inboxId,
                startConversation,
            });

            onLeadCreated();

        } catch (error) {
            console.error(error);
            showToast('Ocorreu um erro ao criar o lead.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold text-brand-black mb-6">Criar Novo Lead</h1>
            <div className="max-w-xl mx-auto w-full">
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-brand-orange/10 rounded-full">
                               <User className="w-6 h-6 text-brand-orange" />
                            </div>
                            <CardTitle>Informações do Contato</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingInboxes ? <Spinner /> : (
                             <form onSubmit={handleSubmit} className="space-y-6">
                                <InputField id="fullName" label="Nome Completo" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                <InputField id="email" label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@dominio.com" />
                                <InputField id="phone" label="Telefone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+5511999998888" />
                                <InputField id="value" label="Valor do Negócio (Opcional)" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" step="0.01" />
                                <SelectField id="inbox" label="Caixa de Entrada (Inbox)" value={inboxId} onChange={e => setInboxId(Number(e.target.value))} required>
                                    {inboxes.map(inbox => <option key={inbox.id} value={inbox.id}>{inbox.name}</option>)}
                                </SelectField>
                                <Toggle label="Criar conversa inicial?" enabled={startConversation} setEnabled={setStartConversation} />
                                <div className="pt-2">
                                    <button type="submit" disabled={loading} className="w-full flex justify-center items-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-orange rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:bg-opacity-70 disabled:cursor-not-allowed">
                                        {loading ? <Spinner /> : 'Criar Lead'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};