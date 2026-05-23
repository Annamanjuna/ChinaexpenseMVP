import { NextResponse } from "next/server";
import type { ZaloParseResponse } from "@/types/zalo";

/** Ответ с ошибкой — всегда с expenses: [], чтобы клиент не падал */
export function zaloErrorResponse(
  error: string,
  status: number,
  method: ZaloParseResponse["method"] = "vision"
) {
  const body: ZaloParseResponse & { error: string } = {
    error,
    expenses: [],
    method,
  };
  return NextResponse.json(body, { status });
}
