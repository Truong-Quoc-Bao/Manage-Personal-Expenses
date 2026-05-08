/**
 * Định dạng tiền tệ VND
 */
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Định dạng ngày giờ (Tính phút/giờ/ngày trước)
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '---';

  // 1. Chuyển đổi an toàn (Xử lý cả SQL format ' ' lẫn ISO 'T')
  const date = new Date(dateString.replace(' ', 'T'));

  // Kiểm tra nếu ngày bị lỗi (Invalid Date)
  if (isNaN(date.getTime())) return 'Ngày lỗi';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // 🔥 TRƯỜNG HỢP 1: NGÀY TƯƠNG LAI (Ví dụ: 20/05/2026)
  if (diffMs < 0) {
    const dateFormatted = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${dateFormatted} (tương lai)`;
  }

  // TÍNH TOÁN KHOẢNG CÁCH CHO QUÁ KHỨ
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // 🔥 TRƯỜNG HỢP 2: QUÁ KHỨ GẦN (Trong vòng 7 ngày)
  if (diffSecs < 30) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;

  if (diffDays < 7) {
    if (diffDays === 1) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  }

  // 🔥 TRƯỜNG HỢP 3: QUÁ KHỨ XA (Trên 7 ngày)
  // In ra đầy đủ Ngày/Tháng/Năm Giờ:Phút:Giây thực hiện giao dịch
  const dayMonthYear = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const hourMinSec = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${dayMonthYear} ${hourMinSec}`;
};

/**
 * Animation chạy số tiền mượt mà
 */
export const animateValue = (
  element: HTMLElement,
  start: number,
  end: number,
  duration: number,
): void => {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;

    // Logic kiểm tra điểm dừng của Bảo
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = formatMoney(end);
      clearInterval(timer);
    } else {
      element.textContent = formatMoney(Math.floor(current));
    }
  }, 16);
};
