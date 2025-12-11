import { randomBytes, randomInt } from 'crypto';

export const generateAccessCode = (length: number = 6): string => {
    const charset = '2346789ABCDEFGHJKLMNPQRTUVWXYZ'; // Removed 0, 1, 5, I, O, S to avoid confusion
    let code = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = randomInt(0, charset.length);
        code += charset[randomIndex];
    }
    return code;
};

export const generateReferralCode = (): string => {
    return randomBytes(4).toString('hex').toUpperCase();
};
