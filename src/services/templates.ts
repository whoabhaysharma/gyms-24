export const createCTAUrlContent = (bodyText: string, buttonText: string, url: string, headerText?: string, footerText?: string) => {
    const content: any = {
        type: 'interactive',
        interactive: {
            type: 'cta_url',
            body: {
                text: bodyText,
            },
            action: {
                name: 'cta_url',
                parameters: {
                    display_text: buttonText,
                    url: url,
                },
            },
        },
    };

    if (headerText) {
        content.interactive.header = {
            type: 'text',
            text: headerText,
        };
    }

    if (footerText) {
        content.interactive.footer = {
            text: footerText,
        };
    }

    return content;
};

export const createReplyButtonContent = (bodyText: string, buttons: { id: string; title: string }[], headerText?: string, footerText?: string) => {
    const content: any = {
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: bodyText,
            },
            action: {
                buttons: buttons.map((btn) => ({
                    type: 'reply',
                    reply: {
                        id: btn.id,
                        title: btn.title,
                    },
                })),
            },
        },
    };

    if (headerText) {
        content.interactive.header = {
            type: 'text',
            text: headerText,
        };
    }

    if (footerText) {
        content.interactive.footer = {
            text: footerText,
        };
    }

    return content;
};

export const createListContent = (
    bodyText: string,
    buttonText: string,
    sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
    headerText?: string,
    footerText?: string
) => {
    const content: any = {
        type: 'interactive',
        interactive: {
            type: 'list',
            body: {
                text: bodyText,
            },
            action: {
                button: buttonText,
                sections: sections.map((section) => ({
                    title: section.title,
                    rows: section.rows.map((row) => ({
                        id: row.id,
                        title: row.title,
                        description: row.description,
                    })),
                })),
            },
        },
    };

    if (headerText) {
        content.interactive.header = {
            type: 'text',
            text: headerText,
        };
    }

    if (footerText) {
        content.interactive.footer = {
            text: footerText,
        };
    }

    return content;
};
