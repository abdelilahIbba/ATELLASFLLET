import React from 'react';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminGpsAssignableUnit, AdminGpsResponse, AdminGpsVehicle } from '../../../services/api';
import GPSManagement from './GPSManagementLive';

const gpsMocks = vi.hoisted(() => ({
  list: vi.fn(),
  associate: vi.fn(),
  unassociate: vi.fn(),
  flyTo: vi.fn(),
  setView: vi.fn(),
  fitBounds: vi.fn(),
}));

vi.mock('../../../services/api', () => ({
  adminGpsApi: {
    list: gpsMocks.list,
    associate: gpsMocks.associate,
    unassociate: gpsMocks.unassociate,
  },
}));

vi.mock('react-leaflet', async () => {
  const ReactModule = await import('react');
  return {
    MapContainer: (props: { children?: React.ReactNode }) =>
      ReactModule.createElement('div', { 'data-testid': 'leaflet-map' }, props.children),
    TileLayer: () => null,
    Marker: (props: { position: [number, number]; children?: React.ReactNode }) =>
      ReactModule.createElement('div', {
        'data-testid': 'gps-marker',
        'data-position': props.position.join(','),
      }, props.children),
    Popup: (props: { children?: React.ReactNode }) => ReactModule.createElement('div', {}, props.children),
    useMap: () => ({
      flyTo: gpsMocks.flyTo,
      setView: gpsMocks.setView,
      fitBounds: gpsMocks.fitBounds,
      getZoom: () => 5,
    }),
  };
});

const currentTime = '2026-10-02T19:15:37.000Z';

const gpsVehicle = (overrides: Partial<AdminGpsVehicle> = {}): AdminGpsVehicle => ({
  provider_device_id: '352592579607821',
  provider_name: '771223 WW HYUNDAI I20',
  vehicle_name: '771223 WW HYUNDAI I20',
  car_id: null,
  unit_number: null,
  plate: null,
  linked: false,
  latitude: 35.7595,
  longitude: -5.833,
  speed: 57,
  status: '1',
  is_moving: true,
  odometer: 41796.37,
  fuel: 0,
  reported_at: currentTime,
  is_stale: false,
  ...overrides,
});

const freeUnit: AdminGpsAssignableUnit = {
  car_id: 19,
  unit_number: 2,
  vehicle_name: '2023 Kia Picanto',
  plate: 'G-89013-H',
};

const responseFor = (
  vehicles: AdminGpsVehicle[],
  assignableUnits: AdminGpsAssignableUnit[] = [freeUnit],
): AdminGpsResponse => ({
  vehicles,
  assignable_units: assignableUnits,
  fetched_at: currentTime,
});

const linkedVehicle = (overrides: Partial<AdminGpsVehicle> = {}): AdminGpsVehicle => gpsVehicle({
  provider_name: '771223 WW HYUNDAI I20',
  vehicle_name: '2023 Dacia Logan',
  car_id: 1,
  unit_number: 1,
  plate: 'A-12345-B',
  linked: true,
  ...overrides,
});

describe('GPSManagement at /admin/gps', () => {
  beforeEach(() => {
    gpsMocks.list.mockResolvedValue(responseFor([gpsVehicle()]));
    gpsMocks.associate.mockResolvedValue({ message: 'GPS device associated with the voiture.' });
    gpsMocks.unassociate.mockResolvedValue({ message: 'GPS association removed.' });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders provider voiture fields and creates one map marker per valid GPS location', async () => {
    gpsMocks.list.mockResolvedValue(responseFor([
      linkedVehicle(),
      gpsVehicle({
        provider_device_id: 'device-without-location',
        provider_name: 'Dacia Sandero GPS',
        vehicle_name: 'Dacia Sandero GPS',
        latitude: null,
        longitude: null,
        speed: 0,
        is_moving: false,
      }),
      gpsVehicle({
        provider_device_id: 'second-located-device',
        provider_name: 'Renault Clio GPS',
        vehicle_name: 'Renault Clio GPS',
        latitude: 34.02,
        longitude: -6.8416,
      }),
    ]));

    render(<GPSManagement canManageMappings />);

    await waitFor(() => expect(screen.getAllByText('2023 Dacia Logan').length).toBeGreaterThan(0));
    expect(screen.getAllByText(/GPS: 771223 WW HYUNDAI I20/).length).toBeGreaterThan(0);
    const firstVehicleCard = within(screen.getAllByRole('article')[0]);
    expect(firstVehicleCard.getByText(/Kilométrage/).textContent).toContain('41.796,37');
    expect(firstVehicleCard.getByText('Vitesse 57')).toBeInTheDocument();
    expect(firstVehicleCard.getByText('Carburant API 0')).toBeInTheDocument();
    expect(firstVehicleCard.getByText('Statut API 1')).toBeInTheDocument();
    expect(screen.getByText(/Actualisé/)).toBeInTheDocument();
    expect(screen.getAllByTestId('gps-marker').map(marker => marker.getAttribute('data-position')))
      .toEqual(['35.7595,-5.833', '34.02,-6.8416']);
    expect(screen.getAllByText('Dacia Sandero GPS').length).toBeGreaterThan(0);
  });

  it('shows a loading state while the first GPS response is pending', async () => {
    let resolveList: ((response: AdminGpsResponse) => void) | undefined;
    gpsMocks.list.mockReturnValue(new Promise(resolve => { resolveList = resolve; }));

    render(<GPSManagement canManageMappings={false} />);
    expect(screen.getByText('Chargement des voitures GPS…')).toBeInTheDocument();

    await act(async () => {
      resolveList?.(responseFor([gpsVehicle()]));
    });

    await waitFor(() => expect(screen.getAllByText('771223 WW HYUNDAI I20').length).toBeGreaterThan(0));
  });

  it('shows a provider error with a retry action when the first fetch fails', async () => {
    gpsMocks.list.mockRejectedValueOnce({ message: 'GPS provider is unavailable.' });

    render(<GPSManagement canManageMappings={false} />);

    expect(await screen.findByText('Connexion GPS indisponible')).toBeInTheDocument();
    expect(screen.getByText('GPS provider is unavailable.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await waitFor(() => expect(screen.getAllByText('771223 WW HYUNDAI I20').length).toBeGreaterThan(0));
    expect(gpsMocks.list).toHaveBeenCalledTimes(2);
  });

  it('shows a provider-empty state without rendering fake vehicles or markers', async () => {
    gpsMocks.list.mockResolvedValue(responseFor([], []));

    render(<GPSManagement canManageMappings />);

    expect(await screen.findByText('Aucune voiture reçue')).toBeInTheDocument();
    expect(screen.getByText('La liste GPS du fournisseur est vide.')).toBeInTheDocument();
    expect(screen.queryAllByTestId('gps-marker')).toHaveLength(0);
    expect(screen.queryByText(/V-00[1-4]/)).not.toBeInTheDocument();
  });

  it('automatically refreshes after 30 seconds and keeps last data when refresh fails', async () => {
    let refresh: TimerHandler | undefined;
    const originalSetInterval = window.setInterval;
    vi.spyOn(window, 'setInterval').mockImplementation(((handler: TimerHandler, delay?: number) => {
      if (delay === 30_000) {
        refresh = handler;
        return 1 as unknown as number;
      }
      return originalSetInterval(handler, delay);
    }) as typeof window.setInterval);
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle()]))
      .mockRejectedValueOnce({ message: 'temporary timeout' });

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(screen.getAllByText('771223 WW HYUNDAI I20').length).toBeGreaterThan(0));

    await act(async () => {
      if (typeof refresh === 'function') refresh();
      await Promise.resolve();
    });

    expect(await screen.findByRole('status')).toHaveTextContent('temporary timeout');
    const firstVehicleCard = within(screen.getAllByRole('article')[0]);
    expect(firstVehicleCard.getByText(/Kilométrage/).textContent).toContain('41.796,37');
    expect(gpsMocks.list).toHaveBeenCalledTimes(2);
  });

  it('replaces vehicle telemetry when an automatic refresh succeeds', async () => {
    let refresh: TimerHandler | undefined;
    const originalSetInterval = window.setInterval;
    vi.spyOn(window, 'setInterval').mockImplementation(((handler: TimerHandler, delay?: number) => {
      if (delay === 30_000) {
        refresh = handler;
        return 1 as unknown as number;
      }
      return originalSetInterval(handler, delay);
    }) as typeof window.setInterval);
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle({ speed: 57, odometer: 41796.37 })]))
      .mockResolvedValueOnce(responseFor([gpsVehicle({ speed: 12, odometer: 41797.37 })]));

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 57')).toBeInTheDocument());

    await act(async () => {
      if (typeof refresh === 'function') refresh();
      await Promise.resolve();
    });

    await waitFor(() => expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 12')).toBeInTheDocument());
    expect(within(screen.getAllByRole('article')[0]).getByText(/Kilométrage/).textContent).toContain('41.797,37');
    expect(gpsMocks.list).toHaveBeenCalledTimes(2);
  });

  it('recenters the map on the selected device GPS coordinates', async () => {
    gpsMocks.list.mockResolvedValue(responseFor([
      gpsVehicle(),
      gpsVehicle({
        provider_device_id: 'second-provider-device',
        provider_name: 'GPS car 2',
        vehicle_name: 'GPS car 2',
        latitude: 34.02,
        longitude: -6.8416,
      }),
    ]));
    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(gpsMocks.flyTo).toHaveBeenCalledWith([35.7595, -5.833], 13, { duration: 0.5 }));

    await userEvent.click(screen.getByRole('button', { name: /GPS car 2/ }));
    await waitFor(() => expect(gpsMocks.flyTo).toHaveBeenCalledWith([34.02, -6.8416], 13, { duration: 0.5 }));
  });

  it('associates an unlinked device with the selected voiture unit and refreshes the list', async () => {
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle()]))
      .mockResolvedValueOnce(responseFor([linkedVehicle()], []));

    render(<GPSManagement canManageMappings />);
    const selector = await screen.findByRole('combobox', { name: /Associer 771223 WW HYUNDAI I20/ });
    await userEvent.selectOptions(selector, '19:2');

    await waitFor(() => expect(gpsMocks.associate).toHaveBeenCalledWith('352592579607821', {
      car_id: 19,
      unit_number: 2,
    }));
    await waitFor(() => expect(screen.getAllByText(/771223 WW HYUNDAI I20/).length).toBeGreaterThan(0));
    expect(screen.getByRole('button', { name: 'Dissocier' })).toBeInTheDocument();
  });

  it('surfaces association errors and does not claim an unlinked device is linked', async () => {
    gpsMocks.associate.mockRejectedValueOnce({ message: 'This voiture unit already has a GPS device.' });
    render(<GPSManagement canManageMappings />);

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: /Associer 771223 WW HYUNDAI I20/ }),
      '19:2',
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('This voiture unit already has a GPS device.');
    expect(screen.getByText('Non associée')).toBeInTheDocument();
  });

  it('dissociates a linked provider and reloads it as an unlinked GPS device', async () => {
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([linkedVehicle()], []))
      .mockResolvedValueOnce(responseFor([gpsVehicle()]));
    render(<GPSManagement canManageMappings />);

    await userEvent.click(await screen.findByRole('button', { name: 'Dissocier' }));

    await waitFor(() => expect(gpsMocks.unassociate).toHaveBeenCalledWith('352592579607821'));
    expect(await screen.findByText('Non associée')).toBeInTheDocument();
  });

  it('does not expose association controls to non-admin viewers', async () => {
    render(<GPSManagement canManageMappings={false} />);

    await waitFor(() => expect(screen.getAllByText('771223 WW HYUNDAI I20').length).toBeGreaterThan(0));
    expect(screen.queryByRole('combobox', { name: /Associer/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dissocier' })).not.toBeInTheDocument();
  });

  it('removes the automatic refresh timer when unmounted', async () => {
    const clearInterval = vi.spyOn(window, 'clearInterval');
    const view = render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(screen.getAllByText('771223 WW HYUNDAI I20').length).toBeGreaterThan(0));

    view.unmount();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('contains no hardcoded GPS demo fleet and obtains all vehicles from the API', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(resolve(process.cwd(), 'components/Admin/Tracking/GPSManagementLive.tsx'), 'utf8');

    expect(source).not.toMatch(/INITIAL_VEHICLES|STATS_DATA|SPEED_HISTORY|Math\.random\(|V-00[1-4]/);
    expect(source).toContain('adminGpsApi.list()');
    expect(source).toContain('setInterval(load, REFRESH_INTERVAL_MS)');
  });
});