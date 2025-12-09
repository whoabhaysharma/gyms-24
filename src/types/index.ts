export interface WhatsAppMessage {
    object: string;
    entry: {
        id: string;
        changes: {
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: {
                    profile: {
                        name: string;
                    };
                    wa_id: string;
                }[];
                messages?: {
                    from: string;
                    id: string;
                    timestamp: string;
                    text?: {
                        body: string;
                    };
                    type: string;
                    [key: string]: any;
                }[];
            };
            field: string;
        }[];
    }[];
}

export interface QueueJobData {
    type: 'incoming_message';
    payload: WhatsAppMessage;
}

export interface SendMessageRequest {
    to: string;
    message: string | any;
}

export interface InteractiveMessage {
    type: 'interactive';
    interactive: {
        type: 'list' | 'button' | 'cta_url';
        header?: {
            type: 'text' | 'video' | 'image' | 'document';
            text?: string;
            video?: { link: string };
            image?: { link: string };
            document?: { link: string };
        };
        body: {
            text: string;
        };
        footer?: {
            text: string;
        };
        action: {
            button?: string;
            buttons?: {
                type: 'reply';
                reply: {
                    id: string;
                    title: string;
                };
            }[];
            sections?: {
                title: string;
                rows: {
                    id: string;
                    title: string;
                    description?: string;
                }[];
            }[];
            name?: string;
            parameters?: {
                display_text: string;
                url: string;
            };
        };
    };
}
