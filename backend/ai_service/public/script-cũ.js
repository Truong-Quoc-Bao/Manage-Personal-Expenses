// 1. Khai báo các biến DOM
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');

// --- CÁC BIẾN MỚI CHO VÙNG PREVIEW ---
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreviewImg = document.getElementById('image-preview-img');
const removeImgBtn = document.getElementById('remove-img-btn');

let isSending = false; // Biến chặn gửi tin nhắn liên tục

// // Đoạn code này nên nằm ở phần xử lý sau khi người dùng đã đăng nhập thành công
// function updateTelegramLink(userId) {
//   const telegramBtn = document.getElementById('telegram-link');
//   if (telegramBtn && userId) {
//     // Gắn ID động vào link
//     telegramBtn.href = `https://t.me/truongquocbao_bot?start=${userId}`;
//   }
// }

// // Ví dụ: Nếu bạn lấy ID từ localStorage sau khi đăng nhập
// const loggedInUserId = localStorage.getItem('userId'); // Hoặc lấy từ dữ liệu User của bạn
// updateTelegramLink(loggedInUserId);

// // 1. Thử lấy ID từ bộ nhớ trình duyệt
// const userId = localStorage.getItem('userId'); // Hoặc 'user_id' tùy bạn đặt tên

// // 2. Console.log để kiểm tra
// console.log('--- KIỂM TRA KẾT NỐI TELEGRAM ---');
// console.log('ID người dùng hiện tại:', userId);

// // 3. Cập nhật link nếu có ID
// const telegramBtn = document.getElementById('telegram-link');

// if (userId) {
//   telegramBtn.href = `https://t.me/truongquocbao_bot?start=${userId}`;
//   console.log('Link Telegram mới:', telegramBtn.href);
// } else {
//   console.warn('CẢNH BÁO: Không tìm thấy ID người dùng! Link sẽ bị lỗi.');
// }

// fetch('/login', {
//   method: 'POST',
//   body: JSON.stringify(data),
// })
//   .then((res) => res.json())
//   .then((userData) => {
//     // Console log toàn bộ dữ liệu server trả về
//     console.log('Dữ liệu Server trả về:', userData);

//     const idToLink = userData.user.id; // Giả sử server trả về { user: { id: 123 } }
//     console.log('ID dùng để gắn vào Telegram:', idToLink);

//     // Cập nhật link
//     document.getElementById(
//       'telegram-link',
//     ).href = `https://t.me/truongquocbao_bot?start=${idToLink}`;
//   });

// Thông báo
// === HÀM ĐĂNG KÝ PUSH ĐÃ SỬA ===

let myChart = null; // Biến lưu trữ đối tượng biểu đồ
let dashboardData = null; // Thêm dòng này để lưu dữ liệu từ server
let currentView = 'expense'; // Thêm dòng này để biết đang xem 'chi' hay 'thu'

// Hàm định dạng tiền tệ Việt Nam
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// // Hàm lấy dữ liệu và cập nhật Dashboard
// async function updateDashboard() {
//   try {
//     const res = await fetch('/api/stats');
//     const data = await res.json();

//     document.querySelector(
//       '.dashboard-header h1',
//     ).innerText = `📊 Thống kê Tháng ${data.month}/${data.year}`;

//     // 1. Cập nhật các con số Header
//     document.getElementById('total-income').innerText = formatMoney(data.income);
//     document.getElementById('total-expense').innerText = formatMoney(data.expense);
//     document.getElementById('total-balance').innerText = formatMoney(data.income - data.expense);
//     document.getElementById('current-date').innerText =
//       'Cập nhật lúc: ' + new Date().toLocaleTimeString('vi-VN');

//     // 2. Vẽ biểu đồ tròn (Pie Chart)
//     const ctx = document.getElementById('expenseChart').getContext('2d');

//     // Nếu đã có biểu đồ trước đó thì xóa đi để vẽ lại (tránh bị lỗi đè dữ liệu)
//     if (myChart) {
//       myChart.destroy();
//     }

//     myChart = new Chart(ctx, {
//       type: 'doughnut', // Kiểu hình tròn khuyết (nhìn hiện đại hơn)
//       data: {
//         labels: data.categories.map((c) => c.category_name),
//         datasets: [
//           {
//             data: data.categories.map((c) => c.amount),
//             backgroundColor: [
//               '#0084ff',
//               '#28a745',
//               '#dc3545',
//               '#ffc107',
//               '#17a2b8',
//               '#6610f2',
//               '#e83e8c',
//             ],
//             borderWidth: 1,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: { position: 'bottom' },
//         },
//       },
//     });
//   } catch (err) {
//     console.error('Lỗi fetch stats:', err);
//   }
// }

// --- ĐOẠN CODE ĐÃ ĐƯỢC TINH GỌN VÀ CHUẨN HÓA ---

// Hàm lấy dữ liệu và cập nhật Dashboard
async function updateDashboard() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    // Lưu dữ liệu vào biến toàn cục để hàm renderChart có thể dùng lại
    dashboardData = data;

    // Cập nhật tiêu đề tháng
    const headerTitle = document.querySelector('.dashboard-header h1');
    if (headerTitle) headerTitle.innerText = `📊 Thống kê Tháng ${data.month}/${data.year}`;

    // 1. Cập nhật các con số Header
    document.getElementById('total-income').innerText = formatMoney(data.income);
    document.getElementById('total-expense').innerText = formatMoney(data.expense);
    document.getElementById('total-balance').innerText = formatMoney(data.income - data.expense);
    document.getElementById('current-date').innerText =
      'Cập nhật lúc: ' + new Date().toLocaleTimeString('vi-VN');

    // 2. Gọi hàm vẽ biểu đồ (Dùng view hiện tại: chi hoặc thu)
    renderChart(currentView);
  } catch (err) {
    console.error('Lỗi fetch stats:', err);
  }
}

// Hàm hỗ trợ vẽ biểu đồ (Chỉ giữ một hàm duy nhất này để vẽ)
function renderChart(type) {
  if (!dashboardData) return;
  const canvas = document.getElementById('expenseChart');
  const noDataMsg = document.getElementById('no-data-msg');
  const ctx = canvas.getContext('2d');

  if (myChart) myChart.destroy();

  const dataToRender =
    type === 'income' ? dashboardData.incomeCategories : dashboardData.expenseCategories;

  // KIỂM TRA DỮ LIỆU
  if (!dataToRender || dataToRender.length === 0) {
    // 1. Hiện thông báo đẹp, ẩn canvas
    canvas.style.display = 'none';
    noDataMsg.style.display = 'flex';

    // Cập nhật tiêu đề báo cáo
    const titleText = type === 'income' ? 'Chưa có thu nhập ☘️' : 'Chưa có chi tiêu ✨';
    document.querySelector('.chart-section h3').innerText = titleText;
    return; // Dừng lại không vẽ nữa
  }

  // NẾU CÓ DỮ LIỆU:
  canvas.style.display = 'block'; // Hiện lại canvas
  noDataMsg.style.display = 'none'; // Ẩn thông báo trống

  const colors =
    type === 'income'
      ? ['#28a745', '#34ce57', '#218838', '#1e7e34', '#c3e6cb']
      : ['#0084ff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6610f2', '#e83e8c'];

  const titleText = type === 'income' ? 'Phân tích thu nhập' : 'Phân tích chi tiêu';
  document.querySelector('.chart-section h3').innerText = titleText;

  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dataToRender.map((c) => c.category_name),
      datasets: [
        {
          data: dataToRender.map((c) => c.amount),
          backgroundColor: colors,
          hoverOffset: 15, // Hiệu ứng khi rê chuột vào nó to ra nhìn rất xịn
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%', // Làm vòng tròn mỏng lại cho sang
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });
}

// ==========================================
// PHẦN LIÊN KẾT NGÂN HÀNG
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
  const btnLinkBank = document.getElementById('btn-link-bank');
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');

  if (btnLinkBank) {
    btnLinkBank.addEventListener('click', async function () {
      try {
        // Hiển thị loading
        btnLinkBank.style.display = 'none';
        loadingState.style.display = 'block';
        errorState.style.display = 'none';

        console.log('🔗 Đang gọi API backend để lấy magic link...');

        // Gọi API backend (BACKEND sẽ xử lý tất cả)
        const response = await fetch('/api/create-bank', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || 'demo'}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Không thể tạo link');
        }

        const data = await response.json();

        console.log('✅ Nhận được magic link:', data.url);

        // Chuyển hướng đến magic link
        window.location.href = data.url;
      } catch (error) {
        console.error('❌ Lỗi:', error);

        // Hiển thị lỗi
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorMessage.textContent = `Lỗi: ${error.message}`;
        btnLinkBank.style.display = 'block';
      }
    });
  }
});

// --- QUAN TRỌNG: GỌI HÀM NÀY KHI TRANG LOAD XONG ---
window.addEventListener('load', () => {
  updateDashboard();
});

// --- CẬP NHẬT BIỂU ĐỒ MỖI KHI CHAT XONG ---
// Trong file script.js của Bảo, chỗ fetch('/chat') thành công, hãy gọi thêm hàm này:
// ... sau khi addMessage(cleanReply, false);
// updateDashboard();

async function registerPush() {
  try {
    console.log('⏳ Đang khởi tạo Service Worker...');

    // 1. Đăng ký Service Worker
    const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ Service Worker đã đăng ký!');

    // 2. Đợi Service Worker sẵn sàng
    const ready = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker sẵn sàng!');

    // 3. Lấy Public VAPID Key từ Server
    const keyRes = await fetch('/vapid-public-key');
    if (!keyRes.ok) throw new Error('Không lấy được VAPID key');

    const { publicVapidKey } = await keyRes.json();
    console.log('✅ Đã lấy Public VAPID Key');

    // 4. Kiểm tra subscription cũ
    let subscription = await ready.pushManager.getSubscription();

    // 5. Nếu chưa có thì subscribe mới
    if (!subscription) {
      console.log('🔔 Đang tạo subscription mới...');
      subscription = await ready.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      console.log('✅ Đã subscribe thành công!');
    } else {
      console.log('🟡 Đã có subscription cũ');
    }

    // 6. Gửi subscription lên server
    await fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('🚀 Đăng ký Push Notification thành công!');
  } catch (err) {
    console.error('❌ Lỗi đăng ký push:', err.message);
  }
}

// Hàm bổ trợ để chuyển Public Key (Bảo nhớ copy hàm này dán vào script.js luôn)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Gọi đăng ký Push khi trang load xong
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Đợi người dùng tương tác một chút để tăng tỷ lệ thành công
    setTimeout(registerPush, 2000);
  } else {
    console.warn('❌ Trình duyệt không hỗ trợ Push Notification');
  }
});

// --- 2. CẤU HÌNH SOCKET.IO (NHẬN TIN TỪ NGÂN HÀNG) ---
const socket = io();

let notificationAudio = null;
let userHasInteracted = false;

// Khởi tạo âm thanh một lần
function initNotificationAudio() {
  if (!notificationAudio) {
    notificationAudio = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    );
    notificationAudio.volume = 0.75;
  }
}

// Phát âm thanh an toàn (chỉ phát khi đã có tương tác)
async function playNotificationSound() {
  if (!notificationAudio || !userHasInteracted) return;

  try {
    await notificationAudio.play();
  } catch (err) {
    console.log('🔇 Không phát được âm thanh thông báo (browser chặn)');
  }
}

// Kích hoạt âm thanh sau khi người dùng click/tap vào trang
function enableAudioAfterInteraction() {
  if (userHasInteracted) return;

  const events = ['click', 'touchstart', 'keydown', 'scroll'];

  const handler = () => {
    userHasInteracted = true;
    initNotificationAudio();
    console.log('✅ Người dùng đã tương tác → Âm thanh thông báo đã được kích hoạt');

    // Xóa listener sau khi kích hoạt
    events.forEach((event) => document.removeEventListener(event, handler));
  };

  events.forEach((event) => document.addEventListener(event, handler, { once: true }));
}

// Lắng nghe thông báo từ ngân hàng
socket.on('bank_notification', (data) => {
  console.log('🏦 Nhận dữ liệu bank:', data);

  // Hiển thị tin nhắn vào chat
  addMessage(data.message, false);

  // Phát âm thanh (an toàn)
  playNotificationSound();

  // Cập nhật lại biểu đồ ngay lập tức khi tiền vừa về!
  updateDashboard();
});

socket.on('connect', () => {
  console.log('✅ Đã kết nối Socket thành công!');
});

// Khi bấm nút camera thì kích hoạt chọn file
if (uploadBtn) {
  uploadBtn.addEventListener('click', () => fileInput.click());
}

// 1. Khi chọn ảnh xong -> Hiện ảnh xem trước ngay lập tức
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    imagePreviewImg.src = url;
    imagePreviewContainer.style.display = 'flex'; // Hiện vùng preview
  }
});

// 2. Nút X để xóa ảnh đã chọn nếu không muốn gửi nữa
if (removeImgBtn) {
  removeImgBtn.addEventListener('click', () => {
    fileInput.value = ''; // Xóa file trong input
    imagePreviewContainer.style.display = 'none'; // Ẩn vùng preview
  });
}

/**
 * Hàm hiển thị tin nhắn lên màn hình
 */
function addMessage(text, isUser = false) {
  const safeText = text || '';

  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(isUser ? 'user' : 'bot');

  if (!isUser) {
    if (typeof marked !== 'undefined' && safeText.trim() !== '') {
      div.innerHTML = marked.parse(safeText);
    } else {
      div.textContent = safeText || 'Guard không có phản hồi, thử lại nhé Bảo!';
    }
  } else {
    div.textContent = safeText;
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Hiệu ứng đang soạn tin
 */
function showTypingIndicator() {
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'typing';
  div.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

/**
 * Xử lý sự kiện gửi Form
 */
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSending) return;

  const message = userInput.value.trim();
  const file = fileInput.files[0];

  // Nếu không có cả chữ lẫn ảnh thì không làm gì cả
  if (!message && !file) return;

  // --- [LOG 1]: Kiểm tra những gì Bảo vừa nhập ---
  console.log('>>> [1. INPUT OBJECT]:', { text: message, file: file ? file.name : 'No image' });

  isSending = true;

  // HIỂN THỊ TIN NHẮN USER
  // Nếu Bảo chỉ gửi ảnh mà không gõ chữ, mình tự hiện câu thông báo
  const displayMessage = message || (file ? 'Phân tích hình ảnh này giúp Bảo...' : '');
  addMessage(displayMessage, true);

  if (file) {
    const imageUrl = URL.createObjectURL(file);
    const lastMsg = chatMessages.lastElementChild;
    lastMsg.innerHTML += `<br><img src="${imageUrl}" style="max-width:200px; border-radius:10px; margin-top:5px; display:block;" />`;
  }

  // DỌN DẸP GIAO DIỆN SAU KHI NHẤN GỬI
  userInput.value = '';
  imagePreviewContainer.style.display = 'none'; // Ẩn vùng xem trước ảnh
  userInput.disabled = true;
  showTypingIndicator();

  try {
    const formData = new FormData();
    formData.append('message', message); // Gửi message (có thể trống)
    if (file) {
      formData.append('image', file);
    }

    // --- [LOG 2]: Kiểm tra gói hàng gửi sang Server/n8n ---
    console.log('>>> [2. SENDING FORMDATA]:');
    for (let pair of formData.entries()) {
      console.log(`   - ${pair[0]}:`, pair[1]);
    }

    // const res = await fetch('http://localhost:4005/chat', {
    const res = await fetch('/chat', {
      method: 'POST',
      body: formData, // FormData chuẩn cho multer
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('>>> [ERR]: Server trả lỗi:', errorData);
      throw new Error(errorData.error || 'Lỗi từ Server Money Guard');
    }

    const data = await res.json();
    const replyText = data.reply;

    // --- PHẦN XỬ LÝ TRÍCH XUẤT DỮ LIỆU ---

    // 1. Nhặt lệnh tạo danh mục (Category)
    const createCatMatch = replyText.match(/<create_category>(.*?)<\/create_category>/s);
    if (createCatMatch && createCatMatch[1]) {
      try {
        const catObj = JSON.parse(createCatMatch[1].trim());
        console.log('✨ [YÊU CẦU TẠO DANH MỤC]:', catObj);
      } catch (e) {
        console.error('🚨 Lỗi parse JSON create_category:', e);
      }
    }

    // 2. Nhặt giao dịch (Transaction)
    const transactionMatch = replyText.match(/<transaction>(.*?)<\/transaction>/s);
    if (transactionMatch && transactionMatch[1]) {
      try {
        const transactionObj = JSON.parse(transactionMatch[1].trim());
        console.log('🎯 [GIAO DỊCH TÌM THẤY]:');
        console.table(transactionObj); // In ra bảng cho Bảo xem
      } catch (e) {
        console.error('🚨 Lỗi khi parse dữ liệu giao dịch:', e);
      }
    }

    // 3. Nhặt TẤT CẢ giao dịch (Sử dụng matchAll để in ra 1 bảng nhiều dòng duy nhất)
    const allMatches = [...replyText.matchAll(/<transaction>(.*?)<\/transaction>/gs)];

    if (allMatches.length > 0) {
      try {
        const transactions = allMatches.map((m) => JSON.parse(m[1].trim()));
        console.log(`🎯 [PHÁT HIỆN ${transactions.length} GIAO DỊCH]:`);
        console.table(transactions); // IN BẢNG XỊN XÒ TẠI ĐÂY
      } catch (e) {
        console.error('🚨 Lỗi parse danh sách giao dịch');
      }
    } else {
      // Fallback: Nếu AI quên bọc thẻ <transaction> nhưng vẫn in JSON khơi khơi
      const looseJson = replyText.match(/\{[\s\S]*?("category_name"|"account_id")[\s\S]*?\}/g);
      if (looseJson) {
        console.log('⚠️ AI quên thẻ nhưng Money Guard nhặt được JSON rác:');
        looseJson.forEach((j) => {
          try {
            console.log(JSON.parse(j));
          } catch (e) {}
        });
      }
    }

    // Nếu AI "quên" thẻ mà in JSON thẳng, mình dùng cái này để bắt
    const fallbackJsonMatch =
      replyText.match(/\{[\s\S]*?"category_name"[\s\S]*?\}/) ||
      replyText.match(/\{[\s\S]*?"account_id"[\s\S]*?\}/);

    if (transactionMatch) {
      console.log('🎯 Giao dịch:', JSON.parse(transactionMatch[1]));
    } else if (createCatMatch) {
      console.log('✨ Danh mục mới:', JSON.parse(createCatMatch[1]));
    } else if (fallbackJsonMatch) {
      console.log('⚠️ AI quên thẻ nhưng vẫn nhặt được JSON:', JSON.parse(fallbackJsonMatch[0]));
    }

    // 2. Làm sạch văn bản trước khi hiện lên màn hình chat
    let cleanReply = replyText
      .replace(/<.*?>[\s\S]*?<\/.*?>/gs, '') // Xóa sạch mọi thứ nằm trong cặp thẻ <tag>...</tag>
      .replace(/<.*?>[\s\S]*?<\/.*?>/gs, '') // Xóa sạch mọi thứ nằm trong cặp ngoặc nhọn {...} (kể cả xuống dòng)
      .trim();

    removeTypingIndicator();
    addMessage(cleanReply, false);

    updateDashboard();
  } catch (err) {
    removeTypingIndicator();
    addMessage('🚨 Lỗi: ' + err.message, false);
  } finally {
    isSending = false;
    userInput.disabled = false;
    fileInput.value = ''; // Reset input file
    userInput.focus();
  }
});

// === KÍCH HOẠT ÂM THANH & PUSH SAU KHI LOAD ===
window.addEventListener('load', () => {
  enableAudioAfterInteraction(); // ← Quan trọng cho âm thanh ting

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    setTimeout(registerPush, 1500);
  }
});

// Lấy đoạn chat
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/chat-history');
    const history = await res.json();

    // Duyệt qua từng tin nhắn cũ và hiện lên màn hình
    history.forEach((msg) => {
      const isUser = msg.role === 'user';
      addMessage(msg.message, isUser);
    });
  } catch (err) {
    console.error('Không lấy được lịch sử chat:', err);
  }
});

// Lắng nghe click vào các Card để đổi biểu đồ
document.addEventListener('click', (e) => {
  // Nếu nhấn vào ô Thu nhập
  if (e.target.closest('.card.income')) {
    currentView = 'income';
    renderChart('income');
  }
  // Nếu nhấn vào ô Chi tiêu
  else if (e.target.closest('.card.expense')) {
    currentView = 'expense';
    renderChart('expense');
  }
});
