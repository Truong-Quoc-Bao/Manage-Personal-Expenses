import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Wallet, Edit2, Trash2, Link, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AddAccountModal } from '../components/modals/AddAccountModal';
import { EditAccountModal } from '../components/modals/EditAccountModal';
import { DeleteAccountModal } from '../components/modals/DeleteAccountModal';
import { accountApi } from '../api/account.api';
import { bankApi } from '../api/ai.api';
type Account = {
  account_id: string;
  account_name: string;
  balance: number;
  type: string;
  currency?: string;
};

export function Accounts() {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLinkingBank, setIsLinkingBank] = useState(false); // Trạng thái đang tạo link Bank

  // ✅ HÀM LẤY DỮ LIỆU TÀI KHOẢN
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await accountApi.getAccounts();
      setAccounts(res.data.data || []);
    } catch (error) {
      console.error('Get accounts failed:', error);
      toast.error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ "ĂNG-TEN" ĐỒNG BỘ VỚI AI
  useEffect(() => {
    fetchAccounts(); // Load lần đầu

    const handleSync = () => {
      console.log('🏦 Accounts: Nhận lệnh đồng bộ từ AI!');
      fetchAccounts();
    };

    window.addEventListener('money-guard-sync', handleSync);
    return () => window.removeEventListener('money-guard-sync', handleSync);
  }, [fetchAccounts]);

  // ✅ LOGIC TẠO LIÊN KẾT NGÂN HÀNG (Sửa lỗi cú pháp)
  const handleConnectBank = async () => {
    try {
      setIsLinkingBank(true);
      toast.info('Đang tạo liên kết bảo mật tới Ngân hàng...');

      // Gọi qua bankApi đã import, wrapper này thường đã xử lý Header/Token rồi
      const res = await bankApi.createBankLink();

      // Dữ liệu từ API wrapper thường nằm trong res.data
      const data = res.data;

      // // Chuyển hướng sang trang liên kết của ngân hàng
      // if (data && data.url) {
      //   console.log('✅ Nhận được link ngân hàng:', data.url);
      //   // window.location.href = data.url;
      //   const popup = window.open(data.url, 'bankhub', 'width=500,height=700');
      // } else {
      //   throw new Error('Hệ thống không trả về đường dẫn liên kết');
      // }

      if (!data?.url) throw new Error('Hệ thống không trả về đường dẫn liên kết');

      console.log('✅ Nhận được link ngân hàng:', data.url);

      // Mở popup thay vì chuyển trang
      const popup = window.open(data.url, 'bankhub', 'width=500,height=700');

      // Lắng nghe postMessage từ SePay
      const handleMessage = async (event: MessageEvent) => {
        console.log('📨 postMessage nhận được:', event.data);
        console.log('📨 postMessage FULL data:', JSON.stringify(event.data));
        console.log('📨 RAW event.data:', JSON.stringify(event.data, null, 2));
        console.log('📨 event.origin:', event.origin);
        // SePay gửi event FINISHED_BANK_ACCOUNT_LINK
        if (event.data?.event === 'FINISHED_BANK_ACCOUNT_LINK') {
          window.removeEventListener('message', handleMessage);
          clearInterval(checkClosed);
          popup?.close();

          // ✅ Lấy từ metadata, không phải root
          const { account_number, account_type, bank_name } = event.data.metadata;
          console.log('🏦 Data từ SePay:', { account_number, account_type, bank_name });

          try {
            await bankApi.saveBankAccount({ account_number, account_type, bank_name });
            toast.success('Liên kết ngân hàng thành công!');
            fetchAccounts();
          } catch (err) {
            console.error('Lỗi lưu tài khoản:', err);
            toast.error('Liên kết thành công nhưng lưu thất bại');
          } finally {
            setIsLinkingBank(false);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup nếu user đóng popup thủ công
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLinkingBank(false);
        }
      }, 1000);
    } catch (error: any) {
      console.error('Lỗi Connect Bank:', error);
      // Hiển thị lỗi chi tiết từ server nếu có
      const errMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      toast.error('Lỗi: ' + errMsg);
    } finally {
      setIsLinkingBank(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-4xl font-bold text-gray-900 flex items-center gap-3">
              Tài khoản
              {loading && <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />}
            </h1>
            <p className="text-gray-600">Quản lý các tài khoản và ví của bạn</p>
          </div>

          <div className="flex gap-3">
            {/* 🔥 NÚT LIÊN KẾT NGÂN HÀNG MỚI */}
            <button
              onClick={handleConnectBank}
              disabled={isLinkingBank}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLinkingBank ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Link className="h-5 w-5" />
              )}
              Liên kết Ngân hàng
            </button>

            <button
              type="button"
              onClick={() => setShowAddAccount(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg transition hover:!from-orange-500 hover:!to-rose-500"
            >
              <Plus className="h-5 w-5" />
              Thêm thủ công
            </button>
          </div>
        </div>

        {/* Tổng số dư Banner */}
        <div className="mb-8 rounded-3xl !bg-gradient-to-br !from-gray-900 !to-slate-800 p-8 shadow-xl relative overflow-hidden text-white">
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Wallet className="h-8 w-8 text-orange-400" />
              </div>
              <p className="text-white/70 font-medium uppercase tracking-widest text-xs">
                Tổng tài sản khả dụng
              </p>
            </div>
            <p className="mb-2 text-5xl font-black">{formatCurrency(totalBalance)}</p>
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
              <ShieldCheck className="h-4 w-4" />
              Đã bảo mật bởi Money Guard AI
            </div>
          </div>
          {/* Trang trí nền */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* List danh sách tài khoản */}
        {loading && accounts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* CARD GỢI Ý LIÊN KẾT BANK (Nếu chưa có bank nào) */}
            <div
              onClick={handleConnectBank}
              className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-all group"
            >
              <div className="mb-4 p-4 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                <Link className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-blue-900">Kết nối ngân hàng tự động</h3>
              <p className="text-xs text-blue-600 mt-1">AI tự động cập nhật số dư & giao dịch</p>
            </div>

            {accounts.map((account) => (
              <div
                key={account.account_id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition hover:shadow-xl relative group"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                      {account.type === 'bank' ? '🏦' : account.type === 'cash' ? '💵' : '📱'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                        {account.account_name}
                      </h3>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                        {account.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Số dư hiện tại
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {formatCurrency(Number(account.balance))}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <button
                    onClick={() => setEditingAccount(account)}
                    className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-500 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingAccount(account)}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-green-500">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals... */}
      {showAddAccount && (
        <AddAccountModal onClose={() => setShowAddAccount(false)} onSuccess={fetchAccounts} />
      )}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSuccess={fetchAccounts}
        />
      )}
      {deletingAccount && (
        <DeleteAccountModal
          account={deletingAccount}
          onClose={() => setDeletingAccount(null)}
          onSuccess={fetchAccounts}
        />
      )}
    </>
  );
}
