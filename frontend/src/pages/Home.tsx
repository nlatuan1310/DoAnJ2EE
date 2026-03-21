import { ArrowRight, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-4">
      <Wallet className="w-16 h-16 text-blue-600 mb-6" />
      <h1 className="text-4xl font-bold mb-4">SpendWise AI</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Trợ lý Quản lý Tài chính Thông minh của bạn. Bắt đầu theo dõi chi tiêu và lập ngân sách ngay hôm nay.
      </p>
      
      <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        Trải nghiệm ngay <ArrowRight size={20} />
      </button>
    </div>
  )
}
