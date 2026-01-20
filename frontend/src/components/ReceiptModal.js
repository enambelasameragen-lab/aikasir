import React from 'react';
import { X, Printer, Share2, CheckCircle } from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ReceiptModal = ({ transaction, tenant, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const receiptText = `
${tenant?.name || 'Toko'}
${tenant?.address || ''}
${tenant?.phone ? `WA: ${tenant.phone}` : ''}

#${transaction.transaction_number}
${formatDateTime(transaction.created_at)}

${transaction.items.map(item => `${item.name} x${item.qty} = ${formatRupiah(item.subtotal)}`).join('\n')}

Total: ${formatRupiah(transaction.total)}
Bayar: ${formatRupiah(transaction.payment_amount)}
Kembali: ${formatRupiah(transaction.change_amount)}

Terima kasih!
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Struk #${transaction.transaction_number}`,
          text: receiptText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(receiptText);
      alert('Struk disalin ke clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="receipt-modal">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
        </div>

        {/* Receipt Content */}
        <div className="p-6" data-testid="receipt-content">
          {/* Store Info */}
          <div className="text-center border-b border-dashed pb-4 mb-4">
            <h3 className="font-bold text-gray-900">{tenant?.name || 'Toko'}</h3>
            {tenant?.address && (
              <p className="text-sm text-gray-500">{tenant.address}</p>
            )}
            {tenant?.phone && (
              <p className="text-sm text-gray-500">WA: {tenant.phone}</p>
            )}
          </div>

          {/* Transaction Info */}
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>#{transaction.transaction_number}</span>
            <span>{formatDateTime(transaction.created_at)}</span>
          </div>

          {/* Items */}
          <div className="space-y-2 border-b border-dashed pb-4 mb-4">
            {transaction.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} x{item.qty}
                </span>
                <span className="text-gray-900 font-medium">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-lg text-gray-900" data-testid="receipt-total">
                {formatRupiah(transaction.total)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Bayar ({transaction.payment_method})</span>
              <span className="text-gray-700">
                {formatRupiah(transaction.payment_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Kembali</span>
              <span className="text-green-600 font-medium">
                {formatRupiah(transaction.change_amount)}
              </span>
            </div>
          </div>

          {/* Thank You */}
          <div className="text-center mt-6 pt-4 border-t border-dashed">
            <p className="text-gray-500 text-sm">🙏 Terima kasih!</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            data-testid="share-receipt-btn"
          >
            <Share2 className="w-5 h-5" />
            Bagikan
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
            data-testid="print-receipt-btn"
          >
            <Printer className="w-5 h-5" />
            Cetak
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700"
            data-testid="close-receipt-btn"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
