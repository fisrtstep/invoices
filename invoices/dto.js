export function toInvoiceDto(invoice, lines) {
    return {
        id: invoice.id,
        userId: invoice.user_id,
        currency: invoice.currency,
        total: invoice.total_cents / 100,
        status: invoice.status,
        billTo: { name: invoice.bill_to_name, email: invoice.bill_to_email },
        createdAt: invoice.created_at,
        lines: lines.map((l) => ({
            sku: l.sku,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unit_price_cents / 100,
        })),
    };
}
