import React, { useMemo } from 'react';
import { Vehicle } from '../types';
import FleetStats from './components/FleetStats';
import FleetToolbar from './components/FleetToolbar';
import FleetTable from './components/FleetTable';

interface FleetManagementProps {
  vehicles: Vehicle[];
  vehicleSearch: string;
  setVehicleSearch: (s: string) => void;
  vehicleFilter: string;
  setVehicleFilter: (s: string) => void;
  openModal: (type: string, item: any) => void;
  handleDelete: (id: string) => void;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ 
  vehicles, 
  vehicleSearch, 
  setVehicleSearch, 
  vehicleFilter, 
  setVehicleFilter, 
  openModal, 
  handleDelete 
}) => {

  const filteredVehicles = useMemo(() => vehicles.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.plate.toLowerCase().includes(vehicleSearch.toLowerCase());
      const matchesFilter = vehicleFilter === 'All' ? true : v.status === vehicleFilter;
      return matchesSearch && matchesFilter;
  }), [vehicles, vehicleSearch, vehicleFilter]);

  return (
    <div className="space-y-6">
        <FleetStats vehicles={vehicles} />

        <FleetToolbar 
            vehicleSearch={vehicleSearch} 
            setVehicleSearch={setVehicleSearch}
            vehicleFilter={vehicleFilter}
            setVehicleFilter={setVehicleFilter}
            onAddVehicle={() => openModal('vehicle_form', null)}
        />

        <FleetTable 
            vehicles={filteredVehicles} 
            onEdit={(v) => openModal('vehicle_form', v)}
            onDelete={handleDelete}
        />
    </div>
  );
};

export default FleetManagement;

