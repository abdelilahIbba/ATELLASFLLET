import type { AdminGpsVehicle } from '../../../services/api';

const timestamp = (vehicle: AdminGpsVehicle): number => {
  if (!vehicle.reported_at) return Number.NEGATIVE_INFINITY;
  const value = Date.parse(vehicle.reported_at);
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
};

export const mergeGpsSnapshots = (
  previous: AdminGpsVehicle[],
  incoming: AdminGpsVehicle[],
): AdminGpsVehicle[] => {
  const latestByDevice = new Map<string, AdminGpsVehicle>();

  for (const vehicle of incoming) {
    const duplicate = latestByDevice.get(vehicle.provider_device_id);
    if (!duplicate || timestamp(vehicle) >= timestamp(duplicate)) {
      latestByDevice.set(vehicle.provider_device_id, vehicle);
    }
  }

  const previousByDevice = new Map(previous.map(vehicle => [vehicle.provider_device_id, vehicle]));

  return [...latestByDevice.values()].map(vehicle => {
    const lastKnown = previousByDevice.get(vehicle.provider_device_id);
    if (!lastKnown) return vehicle;

    const nextTimestamp = timestamp(vehicle);
    const previousTimestamp = timestamp(lastKnown);
    if (nextTimestamp < previousTimestamp) return lastKnown;

    return {
      ...vehicle,
      latitude: vehicle.latitude ?? lastKnown.latitude,
      longitude: vehicle.longitude ?? lastKnown.longitude,
    };
  });
};

export const interpolateGpsPosition = (
  from: [number, number],
  to: [number, number],
  progress: number,
): [number, number] => {
  const fraction = Math.min(1, Math.max(0, progress));
  return [
    from[0] + (to[0] - from[0]) * fraction,
    from[1] + (to[1] - from[1]) * fraction,
  ];
};