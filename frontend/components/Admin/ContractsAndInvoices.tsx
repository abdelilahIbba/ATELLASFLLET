import React, { useState } from 'react';
import { FileSignature, Receipt } from 'lucide-react';
import ContractManagement from './Contracts/ContractManagement';
import InvoiceManagement from './Invoices/InvoiceManagement';

type SubTab = 'contracts' | 'invoices';

const ContractsAndInvoices: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('contracts');

  return (
    <div className="space-y-5">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-2xl p-1 w-fit">
        <button
          onClick={() => setSubTab('contracts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            subTab === 'contracts'
              ? 'bg-white dark:bg-brand-blue text-brand-navy dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          Contrats
        </button>
        <button
          onClick={() => setSubTab('invoices')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            subTab === 'invoices'
              ? 'bg-white dark:bg-brand-blue text-brand-navy dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Factures
        </button>
      </div>

      {/* Content */}
      {subTab === 'contracts' && (
        <ContractManagement onNavigateInvoices={() => setSubTab('invoices')} />
      )}
      {subTab === 'invoices' && (
        <InvoiceManagement />
      )}
    </div>
  );
};

export default ContractsAndInvoices;
