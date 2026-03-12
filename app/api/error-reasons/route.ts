import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ERROR_REASONS_ORDERED, ERROR_REASON_LABELS, ERROR_REASON_COEFFICIENTS, type ErrorReasonType } from "@/lib/severity";

/**
 * GET /api/error-reasons
 * Statik hata nedenleri listesi (enum tabanlı, DB sorgusu yok)
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
  }

  const errorReasons = ERROR_REASONS_ORDERED.map((reason: ErrorReasonType) => ({
    id: reason,
    label: ERROR_REASON_LABELS[reason],
    coefficient: ERROR_REASON_COEFFICIENTS[reason],
  }));

  return NextResponse.json(errorReasons);
}
