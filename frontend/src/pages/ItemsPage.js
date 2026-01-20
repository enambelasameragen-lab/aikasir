import React, { useState, useEffect } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  Plus,
  Search,
  Package,
  Loader2,
  Pencil,
  Trash2,
  X,
  Save,
  Boxes,
  AlertTriangle,
} from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const ItemsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    track_stock: false, 
    stock: '',
    low_stock_threshold: '10'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await getItems(false, search);
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ 
      name: '', 
      price: '', 
      track_stock: false, 
      stock: '',
      low_stock_threshold: '10'
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({ 
      name: item.name, 
      price: item.price.toString(),
      track_stock: item.track_stock || false,
      stock: item.stock?.toString() || '0',
      low_stock_threshold: item.low_stock_threshold?.toString() || '10'
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData({ 
      name: '', 
      price: '', 
      track_stock: false, 
      stock: '',
      low_stock_threshold: '10'
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Nama barang harus diisi');
      return;
    }

    const price = parseInt(formData.price);
    if (!price || price <= 0) {
      setError('Harga harus lebih dari 0');
      return;
    }

    setSaving(true);
    try {
      if (editItem) {
        await updateItem(editItem.id, { name: formData.name, price });
      } else {
        await createItem(formData.name, price);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan barang');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin hapus "${item.name}"?`)) return;

    try {
      await deleteItem(item.id);
      fetchItems();
    } catch (error) {
      alert('Gagal menghapus barang');
    }
  };

  return (
    <Layout>
      <div className="p-6" data-testid="items-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Barang</h1>
            <p className="text-gray-500">Kelola barang jualan kamu</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            data-testid="add-item-btn"
          >
            <Plus className="w-5 h-5" />
            Tambah Barang
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari barang..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="search-items"
            />
          </div>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada barang</p>
            <button
              onClick={openAddModal}
              className="text-blue-600 hover:text-blue-800 font-medium mt-2"
            >
              Tambah barang pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Nama Barang
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600">
                    Harga
                  </th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50" data-testid={`item-row-${item.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          data-testid={`edit-${item.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          data-testid={`delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md" data-testid="item-modal">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editItem ? 'Edit Barang' : 'Tambah Barang'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Kopi Susu"
                  autoFocus
                  data-testid="item-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 15000"
                  min="0"
                  data-testid="item-price-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="save-item-btn"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ItemsPage;
