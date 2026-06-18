var useHttp = configuration['USE_HTTP'] == 'true';

services.AddHttpClient('AccountHttp', (client) => {
  client.BaseAddress = new Uri(
    configuration['HttpSettings:AccountServiceUrl'] ?? 'http://account-service:3002',
  );
});
services.AddHttpClient('CategoryHttp', (client) => {
  client.BaseAddress = new Uri(
    configuration['HttpSettings:CategoryServiceUrl'] ?? 'http://category-service:3003',
  );
});

if (useHttp) {
  services.AddScoped<IAccountInternalService, AccountInternalHttpService>();
  services.AddScoped<ICategoryInternalService, CategoryInternalHttpService>();
} else {
  services.AddScoped<IAccountInternalService, AccountInternalService>();
  services.AddScoped<ICategoryInternalService, CategoryInternalService>();
}

const expenseMonthlyCount = fallbackTxs.filter((t) => {
  const d = new Date(t.date);
  return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
}).length;

const incomeMonthlyCount = fallbackTxs.filter((t) => {
  const d = new Date(t.date);
  return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
}).length;

<div className="flex items-center gap-1 text-base font-medium text-green-600">
  <ArrowUpRight className="h-5 w-5" />
  Đã ghi sổ {incomeMonthlyCount} giao dịch
</div>;
