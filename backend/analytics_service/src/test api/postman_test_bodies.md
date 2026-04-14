# 📬 Postman Test Bodies
> **account_id dùng xuyên suốt:** `7dc770af-615f-48a7-9c24-8baa3caf5571`  
> **category_id dùng xuyên suốt:** `13a008d9-04c7-498f-9557-8dcbed643cb1` (Coffee - expense, của Trần Thiện Châu)  
> **Base URL:** `http://localhost:3000/api` (thay theo port thực tế)

---

## 1. USER ANALYTICS

### GET — Lấy tất cả
```
GET /api/
```
> Không cần body

---

### GET — Lấy theo accountId
```
GET /api/user_analytics/7dc770af-615f-48a7-9c24-8baa3caf5571
```
> Không cần body

---

### POST — Tạo mới
```
POST /api/user_analytics/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "user_id": "mcb96e5d-3cd9-40dc-ad99-635f08456301",
  "display_name": "Phucccccccccccccccccccccccccc",
  "total_income": 0,
  "total_expense": 36290000,
  "current_balance": -36290000,
  "current_month": {
    "year": 2026,
    "month": 4,
    "income": 0,
    "expense": 2199000,
    "savings": -2199000,
    "savings_rate": 0
  },
  "top_categories": [
    {
      "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
      "category_name": "Coffee",
      "total_amount": 14351000
    }
  ],
  "ai_insights": {
    "generated": false,
    "content": null,
    "generated_at": null
  },
  "budget_alert": {
    "enabled": true,
    "alerts": [],
    "last_checked": null
  },
  "goal_tracking": {
    "goals": [
      {
        "goal_id": "goal-chau-001",
        "title": "Tiet kiem 3 thang chi phi",
        "target_amount": 5000000,
        "current_amount": 0,
        "deadline": "2026-06-30T00:00:00.000Z",
        "status": "in_progress",
        "note": "Can cat giam ca phe"
      }
    ]
  },
  "streak": {
    "saving_months": 0,
    "unit": "months"
  }
}
```

---

### PUT — Cập nhật
```
PUT /api/user_analytics/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "total_income": 5000000,
  "current_balance": -31290000,
  "streak": {
    "saving_months": 1,
    "unit": "months"
  }
}
```

---

### DELETE — Xóa
```
DELETE /api/user_analytics/7dc770af-615f-48a7-9c24-8baa3caf5571
```
> Không cần body

---

## 2. ANOMALY LOGS

### GET — Lấy tất cả logs của account
```
GET /api/anomaly_logs/7dc770af-615f-48a7-9c24-8baa3caf5571
```

### GET — Lấy unread logs
```
GET /api/anomaly_logs/7dc770af-615f-48a7-9c24-8baa3caf5571/unread
```

### GET — Đếm unread logs
```
GET /api/anomaly_logs/7dc770af-615f-48a7-9c24-8baa3caf5571/unread/count
```

### GET — Lấy log theo _id (lấy _id từ response POST)
```
GET /api/anomaly_logs/detail/{logId}
```

---

### POST — Tạo mới
```
POST /api/anomaly_logs/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "type": "category_spike",
  "severity": "high",
  "description": "Chi tieu Coffee tang 80% so voi thang truoc",
  "transaction_id": null,
  "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
  "amount_flagged": 670000,
  "expected_range": {
    "min": 200000,
    "max": 400000
  },
  "is_read": false,
  "is_dismissed": false,
  "detected_at": "2026-04-14T08:00:00.000Z"
}
```

---

### PUT — Cập nhật log
```
PUT /api/anomaly_logs/detail/{logId}
Content-Type: application/json
```
```json
{
  "severity": "medium",
  "description": "Chi tieu Coffee tang nhe, da dieu chinh muc do"
}
```

---

### PATCH — Đánh dấu tất cả đã đọc
```
PATCH /api/anomaly_logs/7dc770af-615f-48a7-9c24-8baa3caf5571/read_all
```
> Không cần body

### PATCH — Dismiss một log
```
PATCH /api/anomaly_logs/detail/{logId}/dismiss
```
> Không cần body

### DELETE — Xóa một log
```
DELETE /api/anomaly_logs/detail/{logId}
```

### DELETE — Xóa tất cả
```
DELETE /api/anomaly_logs/7dc770af-615f-48a7-9c24-8baa3caf5571
```

---

## 3. CATEGORY SUMMARY

### GET — Lấy tất cả
```
GET /api/category_summary/7dc770af-615f-48a7-9c24-8baa3caf5571
```

### GET — Lấy theo tháng
```
GET /api/category_summary/7dc770af-615f-48a7-9c24-8baa3caf5571/by_month?year=2026&month=4
```

### GET — Lấy vượt budget
```
GET /api/category_summary/7dc770af-615f-48a7-9c24-8baa3caf5571/over_budget
```

### GET — Lấy theo _id
```
GET /api/category_summary/detail/{id}
```

---

### POST — Tạo mới
```
POST /api/category_summary/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
  "category_name": "Coffee",
  "category_type": "expense",
  "year": 2026,
  "month": 4,
  "total_amount": 320000,
  "transaction_count": 5,
  "budget_limit": 1000000,
  "is_over_budget": false,
  "daily_breakdown": [
    { "day": 1,  "amount": 55000 },
    { "day": 3,  "amount": 65000 },
    { "day": 7,  "amount": 80000 },
    { "day": 10, "amount": 55000 },
    { "day": 14, "amount": 65000 }
  ]
}
```

---

### PUT — Upsert
```
PUT /api/category_summary/7dc770af-615f-48a7-9c24-8baa3caf5571/upsert
Content-Type: application/json
```
```json
{
  "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
  "category_name": "Coffee",
  "category_type": "expense",
  "year": 2026,
  "month": 4,
  "total_amount": 450000,
  "transaction_count": 7,
  "budget_limit": 1000000,
  "is_over_budget": false,
  "daily_breakdown": [
    { "day": 1,  "amount": 55000 },
    { "day": 3,  "amount": 65000 },
    { "day": 7,  "amount": 80000 },
    { "day": 10, "amount": 55000 },
    { "day": 14, "amount": 65000 },
    { "day": 18, "amount": 70000 },
    { "day": 21, "amount": 60000 }
  ]
}
```

---

### PUT — Cập nhật theo _id
```
PUT /api/category_summary/detail/{id}
Content-Type: application/json
```
```json
{
  "total_amount": 1200000,
  "transaction_count": 18,
  "is_over_budget": true
}
```

### DELETE — Xóa một summary
```
DELETE /api/category_summary/detail/{id}
```

### DELETE — Xóa tất cả
```
DELETE /api/category_summary/7dc770af-615f-48a7-9c24-8baa3caf5571
```

---

## 4. DASHBOARD CACHE

### GET — Lấy cache
```
GET /api/dashboard_cache/7dc770af-615f-48a7-9c24-8baa3caf5571
```
> Trả về `null` nếu hết hạn (TTL 15 phút)

---

### PUT — Upsert cache
```
PUT /api/dashboard_cache/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "summary": {
    "current_balance": -36290000,
    "monthly_income": 0,
    "monthly_expense": 2199000,
    "monthly_savings": -2199000,
    "savings_rate": 0
  },
  "top_categories": [
    {
      "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
      "category_name": "Coffee",
      "total_amount": 670000
    }
  ],
  "recent_transactions": [
    {
      "trans_id": "trans-chau-test-001",
      "description": "Highlands Coffee",
      "amount": 65000,
      "type": "expense",
      "date": "2026-04-14",
      "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1"
    }
  ],
  "streak": {
    "saving_months": 0,
    "unit": "months"
  },
  "ttl_ms": 900000
}
```

---

### DELETE — Invalidate cache
```
DELETE /api/dashboard_cache/7dc770af-615f-48a7-9c24-8baa3caf5571
```

---

## 5. MONTHLY REPORT

### GET — Lấy tất cả
```
GET /api/monthly_reports/7dc770af-615f-48a7-9c24-8baa3caf5571
```

### GET — Lấy theo tháng
```
GET /api/monthly_reports/7dc770af-615f-48a7-9c24-8baa3caf5571/by_month?year=2026&month=4
```

### GET — Lấy N gần nhất
```
GET /api/monthly_reports/7dc770af-615f-48a7-9c24-8baa3caf5571/recent?limit=3
```

### GET — Lấy theo _id
```
GET /api/monthly_reports/detail/{id}
```

---

### POST — Tạo mới
```
POST /api/monthly_reports/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "year": 2026,
  "month": 4,
  "summary": {
    "total_income": 0,
    "total_expense": 320000,
    "savings": -320000,
    "savings_rate": 0,
    "transaction_count": 5
  },
  "income_by_category": [],
  "expense_by_category": [
    {
      "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
      "category_name": "Coffee",
      "amount": 320000
    }
  ],
  "weekly_trend": [
    { "week": 1, "income": 0, "expense": 120000 },
    { "week": 2, "income": 0, "expense": 145000 },
    { "week": 3, "income": 0, "expense": 55000 }
  ],
  "daily_cashflow": [
    { "day": 1,  "income": 0, "expense": 55000 },
    { "day": 3,  "income": 0, "expense": 65000 },
    { "day": 7,  "income": 0, "expense": 80000 },
    { "day": 10, "income": 0, "expense": 55000 },
    { "day": 14, "income": 0, "expense": 65000 }
  ],
  "top_expenses": [
    {
      "trans_id": "trans-chau-test-001",
      "description": "Highlands Coffee",
      "amount": 80000,
      "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
      "date": "2026-04-07T00:00:00.000Z"
    }
  ],
  "comparison": {
    "prev_income": 0,
    "prev_expense": 2199000,
    "income_change_pct": 0,
    "expense_change_pct": -85.45
  },
  "ai_report": {
    "generated": false,
    "content": null,
    "generated_at": null
  },
  "status": "draft",
  "generated_at": "2026-04-14T10:00:00.000Z"
}
```

---

### PUT — Upsert
```
PUT /api/monthly_reports/7dc770af-615f-48a7-9c24-8baa3caf5571/upsert
Content-Type: application/json
```
```json
{
  "year": 2026,
  "month": 4,
  "summary": {
    "total_income": 5000000,
    "total_expense": 320000,
    "savings": 4680000,
    "savings_rate": 93.6,
    "transaction_count": 6
  },
  "status": "generated",
  "generated_at": "2026-04-14T12:00:00.000Z"
}
```

---

### PUT — Cập nhật theo _id
```
PUT /api/monthly_reports/detail/{id}
Content-Type: application/json
```
```json
{
  "status": "reviewed",
  "ai_report": {
    "generated": true,
    "content": "Thang nay chi tieu Coffee giam dang ke so voi thang truoc. Hay duy tri xu huong nay!",
    "generated_at": "2026-04-14T12:30:00.000Z"
  }
}
```

### DELETE — Xóa một report
```
DELETE /api/monthly_reports/detail/{id}
```

### DELETE — Xóa tất cả
```
DELETE /api/monthly_reports/7dc770af-615f-48a7-9c24-8baa3caf5571
```

---

## 6. SPENDING TREND

### GET — Lấy tất cả
```
GET /api/spending_trends/7dc770af-615f-48a7-9c24-8baa3caf5571
```

### GET — Lấy theo account + category
```
GET /api/spending_trends/7dc770af-615f-48a7-9c24-8baa3caf5571/category/13a008d9-04c7-498f-9557-8dcbed643cb1
```

### GET — Lấy theo _id
```
GET /api/spending_trends/detail/{id}
```

---

### POST — Tạo mới
```
POST /api/spending_trends/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
  "category_name": "Coffee",
  "category_type": "expense",
  "monthly_data": [
    { "year": 2026, "month": 1, "amount": 580000 },
    { "year": 2026, "month": 2, "amount": 620000 },
    { "year": 2026, "month": 3, "amount": 670000 },
    { "year": 2026, "month": 4, "amount": 320000 }
  ],
  "stats": {
    "total_amount": 2190000,
    "avg_monthly": 547500,
    "max_month": { "year": 2026, "month": 3, "amount": 670000 },
    "min_month": { "year": 2026, "month": 4, "amount": 320000 },
    "last_updated": "2026-04-14T10:00:00.000Z"
  }
}
```

---

### PUT — Upsert
```
PUT /api/spending_trends/7dc770af-615f-48a7-9c24-8baa3caf5571/upsert
Content-Type: application/json
```
```json
{
  "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
  "category_name": "Coffee",
  "category_type": "expense",
  "monthly_data": [
    { "year": 2026, "month": 1, "amount": 580000 },
    { "year": 2026, "month": 2, "amount": 620000 },
    { "year": 2026, "month": 3, "amount": 670000 },
    { "year": 2026, "month": 4, "amount": 450000 }
  ],
  "stats": {
    "total_amount": 2320000,
    "avg_monthly": 580000,
    "max_month": { "year": 2026, "month": 3, "amount": 670000 },
    "min_month": { "year": 2026, "month": 1, "amount": 580000 },
    "last_updated": "2026-04-14T14:00:00.000Z"
  }
}
```

---

### PUT — Cập nhật theo _id
```
PUT /api/spending_trends/detail/{id}
Content-Type: application/json
```
```json
{
  "category_name": "Coffee & Drinks",
  "stats": {
    "total_amount": 2500000,
    "avg_monthly": 625000,
    "last_updated": "2026-04-14T15:00:00.000Z"
  }
}
```

### DELETE — Xóa một trend
```
DELETE /api/spending_trends/detail/{id}
```

### DELETE — Xóa tất cả
```
DELETE /api/spending_trends/7dc770af-615f-48a7-9c24-8baa3caf5571
```

---

## 7. TRANSACTIONS

### GET — Lấy danh sách (phân trang)
```
GET /api/transactions/7dc770af-615f-48a7-9c24-8baa3caf5571?limit=10&skip=0
```

### GET — Lấy theo khoảng thời gian
```
GET /api/transactions/7dc770af-615f-48a7-9c24-8baa3caf5571/date_range?from=2026-04-01&to=2026-04-30
```

### GET — Lấy theo category
```
GET /api/transactions/7dc770af-615f-48a7-9c24-8baa3caf5571/category/13a008d9-04c7-498f-9557-8dcbed643cb1
```

### GET — Lấy theo trans_id
```
GET /api/transactions/detail/trans-chau-test-001
```

---

### POST — Tạo mới
```
POST /api/transactions/7dc770af-615f-48a7-9c24-8baa3caf5571
Content-Type: application/json
```
```json
{
  "trans_id": "trans-chau-test-001",
  "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
  "amount": 65000,
  "transaction_type": "expense",
  "description": "Highlands Coffee - Quan 1",
  "date": "2026-04-14T08:30:00.000Z",
  "note": "Ca phe buoi sang voi dong nghiep"
}
```

---

### PUT — Cập nhật
```
PUT /api/transactions/detail/trans-chau-test-001
Content-Type: application/json
```
```json
{
  "amount": 70000,
  "description": "Highlands Coffee - Quan 1 (updated)",
  "note": "Them banh mi"
}
```

---

### DELETE — Xóa
```
DELETE /api/transactions/detail/trans-chau-test-001
```

---

## Thứ tự test gợi ý

```
1.  POST   user_analytics           tao truoc
2.  GET    user_analytics
3.  PUT    user_analytics
4.  POST   transactions              luu trans_id
5.  GET    transactions by trans_id
6.  GET    transactions date_range
7.  GET    transactions by category
8.  PUT    transactions
9.  POST   anomaly_logs              luu logId tu response._id
10. GET    anomaly_logs
11. GET    anomaly_logs unread
12. GET    anomaly_logs unread/count
13. GET    anomaly_logs detail/logId
14. PUT    anomaly_logs detail
15. PATCH  anomaly_logs read_all
16. PATCH  anomaly_logs dismiss
17. POST   category_summary
18. PUT    category_summary upsert
19. GET    category_summary by_month
20. GET    category_summary over_budget
21. PUT    dashboard_cache upsert
22. GET    dashboard_cache
23. POST   monthly_reports
24. PUT    monthly_reports upsert
25. GET    monthly_reports by_month
26. GET    monthly_reports recent
27. PUT    monthly_reports detail
28. POST   spending_trends
29. PUT    spending_trends upsert
30. GET    spending_trends by category
31. PUT    spending_trends detail
32. DELETE (don dep nguoc lai neu can)
```
