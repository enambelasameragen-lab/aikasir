import React, { useState, useEffect } from 'react';
import { getStockSummary, getStockAlerts, adjustStock, getStockHistory, updateItem } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  Settings,
  Loader2,
  History,
  X,
  Check,
  Search,
  Bell,
  RefreshCw,
  Edit2,
} from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const StockPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stockHistory, setStockHistory] = useState([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchData();
  }, [showLowStockOnly]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockRes, alertsRes] = await Promise.all([
        getStockSummary(showLowStockOnly),
        getStockAlerts()
      ]);
      setStockData(stockRes.data);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustmentType('add');
    setAdjustmentQty('');
    setAdjustmentReason('');
    setShowAdjustModal(true);
  };

  const openHistoryModal = async (item) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
    try {
      const response = await getStockHistory(item.id);
      setStockHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
      setStockHistory([]);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustmentQty || parseInt(adjustmentQty) <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }

    setSubmitting(true);
    try {
      await adjustStock(
        selectedItem.id,
        adjustmentType,
        parseInt(adjustmentQty),
        adjustmentReason || null
      );
      setShowAdjustModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert(error.response?.data?.detail || 'Gagal menyesuaikan stok');
    } finally {
      setSubmitting(false);
    }
  };

  const getStockStatus = (item) => {
    const stock = item.stock || 0;
    const threshold = item.low_stock_threshold || 10;
    
    if (stock === 0) {
      return { label: 'Habis', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    } else if (stock <= threshold) {
      return { label: 'Hampir Habis', color: 'bg-yellow-100 text-yellow-700', icon: TrendingDown };
    }
    return { label: 'Tersedia', color: 'bg-green-100 text-green-700', icon: Check };
  };

  const getAdjustmentTypeLabel = (type) => {
    switch (type) {
      case 'add': return 'Tambah';
      case 'subtract': return 'Kurang';
      case 'set': return 'Set';
      case 'sale': return 'Penjualan';
      case 'void_return': return 'Batal Transaksi';
      default: return type;
    }
  };

  const getAdjustmentTypeColor = (type) => {
    switch (type) {
      case 'add': return 'text-green-600';
      case 'subtract': 
      case 'sale': return 'text-red-600';
      case 'set': return 'text-blue-600';
      case 'void_return': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Filter items by search
  const filteredItems = stockData?.items?.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Only owner can access
  if (user?.role !== 'pemilik') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-500">Hanya pemilik yang bisa mengakses manajemen stok</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6" data-testid="stock-page">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok</h1>
            <p className="text-gray-500">Kelola stok barang toko kamu</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Stok rendah saja</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-orange-800">
                    {alerts.length} Peringatan Stok
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {alerts.slice(0, 6).map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl ${
                        alert.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          alert.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {alert.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-500">Barang Terlacak</span>
                </div>
                <p className="text-3xl font-bold text-gray-900" data-testid="total-tracked">
                  {stockData?.summary?.total_tracked_items || 0}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-gray-500">Stok Rendah</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600" data-testid="low-stock-count">
                  {stockData?.summary?.low_stock_count || 0}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-gray-500">Stok Habis</span>
                </div>
                <p className="text-3xl font-bold text-red-600" data-testid="out-of-stock-count">
                  {stockData?.summary?.out_of_stock_count || 0}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari barang..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="stock-search"
                />
              </div>
            </div>

            {/* Stock Items Table */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {stockData?.items?.length === 0 
                    ? 'Belum ada barang dengan pelacakan stok'
                    : 'Tidak ada barang yang cocok'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Barang</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Stok</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Batas Minimum</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredItems.map((item) => {
                        const status = getStockStatus(item);
                        const StatusIcon = status.icon;
                        
                        return (
                          <tr key={item.id} data-testid={`stock-item-${item.id}`}>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{formatRupiah(item.price)}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-2xl font-bold text-gray-900" data-testid={`stock-qty-${item.id}`}>
                                {item.stock || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-500">
                              {item.low_stock_threshold || 10}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openAdjustModal(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Sesuaikan Stok"
                                  data-testid={`adjust-stock-${item.id}`}
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openHistoryModal(item)}
                                  className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                                  title="Riwayat Stok"
                                  data-testid={`stock-history-${item.id}`}
                                >
                                  <History className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="adjust-stock-modal">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Sesuaikan Stok</h2>
              <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-gray-900">{selectedItem.name}</p>
                <p className="text-gray-500">Stok saat ini: <span className="font-bold">{selectedItem.stock || 0}</span></p>
              </div>

              {/* Adjustment Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Penyesuaian</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAdjustmentType('add')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      adjustmentType === 'add' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                    data-testid="adjustment-type-add"
                  >
                    <Plus className={`w-5 h-5 mx-auto ${adjustmentType === 'add' ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className="text-sm mt-1">Tambah</p>
                  </button>
                  <button
                    onClick={() => setAdjustmentType('subtract')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      adjustmentType === 'subtract' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    data-testid="adjustment-type-subtract"
                  >
                    <Minus className={`w-5 h-5 mx-auto ${adjustmentType === 'subtract' ? 'text-red-600' : 'text-gray-400'}`} />
                    <p className="text-sm mt-1">Kurang</p>
                  </button>
                  <button
                    onClick={() => setAdjustmentType('set')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      adjustmentType === 'set' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    data-testid="adjustment-type-set"
                  >
                    <Settings className={`w-5 h-5 mx-auto ${adjustmentType === 'set' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="text-sm mt-1">Set</p>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {adjustmentType === 'set' ? 'Jumlah Stok Baru' : 'Jumlah'}
                </label>
                <input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan jumlah"
                  min="1"
                  data-testid="adjustment-quantity"
                />
              </div>

              {/* Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alasan (Opsional)</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Stok masuk, Rusak, Koreksi"
                  data-testid="adjustment-reason"
                />
              </div>

              {/* Preview */}
              {adjustmentQty && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    Stok setelah penyesuaian:{' '}
                    <span className="font-bold">
                      {adjustmentType === 'add' 
                        ? (selectedItem.stock || 0) + parseInt(adjustmentQty || 0)
                        : adjustmentType === 'subtract'
                        ? (selectedItem.stock || 0) - parseInt(adjustmentQty || 0)
                        : parseInt(adjustmentQty || 0)
                      }
                    </span>
                  </p>
                </div>
              )}

              <button
                onClick={handleAdjustStock}
                disabled={submitting || !adjustmentQty}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="submit-adjustment"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Simpan Penyesuaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="stock-history-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Riwayat Stok</h2>
                <p className="text-gray-500">{selectedItem.name}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {stockHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada riwayat perubahan stok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockHistory.map((record, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${getAdjustmentTypeColor(record.adjustment_type)}`}>
                          {getAdjustmentTypeLabel(record.adjustment_type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Stok:</span>
                        <span className="font-medium">{record.stock_before}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{record.stock_after}</span>
                        <span className={`${
                          record.stock_after > record.stock_before ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ({record.stock_after > record.stock_before ? '+' : ''}{record.stock_after - record.stock_before})
                        </span>
                      </div>
                      {record.reason && (
                        <p className="text-sm text-gray-500 mt-1">{record.reason}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">oleh {record.created_by_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StockPage;
