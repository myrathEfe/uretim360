import axios from "axios";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string;
}

export function createApiClient(accessToken?: string) {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json"
    }
  });

  client.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  return client;
}

export async function apiGet<T>(path: string, accessToken: string) {
  const { data } = await createApiClient(accessToken).get<ApiEnvelope<T>>(path);
  return data.data;
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody, accessToken: string) {
  const { data } = await createApiClient(accessToken).post<ApiEnvelope<TResponse>>(path, body);
  return data.data;
}

export async function apiPut<TResponse, TBody>(path: string, body: TBody, accessToken: string) {
  const { data } = await createApiClient(accessToken).put<ApiEnvelope<TResponse>>(path, body);
  return data.data;
}

export async function apiPatch<TResponse, TBody>(path: string, body: TBody | undefined, accessToken: string) {
  const { data } = await createApiClient(accessToken).patch<ApiEnvelope<TResponse>>(path, body);
  return data.data;
}

export async function apiDelete(path: string, accessToken: string) {
  const { data } = await createApiClient(accessToken).delete<ApiEnvelope<null>>(path);
  return data;
}

