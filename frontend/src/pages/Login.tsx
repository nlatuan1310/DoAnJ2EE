import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import OtpVerification from '@/components/auth/OtpVerification';

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
            id: data.id,
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
          id: data.id,
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />

      <div className="w-full max-w-[440px] z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 mb-6 border border-slate-50 group">
            <ShieldCheck className="w-8 h-8 text-violet-600 transition-transform group-hover:scale-110" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {step === 1 ? 'Chào mừng trở lại' : 'Xác thực bảo mật'}
          </h1>
          <p className="text-slate-500 font-medium">
            {step === 1 ? (
              <>
                Hoặc{' '}
                <Link to="/register" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">
                  tạo tài khoản mới miễn phí
                </Link>
              </>
            ) : (
              'Mã xác thực đã được gửi tới email của bạn'
            )}
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl border-white/50">
          <CardContent className="p-8 sm:p-10">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 font-bold">!</span>
                </div>
                <p className="text-sm text-rose-700 font-semibold">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-13 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label htmlFor="password" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    <Link to="/forgot-password" title="Quên mật khẩu?" className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-13 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-1">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded-lg cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="text-sm text-slate-600 font-medium cursor-pointer">
                    Duy trì đăng nhập
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-violet-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đăng nhập...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Đăng nhập ngay
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <OtpVerification
                email={email}
                otp={otp}
                setOtp={setOtp}
                onSubmit={handleVerify2FA}
                onBack={() => setStep(1)}
                loading={loading}
                title="Xác thực bước 2"
                description="Nhập mã bí mật được gửi tới tài khoản"
              />
            )}
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <div className="mt-10 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Secure
          </div>
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Private
          </div>
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
