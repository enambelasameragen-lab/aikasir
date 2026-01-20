import React, { useState, useEffect } from 'react';
import { getUsers, inviteUser, updateUser, deleteUser } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  UserPlus,
  Users,
  Loader2,
  X,
  Save,
  Trash2,
  Mail,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  Clock,
  Ban,
} from 'lucide-react';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'kasir' });
  const [inviteResult, setInviteResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        setError('Hanya pemilik yang bisa mengakses halaman ini');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await inviteUser(inviteForm.name, inviteForm.email, inviteForm.role);
      setInviteResult(response.data);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengirim undangan');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/invite/${inviteResult.invite_token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await updateUser(userId, { is_active: !currentStatus });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Yakin hapus "${user.name}"? User tidak akan bisa login lagi.`)) return;

    try {
      await deleteUser(user.id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Gagal menghapus karyawan');
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteForm({ name: '', email: '', role: 'kasir' });
    setInviteResult(null);
    setError('');
  };

  const getStatusBadge = (user) => {
    if (user.status === 'invited') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          Menunggu
        </span>
      );
    }
    if (!user.is_active || user.status === 'disabled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <Ban className="w-3 h-3" />
          Nonaktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        <Check className="w-3 h-3" />
        Aktif
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === 'pemilik') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3 h-3" />
          Pemilik
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <Shield className="w-3 h-3" />
        Kasir
      </span>
    );
  };

  // Check if current user is owner
  if (currentUser?.role !== 'pemilik') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-500">Hanya pemilik yang bisa mengakses halaman ini</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6" data-testid="users-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Karyawan</h1>
            <p className="text-gray-500">Kelola akses karyawan ke toko</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
            data-testid="invite-btn"
          >
            <UserPlus className="w-5 h-5" />
            Undang Karyawan
          </button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada karyawan</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-blue-600 hover:text-blue-800 font-medium mt-2"
            >
              Undang karyawan pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Email</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-600">Peran</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50" data-testid={`user-row-${user.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-center">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {user.id !== currentUser?.id && user.role !== 'pemilik' && (
                          <>
                            <button
                              onClick={() => handleToggleActive(user.id, user.is_active)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                user.is_active
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              data-testid={`toggle-${user.id}`}
                            >
                              {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              data-testid={`delete-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {user.id === currentUser?.id && (
                          <span className="text-sm text-gray-400">Anda</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md" data-testid="invite-modal">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {inviteResult ? 'Undangan Terkirim!' : 'Undang Karyawan'}
              </h2>
              <button onClick={closeInviteModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {inviteResult ? (
              <div className="p-6">
                <div className="bg-green-50 rounded-xl p-4 mb-4 text-center">
                  <Mail className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">{inviteResult.message}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Link undangan:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/invite/${inviteResult.invite_token}`}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      data-testid="copy-link-btn"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Bagikan link ini ke {inviteResult.user.name} untuk bergabung
                  </p>
                </div>

                <button
                  onClick={closeInviteModal}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Karyawan
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Dedi"
                    required
                    data-testid="invite-name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@contoh.com"
                    required
                    data-testid="invite-email-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peran
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="invite-role-select"
                  >
                    <option value="kasir">Kasir</option>
                    <option value="pemilik">Pemilik</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Kasir hanya bisa catat penjualan. Pemilik bisa akses semua.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeInviteModal}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="send-invite-btn"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    Kirim Undangan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersPage;
