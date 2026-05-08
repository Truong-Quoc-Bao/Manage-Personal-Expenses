import React, { useState } from 'react';
import { authApi, statsApi, chatApi, notificationApi } from '../api/ai.api';

const ApiTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const runTest = async (apiCall: Promise<any>) => {
    setLoading(true);
    setStatus('idle');
    setResult('🚀 Đang gọi API...');

    try {
      const res = await apiCall;
      setResult(res.data || res); // Backup nếu res không có .data
      setStatus('success');
      console.log('✅ Kết quả:', res.data);
    } catch (err: any) {
      setResult(err.response?.data || err.message || 'Lỗi không xác định');
      setStatus('error');
      console.error('❌ Lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setStatus('idle');
  };

  // Helper render button group
  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div
      style={{
        marginBottom: '15px',
        border: '1px solid #ddd',
        padding: '10px',
        borderRadius: '8px',
      }}
    >
      <h4 style={{ marginTop: 0, color: '#555' }}>{title}</h4>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{children}</div>
    </div>
  );

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🛠 API Testing Dashboard</h1>
        <button onClick={clearResult} style={{ padding: '5px 15px', cursor: 'pointer' }}>
          Xóa log
        </button>
      </div>

      {/* NHÓM AUTH */}
      <Group title="🔐 Authentication">
        <button onClick={() => runTest(authApi.login({ username: 'admin', password: '123' }))}>
          Login (Admin)
        </button>
      </Group>

      {/* NHÓM THỐNG KÊ */}
      <Group title="📊 Statistics">
        <button onClick={() => runTest(statsApi.getStats())}>Get General Stats</button>
        <button onClick={() => runTest(statsApi.getRecentTransactions())}>
          Get Recent Transactions
        </button>
        <button onClick={() => runTest(statsApi.getAllTransactions())}>Get Transactions</button>
      </Group>

      {/* NHÓM CHAT & AI */}
      <Group title="🤖 Chat & AI Services">
        <button onClick={() => runTest(chatApi.getChatHistory())}>Get History</button>
        <button onClick={() => runTest(chatApi.sendMessage({ message: 'Hello AI' }))}>
          Send "Hello AI"
        </button>
        <button onClick={() => runTest(chatApi.getAiHealth())}>Check AI Health</button>
      </Group>

      {/* NHÓM THÔNG BÁO */}
      <Group title="🔔 Notifications">
        <button onClick={() => runTest(notificationApi.getAll())}>Get All Notifications</button>
      </Group>

      {/* HIỂN THỊ KẾT QUẢ */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Response:{' '}
          {loading && <span style={{ fontSize: '14px', color: '#666' }}>⏳ Đang tải...</span>}
        </h3>

        <div
          style={{
            background: '#1e1e1e',
            color: status === 'error' ? '#ff6b6b' : '#4ade80',
            padding: '20px',
            borderRadius: '8px',
            minHeight: '200px',
            maxHeight: '500px',
            overflow: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            borderLeft: `5px solid ${
              status === 'error' ? '#ff6b6b' : status === 'success' ? '#4ade80' : '#888'
            }`,
          }}
        >
          <pre
            style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '14px' }}
          >
            {result
              ? JSON.stringify(result, null, 2)
              : '// Chưa có dữ liệu. Hãy chọn một API để test.'}
          </pre>
        </div>
      </div>

      <style>{`
        button {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #007bff;
          background: white;
          color: #007bff;
          cursor: pointer;
          transition: 0.2s;
        }
        button:hover {
          background: #007bff;
          color: white;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ApiTestPage;
