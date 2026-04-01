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
  Users,
  TrendingUp,
  Wallet,
  PieChart,
  Scan,
  Cpu,
  Fingerprint,
  CircleCheck
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-violet-500/20 selection:text-violet-900 scroll-smooth">
      
      {/* Navigation - Light Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                SpendwiseAI
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">Tính năng AI</a>
              <a href="#about" className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">Dự án</a>
              <a href="#security" className="text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">Bảo mật</a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:inline-flex text-sm font-bold text-slate-600 hover:text-violet-600 transition-colors">
                Đăng nhập
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20">
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Light Tech */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-400/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-200/20 rounded-full blur-[100px]"></div>
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-violet-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Vận hành bởi Google Gemini AI</span>
              </div>
              <h1 className="text-5xl lg:text-[5.5rem] font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                Tài chính <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500">
                  Tối ưu bởi AI
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                SpendwiseAI tự động hóa hoàn toàn việc xử lý hóa đơn, gán nhãn giao dịch, và đưa ra lời khuyên đầu tư nhờ trí tuệ nhân tạo đa phương thức.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-xl shadow-violet-900/20 transition-all hover:shadow-violet-600/30 hover:-translate-y-1">
                  Khám phá ngay
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all hover:-translate-y-1">
                   Tìm hiểu thêm
                </Link>
              </div>
              
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm font-semibold text-slate-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 grid place-items-center overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/150?u=${i + 30}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-800 font-bold">10,000+ Người dùng</span>
                  <span>Đã tối ưu hóa tài chính mỗi ngày</span>
                </div>
              </div>
            </div>

            <div className="relative group perspective-1000 mt-10 lg:mt-0">
               {/* Decorative Abstract Orb */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-violet-400 via-indigo-300 to-cyan-200 rounded-full blur-[80px] opacity-60 animate-pulse"></div>

              <div className="relative z-10 w-full aspect-[4/3] bg-white/60 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex items-center justify-center p-8 lg:p-12 overflow-hidden animate-float">
                {/* Visual Icons to represent the app in Light mode */}
                <div className="relative z-20 grid grid-cols-2 gap-6 lg:gap-8 w-full max-w-md">
                   <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500">
                      <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-4 shadow-[0_4px_10px_rgba(139,92,246,0.15)]">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="h-2 w-16 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500 delay-75">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-[0_4px_10px_rgba(16,185,129,0.15)]">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="h-2 w-16 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500 delay-150">
                      <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 mb-4 shadow-[0_4px_10px_rgba(6,182,212,0.15)]">
                        <PieChart className="w-6 h-6" />
                      </div>
                      <div className="h-2 w-16 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                   </div>
                   <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500 delay-200">
                      <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-[0_4px_10px_rgba(244,63,94,0.15)]">
                        <Scan className="w-6 h-6" />
                      </div>
                      <div className="h-2 w-16 bg-slate-200 rounded-full mb-2"></div>
                      <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                   </div>
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -top-6 -right-6 lg:-top-10 lg:-right-10 bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-bounce-slow hidden sm:block hover:scale-105 transition-transform z-30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Advisor 24/7</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">Xử lý ngôn ngữ tự nhiên</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-6 lg:-bottom-12 lg:-left-12 bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-float-delayed hidden sm:block hover:scale-105 transition-transform z-30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 border border-violet-200">
                    <ScanText className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Quét hóa đơn siêu tốc</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Trích xuất dưới 2 giây</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands & Stats Section */}
      <section className="py-12 border-y border-slate-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Sức mạnh công nghệ được chứng minh bằng con số</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            <div>
              <p className="text-4xl lg:text-5xl font-black text-slate-800 mb-2">Gemini Pro</p>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Lõi đa phương thức</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black text-slate-800 mb-2">99.8%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Độ chính xác quét</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black text-slate-800 mb-2">AES-256</p>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Bảo mật cấp ngân hàng</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black text-slate-800 mb-2">0s</p>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Độ trễ phản hồi AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Light Mode */}
      <section id="features" className="py-24 bg-slate-50 relative border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-violet-600 uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4" /> Hệ sinh thái AI
            </h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">Vượt qua giới hạn của<br/>ứng dụng tài chính thường</h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">SpendwiseAI mang đến những công nghệ độc quyền để biến việc quản lý tiền bạc trở nên tự động và chính xác.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCardLight 
              icon={<ScanText className="w-7 h-7" />}
              color="violet"
              title="Quét Hóa Đơn AI"
              description="Sử dụng mô hình thị giác máy tính Gemini để đọc hóa đơn bóp méo, mờ nhòe. Trích xuất tên món, giá tiền và thuế trong chớp mắt."
            />
            <FeatureCardLight 
              icon={<Bot className="w-7 h-7" />}
              color="emerald"
              title="Cố Vấn Tài Chính Ảo"
              description="Trò chuyện với trợ lý AI bằng ngôn ngữ tự nhiên. Phân tích dòng tiền của bạn và đưa ra lời khuyên cắt giảm chi tiêu cá nhân hóa."
            />
            <FeatureCardLight 
              icon={<Sparkles className="w-7 h-7" />}
              color="rose"
              title="Gán Nhãn Tự Động"
              description="Thuật toán học máy tự động gom nhóm hàng ngàn giao dịch vào các danh mục cụ thể mà không cần bạn phải thiết lập luật (rules)."
            />
            <FeatureCardLight 
              icon={<BarChart3 className="w-7 h-7" />}
              color="cyan"
              title="Dự Báo Ngân Sách"
              description="Mô phỏng xu hướng chi tiêu tương lai dựa trên lịch sử dữ liệu quá khứ. Nhận cảnh báo sớm trước khi bạn vượt lạm chi."
            />
            <FeatureCardLight 
              icon={<Smartphone className="w-7 h-7" />}
              color="indigo"
              title="Đồng Bộ Đa Nền Tảng"
              description="Trải nghiệm PWA xuất sắc trên cả web và mobile. Dữ liệu thay đổi trên điện thoại lập tức hiển thị trên máy tính."
            />
            <FeatureCardLight 
              icon={<ShieldCheck className="w-7 h-7" />}
              color="amber"
              title="Chống Gian Lận"
              description="Hệ thống tự động phát hiện các khoản thu dường như bất thường, lặp lại liên tục và nhắc nhở bạn kiểm tra kịp thời."
            />
          </div>
        </div>
      </section>

      {/* About Section - Split Design Light */}
      <section id="about" className="py-24 bg-white overflow-hidden relative border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-100/50 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10 bg-slate-900 rounded-[3rem] p-10 lg:p-14 shadow-2xl overflow-hidden shadow-slate-300">
                 {/* Inner glow code */}
                 <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-60"></div>
                 <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-600 rounded-full blur-[80px] opacity-60"></div>
                 
                 <div className="relative z-10">
                   <Zap className="w-12 h-12 text-violet-300 mb-8" />
                   <h3 className="text-3xl font-black text-white mb-6 leading-tight">Mang "bộ não AI" vào chiếc ví của bạn.</h3>
                   <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">Chúng tôi tạo ra SpendwiseAI vì mệt mỏi với việc nhập tay dữ liệu vào Excel mỗi ngày. Tương lai của phần mềm tài chính phải là tự động hóa 100%.</p>
                   
                   <ul className="space-y-4">
                     <li className="flex items-center gap-4 text-white font-medium">
                       <CircleCheck className="w-6 h-6 text-emerald-400 shrink-0" /> Dành cho freelancer và nhân viên văn phòng.
                     </li>
                     <li className="flex items-center gap-4 text-white font-medium">
                       <CircleCheck className="w-6 h-6 text-emerald-400 shrink-0" /> Không bán dữ liệu cho bên thứ ba.
                     </li>
                     <li className="flex items-center gap-4 text-white font-medium">
                       <CircleCheck className="w-6 h-6 text-emerald-400 shrink-0" /> Luôn cập nhật LLM nội bộ mạnh mẽ.
                     </li>
                   </ul>
                 </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-violet-600 uppercase tracking-[0.2em] mb-4">Mạng lưới tin cậy</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-[1.15] tracking-tight">
                Hơn cả một ứng dụng, <br/> đó là lối sống.
              </h3>
              
              <div className="space-y-8">
                 <div className="flex gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
                     <Users className="w-8 h-8 text-violet-600" />
                   </div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Cộng đồng thông thái</h4>
                     <p className="text-slate-500 font-medium leading-relaxed text-base">Hàng ngàn người dùng đã tiết kiệm được trung bình 20% thu nhập hàng tháng kể từ khi sử dụng AI tư vấn.</p>
                   </div>
                 </div>
                 
                 <div className="flex gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center shrink-0 border border-cyan-100">
                     <Globe className="w-8 h-8 text-cyan-600" />
                   </div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Đa tiền tệ toàn cầu</h4>
                     <p className="text-slate-500 font-medium leading-relaxed text-base">Hỗ trợ tra cứu tỷ giá theo thời gian thực. Bất kể bạn đi công tác hay du lịch, báo cáo vẫn luôn chính xác.</p>
                   </div>
                 </div>
              </div>

              <div className="mt-10">
                 <Link to="/about" className="inline-flex items-center gap-2 text-violet-600 font-bold hover:gap-4 transition-all text-lg">
                  Tìm hiểu chi tiết về đội ngũ phát triển <ArrowRight className="w-5 h-5" />
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section - Light Tech Mode */}
      <section id="security" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              <Fingerprint className="w-4 h-4" /> Bức tường thép
            </h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">Quyền riêng tư là <br/>tiêu chí số một.</h3>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Mô hình AI chỉ chạy trên dữ liệu của riêng bạn. Không ai khác có thể truy cập lịch sử giao dịch này.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityCardLight 
              icon={<Lock className="w-8 h-8" />}
              title="Mã Hóa AES-256"
              description="Dữ liệu được mã hóa chuẩn quân sự ngay tại database. Ngay cả kỹ sư của chúng tôi cũng không thể đọc."
              highlightColor="emerald"
            />
            <SecurityCardLight 
              icon={<Shield className="w-8 h-8" />}
              title="Xác Thực Đa Bước (2FA)"
              description="Bảo vệ tài khoản tối đa với mã OTP gửi qua email chuyên dụng và kiểm soát thiết bị đăng nhập."
              highlightColor="cyan"
            />
            <SecurityCardLight 
              icon={<Key className="w-8 h-8" />}
              title="Không Lưu Mật Khẩu"
              description="Sử dụng Hash BCrypt để đối chiếu. Mật khẩu thật của bạn luôn là ẩn số đối với toàn bộ mạng lưới."
              highlightColor="violet"
            />
            <SecurityCardLight 
              icon={<Fingerprint className="w-8 h-8" />}
              title="Sinh Trắc Học"
              description="Hỗ trợ đăng nhập nhanh bằng FaceID/TouchID trên thiết bị di động chuẩn bảo mật WebAuthn."
              highlightColor="rose"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 z-10 relative">
          <div className="relative rounded-[3rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 overflow-hidden py-20 px-8 lg:px-16 text-center shadow-2xl shadow-violet-900/30">
             {/* Glossy overlay */}
             <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl mix-blend-overlay"></div>
             
             <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 relative z-10 tracking-tight leading-tight">
               Thay đổi cách bạn nhìn <br /> về chi tiêu, ngay hôm nay.
             </h2>
             <p className="text-violet-100 text-xl mb-12 max-w-2xl mx-auto relative z-10 font-medium">
               Tham gia bản thử nghiệm miễn phí với toàn bộ tính năng AI vượt trội. Không quảng cáo. Không gắn thẻ tín dụng giấu kín.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
               <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-violet-700 bg-white hover:bg-slate-50 rounded-2xl transition-all shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-105 active:scale-95">
                 Tạo tài khoản miễn phí
               </Link>
             </div>
          </div>
        </div>
      </section>

      {/* Footer Light Mode */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-4">
              <Link to="/" className="flex items-center gap-2 mb-6 group">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center border border-violet-200 group-hover:bg-violet-600 transition-colors">
                  <Zap className="w-6 h-6 text-violet-600 group-hover:text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">SpendwiseAI</span>
              </Link>
              <p className="text-slate-500 text-base leading-relaxed mb-8 pr-4">
                Tương lai của quản lý tài chính cá nhân. Chúng tôi kết hợp giao diện thiết kế tinh hoa cùng não bộ AI tiên tiến nhất từ Google.
              </p>
              <div className="flex gap-4">
                <SocialIconLight to="#" icon={<Smartphone className="w-5 h-5" />} />
                <SocialIconLight to="#" icon={<Globe className="w-5 h-5" />} />
                <SocialIconLight to="#" icon={<Bot className="w-5 h-5" />} />
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Sản phẩm</h5>
              <ul className="space-y-4">
                <FooterLinkLight to="#">Quét Hóa Đơn</FooterLinkLight>
                <FooterLinkLight to="#">AI Cố Vấn</FooterLinkLight>
                <FooterLinkLight to="#">Smart Alert</FooterLinkLight>
                <FooterLinkLight to="#">Báo cáo PDF</FooterLinkLight>
              </ul>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Công ty</h5>
              <ul className="space-y-4">
                <FooterLinkLight to="#">Về chúng tôi</FooterLinkLight>
                <FooterLinkLight to="#">Blog AI</FooterLinkLight>
                <FooterLinkLight to="#">Tuyển dụng</FooterLinkLight>
                <FooterLinkLight to="#">Tài liệu API</FooterLinkLight>
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-4">
              <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Tham gia vào kỷ nguyên mới</h5>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">Để lại email để nhận quyền ưu tiên truy cập các tính năng AI sắp ra mắt.</p>
              <form className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Nhập email của bạn" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all shadow-sm"
                />
                <button 
                  type="button" 
                  className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">
              © 2024 SpendwiseAI. Đồ án quản lý chi tiêu AI.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">Điều khoản</Link>
              <Link to="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">Quyền riêng tư</Link>
              <Link to="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Reusable Keyframes included directly */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite 2s; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function FeatureCardLight({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  const bgColors: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
  }

  return (
    <div className="p-8 bg-white border border-slate-200/60 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 mb-6 shadow-sm ${bgColors[color]}`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h4>
      <p className="text-slate-500 leading-relaxed text-sm font-medium">
        {description}
      </p>
    </div>
  )
}

function SecurityCardLight({ icon, title, description, highlightColor }: { icon: React.ReactNode, title: string, description: string, highlightColor: string }) {
   const colors: Record<string, string> = {
      emerald: 'text-emerald-600 bg-emerald-100 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)]',
      cyan: 'text-cyan-600 bg-cyan-100 border-cyan-200 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(6,182,212,0.3)]',
      violet: 'text-violet-600 bg-violet-100 border-violet-200 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(139,92,246,0.3)]',
      rose: 'text-rose-600 bg-rose-100 border-rose-200 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(244,63,94,0.3)]',
   }

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-3xl hover:shadow-lg transition-all duration-300 group cursor-default">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 mb-6 ${colors[highlightColor]}`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h4>
      <p className="text-slate-500 leading-relaxed text-sm font-medium">
        {description}
      </p>
    </div>
  )
}

function FooterLinkLight({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium flex items-center gap-2 group">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-violet-500 transition-colors" /> {children}
      </Link>
    </li>
  )
}

function SocialIconLight({ to, icon }: { to: string, icon: React.ReactNode }) {
  return (
    <Link to={to} className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-violet-600 transition-all duration-300 hover:shadow-md">
      {icon}
    </Link>
  )
}
