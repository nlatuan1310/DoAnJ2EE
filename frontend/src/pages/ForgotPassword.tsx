import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
      alert('Đổi mật khẩu thành công!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />

      <div className="w-full max-w-[480px] z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 mb-6 border border-slate-50">
            <ShieldQuestion className="w-8 h-8 text-violet-600 transition-transform hover:scale-110" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Quên mật khẩu?</h1>
          <p className="text-slate-500 font-medium">Chúng tôi sẽ giúp bạn khôi phục lại tài khoản.</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl border-white/50">
          <CardContent className="p-8 sm:p-10">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-10 px-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
                    step === s ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 scale-110' : 
                    step > s ? 'bg-violet-100 border-violet-100 text-violet-600' : 'bg-white border-slate-100 text-slate-300'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold text-base">{s}</span>}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1.5 mx-3 rounded-full transition-all duration-500 ${step > s ? 'bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-slate-100'}`} />}
                </React.Fragment>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 font-bold">!</span>
                </div>
                <p className="text-sm text-rose-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Email tài khoản</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-13 pl-12 pr-4 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-violet-200 transition-all hover:-translate-y-1"
                >
                  {loading ? 'Đang gửi mã...' : 'Gửi mã khôi phục'}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <OtpVerification
                email={email}
                otp={otp}
                setOtp={setOtp}
                onSubmit={handleVerifyOtp}
                onBack={() => setStep(1)}
                loading={loading}
                title="Xác thực Email"
                description="Chúng tôi đã gửi mã xác thực đến"
              />
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Mật khẩu mới</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={matKhauMoi}
                        onChange={(e) => setMatKhauMoi(e.target.value)}
                        className="h-13 pl-12 pr-12 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={xacNhanMatKhau}
                        onChange={(e) => setXacNhanMatKhau(e.target.value)}
                        className="h-13 pl-12 pr-12 bg-white border-slate-200 rounded-2xl text-slate-900 focus:ring-violet-500 focus:border-violet-500 transition-all font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-base font-bold shadow-xl shadow-violet-200 transition-all hover:-translate-y-1"
                >
                  {loading ? 'Đang lưu...' : 'Hoàn tất cập nhật'}
                </Button>
              </form>
            )}

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Quay về Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
