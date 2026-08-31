import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import {
  tournamentWorkbook,
  type ExportRegistration,
} from "@/features/exports/tournament";
import { Tournament } from "@/models/Tournament";
import { Settings } from "@/models/Settings";
import { AppError } from "@/lib/app-error";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    await connectDb();
    const [tournament, settings] = await Promise.all([
      Tournament.findById((await params).id).lean(),
      Settings.findOne({ key: "dojo" }).lean(),
    ]);
    if (!tournament) throw new AppError("NOT_FOUND");
    const data = await tournamentWorkbook({
      dojoName: String(settings?.dojoName ?? "Kyoku"),
      tournamentName: String(tournament.name),
      date: tournament.date as Date,
      registrations:
        tournament.registrations as unknown as ExportRegistration[],
    });
    return new NextResponse(data, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="inscripciones-${String(
          tournament.name,
        )
          .replace(/[^a-z0-9]+/gi, "-")
          .toLowerCase()}.xlsx"`,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
