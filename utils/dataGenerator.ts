
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

export const generatePnLDataForMonth = (monthName: string, year: number, targetTotalPnL: number): DailyPnL[] => {
  const monthInt = parseInt(monthName.replace('Tháng ', ''));
  const daysInMonth = getDaysInMonth(monthInt, year);
  
  // Kiểm tra mốc khởi đầu 14/06/2025
  const isStartMonth = monthInt === 6 && year === 2025;
  const startDay = isStartMonth ? 14 : 1;

  const isJan2026 = monthInt === 1 && year === 2026;
  const isFeb2026 = monthInt === 2 && year === 2026;
  
  // Giới hạn ngày hiện tại: Cập nhật đến ngày 05/02/2026
  const isFutureMonth = (year > 2026) || (year === 2026 && monthInt > 2);
  const currentDayLimit = isFutureMonth ? 0 : (isFeb2026 ? 5 : daysInMonth);

  const data: DailyPnL[] = [];
  
  // Số ngày có dữ liệu trong tháng này
  const activeDaysCount = Math.max(0, currentDayLimit - startDay + 1);

  if (activeDaysCount <= 0) {
    // Trả về mảng rỗng hoặc toàn số 0 nếu tháng trong tương lai hoặc trước ngày bắt đầu
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

  // Phân bổ lợi nhuận
  const lossDaysRatio = 0.2; 
  const lossDaysCount = Math.floor(activeDaysCount * lossDaysRatio);
  const profitDaysCount = activeDaysCount - lossDaysCount;

  // Tạo các ngày lỗ (Không quá 3%)
  const losses: number[] = [];
  let sumLosses = 0;
  for (let i = 0; i < lossDaysCount; i++) {
    // Random lỗ từ -0.5% đến -2.9% (đảm bảo không quá 3%)
    const val = -(0.5 + Math.random() * 2.4);
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
      const variance = (Math.random() * 0.6 - 0.3) * avgProfitPerDay;
      let val = avgProfitPerDay + variance;
      if (val < 0.1) val = 0.1 + (Math.random() * 0.5);
      profits.push(val);
      currentProfitSum += val;
    }
    profits.push(neededProfitSum - currentProfitSum);
  }

  const allActiveValues = [...losses.map(v => ({ val: v, isProfit: false })), ...profits.map(v => ({ val: v, isProfit: true }))];
  
  // Shuffle ngẫu nhiên
  for (let i = allActiveValues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allActiveValues[i], allActiveValues[j]] = [allActiveValues[j], allActiveValues[i]];
  }

  let activeIndex = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${monthInt.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const randomStrategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
    
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
