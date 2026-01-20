import React, { useState, useEffect } from 'react';
import { getReportSummary, getDailyReport, exportReport } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  Calendar,
  TrendingUp,
  Receipt,
  Package,
  Download,
  Loader2,
  BarChart3,
  Banknote,
  QrCode,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
};

const ReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await getReportSummary(startDate, endDate);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await exportReport(startDate, endDate, format);
      
      if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([response.data.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON file
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan_${startDate}_to_${endDate}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport laporan');
    } finally {
      setExporting(false);
    }
  };

  const setQuickRange = (range) => {
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'today':
        start = today;
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      default:
        start = today;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  // Only owner can access
  if (user?.role !== 'pemilik') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-500">Hanya pemilik yang bisa mengakses laporan</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'tunai': return <Banknote className="w-5 h-5 text-green-600" />;
      case 'qris': return <QrCode className="w-5 h-5 text-purple-600" />;
      case 'transfer': return <Building2 className="w-5 h-5 text-blue-600" />;
      default: return <Banknote className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="p-6" data-testid="reports-page">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
            <p className="text-gray-500">Analisis performa toko kamu</p>
          </div>
          
          {/* Date Range & Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Range Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setQuickRange('today')}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Hari Ini
              </button>
              <button
                onClick={() => setQuickRange('week')}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                7 Hari
              </button>
              <button
                onClick={() => setQuickRange('month')}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                30 Hari
              </button>
            </div>
            
            {/* Date Inputs */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                data-testid="start-date"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                data-testid="end-date"
              />
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                data-testid="export-csv-btn"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                data-testid="export-json-btn"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Sales */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-blue-100">Total Penjualan</span>
                </div>
                <p className="text-3xl font-bold" data-testid="total-sales">
                  {reportData.summary.total_sales_formatted}
                </p>
              </div>

              {/* Transactions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-500">Transaksi</span>
                </div>
                <p className="text-3xl font-bold text-gray-900" data-testid="total-transactions">
                  {reportData.summary.total_transactions}
                </p>
              </div>

              {/* Items Sold */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-500">Barang Terjual</span>
                </div>
                <p className="text-3xl font-bold text-gray-900" data-testid="total-items">
                  {reportData.summary.total_items_sold}
                </p>
              </div>

              {/* Avg Transaction */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-500">Rata-rata/Transaksi</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatRupiah(reportData.summary.avg_transaction)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-gray-400" />
                  Metode Pembayaran
                </h3>
                {Object.keys(reportData.payment_breakdown).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada data</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(reportData.payment_breakdown).map(([method, data]) => (
                      <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {getPaymentIcon(method)}
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{method}</p>
                            <p className="text-sm text-gray-500">{data.count} transaksi</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">{formatRupiah(data.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Items */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  Produk Terlaris
                </h3>
                {reportData.top_items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Belum ada data</p>
                ) : (
                  <div className="space-y-3">
                    {reportData.top_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.qty} terjual</p>
                          </div>
                        </div>
                        <p className="font-bold text-blue-600">{formatRupiah(item.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Sales Chart */}
            {Object.keys(reportData.daily_sales).length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border mt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  Penjualan Harian
                </h3>
                <div className="space-y-2">
                  {Object.entries(reportData.daily_sales)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, data]) => {
                      const maxAmount = Math.max(...Object.values(reportData.daily_sales).map(d => d.amount));
                      const percentage = (data.amount / maxAmount) * 100;
                      
                      return (
                        <div key={date} className="flex items-center gap-4">
                          <span className="w-24 text-sm text-gray-500">{date}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xs text-white font-medium">
                                {formatRupiah(data.amount)}
                              </span>
                            </div>
                          </div>
                          <span className="w-16 text-sm text-gray-500 text-right">
                            {data.transactions} tx
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada data untuk periode ini</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
