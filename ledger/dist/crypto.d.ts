export type KeyPair = {
    publicKey: string;
    privateKey: string;
};
export declare function generateKeyPair(): KeyPair;
export declare function hashObject(value: unknown): string;
export declare function hmacFingerprint(rawFingerprint: string, secret: string): string;
export declare function signPayload(payload: unknown, privateKey: string): string;
export declare function verifySignature(payload: unknown, signature: string, publicKey: string): boolean;
