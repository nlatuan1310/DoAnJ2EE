import { Link } from "react-router-dom"
import { 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Globe, 
  Sparkles,
  Bot,
  ScanText,
  Lock,
  Shield,
  Key,
  Users
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-violet-100 selection:text-violet-900 scroll-smooth">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-200">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
                SpendwiseAI
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Tính năng AI</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Về dự án</a>
              <a href="#security" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Bảo mật</a>
            </div>

            <div className="flex items-center gap-4">
             
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-full shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95">
                Tham gia ngay
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-100 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
                <Sparkles className="w-3 h-3 fill-violet-600" />
                Vận hành bởi Google Gemini AI
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Tài chính cá nhân <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  Tối ưu bởi AI
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                SpendwiseAI tích hợp trí tuệ nhân tạo đa phương thức để tự động hóa việc nhập liệu, phân tích chi tiêu và đưa ra lời khuyên tài chính thông minh dành riêng cho bạn.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xl transition-all hover:-translate-y-1">
                  Khám phá ngay
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 grid place-items-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span>Tự động hóa tài chính cho hàng nghìn người dùng</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 p-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-[2.5rem] shadow-2xl">
                <Link to="/login" className="block cursor-pointer">
                  <img 
                    src="/spendwise_hero_bg.png" 
                    alt="Dashboard Preview" 
                    className="rounded-[2rem] shadow-lg animate-float"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=2070&auto=format&fit=crop";
                    }}
                  />
                </Link>
              </div>
              
              {/* Floating UI Elements */}
              <Link to="/login" className="absolute -top-6 -right-6 lg:-top-12 lg:-right-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow hidden sm:block hover:scale-110 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">AI Advisor</p>
                    <p className="text-sm font-bold text-slate-800">Cần tư vấn ngay?</p>
                  </div>
                </div>
              </Link>

              <Link to="/login" className="absolute -bottom-10 -left-6 lg:-bottom-20 lg:-left-12 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 animate-float-delayed hidden sm:block hover:scale-110 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                    <ScanText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Quét hóa đơn AI</p>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">Trích xuất ngay</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-2">Gemini</p>
              <p className="text-sm font-medium text-slate-500">Lõi công nghệ AI</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-2">100%</p>
              <p className="text-sm font-medium text-slate-500">Tự động nhập liệu</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-2">256-bit</p>
              <p className="text-sm font-medium text-slate-500">Bảo mật dữ liệu</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-2">24/7</p>
              <p className="text-sm font-medium text-slate-500">Cố vấn thông minh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-base font-bold text-violet-600 uppercase tracking-widest mb-4">Sức mạnh của trí tuệ nhân tạo</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Tại sao chọn SpendwiseAI?</h3>
            <p className="text-slate-500 max-w-2xl mx-auto">Chúng tôi mang đến những công nghệ đột phá để việc quản lý tiền bạc không còn là gánh nặng.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ScanText className="w-6 h-6" />}
              title="Quét Hóa đơn AI"
              description="Sử dụng Google Gemini AI để tự động đọc và trích xuất thông tin từ ảnh chụp hóa đơn, không cần nhập tay."
            />
            <FeatureCard 
              icon={<Bot className="w-6 h-6" />}
              title="Cố Vấn Tài Chính AI"
              description="Hệ thống Chatbot AI thông minh đưa ra lời khuyên đầu tư và tiết kiệm dựa trên tình hình tài chính thực tế của bạn."
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Tự Động Phân Loại"
              description="AI tự động nhận diện và gán danh mục (Ăn uống, Shopping, v.v.) cho các giao dịch giúp báo cáo luôn chính xác."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Dự Báo Thông Minh"
              description="Phân tích xu hướng lịch sử để dự báo chi tiêu trong tương lai và đưa ra cảnh báo sớm về ngân sách."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6" />}
              title="Trải Nghiệm Mượt Mà"
              description="Giao diện hiện đại, tối ưu cho cả di động và máy tính, truy cập dữ liệu mọi lúc mọi nơi."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="An Toàn Tuyệt Đối"
              description="Dữ liệu tài chính được bảo vệ bởi các tiêu chuẩn an ninh cao nhất hiện nay."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50 block sm:hidden lg:block"></div>
              <div className="relative z-10 grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <Users className="w-10 h-10 text-violet-600 mb-4" />
                    <h4 className="font-bold text-slate-900">10k+ Người dùng</h4>
                  </div>
                  <div className="bg-violet-600 p-6 rounded-[2rem] text-white shadow-xl shadow-violet-200">
                    <Sparkles className="w-10 h-10 mb-4" />
                    <h4 className="font-bold text-lg leading-tight text-white">Sức mạnh AI dẫn đầu</h4>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6 pt-12">
                  <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl">
                    <Globe className="w-10 h-10 mb-4 text-violet-400" />
                    <h4 className="font-bold text-white leading-tight">Mạng lưới Toàn cầu</h4>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <ShieldCheck className="w-10 h-10 text-emerald-600 mb-4" />
                    <h4 className="font-bold text-slate-900 leading-tight">An toàn & Tin cậy</h4>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-violet-600 uppercase tracking-widest mb-4">Câu chuyện của chúng tôi</h2>
              <h3 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                SpendwiseAI: Mang trí tuệ nhân tạo vào túi tiền của bạn
              </h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Chúng tôi bắt đầu dự án này với một mục tiêu đơn giản: Giúp mọi người quản lý tài chính một cách nhẹ nhàng nhất có thể. Không còn bảng tính phức tạp, không còn việc quên nhập chi tiêu.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                  </div>
                  <p className="text-slate-600 font-medium">Tự động hóa 90% các tác vụ thủ công bằng AI.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                  </div>
                  <p className="text-slate-600 font-medium">Báo cáo trực quan, dễ hiểu cho mọi đối tượng.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                  </div>
                  <p className="text-slate-600 font-medium">Cập nhật liên tục các công nghệ Generative AI mới nhất.</p>
                </div>
              </div>
              <Link to="/login" className="inline-flex items-center gap-2 text-violet-600 font-bold hover:gap-4 transition-all">
                Tìm hiểu thêm về dự án <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-base font-bold text-violet-400 uppercase tracking-widest mb-4">Thành trì bảo mật</h2>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Dữ liệu của bạn được bảo vệ đa lớp</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">Chúng tôi coi quyền riêng tư và an toàn dữ liệu là ưu tiên hàng đầu trong mọi dòng code.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityCard 
              icon={<Lock className="w-8 h-8" />}
              title="Mã hóa AES-256"
              description="Dữ liệu được mã hóa chuẩn quân đội ngay cả khi lưu trữ và truyền tải."
            />
            <SecurityCard 
              icon={<Shield className="w-8 h-8" />}
              title="Xác thực 2FA"
              description="Bảo vệ tài khoản tối đa với mã OTP qua email và Google Authenticator."
            />
            <SecurityCard 
              icon={<Key className="w-8 h-8" />}
              title="Không lưu Mật khẩu"
              description="Mật khẩu được băm qua thuật toán BCrypt, chúng tôi không bao giờ biết mật khẩu thực của bạn."
            />
            <SecurityCard 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Riêng tư Hoàn toàn"
              description="Dữ liệu tài chính chỉ thuộc về bạn. Chúng tôi cam kết không chia sẻ cho bên thứ ba."
            />
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <p className="text-white font-medium mb-6">Bạn có thắc mắc về cách chúng tôi xử lý dữ liệu?</p>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all">
              Xem Chính sách bảo mật
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden py-16 px-8 lg:px-16 text-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-[80px]"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px]"></div>
             
             <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 relative z-10">
               Sẵn sàng kiểm soát <br /> tài chính của bạn?
             </h2>
             <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
               Tham gia cùng hàng ngàn người đang thay đổi cách họ quản lý tiền bạc mỗi ngày.
             </p>
             <Link to="/login" className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 relative z-10">
               Đăng nhập ngay
             </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <Link to="/login" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">SpendwiseAI</span>
              </Link>
              <p className="text-slate-500 text-base leading-relaxed max-w-sm mb-8">
                Tương lai của quản lý tài chính cá nhân. Chúng tôi sử dụng trí tuệ nhân tạo để giúp bạn tiết kiệm nhiều hơn và chi tiêu hiệu quả hơn.
              </p>
              <div className="flex gap-4">
                <SocialIcon to="/login" icon={<Smartphone className="w-5 h-5" />} />
                <SocialIcon to="/login" icon={<Globe className="w-5 h-5" />} />
                <SocialIcon to="/login" icon={<Zap className="w-5 h-5" />} />
              </div>
            </div>

            <div className="col-span-1">
              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Sản phẩm AI</h5>
              <ul className="space-y-4">
                <FooterLink to="/login">Quét Hóa đơn</FooterLink>
                <FooterLink to="/login">Cố vấn tài chính</FooterLink>
                <FooterLink to="/login">Phân loại tự động</FooterLink>
                <FooterLink to="/login">Dự báo ngân sách</FooterLink>
              </ul>
            </div>

            <div className="col-span-1">
              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Dự án</h5>
              <ul className="space-y-4">
                <FooterLink to="/login">Về chúng tôi</FooterLink>
                <FooterLink to="/login">Đội ngũ</FooterLink>
                <FooterLink to="/login">Tuyển dụng</FooterLink>
                <FooterLink to="/login">Báo chí</FooterLink>
              </ul>
            </div>

            <div className="col-span-1">
              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Hỗ trợ</h5>
              <ul className="space-y-4">
                <FooterLink to="/login">Trung tâm giúp đỡ</FooterLink>
                <FooterLink to="/login">Bảo mật</FooterLink>
                <FooterLink to="/login">Liên hệ</FooterLink>
                <FooterLink to="/login">Chính sách</FooterLink>
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Tham gia bản tin</h5>
              <p className="text-slate-500 text-sm mb-4">Nhận những mẹo tài chính và cập nhật AI mới nhất.</p>
              <div className="flex flex-col gap-2">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700 transition-colors text-center shadow-lg shadow-violet-200"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2024 SpendwiseAI. Tự hào được phát triển tại Việt Nam.
            </p>
            <div className="flex gap-8">
              <Link to="/login" className="text-sm text-slate-400 hover:text-violet-600 transition-colors">Điều khoản</Link>
              <Link to="/login" className="text-sm text-slate-400 hover:text-violet-600 transition-colors">Quyền riêng tư</Link>
              <Link to="/login" className="text-sm text-slate-400 hover:text-violet-600 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite 2s; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link to="/login" className="block p-8 bg-white border border-slate-200/60 rounded-3xl hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 group">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors mb-6">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h4>
      <p className="text-slate-500 leading-relaxed text-sm">
        {description}
      </p>
    </Link>
  )
}

function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-slate-500 hover:text-violet-600 transition-colors text-sm font-medium">
        {children}
      </Link>
    </li>
  )
}

function SocialIcon({ to, icon }: { to: string, icon: React.ReactNode }) {
  return (
    <Link to={to} className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all duration-300">
      {icon}
    </Link>
  )
}

function SecurityCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link to="/login" className="block p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
      <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors mb-6">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h4>
      <p className="text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </Link>
  )
}

