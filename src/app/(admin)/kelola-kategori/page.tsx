"use client";

import { useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    "Jalan Rusak",
    "Banjir",
    "Sampah",
  ]);

  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    setCategories([...categories, newCategory]);
    setNewCategory("");
  };

  const handleDelete = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Kelola Kategori
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Tambah Kategori
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Masukkan kategori"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />

          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Tambah
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Daftar Kategori
        </h2>

        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between border p-4 rounded-xl"
            >
              <span>{category}</span>

              <button
                onClick={() => handleDelete(index)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}