db.user_analytics.insertMany([

  // ============================================================
  // USER 1: Lê Tấn Đạt
  // user_id : 4f4b144d-e3f8-4e6b-9e32-408030a85698
  // accounts: Tiền mặt | TP Bank | MB Bank | MB bank (new) | Le bank (new)
  // Kỳ dữ liệu: 2025-01 → 2026-03 (15 tháng, tháng nào cũng tiết kiệm dương)
  // total_income : 163,580,000 ₫
  // total_expense: 102,920,000 ₫  →  balance: +60,660,000 ₫
  // 2026-03: income 13,828,000 | expense 8,168,000 | savings 5,660,000 (40.93%)
  // top expense categories: Entertainment > Ăn uống > Di chuyển
  // ============================================================
  {
    "user_id": "4f4b144d-e3f8-4e6b-9e32-408030a85698",
    "display_name": "Lê Tấn Đạt",
    "account_id": [
      "d722044d-7259-4a95-9a9f-930935073828",
      "d4ffbef0-8bcc-445e-9ea3-7bc854e2ad76",
      "d922044d-7259-4a95-9a9f-930935073821",
      "f9a729df-e5cc-4cf5-88ef-cc2a2cb581e2",
      "eecf4602-ff44-4526-a7d7-e7f56e8d4855"
    ],
    "total_income": 163580000,
    "total_expense": 102920000,
    "current_balance": 60660000,
    "current_month": {
      "year": 2026,
      "month": 3,
      "income": 13828000,
      "expense": 8168000,
      "savings": 5660000,
      "savings_rate": 40.93
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
          "alerted_at": { "$date": "2026-03-29T08:00:00.000Z" }
        },
        {
          "category_id": "615b0d7a-5ace-4297-a404-0d67b7b0087a",
          "category_name": "Ăn uống",
          "budget_limit": 3000000,
          "current_spent": 2172000,
          "percent_used": 72.40,
          "status": "warning",
          "alerted_at": { "$date": "2026-03-25T08:00:00.000Z" }
        }
      ],
      "last_checked": { "$date": "2026-03-30T23:00:00.000Z" }
    },
    "goal_tracking": {
      "goals": [
        {
          "goal_id": "goal-dat-001",
          "title": "Quỹ khẩn cấp 6 tháng",
          "target_amount": 50000000,
          "current_amount": 60660000,
          "deadline": { "$date": "2026-06-30T00:00:00.000Z" },
          "status": "completed",
          "note": "Đã đạt mục tiêu, tiếp tục duy trì"
        },
        {
          "goal_id": "goal-dat-002",
          "title": "Giảm chi tiêu Entertainment",
          "target_amount": 4000000,
          "current_amount": 4921000,
          "deadline": { "$date": "2026-04-30T00:00:00.000Z" },
          "status": "exceeded",
          "note": "Đã vượt ngân sách Entertainment tháng này"
        }
      ]
    },
    "streak": {
      "saving_months": 15,
      "unit": "months"
    },
    "created_at": { "$date": "2026-03-27T17:23:02.000Z" },
    "updated_at": { "$date": "2026-03-30T23:59:00.000Z" }
  },

  // ============================================================
  // USER 2: Trương Gia Phúc
  // user_id : a9ae67d2-5615-488c-b56b-b9e425ca5a7b
  // accounts: Tiền mặt | ViettinBank
  // Kỳ dữ liệu: 2025-01 → 2026-03 (15 tháng, nhiều tháng âm)
  // total_income : 170,976,000 ₫
  // total_expense: 174,316,000 ₫  →  balance: -3,340,000 ₫ (thâm hụt)
  // 2026-03: income 11,811,000 | expense 9,588,000 | savings 2,223,000 (18.82%)
  // streak: 3 tháng liên tiếp tiết kiệm dương (2026-01/02/03)
  // top expense categories: Mua sắm > Du lịch > Food
  // ============================================================
  {
    "user_id": "a9ae67d2-5615-488c-b56b-b9e425ca5a7b",
    "display_name": "Trương Gia Phúc",
    "account_id": [
      "92408ebb-8c11-4bdf-a008-8ad2fcbc3686",
      "93408ebb-8c11-4bdf-a008-8ad2fcbc3687"
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
        "category_name": "Food",
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
          "budget_limit": 6000000,
          "current_spent": 7069000,
          "percent_used": 117.82,
          "status": "exceeded",
          "alerted_at": { "$date": "2026-03-27T08:00:00.000Z" }
        },
        {
          "category_id": "c8798f26-d478-4bd7-a1bc-7335850d8dd0",
          "category_name": "Food",
          "budget_limit": 3000000,
          "current_spent": 2519000,
          "percent_used": 83.97,
          "status": "warning",
          "alerted_at": { "$date": "2026-03-28T08:00:00.000Z" }
        }
      ],
      "last_checked": { "$date": "2026-03-30T23:00:00.000Z" }
    },
    "goal_tracking": {
      "goals": [
        {
          "goal_id": "goal-phuc-001",
          "title": "Bù đắp thâm hụt tổng",
          "target_amount": 3340000,
          "current_amount": 2223000,
          "deadline": { "$date": "2026-06-30T00:00:00.000Z" },
          "status": "in_progress",
          "note": "Đang thâm hụt 3.34tr, cần kiểm soát mua sắm"
        },
        {
          "goal_id": "goal-phuc-002",
          "title": "Giảm ngân sách Mua sắm xuống 5 triệu/tháng",
          "target_amount": 5000000,
          "current_amount": 7069000,
          "deadline": { "$date": "2026-04-30T00:00:00.000Z" },
          "status": "exceeded",
          "note": "Tháng 3 vẫn vượt mức, cần kỷ luật hơn"
        }
      ]
    },
    "streak": {
      "saving_months": 3,
      "unit": "months"
    },
    "created_at": { "$date": "2026-03-27T17:23:02.000Z" },
    "updated_at": { "$date": "2026-03-30T23:59:00.000Z" }
  }

]);
