import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface AIGuardResult {
  authorized: boolean;
  userId: string;
}

/**
 * Per-user AI access control.
 * Checks if the current user is authenticated AND has aiEnabled = true.
 * Returns { authorized, userId } on success.
 * Returns a NextResponse error on failure (401 or 403).
 */
export async function checkAIAccess(): Promise<
  AIGuardResult | NextResponse
> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiEnabled: true },
  });

  if (!user?.aiEnabled) {
    return NextResponse.json(
      { error: "AI erişiminiz aktif değil. Yöneticinize başvurun." },
      { status: 403 }
    );
  }

  return { authorized: true, userId };
}

/**
 * Type guard to check if the result is an error response.
 */
export function isAIGuardError(
  result: AIGuardResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
