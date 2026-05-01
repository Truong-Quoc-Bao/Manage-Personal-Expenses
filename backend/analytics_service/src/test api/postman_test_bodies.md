# 📬 Postman Test Bodies
> **user_id dùng xuyên suốt:** `4f4b144d-e3f8-4e6b-9e32-408030a85698`  
> **category_id dùng xuyên suốt:** `c6e31bec-9e96-4981-832d-e8a38feaa9e6` (Di chuyển - expense, của Lê Tấn Đạt)  
> **Base URL:** `http://localhost:3004`

---

## GET

### User Analytics — Lấy tất cả
```
GET

http://localhost:3004/
```

### User Analytics — Lấy theo userId
```
GET

http://localhost:3004/user_analytics/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Anomaly Logs — Lấy tất cả logs của account
```
GET

http://localhost:3004/anomaly_logs/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

### Anomaly Logs — Lấy unread logs
```
GET

http://localhost:3004/anomaly_logs/4f4b144d-e3f8-4e6b-9e32-408030a85698/unread
```

### Anomaly Logs — Đếm unread logs
```
GET

http://localhost:3004/anomaly_logs/4f4b144d-e3f8-4e6b-9e32-408030a85698/unread/count
```

### Anomaly Logs — Lấy log theo _id
```
GET

http://localhost:3004/anomaly_logs/detail/{logId}
```

---

### Category Summary — Lấy tất cả
```
GET

http://localhost:3004/category_summary/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

### Category Summary — Lấy theo tháng
```
GET

http://localhost:3004/category_summary/4f4b144d-e3f8-4e6b-9e32-408030a85698/by_month?year=2025&month=5
```

### Category Summary — Lấy vượt budget
```
GET

http://localhost:3004/category_summary/4f4b144d-e3f8-4e6b-9e32-408030a85698/over_budget
```

### Category Summary — Lấy theo _id
```
GET

http://localhost:3004/category_summary/detail/{id}
```

---

### Dashboard Cache — Lấy cache theo usserID
```
GET

http://localhost:3004/dashboard_cache/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
> Trả về `null` nếu hết hạn (TTL 15 phút)

---

### Dashboard Cache — Lấy cache theo accountID
```
GET

http://localhost:3004/dashboard_cache/account/d4ffbef0-8bcc-445e-9ea3-7bc854e2ad76
```
> Trả về `null` nếu hết hạn (TTL 15 phút)

---

### Monthly Report — Lấy tất cả
```
GET

http://localhost:3004/monthly_reports/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

### Monthly Report — Lấy theo tháng
```
GET

http://localhost:3004/monthly_reports/4f4b144d-e3f8-4e6b-9e32-408030a85698/by_month?year=2025&month=5
```

### Monthly Report — Lấy N gần nhất
```
GET

http://localhost:3004/monthly_reports/4f4b144d-e3f8-4e6b-9e32-408030a85698/recent?limit=3
```

### Monthly Report — Lấy theo _id
```
GET

http://localhost:3004/monthly_reports/detail/{id}
```

---

### Spending Trend — Lấy tất cả
```
GET

http://localhost:3004/spending_trends/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

### Spending Trend — Lấy theo account + category
```
GET

http://localhost:3004/spending_trends/4f4b144d-e3f8-4e6b-9e32-408030a85698/category/c6e31bec-9e96-4981-832d-e8a38feaa9e6
```

### Spending Trend — Lấy theo _id
```
GET

http://localhost:3004/spending_trends/detail/{id}
```

---

## PUT

### User Analytics — Cập nhật
```
PUT

http://localhost:3004/user_analytics/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
```json

{
  "display_name": "Dat đẹp trai hơn"
}



{ 
 "goal_tracking": {
    "goals": [
      {
        "goal_id": "goal-dat-001",
        "title": "Quỹ khẩn cấp 6 tháng",
        "target_amount": 50000000,
        "current_amount": 65000000,
        "deadline": "2026-06-30T00:00:00.000Z",

        "status": "completed",
        "note": "Đã vượt mục tiêu"
      },
      {
        "goal_id": "goal-dat-002",
        "title": "Giảm chi tiêu Entertainmentertainmendddddddddddddddddddddddddddddddddd",
        "target_amount": 4000000,
        "current_amount": 3200000,
        "deadline": "2026-04-30T00:00:00.000Z",

        "status": "in_progress",
        "note": "Đang trong ngưỡng kiểm soát"
      }
      
    ]
  }
}




{
  "total_income": 170000000,
  "total_expense": 105000000,
  "current_balance": 65000000,
  "current_month": {
    "year": 2026,
    "month": 4,
    "income": 13828000,
    "expense": 7500000,
    "savings": 6328000,
    "savings_rate": 45.77
  },
  "top_categories": [
    {
      "category_id": "9b870dba-7323-4dfe-9da5-54dfef366f52",
      "category_name": "Entertainment",
      "total_amount": 60000000
    },
    {
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
      "category_name": "Ăn uống",
      "total_amount": 28500000
    },
    {
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
      "category_name": "Di chuyển",
      "total_amount": 16000000
    }
  ],
  "ai_insights": {
    "generated": true,
    "content": "Chi tiêu Entertainment chiếm tỷ trọng lớn nhất. Nên cân nhắc đặt ngân sách cứng cho danh mục này.",
    "generated_at": "2026-04-01T08:00:00.000Z"
  },
  "budget_alert": {
    "enabled": true,
    "alerts": [
      {
        "category_id": "9b870dba-7323-4dfe-9da5-54dfef366f52",
        "category_name": "Entertainment",
        "budget_limit": 5000000,
        "current_spent": 3200000,
        "percent_used": 64.0,
        "status": "warning",
        "alerted_at": "2026-04-10T08:00:00.000Z"
      }
    ],
    "last_checked": "2026-04-14T23:00:00.000Z"
  },
  "goal_tracking": {
    "goals": [
      {
        "goal_id": "goal-dat-001",
        "title": "Quỹ khẩn cấp 6 tháng",
        "target_amount": 50000000,
        "current_amount": 65000000,
        "deadline": "2026-06-30T00:00:00.000Z",
        "status": "completed",
        "note": "Đã vượt mục tiêu"
      },
      {
        "goal_id": "goal-dat-002",
        "title": "Giảm chi tiêu Entertainment",
        "target_amount": 4000000,
        "current_amount": 3200000,
        "deadline": "2026-04-30T00:00:00.000Z",
        "status": "in_progress",
        "note": "Đang trong ngưỡng kiểm soát"
      }
    ]
  },
  "streak": {
    "saving_months": 16,
    "unit": "months"
  }
}
```

---

### Anomaly Logs — Cập nhật log
```
PUT

http://localhost:3004/anomaly_logs/detail/{logId}
```
```json
{
  "type": "category_spike",
  "severity": "low",
  "description": "Chi tiêu danh mục 'Di chuyển' tháng 4/2026 tăng nhẹ 12% so với tháng trước. Trong ngưỡng bình thường.",
  "amount_flagged": 1205000,
  "expected_range": {
    "min": 870759,
    "max": 1221508
  },
  "is_read": true,
  "is_dismissed": false
}
```

### Anomaly Logs — Đánh dấu tất cả đã đọc (PATCH)
```
PATCH

http://localhost:3004/anomaly_logs/4f4b144d-e3f8-4e6b-9e32-408030a85698/read_all
```

### Anomaly Logs — Dismiss một log (PATCH)
```
PATCH

http://localhost:3004/anomaly_logs/detail/{logId}/dismiss
```

---

### Category Summary — Upsert
```
PUT

http://localhost:3004/category_summary/4f4b144d-e3f8-4e6b-9e32-408030a85698/upsert
```
```json
{
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
  "year": 2025,
  "month": 1,
  "total_amount": 999999999,
  "transaction_count": 30
}


{
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
  "year": 2025,
  "month": 1,
  "daily_breakdown": [
     {
      "day": 1,
      "amount": 40000,
      "trans_id": [
        "2c830d21-dde1-46e7-a3df-b1f73a74bb4e"
      ]
    },
    {
      "day": 4,
      "amount": 119000,
      "trans_id": [
        "81e4682b-b5b2-40f7-98e2-1d4e4b2b08a7",
        "35c88d92-d8f9-4989-8d86-f65ee0f73b73"
      ]
    },
    {
      "day": 5,
      "amount": 45000,
      "trans_id": [
        "9f5564e6-3f06-4bd5-99b9-74f74be1957e"
      ]
    },
    {
      "day": 8,
      "amount": 126000,
      "trans_id": [
        "f66bffea-98dc-41d3-ba19-96d63802e29d",
        "a3838f4a-5a91-46db-a07e-44fd8f119ec9",
        "2e0cb51f-e22e-4b59-8a7b-a946d8d200c5"
      ]
    },
    {
      "day": 10,
      "amount": 70000,
      "trans_id": [
        "36f915e5-0143-4c2a-b400-13c2ced30ef6"
      ]
    },
    {
      "day": 13,
      "amount": 77000,
      "trans_id": [
        "38cc8f90-b729-4770-b27d-c0c25b0cf12c"
      ]
    },
    {
      "day": 18,
      "amount": 145000,
      "trans_id": [
        "9eeb12e2-b040-4dec-a666-c6eb2b0c0a20",
        "758e8909-7755-4384-8029-e1a3c81852b8",
        "0a53fd84-e888-42e9-a993-7d71f06e94dd"
      ]
    },
    {
      "day": 19,
      "amount": 130000,
      "trans_id": [
        "17bcefe9-fb91-4bd8-88e0-6dd31189c503",
        "3f069411-ec4a-4f6e-b502-4e7ec4d58911"
      ]
    },
    {
      "day": 23,
      "amount": 35000,
      "trans_id": [
        "ff40b00c-99de-476e-a286-5ad86114d7f3"
      ]
    },
    {
      "day": 24,
      "amount": 65000,
      "trans_id": [
        "85678699-b29f-4918-9259-0a392dc5d91e"
      ]
    },
    {
      "day": 26,
      "amount": 89000,
      "trans_id": [
        "9b39f141-d59b-4907-a8f4-99230145ccca",
        "5766fc22-c838-4a3d-8b57-49eb73d7d493"
      ]
    },
    {
      "day": 27,
      "amount": 42000,
      "trans_id": [
        "95bf3933-6be2-41df-9aa4-184154f8257f",
        "31812de7-2d6c-4ff9-b4d0-f8ad8d02a915"
      ]
    },
    {
      "day": 29,
      "amount": 87000,
      "trans_id": [
        "83f19486-67cc-40ff-8432-019db19c76da",
        "97b2afe2-da77-4c8c-86c8-22484d940159"
      ]
    },
    {
      "day": 30,
      "amount": 43000,
      "trans_id": [
        "b14eaa92-112c-4976-b2f2-24f6a9452e05"
      ]
    },
    {
      "day": 31,
      "amount": 49000,
      "trans_id": [
        "2d75cc4f-2bdf-41e8-a63c-3981ff5b9aac"
      ]
    }

  ]
}
```

### Dashboard Cache — Upsert cache
```
PUT

http://localhost:3004/dashboard_cache/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
```json





```

### Monthly Report — Cập nhật theo _id
```
PUT

http://localhost:3004/monthly_reports/detail/{id}
```
```json
{
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "year": 2025,
  "month": 1,
  // cac field tùy chọn
  "summary": {
    "total_income": 13828000,
    "total_expense": 7500000,
    "savings": 6328000,
    "savings_rate": 45.77,
    "transaction_count": 75
  },
  "ai_report": {
    "generated": true,
    "content": "Tháng 4 chi tiêu giảm 8.18% so với tháng 3. Entertainment vẫn là danh mục lớn nhất nhưng đã được kiểm soát tốt hơn. Tiếp tục duy trì xu hướng này!"
  },
  "status": "reviewed"
}
```

---

### Spending Trend — Upsert
```
PUT

http://localhost:3004/spending_trends/4f4b144d-e3f8-4e6b-9e32-408030a85698/upsert
```
```json
{
  "account_id": "d722044d-7259-4a95-9a9f-930935073828",
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
  "category_name": "Di chuyển",
  "category_type": "expense",
  "monthly_data": [
    { "year": 2025, "month": 1,  "amount": 1162000 },
    { "year": 2025, "month": 2,  "amount": 1054000 },
    { "year": 2025, "month": 3,  "amount": 1119000 },
    { "year": 2025, "month": 4,  "amount": 1147000 },
    { "year": 2025, "month": 5,  "amount": 1046000 },
    { "year": 2025, "month": 6,  "amount": 1135000 },
    { "year": 2025, "month": 7,  "amount": 868000  },
    { "year": 2025, "month": 8,  "amount": 837000  },
    { "year": 2025, "month": 9,  "amount": 1292000 },
    { "year": 2025, "month": 10, "amount": 889000  },
    { "year": 2025, "month": 11, "amount": 1132000 },
    { "year": 2025, "month": 12, "amount": 1180000 },
    { "year": 2026, "month": 1,  "amount": 577000  },
    { "year": 2026, "month": 2,  "amount": 1179000 },
    { "year": 2026, "month": 3,  "amount": 1075000 },
    { "year": 2026, "month": 4,  "amount": 1100000 }
  ],
  "avg_monthly": 1023875.0,
  "trend": "stable",
  "total_months": 16,
  "total_transactions": 373
}
```

### Spending Trend — Cập nhật theo _id
```
PUT

http://localhost:3004/spending_trends/detail/{id}
```
```json
{
  "avg_monthly": 1023875.0,
  "trend": "stable",
  "total_months": 16,
  "total_transactions": 373,
  "monthly_data": [
    { "year": 2025, "month": 1,  "amount": 1162000 },
    { "year": 2025, "month": 2,  "amount": 1054000 },
    { "year": 2025, "month": 3,  "amount": 1119000 },
    { "year": 2025, "month": 4,  "amount": 1147000 },
    { "year": 2025, "month": 5,  "amount": 1046000 },
    { "year": 2025, "month": 6,  "amount": 1135000 },
    { "year": 2025, "month": 7,  "amount": 868000  },
    { "year": 2025, "month": 8,  "amount": 837000  },
    { "year": 2025, "month": 9,  "amount": 1292000 },
    { "year": 2025, "month": 10, "amount": 889000  },
    { "year": 2025, "month": 11, "amount": 1132000 },
    { "year": 2025, "month": 12, "amount": 1180000 },
    { "year": 2026, "month": 1,  "amount": 577000  },
    { "year": 2026, "month": 2,  "amount": 1179000 },
    { "year": 2026, "month": 3,  "amount": 1075000 },
    { "year": 2026, "month": 4,  "amount": 1100000 }
  ]
}
```

---

### Transactions — Cập nhật
```
PUT

http://localhost:3004/transactions/detail/trans-chau-test-001
```
```json
{
  "amount": 70000,
  "description": "Highlands Coffee - Quan 1 (updated)",
  "note": "Them banh mi"
}
```

---
<!-- 
## POST

### User Analytics — Tạo mới
```
POST

http://localhost:3004/user_analytics/4f4b144d-e3f8-4e6b-9e32-408030a85698
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
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
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

### Anomaly Logs — Tạo mới
```
POST

http://localhost:3004/anomaly_logs/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
```json
{
  "type": "category_spike",
  "severity": "high",
  "description": "Chi tieu Coffee tang 80% so voi thang truoc",
  "transaction_id": null,
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
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

### Category Summary — Tạo mới
```
POST

http://localhost:3004/category_summary/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
```json
{
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
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

### Monthly Report — Tạo mới
```
POST

http://localhost:3004/monthly_reports/4f4b144d-e3f8-4e6b-9e32-408030a85698
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
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
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
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
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

### Spending Trend — Tạo mới
```
POST

http://localhost:3004/spending_trends/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
```json
{
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
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

### Transactions — Tạo mới
```
POST

http://localhost:3004/transactions/4f4b144d-e3f8-4e6b-9e32-408030a85698
```
```json
{
  "trans_id": "trans-chau-test-001",
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
  "amount": 65000,
  "transaction_type": "expense",
  "description": "Highlands Coffee - Quan 1",
  "date": "2026-04-14T08:30:00.000Z",
  "note": "Ca phe buoi sang voi dong nghiep"
}
```

---



## DELETE

### User Analytics — Xóa
```
DELETE

http://localhost:3004/user_analytics/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Anomaly Logs — Xóa một log
```
DELETE

http://localhost:3004/anomaly_logs/detail/{logId}
```

### Anomaly Logs — Xóa tất cả
```
DELETE

http://localhost:3004/anomaly_logs/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Category Summary — Xóa một summary
```
DELETE

http://localhost:3004/category_summary/detail/{id}
```

### Category Summary — Xóa tất cả
```
DELETE

http://localhost:3004/category_summary/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Dashboard Cache — Invalidate cache
```
DELETE

http://localhost:3004/dashboard_cache/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Monthly Report — Xóa một report
```
DELETE

http://localhost:3004/monthly_reports/detail/{id}
```

### Monthly Report — Xóa tất cả
```
DELETE

http://localhost:3004/monthly_reports/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Spending Trend — Xóa một trend
```
DELETE

http://localhost:3004/spending_trends/detail/{id}
```

### Spending Trend — Xóa tất cả
```
DELETE

http://localhost:3004/spending_trends/4f4b144d-e3f8-4e6b-9e32-408030a85698
```

---

### Transactions — Xóa
```
DELETE

http://localhost:3004/transactions/detail/trans-chau-test-001
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
``` -->
