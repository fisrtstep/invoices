import { timingSafeEqual } from 'node:crypto';

// Service-to-service auth: callers send the shared key in the x-service-key header.
export function internalAuth(req, res, next) {
    const expected = Buffer.from(process.env.INTERNAL_API_KEY ?? '');
    const given = Buffer.from(req.header('x-service-key') ?? '');
    if (expected.length === 0 || given.length !== expected.length || !timingSafeEqual(given, expected)) {
        return res.status(401).json({ error: 'Invalid or missing internal key' });
    }
    next();
}
