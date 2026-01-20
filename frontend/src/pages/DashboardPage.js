import React, { useState, useEffect } from 'react';
import { getDashboardToday } from '../api';
import Layout from '../components/Layout';
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  Award,
  Loader2,
  Package,
} from 'lucide-react';

const formatRupiah = (num) => {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboardToday();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6" data-testid="dashboard-page">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ringkasan Hari Ini</h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Sales */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white" data-testid="total-sales-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm">Total Penjualan</p>
            <p className="text-3xl font-bold mt-1" data-testid="total-sales">
              {data?.total_sales_formatted || formatRupiah(0)}
            </p>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-testid="transactions-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Transaksi</p>
            <p className="text-3xl font-bold text-gray-900 mt-1" data-testid="transaction-count">
              {data?.total_transactions || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">pembeli</p>
          </div>

          {/* Items Sold */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-testid="items-sold-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Barang Terjual</p>
            <p className="text-3xl font-bold text-gray-900 mt-1" data-testid="items-sold">
              {data?.total_items_sold || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">item</p>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-testid="top-items-card">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Paling Laku</h2>
          </div>

          {!data?.top_items || data.top_items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada penjualan hari ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.top_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  data-testid={`top-item-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.qty} terjual
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-600">
                    {formatRupiah(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
