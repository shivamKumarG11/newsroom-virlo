// Virlo API Integration — localStorage key management & validation

export function getVirloApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('virlo_api_key')
}

export function setVirloApiKey(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('virlo_api_key', key)
}

export function removeVirloApiKey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('virlo_api_key')
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.usevirlo.com/v1/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch {
    return false
  }
}
