import axios from 'axios';

const mockPost = jest.fn();
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        post: mockPost,
        defaults: { headers: {} },
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    })),
}));

import { sendMessage, markAsRead } from '../src/services/whatsapp';
import { processUserMessage } from '../src/services/backend';

describe('Services', () => {
    // const mockPost = jest.fn(); // Defined above to be used in factory

    // beforeAll removed as mock is set up in factory

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('WhatsApp Service', () => {
        it('sendMessage should call axios.post with text message', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });

            await sendMessage('1234567890', 'Hello');

            expect(mockPost).toHaveBeenCalledWith('/messages', {
                messaging_product: 'whatsapp',
                to: '1234567890',
                type: 'text',
                text: { body: 'Hello' },
            });
        });

        it('sendMessage should call axios.post with interactive message', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });

            const interactiveContent = {
                type: 'interactive',
                interactive: { type: 'cta_url' }
            };

            await sendMessage('1234567890', interactiveContent);

            expect(mockPost).toHaveBeenCalledWith('/messages', {
                messaging_product: 'whatsapp',
                to: '1234567890',
                type: 'interactive',
                interactive: { type: 'cta_url' }
            });
        });

        it('sendMessage should call axios.post with list message', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });

            const listMessage = {
                type: 'interactive',
                interactive: {
                    type: 'list',
                    header: { type: 'text', text: 'Header' },
                    body: { text: 'Body' },
                    footer: { text: 'Footer' },
                    action: {
                        button: 'Main Button',
                        sections: [
                            {
                                title: 'Section 1',
                                rows: [{ id: 'row1', title: 'Row 1', description: 'Desc 1' }]
                            }
                        ]
                    }
                }
            };

            await sendMessage('1234567890', listMessage);

            expect(mockPost).toHaveBeenCalledWith('/messages', {
                messaging_product: 'whatsapp',
                to: '1234567890',
                ...listMessage
            });
        });

        it('sendMessage should call axios.post with reply button message', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });

            const buttonMessage = {
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text: 'Body' },
                    action: {
                        buttons: [
                            { type: 'reply', reply: { id: 'btn1', title: 'Yes' } },
                            { type: 'reply', reply: { id: 'btn2', title: 'No' } }
                        ]
                    }
                }
            };

            await sendMessage('1234567890', buttonMessage);

            expect(mockPost).toHaveBeenCalledWith('/messages', {
                messaging_product: 'whatsapp',
                to: '1234567890',
                ...buttonMessage
            });
        });
        it('markAsRead should call axios.post', async () => {
            mockPost.mockResolvedValue({ data: { success: true } });

            await markAsRead('wamid.123');

            expect(mockPost).toHaveBeenCalledWith('/messages', {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: 'wamid.123',
            });
        });
    });

    describe('Backend Service', () => {
        it('processUserMessage should call axios.post', async () => {
            mockPost.mockResolvedValue({ data: { reply: 'Hi there' } });

            const result = await processUserMessage('1234567890', 'Hello', 'Test User');

            expect(mockPost).toHaveBeenCalledWith('/whatsapp/process', {
                from: '1234567890',
                message: 'Hello',
                name: 'Test User',
            });
            expect(result).toEqual({ reply: 'Hi there' });
        });
    });
});
