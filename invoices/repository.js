import pool from '../db/pool.js';

export async function insertInvoice({ userId, currency, totalCents, billTo, lines }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            'INSERT INTO invoices (user_id, currency, total_cents, bill_to_name, bill_to_email, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, currency, totalCents, billTo.name, billTo.email, new Date().toISOString()],
        );
        const invoice = rows[0];
        for (const line of lines) {
            await client.query(
                'INSERT INTO invoice_lines (invoice_id, sku, description, quantity, unit_price_cents) VALUES ($1, $2, $3, $4, $5)',
                [invoice.id, line.sku, line.description, line.quantity, line.unitPriceCents],
            );
        }
        await client.query('COMMIT');
        return invoice;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function getInvoice(id) {
    const { rows } = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    return rows[0] ?? null;
}

export async function getLines(invoiceId) {
    const { rows } = await pool.query('SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY id', [invoiceId]);
    return rows;
}

export async function listByUser(userId) {
    const { rows } = await pool.query('SELECT * FROM invoices WHERE user_id = $1 ORDER BY id DESC LIMIT 50', [userId]);
    return rows;
}
