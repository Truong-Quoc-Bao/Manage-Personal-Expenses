// ============================================================
// FILE 1: aiValidators.js  (file mới hoàn toàn, chưa có trong project)
// Dùng để validate output AI trước khi đưa vào DB
// Import vào server.js: import { safeParseJSON, validateTransaction, validateCrudCommand } from './aiValidators.js';
// ============================================================

export function safeParseJSON(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export function validateTransaction(raw) {
  if (!raw || typeof raw !== 'object') return { valid: false, reason: 'Không phải object' };
  const errors = [];
  const amount = parseFloat(String(raw.amount || '').replace(/[^0-9.-]+/g, ''));
  if (isNaN(amount) || amount <= 0) errors.push('amount phải là số dương');
  if (amount > 10_000_000_000) errors.push('amount vượt 10 tỷ');
  const txType = raw.transaction_type || 'expense';
  if (!['income', 'expense'].includes(txType)) errors.push('transaction_type không hợp lệ');
  let finalDate = raw.date;
  if (!finalDate || /[^0-9\-]/.test(String(finalDate))) {
    finalDate = new Date().toISOString().split('T')[0];
  } else {
    const parsed = new Date(finalDate);
    if (isNaN(parsed.getTime())) {
      finalDate = new Date().toISOString().split('T')[0];
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (parsed > tomorrow) errors.push(`date '${finalDate}' là ngày tương lai — cần xác nhận`);
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      if (parsed < fiveYearsAgo) errors.push('date quá xa quá khứ (>5 năm)');
    }
  }
  const description = String(raw.description || '')
    .trim()
    .slice(0, 500);
  const categoryName = String(raw.category_name || '')
    .trim()
    .slice(0, 100);
  if (!description) errors.push('description rỗng');
  if (!categoryName) errors.push('category_name rỗng');
  if (/['";\\]/.test(categoryName)) errors.push('category_name chứa ký tự không hợp lệ');
  if (errors.length > 0) return { valid: false, reason: errors.join('; ') };
  return {
    valid: true,
    data: {
      amount,
      transaction_type: txType,
      date: finalDate,
      description,
      category_name: categoryName,
      account_id: parseInt(raw.account_id) || 1,
      note: String(raw.note || '').slice(0, 300),
    },
  };
}

export function validateCrudCommand(raw, type) {
  if (!raw || typeof raw !== 'object') return { valid: false, reason: 'Không phải object' };
  const id = parseInt(raw.id);
  if (!id || isNaN(id) || id <= 0) return { valid: false, reason: 'id phải là số nguyên dương' };
  if (type === 'update') {
    const updates = {};
    if (raw.amount !== undefined) {
      const amount = parseFloat(String(raw.amount).replace(/[^0-9.-]+/g, ''));
      if (isNaN(amount) || amount <= 0) return { valid: false, reason: 'amount không hợp lệ' };
      updates.amount = amount;
    }
    if (raw.description !== undefined)
      updates.description = String(raw.description).trim().slice(0, 500);
    if (Object.keys(updates).length === 0)
      return { valid: false, reason: 'Không có field nào để update' };
    return { valid: true, data: { id, ...updates } };
  }
  return { valid: true, data: { id } };
}
