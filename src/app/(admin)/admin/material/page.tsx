"use client";

import { useState } from "react";
import { Package, TrendingUp, Edit3, Save, X, AlertCircle } from "lucide-react";

interface Material {
  id: string;
  name: string;
  category: string;
  price_per_kg: number;
  unit: string;
  is_active: boolean;
  updated_at: string;
}

const MOCK_MATERIALS: Material[] = [
  { id: "m1", name: "Kertas HVS", category: "Kertas", price_per_kg: 2000, unit: "kg", is_active: true, updated_at: "2024-11-07" },
  { id: "m2", name: "Kardus / Karton", category: "Kertas", price_per_kg: 1000, unit: "kg", is_active: true, updated_at: "2024-11-07" },
  { id: "m3", name: "Plastik PET (Botol)", category: "Plastik", price_per_kg: 3000, unit: "kg", is_active: true, updated_at: "2024-10-15" },
  { id: "m4", name: "Plastik HD (Ember)", category: "Plastik", price_per_kg: 1500, unit: "kg", is_active: true, updated_at: "2024-10-15" },
  { id: "m5", name: "Logam Campuran", category: "Logam", price_per_kg: 1000, unit: "kg", is_active: true, updated_at: "2024-09-20" },
  { id: "m6", name: "Aluminium", category: "Logam", price_per_kg: 8000, unit: "kg", is_active: true, updated_at: "2024-09-20" },
  { id: "m7", name: "Kaca Bening", category: "Kaca", price_per_kg: 200, unit: "kg", is_active: false, updated_at: "2024-08-01" },
];

export default function AdminMaterialPage() {
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [notice, setNotice] = useState("");

  const handleEdit = (m: Material) => {
    setEditing(m.id);
    setEditPrice(String(m.price_per_kg));
    setNotice("");
  };

  const handleSave = (id: string) => {
    const price = parseInt(editPrice);
    if (isNaN(price) || price < 0) {
      setNotice("Harga tidak valid");
      return;
    }
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, price_per_kg: price, updated_at: new Date().toISOString().split("T")[0] }
          : m
      )
    );
    setEditing(null);
    setNotice("");
  };

  const categories = [...new Set(materials.map((m) => m.category))];

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Master Material</div>
          <div className="text-white font-semibold">
            Kelola harga {materials.filter(m => m.is_active).length} material aktif. Perubahan harga berlaku untuk transaksi baru — transaksi lama menggunakan snapshot harga saat timbang.
          </div>
        </div>
      </div>

      {/* Price immutability notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <span className="font-semibold">Snapshot harga: </span>
          Harga saat ini hanya berlaku untuk transaksi mendatang. Transaksi yang sudah ada menyimpan harga snapshot-nya sendiri dan tidak terpengaruh perubahan ini.
        </div>
      </div>

      {/* Material by category */}
      {categories.map((cat) => (
        <div key={cat} className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E1E8E3] bg-[#F6F8F5] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#3D9274]" />
            <span className="text-sm font-semibold text-[#1E2925]">{cat}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E1E8E3]">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Material</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Harga / kg</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Diperbarui</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E8E3]">
              {materials.filter(m => m.category === cat).map((m) => (
                <tr key={m.id} className="hover:bg-[#F6F8F5]">
                  <td className="px-4 py-3 font-medium text-[#1E2925]">{m.name}</td>
                  <td className="px-4 py-3">
                    {editing === m.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#66736D]">Rp</span>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 border border-[#E1E8E3] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#3D9274]"
                          autoFocus
                        />
                        <span className="text-[#66736D]">/kg</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-[#1E2925]">
                        Rp {m.price_per_kg.toLocaleString("id-ID")}<span className="text-[#66736D] font-normal">/kg</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${m.is_active ? "bg-[#DDF3EC] text-[#173F35]" : "bg-[#F6F8F5] text-[#66736D]"}`}>
                      {m.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#66736D]">{m.updated_at}</td>
                  <td className="px-4 py-3">
                    {editing === m.id ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleSave(m.id)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#173F35] text-white rounded-lg text-xs font-semibold hover:bg-[#246B56]">
                          <Save className="w-3 h-3" />Simpan
                        </button>
                        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E1E8E3] text-[#66736D] rounded-lg text-xs hover:bg-[#F6F8F5]">
                          <X className="w-3 h-3" />Batal
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(m)} className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E1E8E3] text-[#66736D] rounded-lg text-xs hover:bg-[#F6F8F5]">
                        <Edit3 className="w-3 h-3" />Edit Harga
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
