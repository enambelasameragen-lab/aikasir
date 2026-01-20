import React, { useState } from 'react';
import { X, Banknote, Calculator, QrCode, Building2, Check } from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
};

const PaymentModal = ({ total, onClose, onPay }) => {
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);

  const change = paymentAmount ? parseInt(paymentAmount) - total : 0;
  
  // Validation based on payment method
  const isValidTunai = paymentAmount && parseInt(paymentAmount) >= total;
  const isValidNonTunai = paymentMethod !== 'tunai'; // Non-cash always valid (exact amount)
  const isValid = paymentMethod === 'tunai' ? isValidTunai : isValidNonTunai;

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
      const amount = paymentMethod === 'tunai' ? parseInt(paymentAmount) : total;
      await onPay(paymentMethod, amount, paymentReference || null);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'tunai', label: 'Tunai', icon: Banknote, color: 'green' },
    { id: 'qris', label: 'QRIS', icon: QrCode, color: 'purple' },
    { id: 'transfer', label: 'Transfer', icon: Building2, color: 'blue' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="payment-modal">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Pembayaran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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

          {/* Payment Method Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    if (method.id !== 'tunai') {
                      setPaymentAmount(total.toString());
                    } else {
                      setPaymentAmount('');
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id
                      ? `border-${method.color}-500 bg-${method.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`method-${method.id}`}
                >
                  <method.icon className={`w-6 h-6 mx-auto mb-2 ${
                    paymentMethod === method.id ? `text-${method.color}-600` : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    paymentMethod === method.id ? `text-${method.color}-700` : 'text-gray-600'
                  }`}>
                    {method.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Tunai Payment Options */}
          {paymentMethod === 'tunai' && (
            <>
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
                          ? 'bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                      data-testid={`quick-amount-${amount}`}
                    >
                      {formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uang Diterima
                </label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-medium"
                    placeholder="Masukkan jumlah"
                    autoFocus
                    data-testid="payment-amount-input"
                  />
                </div>
              </div>

              {/* Change */}
              {paymentAmount && (
                <div className={`rounded-xl p-4 mb-4 ${change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className={`w-5 h-5 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`font-medium ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {change >= 0 ? 'Kembalian' : 'Kurang'}
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`} data-testid="change-amount">
                      {formatRupiah(Math.abs(change))}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* QRIS Payment */}
          {paymentMethod === 'qris' && (
            <div className="mb-4">
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <QrCode className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-700 font-medium mb-2">Scan QRIS untuk membayar</p>
                <p className="text-3xl font-bold text-purple-900 mb-4">{formatRupiah(total)}</p>
                <p className="text-sm text-purple-600">
                  Setelah pembeli scan & bayar, klik tombol "Konfirmasi Pembayaran"
                </p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Referensi (Opsional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Masukkan nomor referensi"
                  data-testid="payment-reference-input"
                />
              </div>
            </div>
          )}

          {/* Transfer Payment */}
          {paymentMethod === 'transfer' && (
            <div className="mb-4">
              <div className="bg-blue-50 rounded-xl p-6">
                <Building2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-700 font-medium mb-2 text-center">Transfer Bank</p>
                <p className="text-3xl font-bold text-blue-900 text-center mb-4">{formatRupiah(total)}</p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Rekening Tujuan:</p>
                  <p className="font-mono font-bold text-lg">1234-5678-9012</p>
                  <p className="text-sm text-gray-600">a.n. Kopi Bang Jago</p>
                </div>
                <p className="text-sm text-blue-600 text-center">
                  Setelah transfer, masukkan nomor referensi dan klik "Konfirmasi"
                </p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Referensi / Bukti Transfer
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nomor referensi"
                  data-testid="payment-reference-input"
                />
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={!isValid || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              paymentMethod === 'tunai'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : paymentMethod === 'qris'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
            }`}
            data-testid="confirm-pay-btn"
          >
            {loading ? (
              'Memproses...'
            ) : (
              <>
                <Check className="w-5 h-5" />
                {paymentMethod === 'tunai' ? 'Bayar Sekarang' : 'Konfirmasi Pembayaran'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
