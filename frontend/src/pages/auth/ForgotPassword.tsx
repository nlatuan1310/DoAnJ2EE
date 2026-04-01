import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CircleCheck, Zap, Sparkles, KeyRound } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OtpVerification from '@/components/auth/OtpVerification';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/quen-mat-khau', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/xac-thuc-otp', { email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhauMoi !== xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/dat-lai-mat-khau', { email, otp, matKhauMoi });
      setLoading(false);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
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
              Khôi phục mật khẩu
            </h1>
            <p className="text-slate-500 font-medium">
              Đã nhớ lại mật khẩu?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">
                Quay về đăng nhập
              </Link>
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-8 mb-6 px-1">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-300 ${
                    step === s ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 
                    step > s ? 'bg-violet-100 border-violet-100 text-violet-600' : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step > s ? <CircleCheck className="w-5 h-5" /> : <span className="font-bold text-sm">{s}</span>}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${step > s ? 'bg-violet-500' : 'bg-slate-100'}`} />}
                </React.Fragment>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 font-bold">!</span>
                </div>
                <p className="text-sm text-rose-700 font-semibold">{error}</p>
              </div>
            )}

            {step === 1 && (
              <form className="space-y-4" onSubmit={handleSendOtp}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Email tài khoản của bạn
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang lấy thông...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Gửi mã xác thực
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-100/50 overflow-hidden">
                <OtpVerification
                  email={email}
                  otp={otp}
                  setOtp={setOtp}
                  onSubmit={handleVerifyOtp}
                  onBack={() => setStep(1)}
                  loading={loading}
                  title="Xác thực danh tính"
                  description="Mã bảo mật gồm 6 chữ số đã được gửi tới email của bạn"
                />
              </div>
            )}

            {step === 3 && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="matKhauMoi" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        id="matKhauMoi"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={matKhauMoi}
                        onChange={(e) => setMatKhauMoi(e.target.value)}
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

                  <div className="space-y-2">
                    <label htmlFor="xacNhanMatKhau" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        id="xacNhanMatKhau"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={xacNhanMatKhau}
                        onChange={(e) => setXacNhanMatKhau(e.target.value)}
                        className="h-14 pl-14 pr-12 bg-slate-50 border-slate-200/60 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base hover:border-slate-300 placeholder:text-slate-400/60"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-violet-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang lưu...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Hoàn tất khôi phục
                        <KeyRound className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

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
          src="https://images.unsplash.com/photo-1614064641913-6b71f30894be?q=80&w=2564&auto=format&fit=crop" 
          alt="Security Abstract"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
        
        {/* Decorative element top left */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-violet-600 rounded-full blur-[140px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-20 mix-blend-screen" />
        
        {/* Copy text block */}
        <div className="relative z-10 w-full max-w-xl mx-auto p-12 mt-auto mb-16 text-white border-l-4 border-violet-500 bg-slate-900/30 backdrop-blur-md rounded-r-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-violet-100">Khôi phục an toàn</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.15] tracking-tight">Quyền kiểm soát <br/> thuộc về <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">riêng bạn.</span></h2>
          <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-md">Chúng tôi sử dụng cơ chế định danh nhiều lớp và mã hóa hiện đại để đảm bảo tài khoản của bạn luôn được bảo vệ nghiêm ngặt nhất.</p>
          
          <div className="grid grid-cols-2 gap-4 mt-10">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-3xl font-black text-white mb-1">AES</div>
                <div className="text-sm font-medium text-slate-400">Chuẩn mã hoá 256-bit</div>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-3xl font-black text-white mb-1"><Sparkles className="w-8 h-8 text-white"/></div>
                <div className="text-sm font-medium text-slate-400">Xác thực AI thông minh</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
