
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import { AppTab } from './types';
import { generatePnLDataForMonth } from './utils/dataGenerator';
import { 
  RefreshCw, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  Zap, 
  Trophy, 
  AlertCircle, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  LayoutGrid, 
  BarChart3 
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [historyMode, setHistoryMode] = useState<'grid' | 'list'>('grid');
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const username = "PNL.29";

  /**
   * Cập nhật lợi nhuận:
   * 04/02 và 05/02 bổ sung (Giả định mỗi ngày ~1%):
   * Tổng lợi nhuận mới: 316.3% + 2.07% (của 4/2 và 5/2) = 318.37%
   */
  const monthlyResults = useMemo(() => [
    { id: 'm8', month: 'Tháng 02', year: 2026, result: 5.62, highest: false }, // 3.55 + 2.07
    { id: 'm7', month: 'Tháng 01', year: 2026, result: 7.95, highest: false },
    { id: 'm6', month: 'Tháng 12', year: 2025, result: 42.15, highest: true },
    { id: 'm5', month: 'Tháng 11', year: 2025, result: 45.80, highest: false },
    { id: 'm4', month: 'Tháng 10', year: 2025, result: 38.20, highest: false },
    { id: 'm3', month: 'Tháng 09', year: 2025, result: 51.45, highest: false },
    { id: 'm2', month: 'Tháng 08', year: 2025, result: 44.10, highest: false },
    { id: 'm1', month: 'Tháng 07', year: 2025, result: 48.60, highest: false },
    { id: 'm0', month: 'Tháng 06', year: 2025, result: 34.50, highest: false },
  ], []);

  const [selectedMonthId, setSelectedMonthId] = useState(monthlyResults[0].id);
  const currentMonthData = useMemo(() => monthlyResults.find(m => m.id === selectedMonthId)!, [selectedMonthId, monthlyResults]);

  const pnlHistoryFullMonth = useMemo(() => {
    return generatePnLDataForMonth(currentMonthData.month, currentMonthData.year, currentMonthData.result);
  }, [currentMonthData]);

  const stats = useMemo(() => {
    const dataWithResults = pnlHistoryFullMonth.filter(d => d.percentage !== 0);
    const winRate = dataWithResults.length > 0 
      ? ((dataWithResults.filter(d => d.isProfit).length / dataWithResults.length) * 100).toFixed(2)
      : "0.00";
    
    const averagePnL = dataWithResults.length > 0
      ? (dataWithResults.reduce((acc, curr) => acc + (curr.isProfit ? curr.percentage : -curr.percentage), 0) / dataWithResults.length).toFixed(2)
      : "0.00";

    return { winRate, averagePnL };
  }, [pnlHistoryFullMonth]);

  const toggleAppFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error full-screen mode: ${err.message}`);
      });
      setIsAppFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsAppFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsAppFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const masters = useMemo(() => [
    { rank: 1, name: 'Apex Flow Execution (AFE)', pnl24h: 1251, amount: 15432.7, private: true },
    { rank: 2, name: 'Precision Liquidity Strike (PLS)', pnl24h: 156, amount: 3890.0, private: false },
    { rank: 3, name: 'Quantum Pullback System (QPS)', pnl24h: 121, amount: 2570.0, private: false },
    { rank: 4, name: 'Adaptive Range Reversal (ARR)', pnl24h: 94, amount: 920.0, private: false },
    { rank: 5, name: 'Velocity Break Structure (VBS)', pnl24h: 87, amount: 1240.0, private: false },
  ], []);

  /**
   * Tính toán tài chính cập nhật:
   * Nạp gốc: $15,000.00
   * Lợi nhuận: 318.37% ($15,000 * 3.1837 = $47,755.50)
   * Tổng cộng (Nạp + Lãi): $15,000 + $47,755.5 = $62,755.50
   * Đã rút: $11,000.00
   * Tài sản hiện có: $62,755.5 - $11,000 = $51,755.50
   */
  const financeData = {
    assets: 51755.50, 
    deposited: 15000.00,
    withdrawn: 11000.00,
    profitPercent: "318.37"
  };

  return (
    <div className="flex h-screen bg-black text-white font-inter overflow-hidden" id="app-root">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <Navbar 
          isAppFullscreen={isAppFullscreen} 
          onToggleFullscreen={toggleAppFullscreen} 
          onMenuToggle={() => setIsSidebarOpen(true)}
          onHistoryToggle={() => setIsHistorySidebarOpen(true)}
          onProfileClick={() => setIsProfileOpen(true)}
        />
        
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-10 custom-scrollbar pb-24">
            {activeTab === AppTab.HOME ? (
              <>
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] lg:text-[10px] font-black text-red-500 uppercase tracking-widest">HỆ THỐNG VẬN HÀNH: SMARTMONEY-X AI V4.0</span>
                  </div>
                  <h2 className="text-3xl lg:text-6xl font-black tracking-tighter max-w-2xl leading-[1.1]">
                    Gia tăng tài sản <br />
                    <span className="text-gray-500">với sự kỷ luật tuyệt đối.</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <div className="glass-card rounded-2xl p-5 lg:p-6 border border-white/5 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap size={40} className="text-green-500" />
                    </div>
                    <h4 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Tài sản hiện có</h4>
                    <div className="text-2xl lg:text-3xl font-black text-white mt-1">$ {financeData.assets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <p className="text-[10px] text-green-500 mt-1 font-bold">+{financeData.profitPercent}% Lợi nhuận ròng</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 lg:p-6 border border-white/5">
                    <h4 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Số tiền đã nạp</h4>
                    <div className="text-xl lg:text-2xl font-black text-blue-400 mt-1">$ {financeData.deposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1 glass-card rounded-2xl p-5 lg:p-6 border border-white/5">
                    <h4 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Số tiền đã rút</h4>
                    <div className="text-xl lg:text-2xl font-black text-red-400 mt-1">$ {financeData.withdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsHistorySidebarOpen(true)}
                  className="lg:hidden w-full p-5 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl border border-red-500/20 flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center red-glow-btn text-white">
                      <History size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-white uppercase italic tracking-widest">LỊCH SỬ PNL</p>
                      <p className="text-[10px] text-green-500 font-bold mt-0.5">Xem chi tiết lợi nhuận hàng ngày</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                </button>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg lg:text-2xl font-black text-red-500 tracking-tighter uppercase italic">Chiến lược Hiệu quả hàng đầu</h3>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                    {masters.map((master, idx) => (
                      <div key={idx} className={`relative rounded-xl p-4 lg:p-6 flex flex-col items-center text-center transition-all border border-white/5 ${idx === 0 ? 'bg-yellow-600/10 border-yellow-500/30' : 'bg-white/5'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs mb-4 ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>{idx + 1}</div>
                        <p className="text-[10px] font-black text-white uppercase line-clamp-2 h-8 leading-tight mb-3">{master.name}</p>
                        <div className="mb-4">
                          <p className="text-[9px] text-green-500 font-black">PnL (+{master.pnl24h}%)</p>
                          <p className="text-base lg:text-lg font-black text-white">${master.amount.toLocaleString()}</p>
                        </div>
                        <button className={`w-full py-2 rounded-lg text-[10px] font-black uppercase ${master.private ? 'border border-red-500/40 text-red-500' : 'bg-red-600 text-white'}`}>{master.private ? 'Riêng tư' : 'Sao chép'}</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[1.5rem] p-6 lg:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500">
                      <Trophy size={20} />
                    </div>
                    <h3 className="font-bold text-lg lg:text-xl uppercase italic tracking-tighter">Kết quả theo tháng</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-6">
                    {monthlyResults.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedMonthId(item.id); setIsHistorySidebarOpen(true); }} 
                        className={`bg-black/40 p-4 lg:p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                          selectedMonthId === item.id 
                            ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                            : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {item.month}
                          </span>
                          <span className="text-[8px] lg:text-[9px] font-medium text-gray-600 mb-1 lg:mb-2 tracking-tight">
                            Năm {item.year}
                          </span>
                          <p className={`text-lg lg:text-2xl font-black tracking-tighter mt-auto ${item.result >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.result >= 0 ? '+' : ''}{item.result.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
               <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-500 text-center">
                <RefreshCw className="animate-spin" size={32} />
                <p className="font-bold uppercase tracking-widest text-sm">Đang cập nhật...</p>
               </div>
            )}
          </div>

          <div 
            className={`
              fixed lg:static inset-0 lg:inset-auto bg-[#030303] flex flex-col transition-all duration-300 z-[100]
              ${isHistorySidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              ${isHistoryExpanded ? 'lg:fixed lg:inset-0 lg:w-full lg:h-full lg:z-[150] lg:bg-black' : 'lg:w-[26rem] lg:border-l lg:border-white/5'}
            `}
          >
            <div className={`p-4 lg:p-6 flex flex-col gap-4 sticky top-0 bg-[#030303] z-40 border-b border-white/5`}>
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest italic text-white/40">Lịch sử PNL</h3>
                  <button onClick={() => {setIsHistorySidebarOpen(false); setIsHistoryExpanded(false);}} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
               </div>

               <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {monthlyResults.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setSelectedMonthId(m.id)} 
                      className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                        selectedMonthId === m.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-[#121212] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {m.month.split(' ')[1]}/{m.year.toString().slice(2)}
                    </button>
                  ))}
                </div>

                <div className="w-full h-[6px] bg-[#121212] rounded-full overflow-hidden">
                   <div className="h-full bg-red-600 w-full rounded-full"></div>
                </div>

                <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-2">
                      <RefreshCw size={14} className="text-red-500" />
                      <h2 className="text-sm font-black uppercase tracking-tighter italic text-white">Lịch sử ngày</h2>
                   </div>
                   <div className="flex items-center space-x-2">
                      <div className="flex bg-[#121212] p-1 rounded-xl">
                        <button 
                          onClick={() => setHistoryMode('list')}
                          className={`p-1.5 rounded-lg transition-all ${historyMode === 'list' ? 'bg-white/5 text-white' : 'text-gray-600'}`}
                        >
                          <BarChart3 size={14} />
                        </button>
                        <button 
                          onClick={() => setHistoryMode('grid')}
                          className={`p-1.5 rounded-lg transition-all ${historyMode === 'grid' ? 'bg-white/5 text-white' : 'text-gray-600'}`}
                        >
                          <LayoutGrid size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)} 
                        className="p-1.5 bg-[#121212] rounded-xl text-gray-500 hover:text-white transition-all"
                      >
                        {isHistoryExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                   </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className={`p-4 lg:p-6 space-y-6 ${isHistoryExpanded ? 'max-w-5xl mx-auto w-full' : ''}`}>
                  
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] p-3 lg:p-4 flex flex-col items-center justify-center transition-all hover:bg-white/[0.02]">
                        <span className="text-[6px] lg:text-[8px] text-gray-500 font-bold uppercase tracking-[0.1em] mb-1">PNL THÁNG</span>
                        <p className="text-sm lg:text-lg font-black text-green-500 tracking-tighter">+{currentMonthData.result.toFixed(2)}%</p>
                     </div>
                     <div className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] p-3 lg:p-4 flex flex-col items-center justify-center transition-all hover:bg-white/[0.02]">
                        <span className="text-[6px] lg:text-[8px] text-gray-500 font-bold uppercase tracking-[0.1em] mb-1">TRUNG BÌNH</span>
                        <p className="text-sm lg:text-lg font-black text-blue-400 tracking-tighter">+{stats.averagePnL}%</p>
                     </div>
                     <div className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] p-3 lg:p-4 flex flex-col items-center justify-center transition-all hover:bg-white/[0.02]">
                        <span className="text-[6px] lg:text-[8px] text-gray-500 font-bold uppercase tracking-[0.1em] mb-1">TỶ LỆ THẮNG</span>
                        <p className="text-sm lg:text-lg font-black text-white tracking-tighter">{stats.winRate}%</p>
                     </div>
                  </div>

                  <div className="pb-8">
                    {historyMode === 'grid' ? (
                       <div className={`grid ${isHistoryExpanded ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-4'} gap-2.5`}>
                          {pnlHistoryFullMonth.map((item, idx) => {
                             const dayNum = item.date.split('-')[2];
                             const hasData = item.percentage !== 0;

                             return (
                                <div key={idx} className={`aspect-square relative flex flex-col items-center justify-center rounded-[0.85rem] border transition-all ${
                                   !hasData 
                                   ? 'border-white/[0.03] bg-[#080808] opacity-20'
                                   : item.isProfit 
                                     ? 'border-green-500/20 bg-green-500/[0.03] shadow-[inset_0_0_20px_rgba(34,197,94,0.02)]' 
                                     : 'border-red-500/20 bg-red-500/[0.03] shadow-[inset_0_0_20px_rgba(239,68,68,0.02)]'
                                }`}>
                                   <span className="absolute top-2 left-2 text-[8px] font-bold text-gray-600 tracking-tight">{dayNum}</span>
                                   
                                   {hasData ? (
                                     <>
                                        <p className={`text-[10px] sm:text-[11px] lg:text-[13px] font-black tracking-tighter text-center leading-none ${item.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                          {item.isProfit ? '+' : '-'}{Math.abs(item.percentage).toFixed(2)}%
                                        </p>
                                        <div className={`absolute bottom-2.5 w-5 h-[2px] rounded-full opacity-50 ${item.isProfit ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                     </>
                                   ) : (
                                     <div className="w-4 h-[1px] bg-white/10 rounded-full mt-4"></div>
                                   )}
                                </div>
                             );
                          })}
                       </div>
                    ) : (
                       <div className="space-y-2.5">
                          {pnlHistoryFullMonth.filter(d => d.percentage !== 0).reverse().map((item, idx) => (
                             <div key={idx} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-[1.25rem] flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                                <div className="flex items-center space-x-3.5">
                                   <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.isProfit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {item.isProfit ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                   </div>
                                   <div>
                                      <p className="text-[8px] text-gray-500 font-bold">{item.date.split('-').reverse().join('/')}</p>
                                      <p className={`text-sm lg:text-base font-black tracking-tighter leading-tight ${item.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                         {item.isProfit ? '+' : '-'}{Math.abs(item.percentage).toFixed(2)}%
                                      </p>
                                   </div>
                                </div>
                                <div className="flex flex-col items-end">
                                   <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">{item.strategy?.split(' ')[0] || 'SmartMoney-X'}</span>
                                   <ChevronRight size={14} className="text-gray-800" />
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                  </div>
               </div>
            </div>

            <div className="bg-[#030303] border-t border-white/5 p-5 lg:p-7 space-y-4 sticky bottom-0 z-40">
               <div className={`bg-red-600/[0.03] border border-red-500/10 rounded-2xl p-4 flex items-start space-x-3 ${isHistoryExpanded ? 'max-w-4xl mx-auto w-full' : ''}`}>
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">
                    <span className="text-red-500 font-black uppercase italic mr-1">Nguyên tắc:</span> Không chốt lỗ quá 3%/ngày. Nếu các Master vi phạm vui lòng báo cáo Admin của Smart Money.
                  </p>
               </div>

               <div className={`flex items-center space-x-3 ${isHistoryExpanded ? 'max-w-4xl mx-auto w-full' : ''}`}>
                  <button className="flex-[2.5] py-4 bg-black border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white active:scale-95 hover:bg-white/5 transition-all italic">
                    SmartMoney
                  </button>
                  <button className="flex-1 py-4 bg-transparent border border-red-500/40 rounded-2xl text-[10px] font-black uppercase text-red-500 active:scale-95 hover:bg-red-500/10 transition-all tracking-widest">
                    BÁO CÁO
                  </button>
               </div>
            </div>
          </div>
        </div>
      </main>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        username={username}
      />
    </div>
  );
};

export default App;
