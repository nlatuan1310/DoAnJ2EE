import { useState, useEffect, useMemo, useCallback } from "react";
import { Image as ImageIcon, Plus, Trash2, Undo2, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { snapApi, giaoDichApi } from "../../services/api";
import SnapModal from "./SnapModal";

export default function SnapFeed() {
  const [snaps, setSnaps] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [undoSnap, setUndoSnap] = useState<any | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayItems, setSelectedDayItems] = useState<{ dateStr: string, items: any[] } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const PAGE_SIZE = 200; // Tải nhiều hơn để giảm số request

  const fetchSnaps = useCallback(async (pageNum: number, merge = false) => {
    try {
      setLoading(true);
      const res = await snapApi.getSnapFeed(pageNum, PAGE_SIZE);
      const newItems = res.data.content || [];
      if (merge) {
        setSnaps((prev: any[]) => [...prev, ...newItems]);
      } else {
        setSnaps(newItems);
      }
      const isLast = res.data.last;
      setHasMore(!isLast);
      return !isLast; // Return true nếu còn trang tiếp
    } catch (err) {
      console.error("Lỗi khi tải Snap Feed", err);
      return false;
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Tải tất cả snap khi mount — fetch liên tục cho đến khi hết
  useEffect(() => {
    const fetchAllSnaps = async () => {
      setInitialLoading(true);
      let currentPage = 0;
      let allSnaps: any[] = [];
      let more = true;

      while (more) {
        try {
          const res = await snapApi.getSnapFeed(currentPage, PAGE_SIZE);
          const newItems = res.data.content || [];
          allSnaps = [...allSnaps, ...newItems];
          more = !res.data.last;
          currentPage++;
        } catch (err) {
          console.error("Lỗi khi tải Snap Feed", err);
          more = false;
        }
      }

      setSnaps(allSnaps);
      setPage(currentPage - 1);
      setHasMore(false);
      setLoading(false);
      setInitialLoading(false);
    };

    fetchAllSnaps();
  }, []);

  const handleSnapSuccess = (newTransaction: any) => {
    setSnaps((prev: any[]) => [newTransaction, ...prev]);
    setUndoSnap(newTransaction);
    setTimeout(() => {
      setUndoSnap((prev: any) => prev?.id === newTransaction.id ? null : prev);
    }, 6000);
  };

  const handleUndo = async () => {
    if (!undoSnap) return;
    try {
      await giaoDichApi.delete(undoSnap.id);
      setSnaps((prev: any[]) => prev.filter(s => s.id !== undoSnap.id));
      setUndoSnap(null);
    } catch (err) {
      console.error("Lỗi hoàn tác", err);
      alert("Không thể hoàn tác giao dịch này!");
    }
  };

  const handleDeleteSnap = async (snapId: string) => {
    if (!window.confirm("Bạn muốn xoá kỉ niệm giao dịch này?")) return;
    try {
      await giaoDichApi.delete(snapId);
      setSnaps((prev: any[]) => prev.filter(s => s.id !== snapId));
      
      // Cập nhật overlay: xoá item khỏi danh sách hiện tại
      setSelectedDayItems(prev => {
        if (!prev) return null;
        const updatedItems = prev.items.filter(s => s.id !== snapId);
        // Issue #8: Tự đóng overlay nếu xoá hết items
        if (updatedItems.length === 0) return null;
        return { ...prev, items: updatedItems };
      });
    } catch (e) {
      alert("Không xoá được!");
    }
  };

  const snapsByDateMap = useMemo(() => {
    const map = snaps.reduce((acc, snap) => {
      const d = new Date(snap.ngayGiaoDich);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(snap);
      return acc;
    }, {} as Record<string, any[]>);

    // Sắp xếp lại danh sách của từng ngày theo thứ tự Cũ -> Mới (Cũ nhất ở trước, Mới hơn ở sau)
    for (const key in map) {
      map[key].sort((a: any, b: any) => new Date(a.ngayGiaoDich).getTime() - new Date(b.ngayGiaoDich).getTime());
    }

    return map;
  }, [snaps]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, key: key, dayNumber: i });
    }
    return days;
  }, [currentMonth]);

  // Đếm tổng snap trong tháng hiện tại
  const monthSnapCount = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return snaps.filter(snap => {
      const d = new Date(snap.ngayGiaoDich);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
  }, [snaps, currentMonth]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Issue #6: Skeleton loading component
  const CalendarSkeleton = () => (
    <div className="flex flex-col bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-200 rounded" />
          <div className="w-40 h-7 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 bg-slate-200 rounded-full" />
          <div className="w-9 h-9 bg-slate-200 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
          <div key={day} className="text-center font-extrabold text-slate-300 py-2 text-sm">{day}</div>
        ))}
        {Array.from({ length: 35 }).map((_, idx) => (
          <div
            key={`skel-${idx}`}
            className="h-20 md:h-32 rounded-2xl bg-slate-100"
            style={{ opacity: 0.3 + Math.random() * 0.5 }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500 min-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 tracking-tight flex items-center gap-3">
             💸 Snap & Save
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Nhật ký chi tiêu bằng hình ảnh siêu tốc.</p>
        </div>
        
        {/* Undo Toast */}
        {undoSnap && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-full flex items-center gap-4 shadow-xl shadow-slate-900/20 animate-in slide-in-from-top-10 fade-in duration-300">
            <span className="text-sm font-medium">Đã lưu: -{new Intl.NumberFormat('vi-VN').format(undoSnap.soTien)}đ</span>
            <div className="w-px h-4 bg-white/20"></div>
            <button 
              onClick={handleUndo}
              className="text-amber-400 hover:text-amber-300 text-sm font-bold flex items-center gap-1.5"
            >
              <Undo2 className="w-4 h-4" /> Hoàn tác
            </button>
          </div>
        )}
      </div>

      {/* Issue #6: Loading Skeleton */}
      {initialLoading ? (
        <CalendarSkeleton />
      ) : snaps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 mt-20">
          <ImageIcon className="w-20 h-20 mb-4 opacity-20" />
          <h2 className="text-xl font-bold text-slate-500">Chưa có "chiếc" Snap nào!</h2>
          <p className="mt-2 text-center text-sm max-w-sm">Hãy chụp hình những món đồ bạn vừa mua, bữa ăn vừa thưởng thức. AI sẽ giúp bạn tự ghi sổ ví gài gắm kỷ niệm xinh xắn.</p>
        </div>
      ) : (
        <div className="flex flex-col bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100">
          
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-violet-500" />
              <h2 className="text-xl font-bold text-slate-800">
                Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
              </h2>
              {monthSnapCount > 0 && (
                <span className="text-xs font-bold bg-violet-100 text-violet-600 px-2.5 py-1 rounded-full">
                  {monthSnapCount} snap
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
              <div key={day} className="text-center font-extrabold text-slate-400 py-2 text-sm">{day}</div>
            ))}
            
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-20 md:h-32 bg-transparent" />;
              
              const daySnaps = snapsByDateMap[day.key] || [];
              const hasSnaps = daySnaps.length > 0;
              const isToday = new Date().toDateString() === day.date.toDateString();
              
              return (
                <div 
                  key={day.key} 
                  onClick={() => {
                    if (hasSnaps) {
                      setSelectedDayItems({ dateStr: day.key, items: daySnaps });
                      setCurrentSlideIndex(0);
                    }
                  }}
                  className={`relative h-20 md:h-32 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center transition-all ${
                    hasSnaps ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'bg-slate-100/50'
                  } ${isToday && !hasSnaps ? 'ring-2 ring-violet-400 bg-violet-50/50' : ''}`}
                >
                  {hasSnaps ? (
                    <>
                      <img src={daySnaps[0].hinhAnhUrl} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors"></div>
                      <span className="relative z-10 text-white font-black text-xl md:text-3xl drop-shadow-md">{day.dayNumber}</span>
                      <span className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] md:text-xs font-bold text-white border border-white/30 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3"/> {daySnaps.length}
                      </span>
                    </>
                  ) : (
                    <span className={`font-bold transition-colors ${
                      isToday ? 'text-violet-600 text-lg' : 'text-slate-400'
                    }`}>
                      {day.dayNumber}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang tải..." : `Tổng cộng ${snaps.length} kỷ niệm đã được lưu trữ.`}
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY HIỂN THỊ CHI TIẾT NGÀY DẠNG SLIDE STORY*/}
      {selectedDayItems && (() => {
        const activeIndex = Math.min(currentSlideIndex, selectedDayItems.items.length - 1);
        const snap = selectedDayItems.items[activeIndex];
        const totalSlides = selectedDayItems.items.length;

        const nextSlide = () => setCurrentSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
        const prevSlide = () => setCurrentSlideIndex(prev => Math.max(prev - 1, 0));

        return (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in flex items-center justify-center p-4">
            {/* Nút đóng góc phải */}
            <button 
              onClick={() => setSelectedDayItems(null)}
              className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-full max-w-md aspect-[3/4] max-h-[85vh] flex flex-col items-center shadow-2xl">
              
              {/* Header: Ngày & Dots */}
              <div className="absolute -top-14 inset-x-0 z-20 flex flex-col items-center">
                  <h2 className="text-white text-xl font-black drop-shadow-md mb-3">
                    {new Date(selectedDayItems.dateStr).toLocaleDateString('vi-VN')}
                  </h2>
                  <div className="flex gap-1.5 justify-center w-full">
                    {selectedDayItems.items.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/30'}`}
                      />
                    ))}
                  </div>
              </div>

              {/* Slide Content */}
              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                  <img 
                    src={snap.hinhAnhUrl} 
                    alt={snap.moTa} 
                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300"
                    key={snap.id}
                  />
                  
                  {/* Overlay Gradient Tối Tối Nổi Bật Chữ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none"></div>

                  {/* Nhãn Tiền & Danh Mục */}
                  <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase rounded-lg border border-white/20 flex items-center gap-1.5 shadow-md">
                    <span className={snap.loai === "expense" ? "text-rose-400" : "text-emerald-400"}>
                      {snap.loai === "expense" ? "-" : "+"} {new Intl.NumberFormat('vi-VN').format(snap.soTien)}
                    </span> 
                    <span className="opacity-50 px-1">●</span> 
                    <span className="opacity-90">{snap.danhMuc?.tenDanhMuc || "AI Xếp"}</span>
                  </div>

                  {/* Nút Xoá */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnap(snap.id);
                    }}
                    className="absolute top-4 right-4 z-20 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors border border-white/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* Caption Story */}
                  <div className="absolute bottom-8 inset-x-6 text-center z-20">
                    <p className="text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-snug line-clamp-4 text-shadow-xl text-lg">
                      {snap.moTa}
                    </p>
                    <p className="text-white/80 text-sm font-semibold mt-2 drop-shadow-md bg-black/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                      {new Date(snap.ngayGiaoDich).toLocaleTimeString('vi-VN', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
              </div>

              {/* Navigation Invisible Overlays (Ấn trái/phải để qua bài) */}
              <div className="absolute inset-0 z-10 flex">
                  <div 
                    className="w-1/2 h-full cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }} 
                  />
                  <div 
                    className="w-1/2 h-full cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }} 
                  />
              </div>

              {/* Hướng dẫn thao tác */}
              {totalSlides > 1 && (
                <div className="absolute -bottom-10 inset-x-0 flex justify-between px-4 text-white/50 text-xs font-medium z-20 pointer-events-none">
                  <span>Chạm trái để lùi</span>
                  <span>Chạm phải để tiếp</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Phím Nổi Bự (FAB) Chụp Nhanh */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900 border-[3px] border-white text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-violet-900/30 group"
      >
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full p-1.5 group-hover:rotate-90 transition-transform">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold tracking-wide pr-1">Chụp / Chọn Ảnh</span>
      </button>

      {/* Render Modal chèn Locket Upload */}
      {isModalOpen && (
        <SnapModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSnapSuccess}
        />
      )}
    </div>
  );
}
