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
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  clients,
  clientSearch,
  setClientSearch,
  clientFilter,
  setClientFilter,
  openModal,
  handleDelete
}) => {
  
  const filteredClients = useMemo(() => clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
                            c.email.toLowerCase().includes(clientSearch.toLowerCase()) || 
                            c.cin.toLowerCase().includes(clientSearch.toLowerCase());
      const matchesFilter = clientFilter === 'All' ? true : c.status === clientFilter;
      return matchesSearch && matchesFilter;
  }), [clients, clientSearch, clientFilter]);

  const totalClients = clients.length;
  const vipClients = clients.filter(c => c.status === 'VIP').length;
  const blacklistedClients = clients.filter(c => c.status === 'Blacklisted').length;

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
            onEdit={(client) => openModal('client_form', client)} 
            onDelete={handleDelete} 
            openModal={openModal}
        />
    </div>
  );
};

export default ClientManagement;
