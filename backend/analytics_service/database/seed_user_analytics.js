// =============================================================
// Collection: user_analytics
// Mapping từ accounts collection:
//   Trần Thiện Châu    → accounts: 7dc770af, a534f72c
//   Phạm Ngọc Bảo Phúc → accounts: d722044d, e5217da4, d922044d, a934f72c, d4ffbef0
//   Trương Quốc Bảo    → accounts: a834f72c, e8217da4
//   Lê Tấn Đạt         → accounts: 93408ebb, 92408ebb
//
// Số liệu tổng hợp = cộng gộp tất cả account thuộc user
// user_id dùng UUID từ accounts collection (không dùng "user_xxx" nữa)
// =============================================================

db.user_analytics.insertMany([

  // ─── Trần Thiện Châu ─────────────────────────────────────────
  // accounts: 7dc770af (chỉ expense, chủ yếu Ăn uống + Di chuyển)
  //           a534f72c (chỉ expense, chủ yếu Cà phê & Đồ uống)
  {
    "user_id": "7cb96e5d-3cd9-40dc-ad99-635f08456301",
    "display_name": "Trần Thiện Châu",
    "account_id": [
      "7dc770af-615f-48a7-9c24-8baa3caf5571",
      "a534f72c-cac3-4387-8ec6-358438385953"
    ],
    "total_income": 0,
    "total_expense": 36290000,
    "current_balance": -36290000,
    "current_month": {
      "year": 2026,
      "month": 3,
      "income": 0,
      "expense": 2199000,
      "savings": -2199000,
      "savings_rate": 0
    },
    "top_categories": [
      {
        "category_id": "970eb25c-2af8-44f3-a762-a4b9a218668e",
        "category_name": "Ăn uống",
        "total_amount": 14495000
      },
      {
        "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
        "category_name": "Cà phê & Đồ uống",
        "total_amount": 14351000
      },
      {
        "category_id": "7b926e06-f682-4e15-a412-554daa9b012d",
        "category_name": "Di chuyển",
        "total_amount": 7444000
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
          "category_id": "13a008d9-04c7-498f-9557-8dcbed643cb1",
          "category_name": "Cà phê & Đồ uống",
          "budget_limit": 1000000,
          "current_spent": 670000,
          "percent_used": 67.0,
          "status": "warning",
          "alerted_at": { "$date": "2026-03-25T08:00:00.000Z" }
        },
        {
          "category_id": "970eb25c-2af8-44f3-a762-a4b9a218668e",
          "category_name": "Ăn uống",
          "budget_limit": 2000000,
          "current_spent": 1529000,
          "percent_used": 76.45,
          "status": "warning",
          "alerted_at": { "$date": "2026-03-28T08:00:00.000Z" }
        }
      ],
      "last_checked": { "$date": "2026-03-30T23:00:00.000Z" }
    },
    "goal_tracking": {
      "goals": [
        {
          "goal_id": "goal-chau-001",
          "title": "Tiết kiệm 3 tháng chi phí",
          "target_amount": 5000000,
          "current_amount": 0,
          "deadline": { "$date": "2026-06-30T00:00:00.000Z" },
          "status": "in_progress",
          "note": "Cần cắt giảm cà phê và ăn uống ngoài"
        }
      ]
    },
    "streak": {
      "saving_months": 0,
      "unit": "months"
    },
    "created_at": { "$date": "2025-01-01T00:00:00.000Z" },
    "updated_at": { "$date": "2026-03-30T23:59:00.000Z" }
  },

  // ─── Phạm Ngọc Bảo Phúc ──────────────────────────────────────
  // accounts: d722044d (Ăn uống + Di chuyển)
  //           e5217da4 (Mua sắm nhiều)
  //           d922044d (Giải trí)
  //           a934f72c (Game & Ứng dụng)
  //           d4ffbef0 (Giải trí + có income)
  {
    "user_id": "a9ae67d2-5615-488c-b56b-b9e425ca5a7b",
    "display_name": "Phạm Ngọc Bảo Phúc",
    "account_id": [
      "d722044d-7259-4a95-9a9f-930935073828",
      "e5217da4-46b7-434f-ba84-69aab89f0dd2",
      "d922044d-7259-4a95-9a9f-930935073821",
      "a934f72c-cac3-4387-8ec6-358438385955",
      "d4ffbef0-8bcc-445e-9ea3-7bc854e2ad76"
    ],
    "total_income": 163580000,
    "total_expense": 178474000,
    "current_balance": -14894000,
    "current_month": {
      "year": 2026,
      "month": 3,
      "income": 13828000,
      "expense": 15368000,
      "savings": -1540000,
      "savings_rate": 0
    },
    "top_categories": [
      {
        "category_id": "87880d53-4827-4f06-8b0c-9c62de6692d9",
        "category_name": "Mua sắm",
        "total_amount": 53949000
      },
      {
        "category_id": "d990a4a7-a436-4a6c-895e-0e71c2bbe88e",
        "category_name": "Mua sắm",
        "total_amount": 34951000
      },
      {
        "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
        "category_name": "Ăn uống",
        "total_amount": 27901000
      },
      {
        "category_id": "9b870dba-7323-4dfe-9da5-54dfef366f52",
        "category_name": "Giải trí",
        "total_amount": 59327000
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
          "category_id": "87880d53-4827-4f06-8b0c-9c62de6692d9",
          "category_name": "Mua sắm",
          "budget_limit": 3000000,
          "current_spent": 5025000,
          "percent_used": 167.5,
          "status": "exceeded",
          "alerted_at": { "$date": "2026-03-15T08:00:00.000Z" }
        },
        {
          "category_id": "9b870dba-7323-4dfe-9da5-54dfef366f52",
          "category_name": "Giải trí",
          "budget_limit": 2000000,
          "current_spent": 2509000,
          "percent_used": 125.45,
          "status": "exceeded",
          "alerted_at": { "$date": "2026-03-20T08:00:00.000Z" }
        }
      ],
      "last_checked": { "$date": "2026-03-30T23:00:00.000Z" }
    },
    "goal_tracking": {
      "goals": [
        {
          "goal_id": "goal-phuc-001",
          "title": "Mua laptop mới",
          "target_amount": 25000000,
          "current_amount": 8000000,
          "deadline": { "$date": "2026-12-31T00:00:00.000Z" },
          "status": "in_progress",
          "note": "Đang tiết kiệm dần, cần giảm mua sắm online"
        },
        {
          "goal_id": "goal-phuc-002",
          "title": "Quỹ khẩn cấp 6 tháng",
          "target_amount": 30000000,
          "current_amount": 0,
          "deadline": { "$date": "2026-09-30T00:00:00.000Z" },
          "status": "not_started",
          "note": "Ưu tiên sau khi trả hết nợ"
        }
      ]
    },
    "streak": {
      "saving_months": 0,
      "unit": "months"
    },
    "created_at": { "$date": "2025-01-01T00:00:00.000Z" },
    "updated_at": { "$date": "2026-03-30T23:59:00.000Z" }
  },

  // ─── Trương Quốc Bảo ─────────────────────────────────────────
  // accounts: a834f72c (có income freelance, chi Game + Tiện ích)
  //           e8217da4 (có income lương, chi Mua sắm)
  {
    "user_id": "bf6e8290-b4c9-448e-82d1-c80b418b2f75",
    "display_name": "Trương Quốc Bảo",
    "account_id": [
      "a834f72c-cac3-4387-8ec6-358438385954",
      "e8217da4-46b7-434f-ba84-69aab89f0dd0"
    ],
    "total_income": 278538000,
    "total_expense": 83185000,
    "current_balance": 195353000,
    "current_month": {
      "year": 2026,
      "month": 3,
      "income": 22426000,
      "expense": 5419000,
      "savings": 17007000,
      "savings_rate": 75.84
    },
    "top_categories": [
      {
        "category_id": "87880d53-4827-4f06-8b0c-9c62de6692d9",
        "category_name": "Mua sắm",
        "total_amount": 53011000
      },
      {
        "category_id": "bc0f56d8-1a77-4024-93d8-ae709d297cc7",
        "category_name": "Game & Ứng dụng",
        "total_amount": 26784000
      },
      {
        "category_id": "1117481a-dd27-4615-9201-9a1cfec45c0e",
        "category_name": "Hóa đơn & Tiện ích",
        "total_amount": 3390000
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
          "category_id": "bc0f56d8-1a77-4024-93d8-ae709d297cc7",
          "category_name": "Game & Ứng dụng",
          "budget_limit": 500000,
          "current_spent": 368000,
          "percent_used": 73.6,
          "status": "warning",
          "alerted_at": { "$date": "2026-03-28T08:00:00.000Z" }
        }
      ],
      "last_checked": { "$date": "2026-03-30T23:00:00.000Z" }
    },
    "goal_tracking": {
      "goals": [
        {
          "goal_id": "goal-bao-001",
          "title": "Mua xe máy",
          "target_amount": 45000000,
          "current_amount": 30000000,
          "deadline": { "$date": "2026-08-01T00:00:00.000Z" },
          "status": "in_progress",
          "note": "Đã tiết kiệm được 30 triệu, cần thêm 15 triệu"
        },
        {
          "goal_id": "goal-bao-002",
          "title": "Du lịch Nhật Bản",
          "target_amount": 40000000,
          "current_amount": 40000000,
          "deadline": { "$date": "2026-05-01T00:00:00.000Z" },
          "status": "completed",
          "note": "Đã đủ tiền, đặt vé tháng 4"
        }
      ]
    },
    "streak": {
      "saving_months": 15,
      "unit": "months"
    },
    "created_at": { "$date": "2025-01-01T00:00:00.000Z" },
    "updated_at": { "$date": "2026-03-30T23:59:00.000Z" }
  },

  // ─── Lê Tấn Đạt ──────────────────────────────────────────────
  // accounts: 93408ebb (có income lương, chi Mua sắm + Du lịch)
  //           92408ebb (không có income, chi Ăn uống + Du lịch)
  {
    "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
    "display_name": "Lê Tấn Đạt",
    "account_id": [
      "93408ebb-8c11-4bdf-a008-8ad2fcbc3687",
      "92408ebb-8c11-4bdf-a008-8ad2fcbc3686"
    ],
    "total_income": 170976000,
    "total_expense": 174316000,
    "current_balance": -3340000,
    "current_month": {
      "year": 2026,
      "month": 3,
      "income": 11811000,
      "expense": 9588000,
      "savings": 2223000,
      "savings_rate": 18.82
    },
    "top_categories": [
      {
        "category_id": "d990a4a7-a436-4a6c-895e-0e71c2bbe88e",
        "category_name": "Mua sắm",
        "total_amount": 102856000
      },
      {
        "category_id": "a7b488f0-14bb-4fb0-9aff-3296ebd9ec9b",
        "category_name": "Du lịch",
        "total_amount": 41445000
      },
      {
        "category_id": "c8798f26-d478-4bd7-a1bc-7335850d8dd0",
        "category_name": "Ăn uống",
        "total_amount": 30015000
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
          "category_id": "d990a4a7-a436-4a6c-895e-0e71c2bbe88e",
          "category_name": "Mua sắm",
          "budget_limit": 5000000,
          "current_spent": 7069000,
          "percent_used": 141.38,
          "status": "exceeded",
          "alerted_at": { "$date": "2026-03-22T08:00:00.000Z" }
        },
        {
          "category_id": "a7b488f0-14bb-4fb0-9aff-3296ebd9ec9b",
          "category_name": "Du lịch",
          "budget_limit": 2000000,
          "current_spent": 2519000,
          "percent_used": 125.95,
          "status": "exceeded",
          "alerted_at": { "$date": "2026-03-18T08:00:00.000Z" }
        }
      ],
      "last_checked": { "$date": "2026-03-30T23:00:00.000Z" }
    },
    "goal_tracking": {
      "goals": [
        {
          "goal_id": "goal-dat-001",
          "title": "Quỹ du lịch năm 2026",
          "target_amount": 20000000,
          "current_amount": 11000000,
          "deadline": { "$date": "2026-12-01T00:00:00.000Z" },
          "status": "in_progress",
          "note": "Dự định đi 2-3 chuyến trong năm"
        },
        {
          "goal_id": "goal-dat-002",
          "title": "Trả nợ thẻ tín dụng",
          "target_amount": 15000000,
          "current_amount": 15000000,
          "deadline": { "$date": "2026-03-31T00:00:00.000Z" },
          "status": "completed",
          "note": "Đã trả hết tháng 3"
        }
      ]
    },
    "streak": {
      "saving_months": 7,
      "unit": "months"
    },
    "created_at": { "$date": "2025-01-01T00:00:00.000Z" },
    "updated_at": { "$date": "2026-03-30T23:59:00.000Z" }
  }

]);
