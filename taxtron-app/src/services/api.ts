import { ApiResponse } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    'EXPO_PUBLIC_API_URL is not set. Set it in .env to connect to the Taxtron API.'
  );
}

export async function generateResponse(
  prompt: string,
  imageBase64?: string
): Promise<string> {
  if (!API_URL) {
    throw new Error('Taxtron API is not configured. Set EXPO_PUBLIC_API_URL in your .env file.');
  }

  const body: Record<string, string> = { topic: prompt };
  if (imageBase64) {
    body.image = imageBase64;
  }

  const res = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Server responded with status ${res.status}`);
  }

  const data: ApiResponse = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result || 'No response received.';
}
