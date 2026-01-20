import React, { useState, useEffect } from 'react';
import { getTransactions, getTransaction } from '../api';
import Layout from '../components/Layout';
import { Receipt, Calendar, Loader2, Eye, Package } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import { useAuth } from '../contexts/AuthContext';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
  const { tenant } = useAuth();

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

  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);

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
                {transactions.length}
              </p>
            </div>
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
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        #{transaction.transaction_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(transaction.created_at)} • {transaction.created_by_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-gray-900">
                        {formatRupiah(transaction.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.items.length} item
                      </p>
                    </div>
                    <button
                      onClick={() => viewReceipt(transaction)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      data-testid={`view-receipt-${transaction.id}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                  {transaction.items.map((item, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
                    >
                      {item.name} x{item.qty}
                    </span>
                  ))}
                </div>
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
    </Layout>
  );
};

export default HistoryPage;
