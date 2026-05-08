import { FinanceAIChatbox } from '../components/ui/FinanceAIChatbox';
import React from 'react';

export function ChatBox() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-1 text-4xl font-bold text-gray-900">Trợ lý AI</h1>
        <p className="text-gray-600">Hỏi đáp và nhận tư vấn tài chính từ AI</p>
      </div>

      {/* ChatBox */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
          <FinanceAIChatbox />
        </div>
      </div>
    </div>
  );
}
