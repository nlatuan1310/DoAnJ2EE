import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    matKhau: '',
    hoVaTen: '',
    dienThoai: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/dang-ky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Họ và tên hoặc Email đã được sử dụng');
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
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />

      <div className="w-full max-w-[500px] z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 mb-6 border border-slate-50 group">
            <ShieldCheck className="w-8 h-8 text-violet-600 transition-transform group-hover:scale-110" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Tham gia Spendwise
          </h1>
          <p className="text-slate-500 font-medium">
            Bắt đầu hành trình quản lý tài chính thông minh ngay hôm nay
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

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="hoVaTen" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                  Họ và tên
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="hoVaTen"
                    name="hoVaTen"
                    type="text"
                    required
                    value={formData.hoVaTen}
                    onChange={handleChange}
                    className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
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
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                      placeholder="name@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="dienThoai" className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                    Số điện thoại
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <Input
                      id="dienThoai"
                      name="dienThoai"
                      type="text"
                      value={formData.dienThoai}
                      onChange={handleChange}
                      className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
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
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="matKhau"
                    name="matKhau"
                    type="password"
                    required
                    value={formData.matKhau}
                    onChange={handleChange}
                    className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
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

              <p className="text-center text-slate-500 text-sm font-medium pt-2">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-violet-600 hover:text-violet-700 font-bold transition-colors">
                  Đăng nhập tại đây
                </Link>
              </p>
            </form>
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
            No Spam
          </div>
        </div>
      </div>
    </div>
  );
}
