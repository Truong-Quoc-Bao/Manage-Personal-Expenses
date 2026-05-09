import { FinanceAIChatbox } from '../components/ui/FinanceAIChatbox';

export function ChatBox() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-4xl font-bold text-gray-900">Trợ lý AI</h1>
          <p className="text-gray-600">Hỏi đáp và nhận tư vấn tài chính từ Money Guard</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <FinanceAIChatbox />
      </div>
    </div>
  );
}
