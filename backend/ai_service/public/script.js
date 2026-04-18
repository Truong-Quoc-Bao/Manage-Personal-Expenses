// ==========================================
// 1. KHAI BÁO CÁC BIẾN DOM
// ==========================================
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreviewImg = document.getElementById('image-preview-img');
const removeImgBtn = document.getElementById('remove-img-btn');
const notiBtn = document.getElementById('noti-btn');
const notiDropdown = document.getElementById('noti-dropdown');
const notiList = document.getElementById('noti-list');
const notiCount = document.getElementById('noti-count');

let isSending = false;
let myChart = null;
let dashboardData = null;
let currentView = 'expense';

// ==========================================
// 2. HÀM HỖ TRỢ
// ==========================================

// Định dạng tiền tệ
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

// Định dạng ngày giờ
// Định dạng ngày giờ (Đã Fix lỗi lệch 7 tiếng UTC của Database)
function formatDateTime(dateString) {
  // Thay thế dấu cách bằng 'T' để JS hiểu đây là định dạng ISO
  const date = new Date(dateString.replace(' ', 'T'));
  const now = new Date();

  // Tính khoảng cách thời gian
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Nếu là thời gian tương lai hoặc vừa mới tạo (do sai lệch milisecond)
  if (diffMins < 1 || isNaN(diffMins)) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
// Animation cho số tiền
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = formatMoney(end);
      clearInterval(timer);
    } else {
      element.textContent = formatMoney(Math.floor(current));
    }
  }, 16);
}

// --- 2.1 CẬP NHẬT SỨC KHỎE NÃO BỘ AI ---
async function updateAIHealth() {
  try {
    const res = await fetch('/api/ai-health');
    const models = await res.json();
    const selector = document.getElementById('model-selector');
    const currentVal = selector.value;

    // Giữ lại option Auto
    /* The above code is using JavaScript to select an HTML element with the id 'model-selector' using
    the `getElementById` method. */
    // selector.innerHTML = '<option value="auto"> </option>';

    models.forEach((m) => {
      const isOnline = m.status === 'online';
      const option = document.createElement('option');
      option.value = m.name;
      option.disabled = !isOnline;
      option.className = isOnline ? 'text-green-600' : 'text-red-400';
      option.innerText = `${isOnline ? '●' : '○'} ${m.name.replace('gemini-', '')}`;
      selector.appendChild(option);
    });
    selector.value = currentVal;
  } catch (err) {
    console.error('Lỗi nạp danh sách AI');
  }
}

// ==========================================
// 3. CẬP NHẬT DASHBOARD
// ==========================================

async function updateDashboard() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Không thể tải dữ liệu');

    const data = await res.json();
    dashboardData = data;

    // Cập nhật tiêu đề
    const headerTitle = document.querySelector('.dashboard-header h1');
    if (headerTitle) {
      headerTitle.innerText = `📊 Thống kê Tháng ${data.month}/${data.year}`;
    }

    // Cập nhật thời gian
    document.getElementById('current-date').innerText =
      'Cập nhật: ' +
      new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });

    // Animate số liệu với hiệu ứng mượt
    const incomeEl = document.getElementById('total-income');
    const expenseEl = document.getElementById('total-expense');
    const balanceEl = document.getElementById('total-balance');

    // Lấy giá trị cũ hoặc 0
    const oldIncome = parseFloat(incomeEl.dataset.value || 0);
    const oldExpense = parseFloat(expenseEl.dataset.value || 0);

    // Lưu giá trị mới
    incomeEl.dataset.value = data.income;
    expenseEl.dataset.value = data.expense;

    // Animate
    if (oldIncome !== data.income) {
      animateValue(incomeEl, oldIncome, data.income, 800);
    } else {
      incomeEl.textContent = formatMoney(data.income);
    }

    if (oldExpense !== data.expense) {
      animateValue(expenseEl, oldExpense, data.expense, 800);
    } else {
      expenseEl.textContent = formatMoney(data.expense);
    }

    animateValue(balanceEl, oldIncome - oldExpense, data.income - data.expense, 800);

    // Vẽ lại biểu đồ
    renderChart(currentView);

    // Cập nhật giao dịch gần đây
    await loadRecentTransactions();
  } catch (err) {
    console.error('❌ Lỗi fetch stats:', err);
    showToast('Không thể tải dữ liệu dashboard', 'error');
  }
}

// ==========================================
// 4. VẼ BIỂU ĐỒ
// ==========================================

function renderChart(type) {
  if (!dashboardData) return;

  const canvas = document.getElementById('expenseChart');
  const noDataMsg = document.getElementById('no-data-msg');
  const ctx = canvas.getContext('2d');

  if (myChart) myChart.destroy();

  const dataToRender =
    type === 'income' ? dashboardData.incomeCategories : dashboardData.expenseCategories;

  // Kiểm tra dữ liệu
  if (!dataToRender || dataToRender.length === 0) {
    canvas.style.display = 'none';
    noDataMsg.style.display = 'flex';

    const titleText = type === 'income' ? 'Chưa có thu nhập ☘️' : 'Chưa có chi tiêu ✨';
    document.querySelector('.chart-section h3').innerText = titleText;
    return;
  }

  // Hiện canvas
  canvas.style.display = 'block';
  noDataMsg.style.display = 'none';

  const colors =
    type === 'income'
      ? ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
      : ['#ec4899', '#f472b6', '#f59e0b', '#fbbf24', '#60a5fa', '#818cf8', '#a78bfa'];

  const titleText = type === 'income' ? '💰 Phân tích thu nhập' : '💸 Phân tích chi tiêu';
  document.querySelector('.chart-section h3').innerText = titleText;

  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dataToRender.map((c) => c.category_name),
      datasets: [
        {
          data: dataToRender.map((c) => c.amount),
          backgroundColor: colors,
          hoverOffset: 20,
          borderWidth: 3,
          borderColor: '#ffffff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 12,
            font: { size: 11 },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          borderRadius: 8,
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = formatMoney(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// ==========================================
// 5. TẢI GIAO DỊCH GẦN ĐÂY
// ==========================================

async function loadRecentTransactions() {
  const container = document.getElementById('recent-transactions');

  try {
    const res = await fetch('/api/recent-transactions');
    if (!res.ok) throw new Error('Không thể tải giao dịch');

    const transactions = await res.json();

    if (!transactions || transactions.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-32 text-gray-400">
          <i class="fa-solid fa-inbox text-3xl mb-2"></i>
          <p class="text-xs italic">Chưa có giao dịch nào</p>
        </div>
      `;
      return;
    }

    container.innerHTML = transactions
      .slice(0, 20)
      .map((t) => {
        const isIncome = t.type === 'income';
        const iconColor = isIncome ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50';
        const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
        const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

        return `
          <div class="transaction-item flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full ${iconColor} flex items-center justify-center shadow-sm shrink-0">
                <i class="fa-solid ${icon} text-sm"></i>
              </div>
              <div class="overflow-hidden">
                <!-- 👉 In ra tên món đồ Bảo nhập (VD: Ăn cơm gà 100k) -->
                <p class="text-sm font-medium text-gray-800 truncate" style="max-width: 180px;" title="${
                  t.description || t.category_name
                }">
                  ${t.description || t.category_name || 'Khác'}
                </p>
                <!-- 👉 In Tag Danh mục và Thời gian ở ngay bên dưới -->
                <div class="flex items-center text-[10px] text-gray-500 mt-1">
                  <span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 mr-2 border border-gray-200">
                    ${t.category_name || 'Khác'}
                  </span>
                  <span>${formatDateTime(t.created_at)}</span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold ${amountColor}">
                ${isIncome ? '+' : '-'}${formatMoney(Math.abs(t.amount))}
              </p>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    console.error('❌ Lỗi tải giao dịch:', err);
    container.innerHTML = `
      <div class="flex items-center justify-center h-32 text-red-500 text-xs">
        <i class="fa-solid fa-exclamation-triangle mr-2"></i>
        Không thể tải dữ liệu
      </div>
    `;
  }
}

// Ngân sách

async function loadBudgets() {
  const container = document.getElementById('budget-container');
  try {
    // Gọi API (chưa có API này ở server thì làm bước 2)
    const res = await fetch('/api/budgets');
    const budgets = await res.json();

    if (budgets.length === 0) {
      container.innerHTML = '<p class="text-xs text-gray-400 italic p-2">Chưa có ngân sách nào</p>';
      return;
    }

    container.innerHTML = budgets
      .map((b) => {
        const limit = b.amount_limit || 0;
        const spent = parseFloat(b.spent || 0);
        const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
        const color =
          percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-yellow-500' : 'bg-green-500';

        return `
        <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
                <div class="flex items-center text-xs">
                    <span class="mr-2">${b.icon || '📁'}</span>
                    <span class="font-medium text-gray-600">${b.category_name}</span>
                </div>
                <div class="text-[10px] text-gray-500 font-medium">
                    ${formatMoney(spent).replace('₫', '')} / ${
          limit > 0 ? formatMoney(limit).replace('₫', '') : 'Chưa đặt'
        }
                </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div class="${color} h-1.5 rounded-full transition-all" style="width: ${percent}%"></div>
            </div>
        </div>
      `;
      })
      .join('');
  } catch (err) {
    console.error('Lỗi load ngân sách:', err);
    container.innerHTML = '<p class="text-xs text-red-400 p-2">Lỗi tải ngân sách</p>';
  }
}

// ==========================================
// 6. LIÊN KẾT NGÂN HÀNG
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
  const btnLinkBank = document.getElementById('btn-link-bank');
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');

  if (btnLinkBank) {
    btnLinkBank.addEventListener('click', async function () {
      try {
        btnLinkBank.style.display = 'none';
        loadingState.style.display = 'block';
        errorState.style.display = 'none';

        console.log('🔗 Đang tạo link liên kết ngân hàng...');

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

        window.location.href = data.url;
      } catch (error) {
        console.error('❌ Lỗi:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorMessage.textContent = error.message;
        btnLinkBank.style.display = 'block';
      }
    });
  }
});

// ==========================================
// 7. PUSH NOTIFICATION
// ==========================================

async function registerPush() {
  try {
    console.log('⏳ Đang khởi tạo Service Worker...');

    const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ Service Worker đã đăng ký!');

    const ready = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker sẵn sàng!');

    const keyRes = await fetch('/vapid-public-key');
    if (!keyRes.ok) throw new Error('Không lấy được VAPID key');

    const { publicVapidKey } = await keyRes.json();
    console.log('✅ Đã lấy Public VAPID Key');

    let subscription = await ready.pushManager.getSubscription();

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

// ==========================================
// 8. SOCKET.IO - NHẬN TIN TỪ NGÂN HÀNG
// ==========================================

const socket = io();

let notificationAudio = null;
let userHasInteracted = false;

function initNotificationAudio() {
  if (!notificationAudio) {
    notificationAudio = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    );
    notificationAudio.volume = 0.75;
  }
}

async function playNotificationSound() {
  if (!notificationAudio || !userHasInteracted) return;

  try {
    await notificationAudio.play();
  } catch (err) {
    console.log('🔇 Không phát được âm thanh (browser chặn)');
  }
}

function enableAudioAfterInteraction() {
  if (userHasInteracted) return;

  const events = ['click', 'touchstart', 'keydown', 'scroll'];

  const handler = () => {
    userHasInteracted = true;
    initNotificationAudio();
    console.log('✅ Âm thanh đã được kích hoạt');
    events.forEach((event) => document.removeEventListener(event, handler));
  };

  events.forEach((event) => document.addEventListener(event, handler, { once: true }));
}

socket.on('bank_notification', (data) => {
  console.log('🏦 Nhận thông báo ngân hàng:', data);
  addMessage(data.message, false);
  playNotificationSound();
  updateDashboard();
  showToast('💰 Có giao dịch mới từ ngân hàng!', 'success');
});

socket.on('connect', () => {
  console.log('✅ Socket.IO đã kết nối!');
});

socket.on('disconnect', () => {
  console.log('⚠️ Socket.IO đã ngắt kết nối');
});

// Bấm vào chuông thì chỉ hiện/ẩn list thông báo
notiBtn.addEventListener('click', () => {
  // Chỉ đổi trạng thái hiện/ẩn của dropdown
  notiDropdown.classList.toggle('hidden');

  // Nếu dropdown vừa mở ra, thì load dữ liệu mới nhất từ DB
  if (!notiDropdown.classList.contains('hidden')) {
    loadNotifications();
  }
});

// Nhận thông báo từ socket
socket.on('new_notification', (data) => {
  // Cập nhật số trên chuông
  let count = parseInt(notiCount.innerText) || 0;
  notiCount.innerText = count + 1;
  notiCount.classList.remove('hidden');

  // Thêm vào list
  const div = document.createElement('div');
  div.className = 'p-2 border-b hover:bg-gray-50';
  div.innerText = data.message;
  notiList.prepend(div);
});

// Hàm đánh dấu đã đọc từngg tin
async function markAsRead(id) {
  try {
    const res = await fetch(`/api/notifications/read/${id}`, { method: 'POST' });
    if (res.ok) {
      const header = document.getElementById(`noti-header-${id}`);
      const statusSpan = header.querySelector('span');
      const parentDiv = header.parentElement;

      // Đổi nền về trắng, chữ giữ font-bold nhưng đổi sang màu xám (text-gray-400)
      parentDiv.classList.replace('bg-blue-50', 'bg-white');
      statusSpan.className = 'text-xs font-bold text-gray-400';
      statusSpan.innerText = 'Thông báo cũ';

      // Cập nhật số đếm trên chuông và nút
      let count = parseInt(notiCount.innerText) || 0;
      if (count > 0) {
        const newCount = count - 1;
        notiCount.innerText = newCount;
        if (newCount === 0) notiCount.classList.add('hidden');

        const markAllBtn = document.querySelector('button[onclick="markAllAsRead()"]');
        if (markAllBtn) {
          if (newCount > 0) {
            markAllBtn.innerText = `Đánh dấu tất cả (${newCount})`;
          } else {
            markAllBtn.outerHTML = '<span class="text-gray-400 font-bold">Không có tin mới</span>';
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Hàm đánh dấu đã đọc tất cả tin
async function markAllAsRead() {
  await fetch('/api/notifications/read-all', { method: 'POST' });
  loadNotifications();
}

// Xóa từng tin
async function deleteNoti(id) {
  if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
  await fetch(`/api/notifications/delete/${id}`, { method: 'DELETE' });
  loadNotifications();
}

// Xóa tất cả
async function deleteAllNotifications() {
  if (!confirm('Xóa sạch tất cả thông báo?')) return;
  await fetch('/api/notifications/delete-all', { method: 'DELETE' });
  loadNotifications();
}

// Load data
async function loadNotifications() {
  try {
    const res = await fetch('/api/notifications');
    const data = await res.json();

    // Tính số lượng tin chưa đọc
    const unreadNotifications = data.filter((n) => !n.is_read);
    const unreadCount = unreadNotifications.length;

    const totalCount = data.length;

    // 1. HEADER CHỨA NÚT CHỨC NĂNG (Chỉ hiện nếu có tin)
    let htmlContent = '';
    if (data.length > 0) {
      htmlContent = `
          <div class="p-3 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center text-[11px]">
             ${
               unreadCount > 0
                 ? `
                   <button onclick="markAllAsRead()" class="text-blue-600 font-bold hover:underline">
                       Đánh dấu tất cả (${unreadCount})
                   </button>
               `
                 : '<span class="text-gray-400 font-bold">Không có tin mới</span>'
             }
               
               <button onclick="deleteAllNotifications()" class="text-red-500 font-bold hover:underline">
                   <i class="fa-solid fa-trash mr-1"></i> Xóa tất cả (${totalCount})
               </button>
           </div>
         `;
    } else {
      htmlContent = '<p class="text-xs text-gray-400 p-4 text-center">Chưa có thông báo nào</p>';
    }
    // 2. Render danh sách thông báo
    htmlContent += data
      .map((n) => {
        const titleColor = n.is_read ? 'text-gray-400' : 'text-gray-900 font-bold';
        const statusText = n.is_read ? 'Thông báo cũ' : 'Thông báo mới';
        const bgColor = n.is_read ? 'bg-white' : 'bg-blue-50';

        // ... trong hàm map của loadNotifications ...
        return `
                <div class="border-b transition border-gray-100 ${bgColor}">
                    <!-- TIÊU ĐỀ: Dùng flex để dàn hàng ngang -->
                    <div id="noti-header-${n.id}" onclick="toggleNoti(${n.id}, ${n.is_read})" 
                        class="p-3 cursor-pointer flex justify-between items-center w-full">
                        
                        <div class="flex flex-col gap-0.5 overflow-hidden">
                           <span class="text-xs font-bold ${
                             n.is_read ? 'text-gray-400' : 'text-gray-900'
                           }">
                              ${statusText}
                            </span>
                      
                            <span class="text-[10px] text-gray-400">${formatDateTime(
                              n.created_at,
                            )}</span>
                        </div>

                        <!-- NHÓM NÚT BÊN PHẢI -->
                        <div class="flex items-center gap-3 text-gray-400">
                            <!-- Nút Xóa -->
                            <button onclick="event.stopPropagation(); deleteNoti(${
                              n.id
                            })" class="hover:text-red-500 transition text-sm">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <!-- Nút Mũi tên -->
                            <i class="fa-solid fa-chevron-down text-[10px]"></i>
                        </div>
                    </div>
                    
                    <!-- NỘI DUNG CHI TIẾT -->
                    <div id="noti-content-${n.id}" class="hidden p-3 pt-0 text-xs text-gray-700">
                        <div class="bg-white p-3 rounded border border-gray-100 shadow-sm">
                            <p class="mb-3">${n.message.replace(/\*\*/g, '')}</p>
                            <div class="flex justify-end gap-3">
                                <button onclick="toggleNoti(${
                                  n.id
                                })" class="text-gray-400 font-bold text-[10px]">« Thu gọn</button>
                                <!-- NÚT ĐÁNH DẤU ĐÃ XÓA Ở ĐÂY -->
                            </div>
                        </div>
                    </div>
                </div>
                `;
      })
      .join('');

    notiList.innerHTML = htmlContent;

    if (unreadCount > 0) {
      notiCount.innerText = unreadCount;
      notiCount.classList.remove('hidden');
    } else {
      notiCount.classList.add('hidden');
    }
  } catch (err) {
    console.error('Lỗi loadNotifications:', err);
  }
}

// Hàm này mở/đóng chi tiết thông báo
async function toggleNoti(id, isRead) {
  const header = document.getElementById(`noti-header-${id}`);
  const content = document.getElementById(`noti-content-${id}`);

  // Nếu đang đóng (hidden) -> mở ra
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    header.classList.add('hidden');

    // Nếu tin chưa đọc, đánh dấu là đã đọc ngay khi mở
    const isUnread = header.querySelector('span').classList.contains('font-bold');
    if (isUnread) {
      await markAsRead(id);
    }
  } else {
    // Nếu đang mở -> đóng lại
    content.classList.add('hidden');
    header.classList.remove('hidden');
  }
}

// ==========================================
// 9. CHAT - XỬ LÝ UPLOAD ẢNH
// ==========================================

if (uploadBtn) {
  uploadBtn.addEventListener('click', () => fileInput.click());
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    imagePreviewImg.src = url;
    imagePreviewContainer.style.display = 'flex';
  }
});

if (removeImgBtn) {
  removeImgBtn.addEventListener('click', () => {
    fileInput.value = '';
    imagePreviewContainer.style.display = 'none';
  });
}

// ==========================================
// 10. CHAT - HIỂN THỊ TIN NHẮN
// ==========================================
function addMessage(text, isUser = false) {
  const safeText = text || '';
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(isUser ? 'user' : 'bot');

  if (!isUser) {
    if (typeof marked !== 'undefined' && safeText.trim() !== '') {
      div.innerHTML = marked.parse(safeText);
    } else {
      div.textContent = safeText || 'Không có phản hồi';
    }
  } else {
    div.textContent = safeText;
  }

  chatMessages.appendChild(div);

  // Smooth scroll to bottom
  setTimeout(() => {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth',
    });
  }, 100);
}

function showTypingIndicator() {
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'typing';
  div.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
  chatMessages.appendChild(div);

  setTimeout(() => {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth',
    });
  }, 100);
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// ==========================================
// 11. CHAT - GỬI TIN NHẮN
// ==========================================

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSending) return;

  const message = userInput.value.trim();
  const file = fileInput.files[0];

  if (!message && !file) return;

  console.log('📤 Gửi:', { text: message, file: file ? file.name : 'No image' });

  isSending = true;

  const displayMessage = message || (file ? '🖼️ Phân tích hình ảnh này giúp Bảo...' : '');
  addMessage(displayMessage, true);

  if (file) {
    const imageUrl = URL.createObjectURL(file);
    const lastMsg = chatMessages.lastElementChild;
    lastMsg.innerHTML += `<br><img src="${imageUrl}" style="max-width:200px; border-radius:12px; margin-top:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
  }

  userInput.value = '';
  imagePreviewContainer.style.display = 'none';
  userInput.disabled = true;
  showTypingIndicator();

  try {
    // ✅ BƯỚC 1: KHỞI TẠO FORMDATA
    const formData = new FormData();

    // ✅ BƯỚC 2: BỎ DỮ LIỆU VÀO TÚI
    formData.append('message', message);
    if (file) {
      formData.append('image', file);
    }

    // ✅ BƯỚC 3: LẤY MODEL TỪ DROPDOWN VÀ BỎ VÀO LUÔN
    const modelSelector = document.getElementById('model-selector');
    const selectedModel = modelSelector ? modelSelector.value : 'auto';
    formData.append('model', selectedModel);

    const res = await fetch('/chat', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Lỗi từ Server');
    }

    const data = await res.json();
    const replyText = data.reply;

    // Phân tích dữ liệu
    const allMatches = [...replyText.matchAll(/<transaction>(.*?)<\/transaction>/gs)];

    if (allMatches.length > 0) {
      try {
        const transactions = allMatches.map((m) => JSON.parse(m[1].trim()));
        console.log(`🎯 [${transactions.length} GIAO DỊCH]:`);
        console.table(transactions);
      } catch (e) {
        console.error('🚨 Lỗi parse giao dịch');
      }
    }

    // Làm sạch reply
    let cleanReply = replyText.replace(/<.*?>[\s\S]*?<\/.*?>/gs, '').trim();

    removeTypingIndicator();
    // addMessage(cleanReply, false);

    addMessage(cleanReply, false, {
      modelUsed: data.modelUsed,
      tokens: data.usage?.totalTokenCount || 0,
      cost: data.cost || 0,
    });
    if (data.reply.includes('🚨') || data.reply.includes('⚠️')) {
      showToast('Moni vừa đưa ra cảnh báo tài chính!', 'error');
    }

    // Cập nhật dashboard sau khi ghi sổ thành công
    updateDashboard();
  } catch (err) {
    removeTypingIndicator();
    addMessage('🚨 Lỗi: ' + err.message, false);
    showToast('Không thể gửi tin nhắn', 'error');
  } finally {
    isSending = false;
    userInput.disabled = false;
    fileInput.value = '';
    userInput.focus();
  }
});

// ==========================================
// 12. TOAST NOTIFICATION
// ==========================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor =
    type === 'success'
      ? 'from-green-500 to-emerald-500'
      : type === 'error'
      ? 'from-red-500 to-pink-500'
      : 'from-blue-500 to-indigo-500';

  toast.className = `fixed top-20 right-6 bg-gradient-to-r ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full`;
  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="fa-solid ${
        type === 'success'
          ? 'fa-check-circle'
          : type === 'error'
          ? 'fa-exclamation-circle'
          : 'fa-info-circle'
      }"></i>
      <span class="font-medium">${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    toast.style.transform = 'translateX(150%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// 13. LOAD LỊCH SỬ CHAT
// ==========================================

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/chat-history');
    const history = await res.json();

    history.forEach((msg) => {
      const isUser = msg.role === 'user';
      addMessage(msg.message, isUser);
    });
  } catch (err) {
    console.error('⚠️ Không lấy được lịch sử chat:', err);
  }
});

// ==========================================
// 14. CLICK VÀO CARD ĐỂ ĐỔI BIỂU ĐỒ
// ==========================================

document.addEventListener('click', (e) => {
  if (e.target.closest('.card.income')) {
    currentView = 'income';
    renderChart('income');
  } else if (e.target.closest('.card.expense')) {
    currentView = 'expense';
    renderChart('expense');
  }
});

// ==========================================
// 15. KHỞI TẠO KHI TRANG LOAD
// ==========================================

window.addEventListener('load', () => {
  // Cập nhật dashboard
  updateDashboard();
  loadBudgets();
  // Hiện số lượng thông báo
  loadNotifications();
  // Kích hoạt âm thanh
  enableAudioAfterInteraction();

  updateAIHealth();
  setInterval(updateAIHealth, 30000); // 30 giây quét sức khỏe AI một lần

  // Đăng ký Push
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    setTimeout(registerPush, 2000);
  }

  // Thêm animation vào các cards
  document.querySelectorAll('.card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  console.log('🎉 Money Guard Dashboard đã sẵn sàng!');
});
