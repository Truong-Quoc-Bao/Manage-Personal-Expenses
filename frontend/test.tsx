<div className="space-y-6">
  {/* Lấy 20 cái đầu tiên từ mảng transactions đã lấy về */}
  {transactions.slice(0, 20).map((t) => (
    <div key={t.id} className="flex items-center justify-between group">
      {/* Nội dung item giao dịch */}
    </div>
  ))}
</div>;
