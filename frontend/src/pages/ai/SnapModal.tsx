import { useState, useRef, useEffect } from "react";
import { Camera, X, Send, Image as ImageIcon, Loader2, Wallet, Banknote } from "lucide-react";
import { snapApi, viTienApi } from "../../services/api";

interface SnapModalProps {
  onClose: () => void;
  onSuccess: (newSnap: any) => void;
}

export default function SnapModal({ onClose, onSuccess }: SnapModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Tải danh sách ví
    viTienApi.getAll().then((res: any) => {
      if (res.data && res.data.length > 0) {
        setWallets(res.data);
        setSelectedWalletId(res.data[0].id);
      }
    }).catch(console.error);

    // Cleanup ObjectURL on unmount to prevent memory leak
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []);

  const MAX_FILE_SIZE_MB = 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size (max 10MB)
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`Ảnh quá lớn! Giới hạn tối đa ${MAX_FILE_SIZE_MB}MB.`);
        e.target.value = ""; // Reset input
        return;
      }

      // Revoke previous ObjectURL to prevent memory leak
      if (preview) URL.revokeObjectURL(preview);

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSnapAndSave = async () => {
    if (!file) {
      setError("Vui lòng đính kèm một bức ảnh hoặc chụp ảnh mới!");
      return;
    }
    if (!selectedWalletId) {
      setError("Bạn chưa có ví tiền để giao dịch!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Gửi note và amount riêng biệt để backend xử lý chính xác
      const trimmedNote = note.trim();
      if (trimmedNote) {
        formData.append("note", trimmedNote);
      }
      
      // Gửi amount riêng — backend sẽ ưu tiên dùng nếu > 0
      if (amount && parseFloat(amount) > 0) {
        formData.append("amount", amount);
      }
      
      formData.append("viId", selectedWalletId);

      const res = await snapApi.autoSnapAndSave(formData);
      
      // Thành công, truyền giao dịch mới về Component cha
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi giao tiếp hệ thống AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Nút đóng */}
      <button 
        onClick={onClose}
        disabled={isLoading}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md h-[85vh] max-h-[800px] bg-slate-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-violet-500/20 flex flex-col items-center">
        
        {/* Khung ảnh */}
        <div className="w-full h-full relative group flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Snap preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-white/50 space-y-4">
              <Camera className="w-16 h-16 opacity-30" />
              <p className="font-medium text-lg">Chưa có hình ảnh</p>
            </div>
          )}

          {/* Nút ẩn để chọn File */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
            capture="environment" 
          />
          
          {/* Nút đổi ảnh (Chỉ hiện khi chưa loading) */}
          {!isLoading && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`absolute flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold transition-all shadow-lg backdrop-blur-md
                ${preview 
                  ? 'top-6 bg-black/40 text-white hover:bg-black/60 border border-white/20' 
                  : 'bg-violet-600 text-white hover:bg-violet-500 scale-110'}`}
            >
               {preview ? <ImageIcon className="w-5 h-5"/> : <Camera className="w-6 h-6"/>}
               {preview ? "Đổi ảnh" : "Tải lên / Chụp ảnh"}
            </button>
          )}

          {/* Lớp phủ Đen gradient từ dưới lên */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
        </div>

        {/* Khu vực input Caption (đặt đè lên ảnh ở dưới đuôi) */}
        <div className="absolute bottom-8 inset-x-6 flex flex-col gap-4">
          
          {error && (
            <div className="bg-rose-500/90 backdrop-blur text-white px-4 py-3 rounded-2xl text-sm font-medium animate-in slide-in-from-bottom flex justify-between">
              {error}
              <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Chọn Ví */}
          {wallets.length > 0 && (
            <div className="bg-black/40 border border-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3">
              <Wallet className="w-5 h-5 text-violet-400" />
              <select 
                value={selectedWalletId} 
                onChange={e => setSelectedWalletId(e.target.value)}
                className="bg-transparent text-white w-full outline-none font-medium text-sm appearance-none cursor-pointer"
                disabled={isLoading}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} className="text-black">{w.tenVi} (Còn {new Intl.NumberFormat('vi-VN').format(w.soDu)}đ)</option>
                ))}
              </select>
            </div>
          )}

          {/* Ô nhập Giá tiền bổ sung */}
          <div className="bg-black/40 border border-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 shadow-inner">
            <Banknote className="w-5 h-5 text-emerald-400" />
            <input 
              type="number"
              placeholder="Nhập giá tiền (hoặc để AI tự quét)..."
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-transparent text-white w-full outline-none font-medium text-sm placeholder-white/50"
              disabled={isLoading}
            />
            {amount && <span className="text-white/50 text-xs font-bold">VNĐ</span>}
          </div>

          {/* Thanh input Caption giống Locket/Insta Story */}
          <div className="relative">
            <input
              type="text"
              placeholder="Thêm mô tả cho bức ảnh này..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              maxLength={100}
              className="w-full bg-black/40 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-3xl outline-none focus:border-violet-500 focus:bg-black/60 transition-all font-medium placeholder-white/50 pr-16"
            />
            <button
              onClick={handleSnapAndSave}
              disabled={isLoading || !file}
              className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-2xl text-white transition-all
                ${!file ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/30'}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-1" />
              )}
            </button>
          </div>
          
          {isLoading && (
            <p className="text-center text-violet-300 text-sm font-medium animate-pulse mt-2 flex items-center justify-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /> AI đang quét và tính toán...
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
