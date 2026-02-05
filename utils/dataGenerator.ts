
import { DailyPnL } from '../types';

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

const STRATEGIES = [
  'Alpha-X AI V4.0',
  'Apex Flow Execution',
  'Precision Liquidity',
  'Quantum Pullback',
  'Velocity Break',
  'Adaptive Range'
];

/**
 * Simple deterministic PRNG to ensure the same results for the same seed
 */
const createSeededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export const generatePnLDataForMonth = (monthName: string, year: number, targetTotalPnL: number): DailyPnL[] => {
  const monthInt = parseInt(monthName.replace('Tháng ', ''));
  const daysInMonth = getDaysInMonth(monthInt, year);
  
  // Tạo seed dựa trên tháng và năm để kết quả luôn cố định cho mỗi tháng
  let currentSeed = (monthInt * 1000000) + (year * 13) + Math.floor(targetTotalPnL * 100);
  const seededRandom = createSeededRandom(currentSeed);

  // Kiểm tra mốc khởi đầu 14/06/2025
  const isStartMonth = monthInt === 6 && year === 2025;
  const startDay = isStartMonth ? 14 : 1;

  const isFeb2026 = monthInt === 2 && year === 2026;
  
  // Giới hạn ngày hiện tại: Cập nhật đến ngày 05/02/2026
  const isFutureMonth = (year > 2026) || (year === 2026 && monthInt > 2);
  const currentDayLimit = isFutureMonth ? 0 : (isFeb2026 ? 5 : daysInMonth);

  const data: DailyPnL[] = [];
  
  // Số ngày có dữ liệu trong tháng này
  const activeDaysCount = Math.max(0, currentDayLimit - startDay + 1);

  if (activeDaysCount <= 0) {
    for (let i = 1; i <= daysInMonth; i++) {
      data.push({
        date: `${year}-${monthInt.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
        percentage: 0,
        isProfit: true,
        strategy: '-'
      });
    }
    return data;
  }

  // Tỷ lệ thắng dao động từ 61-77% (cố định theo seed)
  const targetWinRate = 61 + (currentSeed % 17); 
  const lossDaysRatio = (100 - targetWinRate) / 100; 

  const lossDaysCount = Math.floor(activeDaysCount * lossDaysRatio);
  const profitDaysCount = activeDaysCount - lossDaysCount;

  // Tạo các ngày lỗ (Không quá 3%)
  const losses: number[] = [];
  let sumLosses = 0;
  for (let i = 0; i < lossDaysCount; i++) {
    // Sử dụng seededRandom thay cho Math.random()
    const val = -(0.5 + seededRandom() * 2.4);
    losses.push(val);
    sumLosses += val;
  }

  // Tính toán tổng lợi nhuận cần thiết cho các ngày thắng
  const neededProfitSum = targetTotalPnL - sumLosses;
  const avgProfitPerDay = profitDaysCount > 0 ? neededProfitSum / profitDaysCount : 0;

  const profits: number[] = [];
  let currentProfitSum = 0;
  if (profitDaysCount > 0) {
    for (let i = 0; i < profitDaysCount - 1; i++) {
      const variance = (seededRandom() * 0.6 - 0.3) * avgProfitPerDay;
      let val = avgProfitPerDay + variance;
      if (val < 0.1) val = 0.1 + (seededRandom() * 0.5);
      profits.push(val);
      currentProfitSum += val;
    }
    profits.push(neededProfitSum - currentProfitSum);
  }

  const allActiveValues = [...losses.map(v => ({ val: v, isProfit: false })), ...profits.map(v => ({ val: v, isProfit: true }))];
  
  // Shuffle ngẫu nhiên dựa trên seed
  for (let i = allActiveValues.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [allActiveValues[i], allActiveValues[j]] = [allActiveValues[j], allActiveValues[i]];
  }

  let activeIndex = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${monthInt.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const randomStrategy = STRATEGIES[Math.floor(seededRandom() * STRATEGIES.length)];
    
    if (i >= startDay && i <= currentDayLimit && activeIndex < allActiveValues.length) {
      const result = allActiveValues[activeIndex++];
      data.push({
        date: dateStr,
        percentage: Number(Math.abs(result.val).toFixed(2)),
        isProfit: result.isProfit,
        strategy: randomStrategy
      });
    } else {
      data.push({
        date: dateStr,
        percentage: 0,
        isProfit: true,
        strategy: '-'
      });
    }
  }
  
  return data;
};
