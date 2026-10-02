<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class AlloGpsClient
{
    private function baseUrl(): string
    {
        return rtrim((string) config('services.allogps.base_url'), '/');
    }

    private function tokenCacheKey(): string
    {
        return 'allogps.token.' . hash('sha256', (string) config('services.allogps.email'));
    }

    private function token(): string
    {
        $email = (string) config('services.allogps.email');
        $password = (string) config('services.allogps.password');
        $agencyId = (string) config('services.allogps.agency_id');

        if ($email === '' || $password === '' || $agencyId === '') {
            throw new GpsProviderException(503, 'GPS provider credentials are not configured.');
        }

        return Cache::remember($this->tokenCacheKey(), now()->addMinutes(5), function () use ($email, $password) {
            try {
                $response = Http::acceptJson()
                    ->timeout(15)
                    ->post($this->baseUrl() . '/auth/login', [
                        'email' => $email,
                        'password' => $password,
                    ]);
            } catch (ConnectionException $exception) {
                throw new GpsProviderException(503, 'GPS provider is unavailable.', previous: $exception);
            }

            $token = $response->json('token');
            if (!$response->successful() || !is_string($token) || $token === '') {
                throw new GpsProviderException($response->status(), 'GPS provider authentication failed.');
            }

            return $token;
        });
    }

    /** @return array<int, array<string, mixed>> */
    public function devices(): array
    {
        $agencyId = (string) config('services.allogps.agency_id');

        for ($attempt = 0; $attempt < 2; $attempt++) {
            try {
                $response = Http::acceptJson()
                    ->withToken($this->token())
                    ->timeout(15)
                    ->get($this->baseUrl() . '/list/' . rawurlencode($agencyId));
            } catch (ConnectionException $exception) {
                throw new GpsProviderException(503, 'GPS provider is unavailable.', previous: $exception);
            }

            if ($response->status() === 401 && $attempt === 0) {
                Cache::forget($this->tokenCacheKey());
                continue;
            }

            if (!$response->successful()) {
                throw new GpsProviderException($response->status(), 'GPS provider returned an error.');
            }

            $payload = $response->json();
            if (isset($payload[0]) && is_array($payload[0]) && isset($payload[0]['cars'])) {
                $payload = $payload[0];
            }

            $devices = is_array($payload) ? ($payload['cars'] ?? null) : null;
            if (!is_array($devices)) {
                throw new GpsProviderException(502, 'GPS provider returned an invalid vehicle list.');
            }

            return array_values(array_filter($devices, static fn ($device) =>
                is_array($device) && isset($device['id'], $device['key'])
            ));
        }

        throw new GpsProviderException(401, 'GPS provider authentication failed.');
    }
}