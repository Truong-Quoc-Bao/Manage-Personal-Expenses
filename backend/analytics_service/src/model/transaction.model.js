const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactions = new Schema(
  {
    trans_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      comment: "UUID – primary key",
    },

    user_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – owner of the transaction",
    },

    account_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – account the transaction belongs to",
    },

    category_id: {
      type: String,
      required: true,
      trim: true,
      comment: "UUID – spending / income category",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      comment: "Transaction amount in VND (always positive)",
    },

    transaction_type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      comment: "'income' | 'expense'",
    },

    description: {
      type: String,
      default: null,
      trim: true,
      comment: "Short label entered by the user (e.g. 'Grab food', 'Lương')",
    },

    date: {
      type: String,
      required: true,
      comment: "Calendar date of the transaction – stored as 'YYYY-MM-DD' string",
    },

    note: {
      type: String,
      default: null,
      trim: true,
      comment: "Optional free-text note",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "transactions",
    versionKey: false,
  }
);

transactions.index({ trans_id: 1 }, { unique: true, name: "idx_trans_id_unique" });
transactions.index({ user_id: 1 }, { name: "idx_transactions_user_id" });
transactions.index({ account_id: 1 }, { name: "idx_transactions_account_id" });
transactions.index({ category_id: 1 }, { name: "idx_transactions_category_id" });
transactions.index({ date: -1 }, { name: "idx_transactions_date_desc" });
transactions.index({ user_id: 1, date: -1 }, { name: "idx_transactions_user_date" });
transactions.index({ account_id: 1, date: -1 }, { name: "idx_transactions_account_date" });
transactions.index(
  { user_id: 1, transaction_type: 1, date: -1 },
  { name: "idx_transactions_user_type_date" }
);
transactions.index(
  { account_id: 1, category_id: 1, date: -1 },
  { name: "idx_transactions_account_cat_date" }
);

const Transaction = mongoose.model("Transaction", transactions);

module.exports = Transaction;
