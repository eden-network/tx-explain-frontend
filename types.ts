export interface TokenTransfer {
    token_name: string;
    token_symbol: string;
    token_address: string;
    token_standard: string;
    amount: string;
    usd_value: string;
    from: string;
    to: string;
}
  
export interface SmartContract {
    name: string;
    address: string;
    summary: string;
}
  
export interface FunctionInput {
    param_name?: string;
    param_type: string;
    value: string | number | boolean;
}
  
export interface FunctionOutput {
    output_name?: string;
    output_type: string;
    value: string | number | boolean;
}
  
export interface FunctionCall {
    smart_contract: SmartContract;
    function_name: string;
    function_sig: string;
    summary: string;
    input?: FunctionInput[];
    output?: FunctionOutput[];
}
  
export interface TransactionExplanation {
    summary: string;
    token_transfers: TokenTransfer[];
    calls: FunctionCall[];
    tx_hash?: string;
}