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

  // 1. Chuyển đổi sang Date
  let date = new Date(dateString.replace(' ', 'T'));
  const now = new Date();

  // 2. LOGIC TỰ SỬA LỖI LỆCH 7 TIẾNG
  // Nếu giờ trong DB mà nhanh hơn hiện tại tận 5-7 tiếng -> Nghĩa là lỗi nhãn UTC
  if (date.getTime() - now.getTime() > 3600000 * 3) {
    date = new Date(date.getTime() - 7 * 60 * 60 * 1000);
  }
  // Nếu giờ trong DB mà chậm hơn hiện tại tận 5-7 tiếng -> Nghĩa là lỗi thiếu múi giờ
  else if (now.getTime() - date.getTime() > 3600000 * 5) {
    // Thử ép nó hiểu là UTC để tự cộng 7
    const utcDate = new Date(dateString.replace(' ', 'T') + 'Z');
    if (!isNaN(utcDate.getTime())) date = utcDate;
  }

  const diffMs = now.getTime() - date.getTime();
  const absDiffMs = Math.abs(diffMs);
  const isToday = date.toDateString() === now.toDateString();

  // 3. HIỂN THỊ REAL-TIME
  if (absDiffMs < 3600000 * 24 && isToday) {
    // Trong vòng 24h và cùng ngày
    const diffMins = Math.floor(absDiffMs / 60000);
    const diffHours = Math.floor(absDiffMs / 3600000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    return `${diffHours} giờ trước`;
  }

  // 4. QUÁ KHỨ (Hôm qua / Ngày cũ)
  if (diffMs > 0) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  }

  return (
    date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }) +
    ' ' +
    date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    })
  );
};
//
// format giờ của lịch sử chat
export const formatMessageTime = (date: Date) => {
  const now = new Date();

  // Kiểm tra xem có phải cùng một ngày không
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    // Nếu là hôm nay: chỉ hiện giờ và phút
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else {
    // Nếu quá 1 ngày: hiện giờ, phút, giây, ngày, tháng, năm
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
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
