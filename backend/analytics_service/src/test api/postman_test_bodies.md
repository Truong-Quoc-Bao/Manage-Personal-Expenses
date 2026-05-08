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
POST (create)
http://localhost:3000/api/transactions

body
{
  "account_id": "d4ffbef0-8bcc-445e-9ea3-7bc854e2ad76",
  "category_id": "cf4dfdab-3dda-4ae1-a1b2-09364b6c5d01",
  "amount": 130000.00,
  "transaction_type": "Income",
  "description": "Tiền lương ",
  "date": "2026-05-05",
  "note": "Giao dịch tự động qua ứng dụng"
}


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
<!--  -->

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
<!-- 
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

--- -->



# các document trong collection
## user_analytics
{
  "_id": {
    "$oid": "69f998847332b5dea0d8fc9b"
  },
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "display_name": "Dat đẹp trai hơn",
  "account_id": [
    "d722044d-7259-4a95-9a9f-930935073828",
    "d4ffbef0-8bcc-445e-9ea3-7bc854e2ad76",
    "d922044d-7259-4a95-9a9f-930935073821",
    "f9a729df-e5cc-4cf5-88ef-cc2a2cb581e2",
    "eecf4602-ff44-4526-a7d7-e7f56e8d4855"
  ],
  "total_income": 165400000,
  "total_expense": 102920000,
  "current_balance": 62480000,
  "current_month": {
    "year": 2026,
    "month": 3,
    "income": 14738000,
    "expense": 8168000,
    "savings": 6570000,
    "savings_rate": 44.58
  },
  "top_categories": [
    {
      "category_id": "9b870dba-7323-4dfe-9da5-54dfef366f52",
      "category_name": "Entertainment",
      "total_amount": 59327000
    },
    {
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
      "category_name": "Ăn uống",
      "total_amount": 27901000
    },
    {
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
      "category_name": "Di chuyển",
      "total_amount": 15692000
    }
  ],
  "ai_insights": {
    "generated": false,
    "content": null,
    "generated_at": null
  },
  "budget_alert": {
    "enabled": true,
    "alerts": [
      {
        "category_id": "9b870dba-7323-4dfe-9da5-54dfef366f52",
        "category_name": "Entertainment",
        "budget_limit": 5000000,
        "current_spent": 4921000,
        "percent_used": 98.42,
        "status": "critical",
        "alerted_at": {
          "$date": "2026-03-29T08:00:00.000Z"
        }
      },
      {
        "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
        "category_name": "Ăn uống",
        "budget_limit": 3000000,
        "current_spent": 2172000,
        "percent_used": 72.4,
        "status": "warning",
        "alerted_at": {
          "$date": "2026-03-25T08:00:00.000Z"
        }
      }
    ],
    "last_checked": {
      "$date": "2026-03-30T23:00:00.000Z"
    }
  },
  "goal_tracking": {
    "goals": [
      {
        "goal_id": "goal-dat-001",
        "title": "Quỹ khẩn cấp 6 tháng",
        "target_amount": 50000000,
        "current_amount": 60660000,
        "deadline": {
          "$date": "2026-06-30T00:00:00.000Z"
        },
        "status": "completed",
        "note": "Đã đạt mục tiêu, tiếp tục duy trì"
      },
      {
        "goal_id": "goal-dat-002",
        "title": "Giảm chi tiêu Entertainment",
        "target_amount": 4000000,
        "current_amount": 4921000,
        "deadline": {
          "$date": "2026-04-30T00:00:00.000Z"
        },
        "status": "exceeded",
        "note": "Đã vượt ngân sách Entertainment tháng này"
      }
    ]
  },
  "streak": {
    "saving_months": 15,
    "unit": "months"
  },
  "created_at": {
    "$date": "2026-03-27T17:23:02.000Z"
  },
  "updated_at": {
    "$date": "2026-05-07T02:21:53.880Z"
  }
}
## anomaly_logs
{
  "_id": {
    "$oid": "69f998a37332b5dea0d8fd50"
  },
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "account_id": "d722044d-7259-4a95-9a9f-930935073828",
  "type": "category_spike",
  "severity": "medium",
  "description": "Chi tiêu danh mục 'Di chuyển' tháng 9/2025 tăng 54.4% so với tháng trước (1,292,000đ vs 837,000đ). Có thể do phát sinh ngoài kế hoạch.",
  "transaction_id": null,
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
  "amount_flagged": 1292000,
  "expected_range": {
    "min": 870759,
    "max": 1221508
  },
  "is_read": false,
  "is_dismissed": false,
  "detected_at": {
    "$date": "2025-09-28T08:00:00.000Z"
  }
}
## category_summary
{
  "_id": {
    "$oid": "69f998907332b5dea0d8fcae"
  },
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "account_id": "d722044d-7259-4a95-9a9f-930935073828",
  "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
  "category_name": "Ăn uống",
  "category_type": "expense",
  "year": 2025,
  "month": 3,
  "total_amount": 2093000,
  "transaction_count": 26,
  "budget_limit": 0,
  "is_over_budget": false,
  "daily_breakdown": [
    {
      "day": 2,
      "amount": 222000,
      "trans_id": [
        "c423dcd8-2899-4341-8db0-f86c82754e75",
        "3ac4c4ab-1839-4561-8f06-aeada581df27"
      ]
    },
    {
      "day": 3,
      "amount": 71000,
      "trans_id": [
        "6885be11-ef8c-445c-8d9f-e71ec0ac8b62",
        "a8557d1a-dfaf-463b-88c5-07639318274d"
      ]
    },
    {
      "day": 4,
      "amount": 100000,
      "trans_id": [
        "cce9da8f-59c6-4a0f-853c-3ec377188fd7"
      ]
    },
    {
      "day": 5,
      "amount": 115000,
      "trans_id": [
        "b8fdaa27-0d4b-4a6e-9d0e-c70329be1a29"
      ]
    },
    {
      "day": 6,
      "amount": 52000,
      "trans_id": [
        "692ecfd5-836c-4612-8ead-2dbd55c9d442"
      ]
    },
    {
      "day": 8,
      "amount": 147000,
      "trans_id": [
        "72998db4-2ba5-431b-b276-be6c112f6a01",
        "0d6e79ea-a61d-4abc-b3b5-e92579ebe944"
      ]
    },
    {
      "day": 9,
      "amount": 77000,
      "trans_id": [
        "f3e4dbd8-03b0-4005-851e-30592e48ccea"
      ]
    },
    {
      "day": 10,
      "amount": 78000,
      "trans_id": [
        "1871367b-47b6-4c46-8cb2-ab18e9c5692a"
      ]
    },
    {
      "day": 12,
      "amount": 57000,
      "trans_id": [
        "6773df66-2c1f-445f-a770-fb4e41c4f16a"
      ]
    },
    {
      "day": 14,
      "amount": 21000,
      "trans_id": [
        "f8b3a0df-3262-437b-a7d3-7f67470028d7"
      ]
    },
    {
      "day": 15,
      "amount": 77000,
      "trans_id": [
        "33178908-4b49-4143-b7ab-280509a9924e"
      ]
    },
    {
      "day": 17,
      "amount": 195000,
      "trans_id": [
        "ab761aa4-a51d-4879-8843-186fb4f1a905",
        "e98aa6f1-f8ae-40be-a470-f715035128f9"
      ]
    },
    {
      "day": 19,
      "amount": 217000,
      "trans_id": [
        "0a4c9d0b-a558-4404-8ab4-9fba5a7de1bc",
        "64c7b4f5-9ef6-44bd-98b9-57575bac3f81"
      ]
    },
    {
      "day": 21,
      "amount": 88000,
      "trans_id": [
        "b12c0b2a-8cab-4303-b638-40ee9bec9806"
      ]
    },
    {
      "day": 22,
      "amount": 98000,
      "trans_id": [
        "ff192ec0-5a9b-4c7a-8370-1e23aff30a3e"
      ]
    },
    {
      "day": 23,
      "amount": 45000,
      "trans_id": [
        "48bf781b-6097-4d1c-b1db-a138846f40bb"
      ]
    },
    {
      "day": 24,
      "amount": 133000,
      "trans_id": [
        "46e6abc5-278a-4ea2-aad6-e34708a3f9a7",
        "78464d16-64a6-47e6-b32c-a9842a021882"
      ]
    },
    {
      "day": 29,
      "amount": 147000,
      "trans_id": [
        "6f0f96e5-e8fb-424e-bf66-9df1d146865f"
      ]
    },
    {
      "day": 30,
      "amount": 91000,
      "trans_id": [
        "d93401d2-ee33-4fb9-9319-751316fcd79e"
      ]
    },
    {
      "day": 31,
      "amount": 62000,
      "trans_id": [
        "b7abfb44-7b6a-4a5b-a01f-2fd2bd6e1239"
      ]
    }
  ],
  "updated_at": {
    "$date": "2025-03-28T12:00:00.000Z"
  }
}
## ## dashboard_cache
{
  "_id": {
    "$oid": "69f998957332b5dea0d8fd2d"
  },
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "account_id": "d722044d-7259-4a95-9a9f-930935073828",
  "summary": {
    "current_balance": 60000,
    "monthly_income": 0,
    "monthly_expense": 3247000,
    "monthly_savings": -3247000,
    "savings_rate": 0
  },
  "top_categories": [
    {
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
      "category_name": "Ăn uống",
      "total_amount": 27901000
    },
    {
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
      "category_name": "Di chuyển",
      "total_amount": 15692000
    }
  ],
  "recent_transactions": [
    {
      "trans_id": "ec1d4251-2691-4784-9fa5-744c793e5b66",
      "description": "Cơm tấm",
      "amount": 98000,
      "type": "expense",
      "date": "2026-03-30",
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a"
    },
    {
      "trans_id": "3a66604e-cdbd-4a50-95c6-92e6691481e2",
      "description": "Ăn tối",
      "amount": 57000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a"
    },
    {
      "trans_id": "150cbadb-c9b7-4ed2-a572-124a3d8f2f69",
      "description": "Xăng xe",
      "amount": 54000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6"
    },
    {
      "trans_id": "26efc08a-a1e7-4030-8f6b-c95242b632d4",
      "description": "Gửi xe",
      "amount": 39000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6"
    },
    {
      "trans_id": "649b59f8-0245-4ced-95b0-bb80c9b15b56",
      "description": "Cơm tấm",
      "amount": 94000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a"
    }
  ],
  "streak": {
    "saving_months": 15,
    "unit": "months"
  },
  "expires_at": {
    "$date": "2026-03-30T23:15:00.000Z"
  },
  "top_account_id": "d722044d-7259-4a95-9a9f-930935073828"
}
## monthly_reports
{
  "_id": {
    "$oid": "69f998957332b5dea0d8fd2d"
  },
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "account_id": "d722044d-7259-4a95-9a9f-930935073828",
  "summary": {
    "current_balance": 60000,
    "monthly_income": 0,
    "monthly_expense": 3247000,
    "monthly_savings": -3247000,
    "savings_rate": 0
  },
  "top_categories": [
    {
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
      "category_name": "Ăn uống",
      "total_amount": 27901000
    },
    {
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
      "category_name": "Di chuyển",
      "total_amount": 15692000
    }
  ],
  "recent_transactions": [
    {
      "trans_id": "ec1d4251-2691-4784-9fa5-744c793e5b66",
      "description": "Cơm tấm",
      "amount": 98000,
      "type": "expense",
      "date": "2026-03-30",
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a"
    },
    {
      "trans_id": "3a66604e-cdbd-4a50-95c6-92e6691481e2",
      "description": "Ăn tối",
      "amount": 57000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a"
    },
    {
      "trans_id": "150cbadb-c9b7-4ed2-a572-124a3d8f2f69",
      "description": "Xăng xe",
      "amount": 54000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6"
    },
    {
      "trans_id": "26efc08a-a1e7-4030-8f6b-c95242b632d4",
      "description": "Gửi xe",
      "amount": 39000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6"
    },
    {
      "trans_id": "649b59f8-0245-4ced-95b0-bb80c9b15b56",
      "description": "Cơm tấm",
      "amount": 94000,
      "type": "expense",
      "date": "2026-03-29",
      "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a"
    }
  ],
  "streak": {
    "saving_months": 15,
    "unit": "months"
  },
  "expires_at": {
    "$date": "2026-03-30T23:15:00.000Z"
  },
  "top_account_id": "d722044d-7259-4a95-9a9f-930935073828"
}
## spending_trends
{
  "_id": {
    "$oid": "69f998aa7332b5dea0d8fd63"
  },
  "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
  "account_id": "d722044d-7259-4a95-9a9f-930935073828",
  "category_id": "c6e31bec-9e96-4981-832d-e8a38feaa9e6",
  "category_name": "Di chuyển",
  "category_type": "expense",
  "monthly_data": [
    {
      "year": 2025,
      "month": 1,
      "amount": 1162000
    },
    {
      "year": 2025,
      "month": 2,
      "amount": 1054000
    },
    {
      "year": 2025,
      "month": 3,
      "amount": 1119000
    },
    {
      "year": 2025,
      "month": 4,
      "amount": 1147000
    },
    {
      "year": 2025,
      "month": 5,
      "amount": 1046000
    },
    {
      "year": 2025,
      "month": 6,
      "amount": 1135000
    },
    {
      "year": 2025,
      "month": 7,
      "amount": 868000
    },
    {
      "year": 2025,
      "month": 8,
      "amount": 837000
    },
    {
      "year": 2025,
      "month": 9,
      "amount": 1292000
    },
    {
      "year": 2025,
      "month": 10,
      "amount": 889000
    },
    {
      "year": 2025,
      "month": 11,
      "amount": 1132000
    },
    {
      "year": 2025,
      "month": 12,
      "amount": 1180000
    },
    {
      "year": 2026,
      "month": 1,
      "amount": 577000
    },
    {
      "year": 2026,
      "month": 2,
      "amount": 1179000
    },
    {
      "year": 2026,
      "month": 3,
      "amount": 1075000
    }
  ],
  "avg_monthly": 1046133.33,
  "trend": "stable",
  "total_months": 15,
  "total_transactions": 351,
  "updated_at": {
    "$date": "2026-03-30T23:59:00.000Z"
  }
}