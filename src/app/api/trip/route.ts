import { NextRequest, NextResponse } from "next/server";
import { getDefaultAppData } from "@/lib/storage";
import { getSupabaseAdmin, getTripStateId } from "@/lib/supabase-admin";
import { parseAppData } from "@/lib/validate-app-data";
import type { AppData } from "@/types";

/**
 * Shared trip API — all devices read/write the same Supabase row.
 * GET  → load expenses + settings
 * PUT  → save full state (last write wins if two people edit at once)
 */

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Облако не настроено. Добавьте переменные Supabase в Vercel." },
      { status: 503 }
    );
  }

  const tripId = getTripStateId();
  const { data: row, error } = await supabase
    .from("trip_state")
    .select("data, updated_at")
    .eq("id", tripId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!row) {
    const defaults = getDefaultAppData();
    await supabase.from("trip_state").insert({
      id: tripId,
      data: defaults,
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json(defaults);
  }

  const appData = parseAppData(row.data);
  const response = NextResponse.json(appData);
  response.headers.set("x-trip-updated-at", row.updated_at ?? "");
  return response;
}

export async function PUT(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Облако не настроено." },
      { status: 503 }
    );
  }

  const writeSecret = process.env.TRIP_WRITE_SECRET;
  if (writeSecret) {
    const header = request.headers.get("x-trip-secret");
    if (header !== writeSecret) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
    }
  }

  let body: { data?: unknown; updatedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const appData: AppData = parseAppData(body.data);
  const tripId = getTripStateId();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("trip_state")
    .select("updated_at")
    .eq("id", tripId)
    .maybeSingle();

  if (
    body.updatedAt &&
    existing?.updated_at &&
    body.updatedAt !== existing.updated_at
  ) {
    return NextResponse.json(
      {
        error:
          "Кто-то уже обновил данные. Обновите страницу, чтобы увидеть актуальное.",
      },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("trip_state").upsert({
    id: tripId,
    data: appData,
    updated_at: now,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updatedAt: now });
}
