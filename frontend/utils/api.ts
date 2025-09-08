import Constants from 'expo-constants';

// Return a backend base URL that works on device and simulator
export const getBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv;
  const hostUri = (Constants.expoConfig as any)?.hostUri || (Constants as any)?.manifest2?.extra?.expoClient?.hostUri || '';
  const host = hostUri ? hostUri.split(':')[0] : 'localhost';
  // Default backend port
  return `http://${host}:8000`;
};

export const API = {
  baseUrl: getBaseUrl(),
  url: (path: string) => `${getBaseUrl()}${path}`,
};
