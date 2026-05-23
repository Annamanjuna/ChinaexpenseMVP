import type { AppData } from "@/types";

export type TripFetchResult = {
  data: AppData;
  updatedAt?: string;
};

/** Load shared trip data from the server */
export async function fetchTripFromCloud(): Promise<TripFetchResult> {
  const res = await fetch("/api/trip", { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Failed to load (${res.status})`
    );
  }
  const data = (await res.json()) as AppData;
  const updatedAt = res.headers.get("x-trip-updated-at") ?? undefined;
  return { data, updatedAt };
}

/** Save shared trip data to the server */
export async function saveTripToCloud(
  data: AppData,
  updatedAt?: string
): Promise<{ updatedAt: string }> {
  const res = await fetch("/api/trip", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, updatedAt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? `Failed to save (${res.status})`
    );
  }

  return res.json() as Promise<{ updatedAt: string }>;
}
