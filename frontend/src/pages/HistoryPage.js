import React, { useState, useEffect } from 'react';
import { getTransactions, getTransaction, voidTransaction } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Receipt, Calendar, Loader2, Eye, Package, XCircle, Ban, Check } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [transactionToVoid, setTransactionToVoid] = useState(null);
  const [voiding, setVoiding] = useState(false);
  const { tenant, user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [selectedDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions(selectedDate);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewReceipt = async (transaction) => {
    try {
      const response = await getTransaction(transaction.id);
      setSelectedTransaction({
        ...response.data.transaction,
        receipt: response.data.receipt,
      });
      setShowReceipt(true);
    } catch (error) {
      console.error('Error fetching transaction:', error);
    }
  };

  const openVoidModal = (transaction) => {
    setTransactionToVoid(transaction);
    setVoidReason('');
    setShowVoidModal(true);
  };

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      alert('Alasan pembatalan harus diisi');
      return;
    }

    setVoiding(true);
    try {
      await voidTransaction(transactionToVoid.id, voidReason);
      setShowVoidModal(false);
      setTransactionToVoid(null);
      setVoidReason('');
      fetchTransactions();
    } catch (error) {
      console.error('Void error:', error);
      alert(error.response?.data?.detail || 'Gagal membatalkan transaksi');
    } finally {
      setVoiding(false);
    }
  };

  const completedTransactions = transactions.filter(t => t.status === 'selesai');
  const voidedTransactions = transactions.filter(t => t.status === 'void');
  const totalSales = completedTransactions.reduce((sum, t) => sum + t.total, 0);

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'tunai': return 'Tunai';
      case 'qris': return 'QRIS';
      case 'transfer': return 'Transfer';
      default: return method;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'tunai': return 'bg-green-100 text-green-700';
      case 'qris': return 'bg-purple-100 text-purple-700';
      case 'transfer': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div className="p-6" data-testid="history-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Penjualan</h1>
            <p className="text-gray-500">Lihat semua transaksi</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="date-picker"
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Penjualan</p>
              <p className="text-3xl font-bold mt-1" data-testid="total-sales">
                {formatRupiah(totalSales)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Transaksi</p>
              <p className="text-3xl font-bold mt-1" data-testid="transaction-count">
                {completedTransactions.length}
              </p>
            </div>
            {voidedTransactions.length > 0 && (
              <div className="text-right">
                <p className="text-blue-100 text-sm">Dibatalkan</p>
                <p className="text-xl font-bold mt-1 text-red-200">
                  {voidedTransactions.length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada transaksi di tanggal ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`bg-white rounded-xl p-4 shadow-sm border ${
                  transaction.status === 'void' ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.status === 'void' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {transaction.status === 'void' ? (
                        <Ban className="w-5 h-5 text-red-600" />
                      ) : (
                        <Receipt className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          #{transaction.transaction_number}
                        </p>
                        {transaction.status === 'void' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Dibatalkan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatTime(transaction.created_at)} • {transaction.created_by_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.status === 'void' ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}>
                        {formatRupiah(transaction.total)}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          getPaymentMethodColor(transaction.payment_method)
                        }`}>
                          {getPaymentMethodLabel(transaction.payment_method)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {transaction.items.length} item
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => viewReceipt(transaction)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        data-testid={`view-receipt-${transaction.id}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {transaction.status !== 'void' && user?.role === 'pemilik' && (
                        <button
                          onClick={() => openVoidModal(transaction)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          data-testid={`void-${transaction.id}`}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                  {transaction.items.map((item, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        transaction.status === 'void' 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.name} x{item.qty}
                    </span>
                  ))}
                </div>

                {/* Void reason */}
                {transaction.status === 'void' && transaction.void_reason && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-red-600">
                      <strong>Alasan:</strong> {transaction.void_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          tenant={tenant}
          onClose={() => {
            setShowReceipt(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {/* Void Modal */}
      {showVoidModal && transactionToVoid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="void-modal">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Batalkan Transaksi</h2>
              <p className="text-gray-500 text-sm">
                #{transactionToVoid.transaction_number} - {formatRupiah(transactionToVoid.total)}
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <p className="text-red-700 text-sm">
                  <strong>Perhatian:</strong> Transaksi yang dibatalkan tidak bisa dikembalikan.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Pembatalan *
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Contoh: Salah input, pelanggan batal"
                  data-testid="void-reason-input"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowVoidModal(false);
                    setTransactionToVoid(null);
                    setVoidReason('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleVoid}
                  disabled={voiding || !voidReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="confirm-void-btn"
                >
                  {voiding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Batalkan Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HistoryPage;
