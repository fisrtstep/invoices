CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    currency TEXT NOT NULL,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'issued',
    bill_to_name TEXT NOT NULL,
    bill_to_email TEXT NOT NULL,
    created_at TEXT NOT NULL
);
