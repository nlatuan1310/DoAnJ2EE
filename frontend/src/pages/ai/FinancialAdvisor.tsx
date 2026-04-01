import { useState, useEffect, useRef } from "react";
import { financialAdvisorApi } from "@/services/api";
import {
  BrainCircuit,
  Send,
  Trash2,
  Loader2,
  Sparkles,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";

interface ChatMessage {
  id?: string;
  cauHoi: string;
  traLoi: string;
  ngayTao?: string;
}

const QUICK_SUGGESTIONS = [
  "Tôi đã chi tiêu bao nhiêu tháng này?",
  "Phân tích thói quen chi tiêu của tôi",
  "Làm sao để tiết kiệm hiệu quả hơn?",
  "Tình hình ngân sách hiện tại thế nào?",
  "So sánh thu nhập và chi tiêu tháng này",
  "Gợi ý cách quản lý tài chính cá nhân",
];

export default function FinancialAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await financialAdvisorApi.getHistory();
      // Reverse to show oldest first
      setMessages((res.data as ChatMessage[]).reverse());
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (question?: string) => {
    const cauHoi = question || input.trim();
    if (!cauHoi || loading) return;

    setInput("");
    setLoading(true);

    // Optimistic: add user question immediately
    const tempMsg: ChatMessage = { cauHoi, traLoi: "" };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await financialAdvisorApi.askQuestion({ cauHoi });
      const data = res.data as ChatMessage;
      // Replace temp message with real response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: data.id,
          cauHoi: data.cauHoi,
          traLoi: data.traLoi,
          ngayTao: data.ngayTao,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          cauHoi,
          traLoi:
            "❌ Không thể kết nối với AI. Vui lòng kiểm tra Ollama đang chạy.\n\nLỗi: " +
            (err.response?.data?.message || err.message),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, index: number) => {
    try {
      await financialAdvisorApi.deleteHistory(id);
      setMessages((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg shadow-violet-200">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Cố vấn Tài chính AI
            </h1>
            <p className="text-sm text-slate-500">
              Phân tích dựa trên dữ liệu thực của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Loading history State */}
        {loadingHistory && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
            <span className="text-slate-500">Đang tải lịch sử...</span>
          </div>
        )}

        {/* Empty State */}
        {!loadingHistory && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl mb-4">
              <Sparkles className="w-10 h-10 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              Xin chào! Tôi là cố vấn tài chính AI
            </h2>
            <p className="text-sm text-slate-500 text-center max-w-md mb-6">
              Tôi sẽ phân tích dữ liệu giao dịch, ngân sách và mục tiêu tiết kiệm của bạn để đưa ra lời khuyên cá nhân hóa.
            </p>

            {/* Quick Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {QUICK_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 text-sm text-slate-600 hover:text-violet-700 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-violet-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg, index) => (
          <div key={index} className="space-y-4">
            {/* User Bubble */}
            <div className="flex justify-end">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-md shadow-md">
                  <p className="text-sm whitespace-pre-wrap">{msg.cauHoi}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-violet-600" />
                </div>
              </div>
            </div>

            {/* AI Bubble */}
            {msg.traLoi ? (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="relative group">
                    <div className="bg-white border border-slate-200/60 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {msg.traLoi}
                      </p>
                      {msg.ngayTao && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          {new Date(msg.ngayTao).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                    {/* Delete button */}
                    {msg.id && (
                      <button
                        onClick={() => handleDelete(msg.id!, index)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-50 border border-red-200 rounded-full text-red-400 hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Loading indicator when waiting for AI response */
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200/60 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                      <span className="text-sm text-slate-500">
                        Đang phân tích dữ liệu tài chính...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-slate-200/60">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về tài chính của bạn..."
              rows={1}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all shadow-sm"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height =
                  Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          Powered by Ollama • Dữ liệu được xử lý hoàn toàn dựa trên Ollama
        </p>
      </div>
    </div>
  );
}
