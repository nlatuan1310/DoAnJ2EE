import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/dang-nhap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, matKhau: password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          setStep(2);
          setLoading(false);
        } else {
          login(data.token, {
            email: data.email,
            hoVaTen: data.hoVaTen,
            vaiTro: data.vaiTro
          });
          navigate('/');
        }
      } else {
        setError(data.message || 'Email hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      if (step === 1) setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, {
          email: data.email,
          hoVaTen: data.hoVaTen,
          vaiTro: data.vaiTro
        });
        navigate('/');
      } else {
        setError(data.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-geist">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200 mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            {step === 1 ? 'Đăng nhập tài khoản' : 'Xác thực bảo mật'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {step === 1 ? (
              <>
                Hoặc{' '}
                <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                  đăng ký tài khoản mới
                </Link>
              </>
            ) : (
              'Vui lòng nhập mã OTP đã được gửi tới Email của bạn.'
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100 sm:px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <p className="text-sm text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Ghi nhớ tôi
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" title="Quên mật khẩu?" className="font-bold text-emerald-600 hover:text-emerald-500 underline-offset-4 hover:underline transition-all">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">Nhập mã OTP (6 chữ số)</label>
                <div className="relative group flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full py-4 text-center text-3xl font-black tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-2xl text-emerald-600 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
                >
                  {loading ? 'Đang kiểm tra...' : 'Xác thực & Đăng nhập'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

