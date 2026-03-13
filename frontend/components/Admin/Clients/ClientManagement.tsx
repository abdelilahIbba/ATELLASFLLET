import React, { useMemo } from 'react';
import { Client } from '../types';
import ClientStats from './components/ClientStats';
import ClientToolbar from './components/ClientToolbar';
import ClientTable from './components/ClientTable';

interface ClientManagementProps {
  clients: Client[];
  clientSearch: string;
  setClientSearch: (s: string) => void;
  clientFilter: string;
  setClientFilter: (s: string) => void;
  openModal: (type: string, item: any) => void;
  handleDelete: (id: string) => void;
  onContact?: (client: Client) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  clients,
  clientSearch,
  setClientSearch,
  clientFilter,
  setClientFilter,
  openModal,
  handleDelete,
  onContact,
}) => {
  const totalClients = clients.length;
  const vipClients = clients.filter(c => c.status === 'VIP').length;
  const blacklistedClients = clients.filter(c => c.status === 'Blacklisted').length;

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesFilter = clientFilter === 'All' || c.status === clientFilter;
      const term = clientSearch.toLowerCase();
      const matchesSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.cin && c.cin.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [clients, clientFilter, clientSearch]);

  return (
    <div className="space-y-6">
        <ClientStats 
            totalClients={totalClients} 
            vipClients={vipClients} 
            blacklistedClients={blacklistedClients} 
        />

        <ClientToolbar 
            clientSearch={clientSearch} 
            setClientSearch={setClientSearch} 
            clientFilter={clientFilter} 
            setClientFilter={setClientFilter} 
            onAddClient={() => openModal('client_form', null)} 
        />

        <ClientTable 
            clients={filteredClients} 
            onView={(client) => openModal('client_detail', client)}
            onEdit={(client) => openModal('client_form', client)} 
            onDelete={handleDelete} 
            openModal={openModal}
            onContact={onContact}
        />
    </div>
  );
};

export default ClientManagement;
