import React, { useState } from 'react';
import { authApi, statsApi, chatApi, notificationApi } from '../api/ai.api'; // Sửa lại path cho đúng file chứa code API của bạn

const ApiTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (apiCall: Promise<any>) => {
    setLoading(true);
    setResult('Đang gọi API...');
    try {
      const res = await apiCall;
      setResult(res.data);
      console.log('✅ Kết quả:', res.data);
    } catch (err: any) {
      setResult(err.response?.data || err.message);
      console.error('❌ Lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🛠 API Testing Demo</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* AUTH */}
        <button onClick={() => runTest(authApi.login({ username: 'admin', password: '123' }))}>
          Test Login
        </button>

        {/* STATS */}
        <button onClick={() => runTest(statsApi.getStats())}>Get Stats</button>

        <button onClick={() => runTest(statsApi.getRecentTransactions())}>Get Transactions</button>

        {/* CHAT */}
        <button onClick={() => runTest(chatApi.getChatHistory())}>Get Chat History</button>

        <button onClick={() => runTest(chatApi.sendMessage({ message: 'Hello AI' }))}>
          Send Message
        </button>

        {/* NOTI */}
        <button onClick={() => runTest(notificationApi.getAll())}>Get Notifications</button>
      </div>

      <div style={{ background: 'black', padding: '15px', borderRadius: '8px' }}>
        <h3>Kết quả nhận về từ BE: {loading && '⏳...'}</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ApiTestPage;
