'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  X,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

// ─── Tipe ────────────────────────────────────────────────────────────────────
interface KategoriAdmin {
  id: string;
  nama: string;
  icon: string | null;
  warna: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { laporan: number };
}

// ─── Pilihan icon yang tersedia di DynamicIcon ───────────────────────────────
const ICON_OPTIONS = [
  { value: 'AlertTriangle', label: 'Bahaya' },
  { value: 'Trash2',        label: 'Sampah' },
  { value: 'Lightbulb',     label: 'Lampu' },
  { value: 'Droplets',      label: 'Air' },
  { value: 'Building2',     label: 'Fasilitas' },
  { value: 'TreePine',      label: 'Pohon' },
  { value: 'MapPin',        label: 'Lokasi' },
  { value: 'Car',           label: 'Jalan' },
  { value: 'Zap',           label: 'Listrik' },
  { value: 'Wind',          label: 'Udara' },
  { value: 'ShieldAlert',   label: 'Keamanan' },
  { value: 'VolumeX',       label: 'Bising' },
  { value: 'Flame',         label: 'Api' },
  { value: 'Waves',         label: 'Banjir' },
];



// ─── Form Tambah / Edit ───────────────────────────────────────────────────────
function KategoriForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial?: Partial<KategoriAdmin>;
  onSubmit: (data: { nama: string; icon: string; warna: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [nama, setNama]   = useState(initial?.nama  ?? '');
  const [icon, setIcon]   = useState(initial?.icon  ?? 'AlertTriangle');
  const warna = initial?.warna ?? '#426464';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    onSubmit({ nama: nama.trim(), icon, warna });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-on-surface">Nama Kategori</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Jalan Rusak"
          maxLength={60}
          autoFocus
          className="w-full bg-surface-container-low border border-outline-variant/15 focus:border-primary px-4 py-3 rounded-xl text-sm text-on-surface placeholder:text-on-surface/40 outline-none transition-colors"
        />
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-on-surface">Ikon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setIcon(opt.value)}
              title={opt.label}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                icon === opt.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-[#677177] hover:bg-surface-container-high'
              }`}
            >
              <DynamicIcon iconName={opt.value} className="w-5 h-5" strokeWidth={1.5} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>



      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10"
        >
          <DynamicIcon iconName={icon} className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-semibold text-on-surface">{nama || 'Preview Kategori'}</span>
      </div>

      {/* Tombol */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading || !nama.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dim text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" strokeWidth={2.5} />
          )}
          {initial?.id ? 'Simpan Perubahan' : 'Tambah Kategori'}
        </button>
      </div>
    </form>
  );
}

// ─── Modal Konfirmasi Hapus ───────────────────────────────────────────────────
function ConfirmDeleteModal({
  kategori,
  onConfirm,
  onCancel,
  isLoading,
}: {
  kategori: KategoriAdmin;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface-container-lowest rounded-3xl shadow-ambient w-full max-w-sm overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 mx-auto bg-error/10 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-error" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-base font-semibold text-on-surface">Hapus Kategori?</h3>
            <p className="text-sm text-on-surface/60">
              Kategori{' '}
              <span className="font-semibold text-on-surface">&ldquo;{kategori.nama}&rdquo;</span>{' '}
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-error hover:bg-error/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" strokeWidth={2} />}
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function KelolaKategoriPage() {
  const [kategoriList, setKategoriList]     = useState<KategoriAdmin[]>([]);
  const [isPageLoading, setIsPageLoading]   = useState(true);

  // Form state
  const [showForm, setShowForm]             = useState(false);
  const [editTarget, setEditTarget]         = useState<KategoriAdmin | null>(null);
  const [formLoading, setFormLoading]       = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget]     = useState<KategoriAdmin | null>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  // Toggle loading per-item
  const [toggling, setToggling]             = useState<string | null>(null);

  const { toasts, removeToast, success, error: toastError } = useToast();

  // ── Fetch semua kategori (termasuk nonaktif) ─────────────────────────────
  const fetchKategori = async () => {
    try {
      const res  = await fetch('/api/kategori?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setKategoriList(data);
    } catch {
      toastError('Gagal memuat data kategori.');
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tambah kategori ──────────────────────────────────────────────────────
  const handleCreate = async (data: { nama: string; icon: string; warna: string }) => {
    setFormLoading(true);
    try {
      const res = await fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal membuat kategori.');
      setKategoriList((prev) => [...prev, json].sort((a, b) => a.nama.localeCompare(b.nama)));
      setShowForm(false);
      success(`Kategori "${data.nama}" berhasil ditambahkan.`);
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit kategori ────────────────────────────────────────────────────────
  const handleEdit = async (data: { nama: string; icon: string; warna: string }) => {
    if (!editTarget) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/kategori/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal memperbarui kategori.');
      setKategoriList((prev) =>
        prev.map((k) => (k.id === editTarget.id ? json : k))
            .sort((a, b) => a.nama.localeCompare(b.nama))
      );
      setEditTarget(null);
      success(`Kategori berhasil diperbarui.`);
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Toggle aktif/nonaktif ────────────────────────────────────────────────
  const handleToggle = async (kategori: KategoriAdmin) => {
    setToggling(kategori.id);
    try {
      const res = await fetch(`/api/kategori/${kategori.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !kategori.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal mengubah status.');
      setKategoriList((prev) => prev.map((k) => (k.id === kategori.id ? json : k)));
      success(
        json.isActive
          ? `"${kategori.nama}" diaktifkan — tampil di peta.`
          : `"${kategori.nama}" dinonaktifkan — disembunyikan dari peta.`
      );
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setToggling(null);
    }
  };

  // ── Hapus kategori ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/kategori/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Gagal menghapus kategori.');
      setKategoriList((prev) => prev.filter((k) => k.id !== deleteTarget.id));
      setDeleteTarget(null);
      success(`Kategori "${deleteTarget.nama}" berhasil dihapus.`);
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const aktifCount    = kategoriList.filter((k) => k.isActive).length;
  const nonaktifCount = kategoriList.filter((k) => !k.isActive).length;

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-surface">
      {/* Toast */}
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <ConfirmDeleteModal
          kategori={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleteLoading}
        />
      )}

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-1">
              Kelola Kategori
            </h1>
            <p className="text-sm text-on-surface/60">
              Atur kategori laporan yang tersedia di peta dan form pelaporan warga
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dim text-white rounded-xl text-sm font-semibold transition-colors shadow-ambient self-start"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Tambah Kategori
          </button>
        </div>

        {/* ── Stat Strip ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Kategori',  value: kategoriList.length, color: 'text-on-surface' },
            { label: 'Aktif',           value: aktifCount,           color: 'text-[#006d4a]' },
            { label: 'Nonaktif',        value: nonaktifCount,        color: 'text-on-surface/40' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-lowest rounded-2xl shadow-ambient p-4 text-center"
            >
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-on-surface/50 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Form Tambah (inline, bukan modal) ────────────────────────── */}
        {showForm && !editTarget && (
          <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-on-surface text-base">
                Tambah Kategori Baru
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface/50 hover:text-on-surface transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <KategoriForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isLoading={formLoading}
            />
          </div>
        )}

        {/* ── Loading State ─────────────────────────────────────────────── */}
        {isPageLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────── */}
        {!isPageLoading && kategoriList.length === 0 && (
          <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface-container-low rounded-full flex items-center justify-center">
              <Tag className="w-8 h-8 text-on-surface/30" strokeWidth={1} />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">Belum ada kategori</h3>
            <p className="text-sm text-on-surface/50">
              Tambah kategori pertama untuk mulai menerima laporan dari warga.
            </p>
          </div>
        )}

        {/* ── Daftar Kategori ───────────────────────────────────────────── */}
        {!isPageLoading && kategoriList.length > 0 && (
          <div className="space-y-3">
            {kategoriList.map((kat) => (
              <div key={kat.id}>
                {/* Form Edit inline (menggantikan kartu) */}
                {editTarget?.id === kat.id ? (
                  <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display font-semibold text-on-surface text-base">
                        Edit Kategori
                      </h2>
                      <button
                        onClick={() => setEditTarget(null)}
                        className="p-1.5 rounded-xl hover:bg-surface-container-low text-on-surface/50 hover:text-on-surface transition-colors"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                    <KategoriForm
                      initial={editTarget}
                      onSubmit={handleEdit}
                      onCancel={() => setEditTarget(null)}
                      isLoading={formLoading}
                    />
                  </div>
                ) : (
                  /* ── Kartu Kategori ── */
                  <div
                    className={`bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden transition-all ${
                      !kat.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary/10"
                      >
                        <DynamicIcon
                          iconName={kat.icon}
                          className="w-5 h-5 text-primary"
                          strokeWidth={1.5}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-on-surface text-sm sm:text-base truncate">
                            {kat.nama}
                          </span>
                          {!kat.isActive && (
                            <span className="px-2 py-0.5 bg-surface-container-high text-on-surface/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface/50 mt-0.5">
                          {kat._count.laporan} laporan
                        </p>
                      </div>

                      {/* Aksi */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Toggle aktif */}
                        <button
                          onClick={() => handleToggle(kat)}
                          disabled={toggling === kat.id}
                          title={kat.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          className="p-2 rounded-xl hover:bg-surface-container-low text-on-surface/50 hover:text-on-surface transition-colors disabled:opacity-40"
                        >
                          {toggling === kat.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : kat.isActive ? (
                            <ToggleRight className="w-5 h-5 text-[#006d4a]" strokeWidth={1.5} />
                          ) : (
                            <ToggleLeft className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => { setShowForm(false); setEditTarget(kat); }}
                          title="Edit"
                          className="p-2 rounded-xl hover:bg-surface-container-low text-on-surface/50 hover:text-on-surface transition-colors"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </button>

                        {/* Hapus (hanya jika tidak ada laporan) */}
                        <button
                          onClick={() => setDeleteTarget(kat)}
                          title={
                            kat._count.laporan > 0
                              ? `Tidak dapat dihapus (${kat._count.laporan} laporan terkait)`
                              : 'Hapus'
                          }
                          disabled={kat._count.laporan > 0}
                          className="p-2 rounded-xl hover:bg-red-50 text-on-surface/50 hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Keterangan Sinkronisasi ───────────────────────────────────── */}
        {!isPageLoading && kategoriList.length > 0 && (
          <p className="text-xs text-on-surface/40 text-center mt-6 leading-relaxed">
            Kategori yang <span className="font-semibold">Aktif</span> akan otomatis
            tampil sebagai filter di peta warga, peta admin, dan form buat laporan.
          </p>
        )}
      </div>
    </div>
  );
}
