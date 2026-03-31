import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, CircleCheck, Zap, Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    matKhau: '',
    hoVaTen: '',
    dienThoai: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/dang-ky', formData);
      if (res.data) {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Họ và tên hoặc Email đã được sử dụng');
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

        <div className="w-full max-w-[420px] mx-auto relative z-10 flex flex-col h-full py-6 justify-between">
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
              Tham gia Spendwise
            </h1>
            <p className="text-slate-500 font-medium">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">
                Đăng nhập tại đây
              </Link>
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="hoVaTen" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                Họ và tên
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="hoVaTen"
                  name="hoVaTen"
                  type="text"
                  required
                  value={formData.hoVaTen}
                  onChange={handleChange}
                  className="h-14 pl-14 pr-5 bg-slate-50 border-slate-200/60 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base hover:border-slate-300 placeholder:text-slate-400/60"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="h-14 pl-14 pr-5 bg-slate-50 border-slate-200/60 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base hover:border-slate-300 placeholder:text-slate-400/60"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="dienThoai" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                  Số điện thoại
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <Input
                    id="dienThoai"
                    name="dienThoai"
                    type="text"
                    value={formData.dienThoai}
                    onChange={handleChange}
                    className="h-14 pl-14 pr-5 bg-slate-50 border-slate-200/60 rounded-2xl text-slate-900 focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-medium text-base hover:border-slate-300 placeholder:text-slate-400/60"
                    placeholder="0987xxxxxx"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="matKhau" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                Mật khẩu bảo mật
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="matKhau"
                  name="matKhau"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.matKhau}
                  onChange={handleChange}
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

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Đăng ký ngay
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-auto pt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">
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
            src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2664&auto=format&fit=crop" 
            alt="Abstract Crypto AI Data"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 via-transparent to-transparent" />
          
          {/* Decorative element top left */}
          <div className="absolute top-12 left-12 w-64 h-64 bg-violet-600 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
          <div className="absolute bottom-12 right-12 w-64 h-64 bg-emerald-600 rounded-full blur-[120px] opacity-20 mix-blend-screen" />
          
          {/* Copy text block */}
          <div className="relative z-10 w-full max-w-xl mx-auto p-12 mt-auto mb-16 text-white border-l-4 border-emerald-500 bg-slate-900/20 backdrop-blur-sm rounded-r-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-100">Bảo mật cấp độ ngân hàng</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.15] tracking-tight">An tâm tuyệt đối <br/> với mọi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">dữ liệu lớn.</span></h2>
            <p className="text-lg text-slate-300 leading-relaxed font-medium max-w-md">Chúng tôi sử dụng chuẩn mã hóa cao nhất để bảo vệ thông tin tài chính của bạn 24/7. Không ai có quyền truy cập ngoài bạn.</p>
            
            <div className="grid grid-cols-2 gap-4 mt-10">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-3xl font-black text-white mb-1">0%</div>
                  <div className="text-sm font-medium text-slate-400">Rò rỉ dữ liệu</div>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-3xl font-black text-white mb-1">24/7</div>
                  <div className="text-sm font-medium text-slate-400">Hệ thống giám sát AI</div>
               </div>
            </div>
          </div>
      </div>
    </div>
  );
}
