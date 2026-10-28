import express from 'express';
import { internalAuth } from '../middleware/internalAuth.js';
import { findBillingCustomer } from '../billing/customerLookup.js';
import { toInvoiceDto } from './dto.js';
import { insertInvoice, getInvoice, getLines, listByUser } from './repository.js';

const invoicesRouter = express.Router();
invoicesRouter.use(internalAuth);

function validateCreate(body) {
    const { userId, currency, lines } = body ?? {};
    if (!Number.isInteger(userId)) return 'userId must be an integer';
    if (typeof currency !== 'string' || currency.length !== 3) return 'currency must be a 3-letter code';
    if (!Array.isArray(lines) || lines.length === 0) return 'lines must be a non-empty array';
    for (const l of lines) {
        if (typeof l.sku !== 'string' || typeof l.description !== 'string') return 'each line needs sku and description';
        if (!Number.isInteger(l.quantity) || l.quantity < 1) return 'each line needs a positive integer quantity';
        if (typeof l.unitPrice !== 'number' || l.unitPrice < 0) return 'each line needs a non-negative unitPrice';
    }
    return null;
}

// POST /invoices { userId, currency, lines: [{ sku, description, quantity, unitPrice }] } -> Invoice
invoicesRouter.post('', async (req, res, next) => {
    try {
        const problem = validateCreate(req.body);
        if (problem) return res.status(400).json({ error: problem });

        const { userId, currency, lines } = req.body;
        const billTo = await findBillingCustomer(userId);
        if (!billTo) return res.status(422).json({ error: 'Unknown customer' });

        const priced = lines.map((l) => ({ ...l, unitPriceCents: Math.round(l.unitPrice * 100) }));
        const totalCents = priced.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
        const invoice = await insertInvoice({ userId, currency, totalCents, billTo, lines: priced });
        res.status(201).json(toInvoiceDto(invoice, await getLines(invoice.id)));
    } catch (err) {
        next(err);
    }
});

// GET /invoices?userId= -> Invoice[]
invoicesRouter.get('', async (req, res, next) => {
    try {
        const userId = Number(req.query.userId);
        if (!Number.isInteger(userId)) return res.status(400).json({ error: 'userId is required' });
        const rows = await listByUser(userId);
        const items = await Promise.all(rows.map(async (r) => toInvoiceDto(r, await getLines(r.id))));
        res.json({ items });
    } catch (err) {
        next(err);
    }
});

// GET /invoices/:id -> Invoice
invoicesRouter.get('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });
        const invoice = await getInvoice(id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(toInvoiceDto(invoice, await getLines(id)));
    } catch (err) {
        next(err);
    }
});

export default invoicesRouter;
