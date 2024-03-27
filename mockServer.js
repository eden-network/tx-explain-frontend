const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/transaction', (req, res) => {
  if (!req.body || !req.body.tx_hash) {
    res.status(400).send('Bad Request');
    return;
  }
  if (req.body.network_id != '1') {
    res.status(404).send({ error: 'Network not yet supported' });
    return;
  }
  let response = {}
  if (req.body.tx_hash == '0x648b601f54761a6add24092f5b3c33f5949361a72ca1215e0f6ef46f3e849220') {
    response = {"summary":`This transaction retrieves the latest price feed data from a Chainlink oracle, updates the relevant contracts with the new data, and transfers a small amount of ETH, likely as a payment or fee for the oracle service. The price feed being queried appears to be for the ETH/USD pair, with the latest price being reported as 3977.34769500 USD per ETH.`
    ,"token_transfers":[{"token_name":"Ethereum","token_symbol":"ETH","token_address":"","token_standard":"Native","amount":"0.06079","usd_value":"$205.57354003173828125","from":"0xa62011153e3efb290e9c679b97da311b5029164f","to":"0xe84cba71588f06a29af082d4db6ef02a58e3149d"},{"token_name":"Ethereum","token_symbol":"ETH","token_address":"","token_standard":"Native","amount":"0.06079","usd_value":"$205.57354003173828125","from":"0xe84cba71588f06a29af082d4db6ef02a58e3149d","to":"0xae0c040ef66e1e9a351b0cc5b2714027a646121d"}],"calls":[{"smart_contract":{"name":"EACAggregatorProxy","address":"0xe84cba71588f06a29af082d4db6ef02a58e3149d","summary":"Proxy contract for retrieving price data from an aggregator"},"function_name":"latestRoundData","function_sig":"latestRoundData()","summary":"Retrieves the latest price data round","input":[],"output":[{"output_name":"roundId","output_type":"uint80","value":"110680464442257322915"},{"output_name":"answer","output_type":"int256","value":"397734769500"},{"output_name":"startedAt","output_type":"uint256","value":"1710287723"},{"output_name":"updatedAt","output_type":"uint256","value":"1710287723"},{"output_name":"answeredInRound","output_type":"uint80","value":"110680464442257322915"}]},{"smart_contract":{"name":"EACAggregatorProxy","address":"0xe84cba71588f06a29af082d4db6ef02a58e3149d","summary":"Proxy contract for retrieving price data from an aggregator"},"function_name":"addPhaseIds","function_sig":"addPhaseIds(uint80,int256,uint256,uint256,uint80,uint16)","summary":"Adds phase IDs to a price data round","input":[{"param_name":"roundId","param_type":"uint80","value":"13219"},{"param_name":"answer","param_type":"int256","value":"397734769500"},{"param_name":"startedAt","param_type":"uint256","value":"1710287723"},{"param_name":"updatedAt","param_type":"uint256","value":"1710287723"},{"param_name":"answeredInRound","param_type":"uint80","value":"13219"},{"param_name":"phaseId","param_type":"uint16","value":"6"}],"output":[{"output_name":"","output_type":"uint80","value":"110680464442257322915"},{"output_name":"","output_type":"int256","value":"397734769500"},{"output_name":"","output_type":"uint256","value":"1710287723"},{"output_name":"","output_type":"uint256","value":"1710287723"},{"output_name":"","output_type":"uint80","value":"110680464442257322915"}]}],"tx_hash":"0x648b601f54761a6add24092f5b3c33f5949361a72ca1215e0f6ef46f3e849220"};
  } else if (req.body.tx_hash == '0x8d5de9c252b16a2e8d3cbc3206008c72f288a5ef9379a0300a2d9d6a4aa78099'){
    response = {"summary":"This transaction involves claiming rewards from a TokenStakingPool contract and transferring PAAL AI (PAAL) tokens from the contract to the staker's address.","token_transfers":[{"token_name":"PAAL AI","token_symbol":"PAAL","token_address":"0x14fee680690900ba0cccfc76ad70fd1b95d10e16","token_standard":"ERC20","amount":"3975.113805735","usd_value":"$2464.89","from":"0xb04af4843e3808e1fe6f7a8ee4f456937d7afae8","to":"0x11686f9bb4f9283f304b6384a4a76dc9ebfd06bd"}],"calls":[{"smart_contract":{"name":"TokenStakingPool","address":"0x11686f9bb4f9283f304b6384a4a76dc9ebfd06bd","summary":"A contract for staking tokens and earning rewards"},"function_name":"claimRewards","function_sig":"claimRewards()","summary":"Claims the staking rewards earned by the caller","input":[],"output":[]},{"smart_contract":{"name":"PAALAI","address":"0x14fee680690900ba0cccfc76ad70fd1b95d10e16","summary":"The PAAL AI token contract"},"function_name":"transfer","function_sig":"transfer(address,uint256)","summary":"Transfers PAAL tokens from the TokenStakingPool to the staker","input":[{"param_name":"recipient","param_type":"address","value":"0x11686f9bb4f9283f304b6384a4a76dc9ebfd06bd"},{"param_name":"amount","param_type":"uint256","value":"3975113805735"}],"output":[{"output_name":"","output_type":"bool","value":true}]}],"tx_hash":"0x8d5de9c252b16a2e8d3cbc3206008c72f288a5ef9379a0300a2d9d6a4aa78099"}
  } else if (req.body.tx_hash == '0x8012f1955cbff05cb994e4ed631dbfaee80b078834fa5f03ed5f2795be547552'){
    response = {"summary":"This transaction involves a transfer of 361977.8339669 HIFI tokens (worth $311358.14) from address 0x41fbba5cb38d22b2d80606406944cedd7c97f6f9 to address 0x28c6c06298d514db089934071355e5743bf21d60 using the Hifi smart contract at address 0x4b9278b94a1112cad404048903b8d343a810b07e.","token_transfers":[{"token_name":"Hifi Finance","token_symbol":"HIFI","token_address":"0x4b9278b94a1112cad404048903b8d343a810b07e","token_standard":"ERC20","amount":"361977.8339669","usd_value":"$311358.14","from":"0x41fbba5cb38d22b2d80606406944cedd7c97f6f9","to":"0x28c6c06298d514db089934071355e5743bf21d60"}],"calls":[{"smart_contract":{"name":"Hifi","address":"0x41fbba5cb38d22b2d80606406944cedd7c97f6f9","summary":"Hifi Finance smart contract"},"function_name":"transfer","function_sig":"transfer(address,uint256)","summary":"Transfers HIFI tokens from sender to recipient","input":[{"param_name":"dst","param_type":"address","value":"0x28c6c06298d514db089934071355e5743bf21d60"},{"param_name":"rawAmount","param_type":"uint256","value":"361977833966900000000000"}],"output":[{"output_name":"","output_type":"bool","value":true}]},{"smart_contract":{"name":"Hifi","address":"0x41fbba5cb38d22b2d80606406944cedd7c97f6f9","summary":"Hifi Finance smart contract"},"function_name":"_transferTokens","function_sig":"_transferTokens(address,address,uint96)","summary":"Internal function to transfer HIFI tokens between accounts","input":[{"param_name":"src","param_type":"address","value":"0x41fbba5cb38d22b2d80606406944cedd7c97f6f9"},{"param_name":"dst","param_type":"address","value":"0x28c6c06298d514db089934071355e5743bf21d60"},{"param_name":"amount","param_type":"uint96","value":"361977833966900000000000"}]}],"tx_hash":"0x8012f1955cbff05cb994e4ed631dbfaee80b078834fa5f03ed5f2795be547552"}
  } else if(req.body.tx_hash == '0x1ae03c359d05e813437c277db560236a3dfb4b1dde3017e394c3d04380f7e506') {
    response = {"summary":"This transaction involves swapping 0.5 WETH for 800310.289985436681617168 BETZ tokens through the Uniswap V2 DEX, using the Universal Router smart contract. The user first deposits 0.5 ETH to mint 0.5 WETH, then transfers the WETH to the Uniswap pair contract. The swap is executed, sending most of the BETZ to the user and a small portion to the Bet Lounge contract. The user pays 0.5 ETH in gas fees. The user (0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad) appears to be a regular retail user based on the relatively small swap amount. It's not a known exchange, market maker, whale wallet, or smart contract.","token_transfers":[{"token_name":"Wrapped Ether","token_symbol":"WETH","token_address":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","token_standard":"ERC20","amount":"0.5","usd_value":"$1693.33","from":"0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad","to":"0x1f61cda8825c7fe0c99b3040774d2083681e6840"},{"token_name":"Bet Lounge","token_symbol":"BETZ","token_address":"0x134359b7c852c82e4ebdd16a61020e6b81dd6a6b","token_standard":"ERC20","amount":"24751.864638724845823211","usd_value":"$42.35","from":"0x1f61cda8825c7fe0c99b3040774d2083681e6840","to":"0x134359b7c852c82e4ebdd16a61020e6b81dd6a6b"},{"token_name":"Bet Lounge","token_symbol":"BETZ","token_address":"0x134359b7c852c82e4ebdd16a61020e6b81dd6a6b","token_standard":"ERC20","amount":"800310.289985436681617168","usd_value":"$1369.39","from":"0x1f61cda8825c7fe0c99b3040774d2083681e6840","to":"0x1019bf2d607cc646a94a194f7a79e0b385065cff"}],"calls":[{"smart_contract":{"name":"Universal Router","address":"0x1019bf2d607cc646a94a194f7a79e0b385065cff","summary":"A smart contract that facilitates token swaps and other DeFi interactions in a gas-efficient manner."},"function_name":"execute0","function_sig":"execute0(bytes,bytes[])","summary":"Executes a series of actions based on the provided commands and inputs.","input":[{"param_name":"commands","param_type":"bytes","value":"0x0b08"},{"param_name":"inputs","param_type":"bytes[]","value":"[0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000006f05b59d3b20000, 0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000a4894508a8079188384000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000134359b7c852c82e4ebdd16a61020e6b81dd6a6b]"}],"output":[]},{"smart_contract":{"name":"Uniswap V2 Pair","address":"0x1f61cda8825c7fe0c99b3040774d2083681e6840","summary":"Automated market maker liquidity pool facilitating swaps between ETH and BETZ."},"function_name":"swap","function_sig":"swap(uint256,uint256,address,bytes)","summary":"Swaps tokens, in this case WETH for BETZ.","input":[{"param_name":"amount0Out","param_type":"uint256","value":"825062154624161527440379"},{"param_name":"amount1Out","param_type":"uint256","value":"0"},{"param_name":"to","param_type":"address","value":"0x1019bf2d607cc646a94a194f7a79e0b385065cff"},{"param_name":"data","param_type":"bytes","value":"0x"}],"output":[]}],"tx_hash":"0x1ae03c359d05e813437c277db560236a3dfb4b1dde3017e394c3d04380f7e506"}
  }
  else {
    response = {"summary":"This transaction transfers 48,500 USDC tokens from address 0xc0f522d9d92c618aa74acbbcbb48ce86139adf85 to address 0x28c6c06298d514db089934071355e5743bf21d60 using the FiatTokenProxy smart contract.","token_transfers":[{"token_name":"USDC","token_symbol":"USDC","token_address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","token_standard":"ERC20","amount":"48500","usd_value":"$48176.11771821975708","from":"0xc0f522d9d92c618aa74acbbcbb48ce86139adf85","to":"0x28c6c06298d514db089934071355e5743bf21d60"}],"calls":[{"smart_contract":{"name":"FiatTokenProxy","address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","summary":"Proxy contract for the USDC token"},"function_name":"transfer","function_sig":"transfer(address,uint256)","summary":"Transfers USDC tokens from the sender to the specified address","input":[{"param_name":"to","param_type":"address","value":"0x28c6c06298d514db089934071355e5743bf21d60"},{"param_name":"value","param_type":"uint256","value":"48500000000"}],"output":[{"output_name":"","output_type":"bool","value":true}]},{"smart_contract":{"name":"FiatTokenV2_2","address":"0x43506849d7c04f9138d1a2050bbf3a0c054402dd","summary":"Implementation contract for USDC token"},"function_name":"_transfer","function_sig":"_transfer(address,address,uint256)","summary":"Internal function to transfer tokens between addresses","input":[{"param_name":"from","param_type":"address","value":"0xc0f522d9d92c618aa74acbbcbb48ce86139adf85"},{"param_name":"to","param_type":"address","value":"0x28c6c06298d514db089934071355e5743bf21d60"},{"param_name":"value","param_type":"uint256","value":"48500000000"}],"output":[]}],"tx_hash":"0xbc830a3cc5e2de3fe7b8c4f7c61f4223d23c5d34ed2efa3c4111c40ab8c2ad07"}
  }
  res.json(response);
});

app.listen(port, () => {
  console.log(`Mock server listening at http://localhost:${port}`);
});
