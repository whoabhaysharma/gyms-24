import { Job } from 'bullmq';
import { processJob } from '../src/workers/processor';
import * as WhatsAppService from '../src/services/whatsapp';
import * as BackendService from '../src/services/backend';

jest.mock('../src/services/whatsapp');
jest.mock('../src/services/backend');

describe('Worker Processor', () => {
    const mockJob = {
        data: {
            type: 'incoming_message',
            payload: {
                entry: [
                    {
                        changes: [
                            {
                                value: {
                                    messages: [
                                        {
                                            from: '1234567890',
                                            id: 'wamid.123',
                                            text: { body: 'Hello' },
                                        },
                                    ],
                                    contacts: [{ profile: { name: 'Test User' } }],
                                },
                            },
                        ],
                    },
                ],
            },
        },
    } as unknown as Job;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should process incoming message successfully', async () => {
        (BackendService.processUserMessage as jest.Mock).mockResolvedValue({ reply: 'Welcome' });

        await processJob(mockJob);

        expect(WhatsAppService.markAsRead).toHaveBeenCalledWith('wamid.123');
        expect(BackendService.processUserMessage).toHaveBeenCalledWith('1234567890', 'Hello', 'Test User');
        expect(WhatsAppService.sendMessage).toHaveBeenCalledWith('1234567890', 'Welcome');
    });

    it('should not send reply if backend returns no reply', async () => {
        (BackendService.processUserMessage as jest.Mock).mockResolvedValue({});

        await processJob(mockJob);

        expect(WhatsAppService.sendMessage).not.toHaveBeenCalled();
    });

    it('should throw error if backend fails', async () => {
        (BackendService.processUserMessage as jest.Mock).mockRejectedValue(new Error('Backend Error'));

        await expect(processJob(mockJob)).rejects.toThrow('Backend Error');
    });
});
