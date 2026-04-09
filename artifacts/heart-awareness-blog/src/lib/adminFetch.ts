export function getAdminPassword(): string {
  return sessionStorage.getItem("adminPassword") ?? "";
}

export async function adminFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Password": getAdminPassword(),
      ...options.headers,
    },
  });
  if (res.status === 204) return null as T;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}