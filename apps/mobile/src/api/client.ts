import Constants from 'expo-constants';

function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit) {
    return explicit;
  }

  // In Expo Go on a physical device, localhost points to the phone itself.
  // Derive the dev machine host from Expo runtime metadata when possible.
  const hostUriFromExpoConfig =
    (Constants.expoConfig as { hostUri?: string } | null | undefined)?.hostUri;
  const legacyManifest =
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest;

  const hostUri = hostUriFromExpoConfig ?? legacyManifest?.debuggerHost;
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
}

const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
