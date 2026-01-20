import React, { useState } from 'react';
import { X, Banknote, Calculator } from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const PaymentModal = ({ total, onClose, onPay }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const change = paymentAmount ? parseInt(paymentAmount) - total : 0;
  const isValid = paymentAmount && parseInt(paymentAmount) >= total;

  const quickAmounts = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total);

  const handlePay = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onPay(parseInt(paymentAmount));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="payment-modal">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Pembayaran</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="payment-total">
              {formatRupiah(total)}
            </p>
          </div>

          {/* Quick Amounts */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Uang Pas:</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setPaymentAmount(amount.toString())}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    parseInt(paymentAmount) === amount
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  data-testid={`quick-amount-${amount}`}
                >
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Uang Diterima
            </label>
            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                placeholder="Masukkan jumlah"
                autoFocus
                data-testid="payment-amount-input"
              />
            </div>
          </div>

          {/* Change */}
          {paymentAmount && (
            <div
              className={`rounded-xl p-4 mb-6 ${
                change >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className={`w-5 h-5 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`font-medium ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {change >= 0 ? 'Kembalian' : 'Kurang'}
                  </span>
                </div>
                <span
                  className={`text-xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}
                  data-testid="change-amount"
                >
                  {formatRupiah(Math.abs(change))}
                </span>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={!isValid || loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            data-testid="confirm-pay-btn"
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
