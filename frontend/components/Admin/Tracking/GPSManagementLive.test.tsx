import React from 'react';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminGpsAssignableUnit, AdminGpsLocationVehicle, AdminGpsResponse, AdminGpsVehicle } from '../../../services/api';
import GPSManagement from './GPSManagementLive';
import { interpolateGpsPosition, mergeGpsSnapshots } from './gpsLiveUpdates';

const gpsMocks = vi.hoisted(() => ({
  list: vi.fn(),
  associate: vi.fn(),
  unassociate: vi.fn(),
  flyTo: vi.fn(),
  setView: vi.fn(),
  fitBounds: vi.fn(),
  setLatLng: vi.fn(),
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
    Marker: ReactModule.forwardRef((props: { position: [number, number]; icon?: { options?: { html?: string } }; children?: React.ReactNode }, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ setLatLng: gpsMocks.setLatLng }), []);
      return ReactModule.createElement('div', {
        'data-testid': 'gps-marker',
        'data-position': props.position.join(','),
        'data-marker-html': props.icon?.options?.html ?? '',
      }, props.children);
    }),
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
  refreshIntervalSeconds = 15,
): AdminGpsResponse => ({
  vehicles,
  assignable_units: assignableUnits,
  location_vehicles: locationVehicles,
  refresh_interval_seconds: refreshIntervalSeconds,
  fetched_at: currentTime,
});

const installRefreshTimer = (expectedIntervalMs = 15_000): (() => void) => {
  let scheduledRefresh: TimerHandler | undefined;
  const originalSetTimeout = window.setTimeout;
  vi.spyOn(window, 'setTimeout').mockImplementation(((handler: TimerHandler, delay?: number) => {
    if (delay === expectedIntervalMs) {
      scheduledRefresh = handler;
      return 1 as unknown as number;
    }
    return originalSetTimeout(handler, delay);
  }) as typeof window.setTimeout);

  return () => {
    if (typeof scheduledRefresh === 'function') scheduledRefresh();
  };
};

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
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    gpsMocks.list.mockResolvedValue(responseFor([gpsVehicle()]));
    gpsMocks.associate.mockResolvedValue({ message: 'GPS device associated with the voiture.' });
    gpsMocks.unassociate.mockResolvedValue({ message: 'GPS association removed.' });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
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
        speed: 0,
        is_moving: false,
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
    expect(legend).toHaveTextContent('En mouvement');
    expect(legend).toHaveTextContent('À l’arrêt');
    expect(legend).toHaveTextContent('Voiture en location');
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
    const refresh = installRefreshTimer();
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle()]))
      .mockRejectedValueOnce({ message: 'temporary timeout' });

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(screen.getAllByText('771223 WW HYUNDAI I20').length).toBeGreaterThan(0));

    await act(async () => {
      refresh();
      await Promise.resolve();
    });

    expect(await screen.findByRole('status')).toHaveTextContent('temporary timeout');
    const firstVehicleCard = within(screen.getAllByRole('article')[0]);
    expect(firstVehicleCard.getByText(/Kilométrage/).textContent).toContain('41.796,37');
    expect(gpsMocks.list).toHaveBeenCalledTimes(2);
  });

  it('replaces vehicle telemetry when an automatic refresh succeeds', async () => {
    const refresh = installRefreshTimer();
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle({ speed: 57, odometer: 41796.37 })]))
      .mockResolvedValueOnce(responseFor([gpsVehicle({ speed: 12, odometer: 41797.37 })]));

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 57')).toBeInTheDocument());

    await act(async () => {
      refresh();
      await Promise.resolve();
    });

    await waitFor(() => expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 12')).toBeInTheDocument());
    expect(within(screen.getAllByRole('article')[0]).getByText(/Kilométrage/).textContent).toContain('41.797,37');
    expect(gpsMocks.list).toHaveBeenCalledTimes(2);
  });

  it('uses the refresh interval returned by the Docker-configured backend', async () => {
    const refresh = installRefreshTimer(20_000);
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle({ speed: 57 })], [freeUnit], [], 20))
      .mockResolvedValueOnce(responseFor([gpsVehicle({ speed: 9 })], [freeUnit], [], 20));

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 57')).toBeInTheDocument());

    await act(async () => {
      refresh();
      await Promise.resolve();
    });

    await waitFor(() => expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 9')).toBeInTheDocument());
    expect(gpsMocks.list).toHaveBeenCalledTimes(2);
  });

  it('only focuses on explicit selection and never recenters during GPS polling', async () => {
    const refresh = installRefreshTimer();
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([
      gpsVehicle(),
      gpsVehicle({
        provider_device_id: 'second-provider-device',
        provider_name: 'GPS car 2',
        vehicle_name: 'GPS car 2',
        latitude: 34.02,
        longitude: -6.8416,
      }),
      ]))
      .mockResolvedValueOnce(responseFor([
        gpsVehicle({ latitude: 35.76, longitude: -5.83 }),
        gpsVehicle({
          provider_device_id: 'second-provider-device',
          provider_name: 'GPS car 2',
          vehicle_name: 'GPS car 2',
          latitude: 34.03,
          longitude: -6.83,
          speed: 12,
          is_moving: true,
        }),
      ]));
    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(gpsMocks.fitBounds).toHaveBeenCalledTimes(1));
    expect(gpsMocks.flyTo).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /GPS car 2/ }));
    await waitFor(() => expect(gpsMocks.flyTo).toHaveBeenCalledWith([34.02, -6.8416], 13, { duration: 0.5 }));

    await act(async () => {
      refresh();
      await Promise.resolve();
    });
    await waitFor(() => expect(within(screen.getAllByRole('article')[1]).getByText('Vitesse 12')).toBeInTheDocument());
    expect(gpsMocks.flyTo).toHaveBeenCalledTimes(1);
    expect(gpsMocks.fitBounds).toHaveBeenCalledTimes(1);
  });

  it('pauses and aborts polling while hidden, then fetches immediately when visible', async () => {
    let resolveFirst: ((response: AdminGpsResponse) => void) | undefined;
    let firstSignal: AbortSignal | undefined;
    gpsMocks.list
      .mockImplementationOnce((signal: AbortSignal) => {
        firstSignal = signal;
        return new Promise(resolve => { resolveFirst = resolve; });
      })
      .mockResolvedValueOnce(responseFor([gpsVehicle()]));

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(gpsMocks.list).toHaveBeenCalledTimes(1));
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    fireEvent(document, new Event('visibilitychange'));
    expect(firstSignal?.aborted).toBe(true);

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    fireEvent(document, new Event('visibilitychange'));
    await waitFor(() => expect(gpsMocks.list).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getAllByText(/771223 WW HYUNDAI I20/).length).toBeGreaterThan(0));

    await act(async () => {
      resolveFirst?.(responseFor([gpsVehicle({ speed: 0, is_moving: false })]));
    });
    expect(within(screen.getAllByRole('article')[0]).getByText('Vitesse 57')).toBeInTheDocument();
  });

  it('animates a new GPS position through intermediate Leaflet coordinates', async () => {
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    let animationStart = 100;
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      frames.set(id, callback);
      return id;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
    vi.spyOn(performance, 'now').mockImplementation(() => animationStart);
    const refresh = installRefreshTimer();
    gpsMocks.list
      .mockResolvedValueOnce(responseFor([gpsVehicle()]))
      .mockResolvedValueOnce(responseFor([gpsVehicle({
        latitude: 35.7615,
        longitude: -5.829,
        reported_at: '2026-10-02T19:16:07.000Z',
      })]));

    render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
    expect(gpsMocks.setLatLng).not.toHaveBeenCalled();

    animationStart = 100;
    await act(async () => {
      refresh();
      await Promise.resolve();
    });

    const runNextFrame = async (time: number) => {
      const next = frames.entries().next().value as [number, FrameRequestCallback] | undefined;
      expect(next).toBeDefined();
      if (!next) return;
      frames.delete(next[0]);
      await act(async () => next[1](time));
    };
    await runNextFrame(700);
    const midpoint = gpsMocks.setLatLng.mock.lastCall?.[0] as [number, number];
    expect(midpoint[0]).toBeCloseTo(35.7605, 7);
    expect(midpoint[1]).toBeCloseTo(-5.831, 7);
    await runNextFrame(1300);
    const endpoint = gpsMocks.setLatLng.mock.lastCall?.[0] as [number, number];
    expect(endpoint[0]).toBeCloseTo(35.7615, 7);
    expect(endpoint[1]).toBeCloseTo(-5.829, 7);
    expect(gpsMocks.setView).toHaveBeenCalledTimes(1);
    expect(gpsMocks.flyTo).not.toHaveBeenCalled();
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
    const clearTimeout = vi.spyOn(window, 'clearTimeout');
    const view = render(<GPSManagement canManageMappings={false} />);
    await waitFor(() => expect(screen.getAllByText(/771223 WW HYUNDAI I20/).length).toBeGreaterThan(0));

    view.unmount();
    expect(clearTimeout).toHaveBeenCalled();
  });

  it('contains no hardcoded GPS demo fleet and obtains all vehicles from the API', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(resolve(process.cwd(), 'components/Admin/Tracking/GPSManagementLive.tsx'), 'utf8');

    expect(source).not.toMatch(/INITIAL_VEHICLES|STATS_DATA|SPEED_HISTORY|Math\.random\(|V-00[1-4]/);
    expect(source).toContain('adminGpsApi.list(controller.signal)');
    expect(source).toContain('setTimeout(() => void load(), refreshIntervalMs)');
  });
});

describe('GPS live update reconciliation', () => {
  it('keeps only the newest update for a device and ignores older out-of-order snapshots', () => {
    const latest = gpsVehicle({
      speed: 18,
      odometer: 41798,
      reported_at: '2026-10-03T10:00:30.000Z',
    });
    const stale = gpsVehicle({
      speed: 0,
      odometer: 41790,
      reported_at: '2026-10-03T10:00:00.000Z',
    });

    expect(mergeGpsSnapshots([latest], [stale])).toEqual([latest]);
    expect(mergeGpsSnapshots([], [stale, latest])).toEqual([latest]);
    expect(mergeGpsSnapshots([], [latest, stale])).toEqual([latest]);
  });

  it('preserves last-known coordinates when the new GPS sample omits either coordinate', () => {
    const lastKnown = gpsVehicle({ latitude: 35.7, longitude: -5.8 });
    const partial = gpsVehicle({
      latitude: null,
      longitude: null,
      speed: 12,
      reported_at: '2026-10-03T10:01:00.000Z',
    });

    expect(mergeGpsSnapshots([lastKnown], [partial])[0]).toMatchObject({
      latitude: 35.7,
      longitude: -5.8,
      speed: 12,
    });
  });

  it('interpolates marker coordinates and clamps progress to the animation interval', () => {
    expect(interpolateGpsPosition([10, 20], [20, 40], 0)).toEqual([10, 20]);
    expect(interpolateGpsPosition([10, 20], [20, 40], 0.5)).toEqual([15, 30]);
    expect(interpolateGpsPosition([10, 20], [20, 40], 1)).toEqual([20, 40]);
    expect(interpolateGpsPosition([10, 20], [20, 40], -1)).toEqual([10, 20]);
    expect(interpolateGpsPosition([10, 20], [20, 40], 2)).toEqual([20, 40]);
  });
});