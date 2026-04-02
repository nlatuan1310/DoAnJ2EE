import { useEffect, useRef } from "react";
import { AlertOctagon } from "lucide-react";

interface ThongBaoVuotNganSachProps {
  overBudgets: any[];
}

/**
 * Tạo và phát âm thanh báo động (Kiểu Chuông báo cháy / Báo thức kĩ thuật số)
 */
function createAlarmLoop(): { start: () => void; stop: () => void } {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return { start: () => {}, stop: () => {} };

  let ctx: AudioContext | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const playDigitalAlarm = () => {
    if (!ctx || stopped) return;

    const beep = (startTime: number, freq: number, duration: number) => {
      if (!ctx || stopped) return;
      const osc = ctx.createOscillator();
      osc.type = "square"; // Tín hiệu báo động mạnh
      osc.frequency.setValueAtTime(freq, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gain.gain.setValueAtTime(0.25, startTime + duration - 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // 3 tiếng bíp gắt và liên tục giống đồng hồ báo thức điện tử / báo cháy
    beep(now, 1200, 0.1);
    beep(now + 0.2, 1200, 0.1);
    beep(now + 0.4, 1200, 0.1);
  };

  const start = () => {
    try {
      stopped = false;
      ctx = new AudioCtx();
      playDigitalAlarm(); 
      intervalId = setInterval(playDigitalAlarm, 1000); // Lặp mỗi 1 giây (beep x3 rồi nghỉ chút)
    } catch (err) {
      console.log("Web Audio API error:", err);
    }
  };

  const stop = () => {
    stopped = true;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (ctx) {
      ctx.close().catch(() => {});
      ctx = null;
    }
  };

  return { start, stop };
}

export default function ThongBaoVuotNganSach({ overBudgets }: ThongBaoVuotNganSachProps) {
  const alarmRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  // Quản lý vòng đời âm thanh: bật khi có vượt, tắt khi hết vượt
  useEffect(() => {
    if (overBudgets.length > 0) {
      // Bắt đầu kêu liên tục
      if (!alarmRef.current) {
        alarmRef.current = createAlarmLoop();
        alarmRef.current.start();
      }
    } else {
      // Hết vượt → TẮT âm thanh
      if (alarmRef.current) {
        alarmRef.current.stop();
        alarmRef.current = null;
      }
    }
  }, [overBudgets]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (alarmRef.current) {
        alarmRef.current.stop();
        alarmRef.current = null;
      }
    };
  }, []);

  if (overBudgets.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden font-sans border-2 border-rose-500 select-none animate-[budget-shake_0.5s_infinite]"
      style={{
        transform: "translate3d(0, 0, 0)"
      }}
    >
      <style>
        {`
          @keyframes budget-shake {
            0%, 100% { transform: translate3d(0, 0, 0); }
            20% { transform: translate3d(-3px, 0, 0) rotate(-1deg); }
            40% { transform: translate3d(3px, 0, 0) rotate(1deg); }
            60% { transform: translate3d(-3px, 0, 0) rotate(-1deg); }
            80% { transform: translate3d(3px, 0, 0) rotate(1deg); }
          }
        `}
      </style>

      <div className="p-5 bg-rose-600 flex items-start gap-4">
        <div className="bg-white/20 text-white p-2.5 rounded-full shrink-0">
          <AlertOctagon className="w-7 h-7 animate-ping" />
        </div>
        <div className="text-white">
          <h3 className="font-extrabold text-lg leading-tight mb-1 tracking-tight">
            ⚠️ Vượt Ngân Sách!
          </h3>
          <p className="text-rose-100 text-xs font-medium">
            Bạn đã chi tiêu vượt mức giới hạn cho <strong>{overBudgets.length}</strong> danh mục.
            Hãy điều chỉnh hạn mức để tắt cảnh báo này.
          </p>
        </div>
      </div>

      <div className="bg-white p-5">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <ul className="text-xs text-slate-700 space-y-2.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
            {overBudgets.map((b, i) => {
              const over = (b.spent || 0) - b.gioiHanTien;
              return (
                <li key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="font-bold truncate max-w-[130px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {b.danhMuc?.tenDanhMuc || "Danh mục"}
                  </span>
                  <div className="text-right">
                     <div className="text-slate-800 font-bold">{new Intl.NumberFormat('vi-VN').format(b.spent || 0)} ₫</div>
                     <div className="text-[9px] text-rose-500 font-bold uppercase mt-0.5">Vượt {new Intl.NumberFormat('vi-VN').format(over)} ₫</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
