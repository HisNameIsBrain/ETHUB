export interface Account {
    id: string;
    publicKey: string;
    fingerprintHash: string;
    createdAt: string;
}
export interface Transaction {
    id: string;
    from: string | null;
    to: string;
    amount: string;
    nonce: number;
    timestamp: string;
    fingerprintHash: string;
    signature: string;
    publicKey: string;
}
export interface Block {
    index: number;
    previousHash: string;
    hash: string;
    timestamp: string;
    transactions: Transaction[];
    nonce: number;
    anchor?: string | null;
}
export interface LedgerState {
    accounts: Account[];
    blocks: Block[];
}
