import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Shield, Lock, KeyRound, CheckCircle2, AlertCircle,
  Eye, EyeOff, Mail, ChevronRight, X, FileText,
  Calendar as CalendarIcon, Loader2
} from 'lucide-react';
import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type SidebarItem = 'bao-mat' | 'doi-mat-khau' | 'bao-cao';

interface ConfirmPopup {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

// ─── Confirm Popup Component ──────────────────────────────────────────────────
function ConfirmDialog({
  popup, onClose
}: {
  popup: ConfirmPopup;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popup.open) {
      // Trap focus + animate in
      dialogRef.current?.focus();
    }
  }, [popup.open]);

  if (!popup.open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
      >
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">{popup.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{popup.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 ml-2 shrink-0"
              id="btn-popup-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mx-6" />

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-4">
            <button
              id="btn-popup-cancel"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              id="btn-popup-confirm"
              onClick={() => {
                popup.onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-all shadow-sm"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarItem>('bao-mat');

  // ── Popup state ──
  const [popup, setPopup] = useState<ConfirmPopup>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const openPopup = (title: string, description: string, onConfirm: () => void) => {
    setPopup({ open: true, title, description, onConfirm });
  };
  const closePopup = () => setPopup(p => ({ ...p, open: false }));

  // ── 2FA state ──
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [loading2fa, setLoading2fa] = useState(false);
  const [message2fa, setMessage2fa] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  // ── Change Password state ──
  const [pwForm, setPwForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
  const [showPw, setShowPw] = useState({ matKhauCu: false, matKhauMoi: false, xacNhan: false });
  const [loadingPw, setLoadingPw] = useState(false);
  const [messagePw, setMessagePw] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const [pwErrors, setPwErrors] = useState<{ [k: string]: string }>({});

  const [isPreviewEnabled, setIsPreviewEnabled] = useState(() => {
    return localStorage.getItem('preview_report') !== 'false';
  });

  const togglePreview = () => {
    const newVal = !isPreviewEnabled;
    setIsPreviewEnabled(newVal);
    localStorage.setItem('preview_report', String(newVal));
  };

  // ── Scheduled Report state ──
  const [isScheduledEnabled, setIsScheduledEnabled] = useState(false);
  const [scheduledEmail, setScheduledEmail] = useState("");
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [messageScheduled, setMessageScheduled] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      const data = res.data;
      setIs2faEnabled(data.is2faEnabled);
      setIsScheduledEnabled(data.isScheduledReportsEnabled);
      setScheduledEmail(data.scheduledReportEmail || data.email);
    } catch { /* ignore */ }
  };

  const saveScheduledSettings = async () => {
    setLoadingScheduled(true);
    setMessageScheduled({ text: '', type: null });
    try {
      const res = await api.post('/auth/update-report-scheduled', { enabled: isScheduledEnabled, email: scheduledEmail });
      setMessageScheduled({ text: res.data.message, type: 'success' });
    } catch (err: any) {
      setMessageScheduled({ text: err.response?.data?.message || 'Cập nhật thất bại', type: 'error' });
    } finally {
      setLoadingScheduled(false);
    }
  };

  // ── 2FA toggle ──
  const toggle2FA = async () => {
    setLoading2fa(true);
    setMessage2fa({ text: '', type: null });
    try {
      const res = await api.post('/auth/toggle-2fa', { enable: !is2faEnabled });
      setIs2faEnabled(v => !v);
      setMessage2fa({ text: res.data.message, type: 'success' });
    } catch (err: any) {
      setMessage2fa({ text: err.response?.data?.message || 'Cập nhật thất bại', type: 'error' });
    } finally {
      setLoading2fa(false);
    }
  };

  // ── Change password validation ──
  const validatePw = () => {
    const errors: { [k: string]: string } = {};
    if (!pwForm.matKhauCu) errors.matKhauCu = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwForm.matKhauMoi) errors.matKhauMoi = 'Vui lòng nhập mật khẩu mới';
    else if (pwForm.matKhauMoi.length < 6) errors.matKhauMoi = 'Tối thiểu 6 ký tự';
    if (!pwForm.xacNhan) errors.xacNhan = 'Vui lòng xác nhận mật khẩu mới';
    else if (pwForm.xacNhan !== pwForm.matKhauMoi) errors.xacNhan = 'Mật khẩu không khớp';
    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const doChangePassword = async () => {
    setLoadingPw(true);
    try {
      const res = await api.post('/auth/doi-mat-khau', { matKhauCu: pwForm.matKhauCu, matKhauMoi: pwForm.matKhauMoi });
      if (res.data) {
        setMessagePw({ text: 'Đổi mật khẩu thành công!', type: 'success' });
        setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhan: '' });
        setPwErrors({});
      }
    } catch (err: any) {
      setMessagePw({ text: err.response?.data?.message || 'Đổi mật khẩu thất bại', type: 'error' });
    } finally {
      setLoadingPw(false);
    }
  };

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessagePw({ text: '', type: null });
    if (!validatePw()) return;
    openPopup(
      'Xác nhận đổi mật khẩu',
      'Bạn có chắc muốn đổi mật khẩu không? Hành động này sẽ cập nhật ngay lập tức.',
      doChangePassword
    );
  };

  const pwStrength = (pw: string) => {
    if (!pw) return 0;
    return pw.length < 6 ? 1 : pw.length < 10 ? 2 : pw.length < 14 ? 3 : 4;
  };

  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];

  // ─── Sidebar items ────────────────────────────────────────────────────────
  const sidebarItems: { id: SidebarItem; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'bao-mat',
      label: 'Bảo mật & Xác thực',
      icon: <Shield className="w-5 h-5" />,
      desc: 'Xác thực 2 lớp (2FA)',
    },
    {
      id: 'doi-mat-khau',
      label: 'Đổi mật khẩu',
      icon: <KeyRound className="w-5 h-5" />,
      desc: 'Cập nhật mật khẩu tài khoản',
    },
    {
      id: 'bao-cao',
      label: 'Cài đặt Báo cáo',
      icon: <FileText className="w-5 h-5" />,
      desc: 'Cấu hình xuất báo cáo',
    },
  ];

  return (
    <>
      {/* Backdrop blur + Popup */}
      <ConfirmDialog popup={popup} onClose={closePopup} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto font-geist">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
          <p className="text-slate-500 mt-2">Quản lý thông tin và cấu hình bảo mật của bạn.</p>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex gap-6 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-64 shrink-0">
            <nav className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {sidebarItems.map((item, idx) => (
                <button
                  key={item.id}
                  id={`sidebar-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all group
                    ${idx > 0 ? 'border-t border-slate-100' : ''}
                    ${activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {/* Icon bubble */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight truncate ${activeTab === item.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.desc}</p>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${activeTab === item.id ? 'text-indigo-500 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'}`} />
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* ════ Bảo mật & 2FA ════ */}
            {activeTab === 'bao-mat' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Bảo mật &amp; Xác thực</h2>
                    <p className="text-xs text-slate-500">Cấu hình các phương thức bảo vệ tài khoản.</p>
                  </div>
                </div>

                <div className="p-6">
                  {/* 2FA row */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Xác thực 2 lớp (2FA)</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mã OTP gửi về <span className="font-semibold text-slate-700">{user?.email}</span> mỗi khi đăng nhập.
                        </p>
                      </div>
                    </div>

                    {/* Toggle switch */}
                    <button
                      id="btn-toggle-2fa"
                      onClick={() =>
                        openPopup(
                          is2faEnabled ? 'Tắt xác thực 2 lớp?' : 'Bật xác thực 2 lớp?',
                          is2faEnabled
                            ? 'Tắt 2FA sẽ làm giảm bảo mật tài khoản của bạn. Xác nhận tiếp tục?'
                            : 'Mỗi lần đăng nhập bạn sẽ cần nhập mã OTP gửi về Email. Xác nhận bật?',
                          toggle2FA
                        )
                      }
                      disabled={loading2fa}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-60 ${
                        is2faEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          is2faEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                      is2faEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${is2faEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {is2faEnabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </div>

                  {/* Message */}
                  {message2fa.text && (
                    <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${
                      message2fa.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {message2fa.type === 'success'
                        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                        : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span className="text-sm font-medium">{message2fa.text}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ Đổi mật khẩu ════ */}
            {activeTab === 'doi-mat-khau' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Đổi mật khẩu</h2>
                    <p className="text-xs text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản.</p>
                  </div>
                </div>

                <div className="p-6">
                  <form id="form-doi-mat-khau" onSubmit={handlePwSubmit} noValidate className="space-y-5">

                    {/* Field helper */}
                    {([
                      { key: 'matKhauCu', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
                      { key: 'matKhauMoi', label: 'Mật khẩu mới', placeholder: 'Tối thiểu 6 ký tự' },
                      { key: 'xacNhan', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
                    ] as { key: 'matKhauCu' | 'matKhauMoi' | 'xacNhan'; label: string; placeholder: string }[]).map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <label htmlFor={field.key} className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            id={field.key}
                            type={showPw[field.key] ? 'text' : 'password'}
                            value={pwForm[field.key]}
                            onChange={e => {
                              setPwForm(p => ({ ...p, [field.key]: e.target.value }));
                              if (pwErrors[field.key]) setPwErrors(p => ({ ...p, [field.key]: '' }));
                              if (messagePw.text) setMessagePw({ text: '', type: null });
                            }}
                            placeholder={field.placeholder}
                            className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm transition-all outline-none bg-white ${
                              pwErrors[field.key]
                                ? 'border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-200'
                                : field.key === 'xacNhan' && pwForm.xacNhan && pwForm.xacNhan === pwForm.matKhauMoi
                                ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                                : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                            }`}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPw(p => ({ ...p, [field.key]: !p[field.key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPw[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Error */}
                        {pwErrors[field.key] && (
                          <p className="text-xs text-rose-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />{pwErrors[field.key]}
                          </p>
                        )}

                        {/* Match indicator */}
                        {field.key === 'xacNhan' && !pwErrors.xacNhan && pwForm.xacNhan && pwForm.xacNhan === pwForm.matKhauMoi && (
                          <p className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />Mật khẩu khớp
                          </p>
                        )}

                        {/* Strength bar for new password */}
                        {field.key === 'matKhauMoi' && pwForm.matKhauMoi && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i <= pwStrength(pwForm.matKhauMoi)
                                    ? strengthColor[pwStrength(pwForm.matKhauMoi)]
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-slate-400 ml-1 w-20 shrink-0">
                              {strengthLabel[pwStrength(pwForm.matKhauMoi)]}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Result message */}
                    {messagePw.text && (
                      <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${
                        messagePw.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {messagePw.type === 'success'
                          ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                          : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span className="text-sm font-medium">{messagePw.text}</span>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end pt-1">
                      <button
                        id="btn-doi-mat-khau"
                        type="submit"
                        disabled={loadingPw}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                      >
                        {loadingPw ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Đang cập nhật…
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            Cập nhật mật khẩu
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ════ Báo cáo ════ */}
            {activeTab === 'bao-cao' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200">
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Cấu hình Báo cáo</h2>
                    <p className="text-xs text-slate-500">Tùy chỉnh trải nghiệm xuất và gửi báo cáo.</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Xem trước tóm tắt</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hiển thị số lượng giao dịch và tổng tiền trước khi xuất file.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={togglePreview}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
                        isPreviewEnabled ? 'bg-violet-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          isPreviewEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Monthly schedule */}
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                          <CalendarIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Báo cáo định kỳ hàng tháng</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tự động gửi báo cáo tổng kết tháng vào ngày 01 mỗi tháng.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsScheduledEnabled(!isScheduledEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                          isScheduledEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            isScheduledEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {isScheduledEnabled && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5 ml-1">
                          <label className="text-sm font-semibold text-slate-700">Email nhận báo cáo định kỳ</label>
                          <input
                            type="email"
                            value={scheduledEmail}
                            onChange={(e) => setScheduledEmail(e.target.value)}
                            placeholder="Nhập email dự phòng..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {messageScheduled.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${
                          messageScheduled.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {messageScheduled.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                            : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span className="text-sm font-medium">{messageScheduled.text}</span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={saveScheduledSettings}
                          disabled={loadingScheduled}
                          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-lg shadow-violet-100 transition-all hover:-translate-y-0.5 flex items-center gap-2 "
                        >
                          {loadingScheduled && <Loader2 className="w-4 h-4 animate-spin" />}
                          Lưu cấu hình báo cáo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}