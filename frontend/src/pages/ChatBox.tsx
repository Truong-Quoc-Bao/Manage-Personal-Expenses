import { FinanceAIChatbox } from "../components/ui/FinanceAIChatbox";
import React from "react";

export function ChatBox() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-800 mb-1">Trợ lý AI</h1>
        <p className="text-gray-600">Hỏi đáp và nhận tư vấn tài chính từ AI</p>
      </div>

      {/* ChatBox */}
      <div className="max-w-4xl mx-auto">
        <FinanceAIChatbox />
      </div>
    </div>
  );
}
