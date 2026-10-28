import iamPool from '../db/iamPool.js';

// Billing details come straight from IAM's users table (read replica) instead of an API call.
// This couples invoices to IAM's schema: renaming or dropping these columns breaks us.
export async function findBillingCustomer(userId) {
    const { rows } = await iamPool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    if (!rows[0]) return null;
    return { name: rows[0].full_name, email: rows[0].email };
}
