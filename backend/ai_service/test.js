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

async function toggleNoti(id) {
  const header = document.getElementById(`noti-header-${id}`);
  const content = document.getElementById(`noti-content-${id}`);

  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');

    // Nếu chữ vẫn là màu đen (text-gray-900) thì mới là chưa đọc -> Gọi markAsRead
    const isUnread = header.querySelector('span').classList.contains('text-gray-900');
    if (isUnread) {
      await markAsRead(id);
    }
  } else {
    content.classList.add('hidden');
  }
}
