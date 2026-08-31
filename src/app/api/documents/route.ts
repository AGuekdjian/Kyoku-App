import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { storage } from "@/features/storage";
import { DojoDocument } from "@/models/Document";
const MAX = 10 * 1024 * 1024;
export async function GET() {
  try {
    await requireSession();
    await connectDb();
    return NextResponse.json(
      await DojoDocument.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .lean(),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    await connectDb();
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX ||
      file.type !== "application/pdf"
    )
      return NextResponse.json(
        { error: "PDF_REQUIRED_MAX_10MB" },
        { status: 400 },
      );
    const meta = z
      .object({
        name: z.string().min(2),
        category: z.string().min(1),
        description: z.string().optional(),
        version: z.string().optional(),
        gradeId: z.string().optional(),
      })
      .parse(Object.fromEntries(form));
    const key = `documents/${crypto.randomUUID()}.pdf`;
    await storage().upload({
      key,
      data: new Uint8Array(await file.arrayBuffer()),
    });
    try {
      return NextResponse.json(
        await DojoDocument.create({
          ...meta,
          storageKey: key,
          mimeType: file.type,
          size: file.size,
        }),
        { status: 201 },
      );
    } catch (e) {
      await storage().delete(key);
      throw e;
    }
  } catch (e) {
    return apiError(e);
  }
}
