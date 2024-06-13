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
    "Status:": string | undefined;
    "Block Number:": string | undefined;
    "Chain ID:": number | undefined;
    "Tx Hash:": {
        value: `0x${string}` | undefined;
        link: string | undefined;
    };
    "Position In Block:": number | undefined;
    "From:": `0x${string}` | undefined;
    "To:": `0x${string}` | null | undefined;
    "Value:": string;
    "Nonce:": number | undefined;
    "Gas Used:": string | undefined;
    "TypeHex:": `0x${string}` | null | undefined;
    "Type:": "legacy" | "eip2930" | "eip1559" | "eip4844" | undefined;
    "Transaction Fee:": string | undefined;
    "Gas Price:": string | undefined;
    "Base:": string | undefined;
    "Max:": string | undefined;
    "Max Priority:": string | undefined;
};
