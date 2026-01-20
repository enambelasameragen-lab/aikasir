import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiOnboard } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Send, Bot, User, Loader2, Store } from 'lucide-react';

const OnboardingPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! 👋 Selamat datang di AIKasir!\n\nAku akan bantu kamu setup toko dalam hitungan detik. Yuk mulai!\n\nBisnis atau usaha apa yang mau kamu kelola?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiOnboard(userMessage, sessionId);
      const data = response.data;

      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);

      if (data.status === 'complete') {
        setSetupComplete(true);
        setSetupData(data);
        
        // Auto login
        if (data.token) {
          loginUser(data.token, data.user, data.tenant);
        }
      }
    } catch (error) {
      console.error('Onboard error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, ada gangguan. Coba lagi ya! 🙏',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const goToPOS = () => {
    navigate('/pos');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col" data-testid="onboarding-page">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AIKasir</h1>
              <p className="text-xs text-gray-500">Setup Toko Otomatis</p>
            </div>
          </div>
          <button
            onClick={goToLogin}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            data-testid="login-link"
          >
            Sudah punya akun? Login
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white shadow-md rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white shadow-md rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            </div>
          )}

          {/* Setup Complete Card */}
          {setupComplete && setupData && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200" data-testid="setup-complete">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  🎉 Toko Kamu Sudah Jadi!
                </h2>
                <p className="text-gray-600 mb-4">
                  <strong>{setupData.tenant?.name}</strong>
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                  <p className="text-sm text-gray-600 mb-2">Info Login:</p>
                  <p className="text-sm">
                    <span className="text-gray-500">Email:</span>{' '}
                    <strong>{setupData.user?.email}</strong>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Password:</span>{' '}
                    <strong>{setupData.user?.temp_password}</strong>
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Simpan password ini! Kamu bisa ubah nanti di pengaturan.
                  </p>
                </div>

                {setupData.items && setupData.items.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
                    <p className="text-sm text-gray-600 mb-2">Barang yang ditambahkan:</p>
                    <div className="flex flex-wrap gap-2">
                      {setupData.items.map((item, i) => (
                        <span
                          key={i}
                          className="bg-white px-3 py-1 rounded-full text-sm border"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Harga default Rp 10.000 - bisa kamu ubah nanti
                    </p>
                  </div>
                )}

                <button
                  onClick={goToPOS}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                  data-testid="go-to-pos-btn"
                >
                  Mulai Jualan! 🚀
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!setupComplete && (
        <div className="bg-white border-t shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik jawaban kamu..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                data-testid="chat-input"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="send-btn"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
