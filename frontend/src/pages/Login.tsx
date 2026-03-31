import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ShieldCheck, ArrowRight, CircleCheck, Zap, Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OtpVerification from '@/components/auth/OtpVerification';

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/dang-nhap', { email, matKhau: password });
      const data = res.data;

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
        navigate(data.vaiTro?.toLowerCase() === 'admin' ? '/admin' : '/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      if (step === 1) setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-2fa', { email, otp });
      const data = res.data;

      login(data.token, {
        id: data.id,
        email: data.email,
        hoVaTen: data.hoVaTen,
        vaiTro: data.vaiTro
      });
      navigate(data.vaiTro?.toLowerCase() === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans selection:bg-violet-100 selection:text-violet-900 overflow-hidden">
      {/* Left Side: Form Container */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center h-full p-6 sm:px-12 relative overflow-hidden z-10 bg-white shadow-2xl">
        {/* Background soft blobs for left side */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-50/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[420px] mx-auto relative z-10 flex flex-col py-6 h-full justify-between">
          {/* Header / Logo */}
          <Link to="/" className="flex items-center gap-2 w-fit group">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
              SpendwiseAI
            </span>
          </Link>

          <div className="my-auto pl-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {step === 1 ? 'Chào mừng trở lại' : 'Xác thực bảo mật'}
            </h1>
            <p className="text-slate-500 font-medium">
              {step === 1 ? (
                <>
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">
                    Tạo tài khoản miễn phí
                  </Link>
                </>
              ) : (
                'Mã OTP xác thực đã được gửi tới email của bạn'
              )}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <span className="text-rose-600 font-bold">!</span>
              </div>
              <p className="text-sm text-rose-700 font-semibold">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-14 pr-5 bg-slate-50 border-slate-200/60 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base hover:border-slate-300 placeholder:text-slate-400/60"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <Link to="/forgot-password" title="Quên mật khẩu?" className="text-[13px] font-bold text-violet-600 hover:text-violet-700 transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-14 pr-12 bg-slate-50 border-slate-200/60 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base hover:border-slate-300 placeholder:text-slate-400/60"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-1 pt-1 pb-1">
                <div className="relative flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="peer h-5 w-5 text-violet-600 bg-slate-50 focus:ring-violet-500/20 border-slate-300 rounded-md cursor-pointer transition-all"
                  />
                </div>
                <label htmlFor="remember-me" className="text-sm text-slate-600 font-medium cursor-pointer select-none">
                  Duy trì đăng nhập trong 30 ngày
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Đăng nhập tài khoản
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
              
              {/* Oauth Buttons */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-400 font-medium">Hoặc tiếp tục với</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button type="button" className="h-12 flex items-center justify-center gap-2 px-4 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Google
                  </button>
                  <button type="button" className="h-12 flex items-center justify-center gap-2 px-4 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700">
                    <img src="https://www.svgrepo.com/show/473600/apple.svg" alt="Apple" className="w-5 h-5" />
                    Apple
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-100/50 mt-4 overflow-hidden">
               <OtpVerification
                 email={email}
                 otp={otp}
                 setOtp={setOtp}
                 onSubmit={handleVerify2FA}
                 onBack={() => setStep(1)}
                 loading={loading}
                 title="Xác thực bước 2"
                 description="Mã OTP đã gửi về email của bạn"
               />
            </div>
          )}

          <div className="mt-auto pt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">
            <div className="flex items-center gap-1.5">
              <CircleCheck className="w-4 h-4 text-emerald-500" />
              Bảo mật
            </div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <div className="flex items-center gap-1.5">
              <CircleCheck className="w-4 h-4 text-emerald-500" />
              Riêng tư
            </div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <div className="flex items-center gap-1.5">
              <CircleCheck className="w-4 h-4 text-emerald-500" />
              Nhanh chóng
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center bg-slate-900 overflow-hidden">
          {/* Abstract floating shapes / Image */}
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
            alt="Abstract AI Data"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
          
          {/* Decorative element top right */}
          <div className="absolute top-12 right-12 w-64 h-64 bg-violet-600 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
          
          {/* Copy text block */}
          <div className="relative z-10 w-full max-w-xl mx-auto p-12 mt-auto mb-16 text-white border-l-4 border-violet-500 bg-slate-900/20 backdrop-blur-sm rounded-r-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span className="text-violet-100">AI-Powered Fintech</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.15] tracking-tight">Kiểm soát tài chính <br/> chưa bao giờ <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">dễ dàng đến thế.</span></h2>
            <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-md">SpendwiseAI phân tích thông minh chi tiêu của bạn, bảo mật tuyệt đối, và tối ưu hóa ngân sách bằng trí tuệ nhân tạo thế hệ mới.</p>
            
            <div className="flex items-center gap-4 mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-bold text-white leading-tight">10,000+</div>
                <div className="text-slate-400">Người dùng tin tưởng</div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
