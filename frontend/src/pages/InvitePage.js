import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInviteInfo, acceptInvite } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Store, Loader2, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInviteInfo();
  }, [token]);

  const fetchInviteInfo = async () => {
    try {
      const response = await getInviteInfo(token);
      setInviteInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Link undangan tidak valid atau sudah digunakan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak sama');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setSaving(true);
    try {
      const response = await acceptInvite(token, password);
      loginUser(response.data.token, response.data.user, response.data.tenant);
      navigate('/pos');
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengaktifkan akun');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Undangan Tidak Valid</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" data-testid="invite-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AIKasir</h1>
          <p className="text-gray-500 mt-1">Bergabung ke Toko</p>
        </div>

        {/* Invite Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Invite Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kamu diundang oleh</p>
                <p className="font-semibold text-gray-900">{inviteInfo?.invited_by}</p>
              </div>
            </div>
            <div className="border-t border-blue-100 pt-3">
              <p className="text-sm text-gray-600">Untuk bergabung ke</p>
              <p className="text-xl font-bold text-blue-600">{inviteInfo?.tenant_name}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">Nama: <strong>{inviteInfo?.name}</strong></p>
            <p className="text-sm text-gray-600">Email: <strong>{inviteInfo?.email}</strong></p>
            <p className="text-sm text-gray-600">Peran: <strong className="capitalize">{inviteInfo?.role}</strong></p>
          </div>

          {/* Set Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buat Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimal 6 karakter"
                  required
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ulangi password"
                required
                data-testid="confirm-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="accept-invite-btn"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Bergabung Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Sudah punya akun?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
