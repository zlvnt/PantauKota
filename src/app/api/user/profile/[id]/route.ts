import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PATCH /api/user/[id] — Admin aktifkan/nonaktifkan user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive harus boolean" }, { status: 400 });
    }

    // Cegah admin nonaktifkan dirinya sendiri
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak bisa menonaktifkan akun sendiri" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[API /user/[id] PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/user/[id] — Admin hapus user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cegah admin hapus dirinya sendiri
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("[API /user/[id] DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
