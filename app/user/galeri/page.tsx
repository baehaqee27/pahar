import React from "react";

export default function GaleriPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4">Galeri</h1>
      <p className="text-gray-600">Koleksi galeri akan ditampilkan di sini.</p>
      <div className="mt-4">
        <button className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600">
          Lihat Galeri
        </button>
      </div>
    </div>
  );
}
