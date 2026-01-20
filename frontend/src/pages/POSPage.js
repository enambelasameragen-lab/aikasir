import React, { useState, useEffect } from 'react';
import { getItems, createTransaction } from '../api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Loader2,
  Search,
  Package,
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const POSPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const { tenant } = useAuth();
  const {
    items: cartItems,
    addItem,
    incrementQty,
    decrementQty,
    removeItem,
    clearCart,
    total,
  } = useCart();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await getItems(true, search);
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

  const handlePayment = async (paymentMethod, paymentAmount, paymentReference) => {
    try {
      const transactionItems = cartItems.map((item) => ({
        item_id: item.id,
        qty: item.qty,
      }));

      const response = await createTransaction(
        transactionItems,
        paymentMethod,
        paymentAmount,
        paymentReference
      );

      setLastTransaction(response.data);
      setShowPayment(false);
      setShowReceipt(true);
      clearCart();
    } catch (error) {
      console.error('Transaction error:', error);
      alert(error.response?.data?.detail || 'Gagal membuat transaksi');
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  };

  return (
    <Layout>
      <div className="h-full flex" data-testid="pos-page">
        {/* Products Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari barang..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="search-input"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Package className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Belum ada barang</p>
                <p className="text-sm">Tambah barang di menu "Barang"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 text-left"
                    data-testid={`item-${item.id}`}
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 font-semibold text-sm mt-1">
                      {formatRupiah(item.price)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white border-l flex flex-col" data-testid="cart-sidebar">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Keranjang</h2>
              {cartItems.length > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {cartItems.length} item
                </span>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p className="text-sm">Keranjang kosong</p>
                <p className="text-xs">Tap barang untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-xl p-3"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </h4>
                        <p className="text-blue-600 text-sm">
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        data-testid={`remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrementQty(item.id)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                          data-testid={`decrement-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => incrementQty(item.id)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                          data-testid={`increment-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatRupiah(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900" data-testid="cart-total">
                {formatRupiah(total)}
              </span>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              disabled={cartItems.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="pay-btn"
            >
              <CreditCard className="w-5 h-5" />
              Bayar
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onPay={handlePayment}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          tenant={tenant}
          onClose={closeReceipt}
        />
      )}
    </Layout>
  );
};

export default POSPage;
