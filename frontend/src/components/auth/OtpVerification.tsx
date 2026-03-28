import React from 'react';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OtpVerificationProps {
  email: string;
  otp: string;
  setOtp: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
  title?: string;
  description?: string;
}

export default function OtpVerification({
  email,
  otp,
  setOtp,
  onSubmit,
  onBack,
  loading,
  title = "Xác thực bảo mật",
  description = "Vui lòng nhập mã OTP đã được gửi tới email của bạn"
}: OtpVerificationProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-5">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center relative shadow-inner shadow-violet-100/50">
            <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-ping opacity-25" />
            <KeyRound className="w-10 h-10 text-violet-600" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <div className="px-4 py-3 bg-slate-50/80 rounded-2xl border border-slate-100 mx-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-0.5">{description}</p>
            <p className="text-sm font-bold text-slate-900 break-all">{email}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3 text-center">
            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">
              6 chữ số xác thực
            </label>
            <Input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-20 text-center text-4xl font-black tracking-[0.4em] bg-white border-slate-200 rounded-3xl text-violet-600 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all uppercase placeholder-slate-200 shadow-sm"
              placeholder="000000"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-base font-black shadow-xl shadow-violet-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang kiểm tra...
                </div>
              ) : (
                "Xác thực tài khoản"
              )}
            </Button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-800 font-bold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại bước trước
            </button>
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500 font-medium italic">
          Không nhận được mã?{' '}
          <button type="button" className="text-violet-600 hover:text-violet-700 font-bold underline underline-offset-4 not-italic">
            Gửi lại
          </button>
        </p>
      </div>
    </div>
  );
}
