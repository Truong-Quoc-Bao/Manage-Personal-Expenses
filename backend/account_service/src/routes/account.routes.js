const express = require('express');
const {
  CreateAccount,
  getAccountsController,
  updateAccountController,
  deleteAccountController,
  getTotalBalanceController,
} = require('../controllers/account.controller');
const validate = require('../middlewares/validation.middleware');
const accountService = require('../services/account.service');

const router = express.Router();
router.post('/', validate(), CreateAccount);
router.get('/', getAccountsController);
router.put('/', validate(), updateAccountController);
router.delete('/', deleteAccountController);
router.get('/total-balance', getTotalBalanceController);

// Internal endpoints for transaction-service
router.get('/internal/:accountId/status', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.query;
    const exists = await accountService.checkExistAccount(accountId, userId);
    res.json({ exists, message: exists ? 'Account exists' : 'Account not found' });
  } catch (error) {
    res.status(500).json({ exists: false, message: error.message });
  }
});

router.get('/internal/:accountId/display', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId } = req.query;
    const display = await accountService.getAccountDisplayService(accountId, userId);
    res.json({ found: display.found, account_name: display.account_name });
  } catch (error) {
    res.status(500).json({ found: false, account_name: '' });
  }
});

module.exports = router;
