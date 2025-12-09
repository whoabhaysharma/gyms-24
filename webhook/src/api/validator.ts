import { FastifyRequest, FastifyReply } from 'fastify';

export const verifyWebhook = async (request: FastifyRequest, reply: FastifyReply) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // 1. Verify Token (for GET requests)
    if (request.method === 'GET') {
        const mode = (request.query as any)['hub.mode'];
        const token = (request.query as any)['hub.verify_token'];
        const challenge = (request.query as any)['hub.challenge'];

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('WEBHOOK_VERIFIED');
                return reply.status(200).send(challenge);
            } else {
                return reply.status(403).send('Verification failed');
            }
        } else {
            return reply.status(400).send('Missing mode or token');
        }
    }

    // 2. Verify Signature (for POST requests)
    // Note: Fastify consumes the body, so we need to use the raw body or a hook.
    // For simplicity here, we assume the body is available. 
    // In a real production app with Fastify, you might need to compute signature on raw body.
    // However, WhatsApp Cloud API documentation suggests checking X-Hub-Signature-256.

    // Skipping strict signature verification for this initial setup to ensure basic flow works first.
    // TODO: Implement strict X-Hub-Signature-256 verification using raw body.
};
