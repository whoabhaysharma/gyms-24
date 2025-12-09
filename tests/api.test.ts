import Fastify, { FastifyInstance } from 'fastify';
import routes from '../src/api/routes';
import * as messageQueue from '../src/queues/messageQueue';
import * as whatsappService from '../src/services/whatsapp';

// Mock the queue module
jest.mock('../src/queues/messageQueue');
// Mock the whatsapp service
jest.mock('../src/services/whatsapp');

describe('API Routes', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = Fastify();
        server.register(routes);
        await server.ready();
    });

    afterAll(async () => {
        await server.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /health', () => {
        it('should return 200 OK', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health',
            });
            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({ status: 'ok' });
        });
    });

    describe('GET /webhook (Verification)', () => {
        it('should verify token and return challenge', async () => {
            process.env.VERIFY_TOKEN = 'test-token';
            const challenge = '12345';

            const response = await server.inject({
                method: 'GET',
                url: '/webhook',
                query: {
                    'hub.mode': 'subscribe',
                    'hub.verify_token': 'test-token',
                    'hub.challenge': challenge,
                },
            });

            expect(response.statusCode).toBe(200);
            expect(response.payload).toBe(challenge);
        });

        it('should return 403 if token is invalid', async () => {
            process.env.VERIFY_TOKEN = 'test-token';

            const response = await server.inject({
                method: 'GET',
                url: '/webhook',
                query: {
                    'hub.mode': 'subscribe',
                    'hub.verify_token': 'wrong-token',
                    'hub.challenge': '12345',
                },
            });

            expect(response.statusCode).toBe(403);
        });
    });

    describe('POST /webhook (Ingestion)', () => {
        const validMessage = {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: '12345',
                    changes: [
                        {
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: { display_phone_number: '123', phone_number_id: '123' },
                                messages: [{ from: '123', id: 'wamid.123', timestamp: '123', type: 'text', text: { body: 'hello' } }],
                            },
                            field: 'messages',
                        },
                    ],
                },
            ],
        };

        it('should accept valid message and add to queue', async () => {
            (messageQueue.addMessageToQueue as jest.Mock).mockResolvedValue(undefined);

            const response = await server.inject({
                method: 'POST',
                url: '/webhook',
                payload: validMessage,
            });

            expect(response.statusCode).toBe(200);
            expect(response.payload).toBe('EVENT_RECEIVED');
            expect(messageQueue.addMessageToQueue).toHaveBeenCalledWith(validMessage);
        });

        it('should return 500 if queue fails', async () => {
            (messageQueue.addMessageToQueue as jest.Mock).mockRejectedValue(new Error('Queue Error'));

            const response = await server.inject({
                method: 'POST',
                url: '/webhook',
                payload: validMessage,
            });

            expect(response.statusCode).toBe(500);
        });

        it('should return 404 for invalid object', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/webhook',
                payload: { object: null },
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /messages (Send Message)', () => {
        it('should send message successfully', async () => {
            (whatsappService.sendMessage as jest.Mock).mockResolvedValue({ success: true });

            const response = await server.inject({
                method: 'POST',
                url: '/messages',
                payload: {
                    to: '1234567890',
                    message: 'Hello World',
                },
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({ success: true });
            expect(whatsappService.sendMessage).toHaveBeenCalledWith('1234567890', 'Hello World');
        });

        it('should return 400 if fields are missing', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/messages',
                payload: {
                    to: '1234567890',
                    // message missing
                },
            });

            expect(response.statusCode).toBe(400);
        });
        it('should send interactive message successfully', async () => {
            (whatsappService.sendMessage as jest.Mock).mockResolvedValue({ success: true });

            const interactiveMessage = {
                type: 'interactive',
                interactive: {
                    type: 'cta_url',
                    body: { text: 'Click me' },
                    action: { name: 'cta_url', parameters: { display_text: 'Visit', url: 'https://example.com' } }
                }
            };

            const response = await server.inject({
                method: 'POST',
                url: '/messages',
                payload: {
                    to: '1234567890',
                    message: interactiveMessage,
                },
            });

            expect(response.statusCode).toBe(200);
            expect(whatsappService.sendMessage).toHaveBeenCalledWith('1234567890', interactiveMessage);
        });
    });
});
