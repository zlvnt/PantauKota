"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  UserCircle2, 
  ShieldAlert, 
  Mail, 
  FileText, 
  Power, 
  Trash2,
  Users
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { laporan: number };
};

export default function KelolaUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAktif = async (id: string, isActive: boolean) => {
    setUpdating(id);
    try {
      await fetch(`/api/user/profile/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !isActive } : u))
      );
    } catch (err) {
      console.error("Gagal update user:", err);
    } finally {
      setUpdating(null);
    }
  };

  const hapusUser = async (id: string, name: string) => {
    if (!confirm(`Yakin hapus user "${name}"? Semua laporan user ini ikut terhapus.`)) return;
    try {
      await fetch(`/api/user/profile/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Gagal hapus user:", err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-surface">
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2">
            Kelola User
          </h1>
          <p className="text-sm sm:text-base text-on-surface/60">
            Kelola akun warga dan admin yang terdaftar di PantauKota
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-4 sm:p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface/40"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface placeholder:text-on-surface/40"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface-container-low rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-on-surface/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">
              User Tidak Ditemukan
            </h3>
            <p className="text-sm text-on-surface/60">
              Tidak ada pengguna yang cocok dengan kata kunci pencarian.
            </p>
          </div>
        )}

        {/* Data List (Cards for Mobile & Desktop) */}
        {!loading && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] hover:shadow-[0_4px_16px_rgba(42,52,57,0.12)] transition-all overflow-hidden flex flex-col"
              >
                <div className="p-5 sm:p-6 flex-1 space-y-4">
                  {/* Header: Avatar, Name, Badges */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center shrink-0 border border-outline-variant/15">
                      {user.role === "ADMIN" ? (
                        <ShieldAlert className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      ) : (
                        <UserCircle2 className="w-6 h-6 text-[#677177]" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-on-surface truncate">
                        {user.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-surface-container-low text-on-surface/60"
                        }`}>
                          {user.role}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.isActive ? "bg-[#006d4a]/10 text-[#006d4a]" : "bg-error/10 text-error"
                        }`}>
                          {user.isActive ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-on-surface/80">
                      <Mail className="w-4 h-4 text-on-surface/40 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-on-surface/80">
                      <FileText className="w-4 h-4 text-on-surface/40 shrink-0" strokeWidth={1.5} />
                      <span>{user._count?.laporan || 0} Laporan Dibuat</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 sm:p-5 border-t border-outline-variant/15 bg-surface-container-lowest/50 flex items-center gap-2">
                  <button
                    onClick={() => toggleAktif(user.id, user.isActive)}
                    disabled={updating === user.id}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                      user.isActive 
                        ? "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                        : "bg-primary text-white hover:bg-primary-dim"
                    }`}
                  >
                    <Power className="w-4 h-4" strokeWidth={2} />
                    {updating === user.id ? "Memproses..." : user.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  
                  {user.role !== "ADMIN" && (
                    <button
                      onClick={() => hapusUser(user.id, user.name)}
                      className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors"
                      title="Hapus User"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}