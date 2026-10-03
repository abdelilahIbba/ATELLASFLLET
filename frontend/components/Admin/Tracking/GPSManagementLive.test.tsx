import React from 'react';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminGpsAssignableUnit, AdminGpsLocationVehicle, AdminGpsResponse, AdminGpsVehicle } from '../../../services/api';
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
    Marker: (props: { position: [number, number]; icon?: { options?: { html?: string } }; children?: React.ReactNode }) =>
      ReactModule.createElement('div', {
        'data-testid': 'gps-marker',
        'data-position': props.position.join(','),
        'data-marker-html': props.icon?.options?.html ?? '',
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
  unit_count: null,
  unit_identity: null,
  plate: null,
  linked: false,
  in_location: false,
  location_booking: null,
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
  quantity: 3,
  vehicle_name: '2023 Kia Picanto',
  plate: 'G-89013-H',
  unit_label: 'Voiture #19 · 2023 Kia Picanto · qté 2/3 · Matricule G-89013-H',
};

const currentLocationVehicle = (overrides: Partial<AdminGpsLocationVehicle> = {}): AdminGpsLocationVehicle => ({
  location_id: '1:2',
  booking_id: 77,
  car_id: 1,
  unit_number: 2,
  quantity: 3,
  vehicle_name: '2023 Dacia Logan',
  plate: 'B-12345-B',
  unit_identity: 'Voiture #1 · 2023 Dacia Logan · qté 2/3 · Matricule B-12345-B',
  client_name: 'Karim Client',
  start_date: '2026-10-01',
  end_date: '2026-10-05',
  booking_status: 'active',
  contract_number: null,
  gps_device_id: '352592579607821',
  gps_available: true,
  latitude: 35.7595,
  longitude: -5.833,
  speed: 57,
  odometer: 41796.37,
  status: '1',
  reported_at: currentTime,
  is_stale: false,
  ...overrides,
});

const responseFor = (
  vehicles: AdminGpsVehicle[],
  assignableUnits: AdminGpsAssignableUnit[] = [freeUnit],
  locationVehicles: AdminGpsLocationVehicle[] = [],
): AdminGpsResponse => ({
  vehicles,
  assignable_units: assignableUnits,
  location_vehicles: locationVehicles,
  fetched_at: currentTime,
});

const linkedVehicle = (overrides: Partial<AdminGpsVehicle> = {}): AdminGpsVehicle => gpsVehicle({
  provider_name: '771223 WW HYUNDAI I20',
  vehicle_name: '2023 Dacia Logan',
  car_id: 1,
  unit_number: 1,
  unit_count: 3,
  unit_identity: 'Voiture #1 · 2023 Dacia Logan · qté 1/3 · Matricule A-12345-B',
  plate: 'A-12345-B',
  linked: true,
  in_location: true,
  location_booking: {
    booking_id: 77,
    client_name: 'Karim Client',
    start_date: '2026-10-01',
    end_date: '2026-10-05',
    booking_status: 'active',
    contract_number: null,
  },
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
        provider_device_id: 'unlinked-located-device',
        provider_name: 'Dacia GPS unlinked',
        latitude: 34.05,
        longitude: -5.0,
      }),
      linkedVehicle({
        provider_device_id: 'second-located-device',
        provider_name: 'Renault Clio Tracker',
        vehicle_name: '2023 Renault Clio',
        car_id: 2,
        plate: 'D-56789-E',
        unit_identity: 'Voiture #2 · 2023 Renault Clio · qté 1/3 · Matricule D-56789-E',
        in_location: false,
        latitude: 34.02,
        longitude: -6.8416,
      }),
      linkedVehicle({
        provider_device_id: 'stale-located-device',
        provider_name: 'Kia Picanto Tracker',
        vehicle_name: '2023 Kia Picanto',
        car_id: 3,
        plate: 'G-89012-H',
        unit_identity: 'Voiture #3 · 2023 Kia Picanto · qté 1/3 · Matricule G-89012-H',
        is_stale: true,
        in_location: false,
        latitude: 31.0,
        longitude: -7.0,
      }),
    ], [freeUnit], [
      currentLocationVehicle(),
      currentLocationVehicle({
        location_id: '2:1',
        booking_id: 88,
        car_id: 2,
        unit_number: 1,
        vehicle_name: '2023 Renault Clio',
        unit_identity: 'Voiture #2 · 2023 Renault Clio · qté 1/3 · Matricule D-56789-E',
        plate: 'D-56789-E',
        client_name: 'Sarah Client',
        gps_device_id: null,
        gps_available: false,
        latitude: null,
        longitude: null,
        speed: null,
        odometer: null,
        status: null,
        reported_at: null,
        is_stale: null,
      }),
    ]));

    render(<GPSManagement canManageMappings />);

    await waitFor(() => expect(screen.getAllByText('2023 Dacia Logan').length).toBeGreaterThan(0));
    expect(screen.getAllByText(/Voiture #1 · 2023 Dacia Logan · qté 1\/3 · Matricule A-12345-B/).length).toBeGreaterThan(0);
    const firstVehicleCard = within(screen.getAllByRole('article')[0]);
    expect(firstVehicleCard.getByText(/Kilométrage/).textContent).toContain('41.796,37');
    expect(firstVehicleCard.getByText('Vitesse 57')).toBeInTheDocument();
    expect(firstVehicleCard.getByText('Carburant API 0')).toBeInTheDocument();
    expect(firstVehicleCard.getByText('Statut API 1')).toBeInTheDocument();
    expect(screen.getByText(/Actualisé/)).toBeInTheDocument();
    const markers = screen.getAllByTestId('gps-marker');
    expect(markers.map(marker => marker.getAttribute('data-position')))
      .toEqual(['35.7595,-5.833', '34.05,-5', '34.02,-6.8416', '31,-7']);
    expect(markers.map(marker => marker.getAttribute('data-marker-html'))).toEqual([
      expect.stringContaining('#16a34a'),
      expect.stringContaining('#d97706'),
      expect.stringContaining('#2563eb'),
      expect.stringContaining('#64748b'),
    ]);
    const legend = screen.getByLabelText('Légende de la map');
    expect(legend).toHaveTextContent('Voiture en location');
    expect(legend).toHaveTextContent('GPS associé · hors location');
    expect(legend).toHaveTextContent('GPS non associé');
    expect(legend).toHaveTextContent('Données GPS anciennes');
    expect(screen.getAllByText('Dacia Sandero GPS').length).toBeGreaterThan(0);
    const locationList = screen.getByRole('region', { name: 'Voitures en location' });
    expect(locationList).toHaveTextContent('Karim Client');
    expect(locationList).toHaveTextContent('Sarah Client');
    expect(locationList).toHaveTextContent('Position GPS indisponible');
  });

  it('distinguishes same-marque, same-model voitures by car id, qté unit, and matricule', async () => {
    const secondUnit: AdminGpsAssignableUnit = {
      car_id: 20,
      unit_number: 1,
      quantity: 2,
      vehicle_name: '2023 Kia Picanto',
      plate: 'H-89012-J',
      unit_label: 'Voiture #20 · 2023 Kia Picanto · qté 1/2 · Matricule H-89012-J',
    };
    gpsMocks.list.mockResolvedValue(responseFor([gpsVehicle()], [freeUnit, secondUnit]));

    render(<GPSManagement canManageMappings />);

    const selector = await screen.findByRole('combobox', { name: /Associer 771223 WW HYUNDAI I20/ });
    expect(within(selector).getByRole('option', { name: freeUnit.unit_label })).toBeInTheDocument();
    expect(within(selector).getByRole('option', { name: secondUnit.unit_label })).toBeInTheDocument();
  });

  it('shows every current location reservation, including a voiture without a GPS association', async () => {
    gpsMocks.list.mockResolvedValue(responseFor([linkedVehicle()], [], [
      currentLocationVehicle(),
      currentLocationVehicle({
        location_id: '44:1',
        booking_id: 99,
        car_id: 44,
        unit_number: 1,
        vehicle_name: '2024 Dacia Logan',
        unit_identity: 'Voiture #44 · 2024 Dacia Logan · qté 1/3 · Matricule A-12345-B',
        client_name: 'Fatima Client',
        gps_device_id: null,
        gps_available: false,
        latitude: null,
        longitude: null,
        speed: null,
        odometer: null,
        status: null,
        reported_at: null,
        is_stale: null,
      }),
    ]));

    render(<GPSManagement canManageMappings={false} />);

    const locationList = await screen.findByRole('region', { name: 'Voitures en location' });
    expect(locationList).toHaveTextContent('2');
    expect(locationList).toHaveTextContent('Karim Client');
    expect(locationList).toHaveTextContent('Fatima Client');
    expect(locationList).toHaveTextContent('Voiture #44 · 2024 Dacia Logan · qté 1/3 · Matricule A-12345-B');
    expect(locationList).toHaveTextContent('Position GPS indisponible');
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