export interface TokenInfo {
    standard: string;
    type: string;
    symbol: string;
    name: string;
    decimals: number;
    contract_address: string;
}

export interface AssetChange {
    type: string;
    from: string;
    to: string;
    amount: string;
    dollar_value: string;
    token_info: TokenInfo;
}

export interface DecodedInput {
    name: string;
    type: string;
    value: any;
}

export interface DecodedOutput {
    name: string;
    type: string;
    value: any;
}

export interface FunctionCall {
    contract_name: string;
    function: string;
    from: string;
    from_balance: string | null;
    to: string;
    input: string;
    output: string;
    value: string | null;
    caller: string | null;
    caller_balance: string | null;
    decoded_input: DecodedInput[];
    decoded_output: DecodedOutput[] | null;
    calls: FunctionCall[] | null;
}

export interface TransactionSimulation {
    hash: string;
    call_trace: FunctionCall[];
    asset_changes: AssetChange[];
}

export interface Categories {
    labels: string[];
    probabilities: number[];
}

export interface TransactionDetails {
    status: string | undefined;
    block_number: string | undefined;
    chain_id: number | undefined;
    tx_hash:
    `0x${string}` | undefined;

    position_in_block: number | undefined;
    from: `0x${string}` | undefined;
    to: `0x${string}` | null | undefined;
    value: string | undefined;
    nonce: number | undefined;
    gas_used: string | undefined;
    type_hex: `0x${string}` | null | undefined;
    type: "legacy" | "eip2930" | "eip1559" | "eip4844" | undefined;
    transaction_fee: string | undefined;
    gas_price: string | undefined;
    base: string | undefined;
    max_gas: string | undefined;
    max_priority: string | undefined;
};

export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}
