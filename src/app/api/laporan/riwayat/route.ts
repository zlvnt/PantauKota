import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const laporan = await prisma.laporan.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      kategori: {
        select: { nama: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const result = laporan.map((item) => ({
    id: item.id,
    judul: item.judul,
    status: item.status,
    kategori: item.kategori,
    createdAt: item.createdAt,
    fotoBukti: item.foto?.[0] ?? null,
  }));

  return NextResponse.json(result);
}