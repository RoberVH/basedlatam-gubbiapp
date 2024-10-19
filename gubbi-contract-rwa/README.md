# Gubbi App RWA Tokenization Contracts

<strong>Gubbi APP. Smart Contracts to tokenized and trade  RWA Tokens</strong>

**Based Latam Hackathon**

*Oct, 2024* | *@rovicher.eth*

### Dev Environment Setup 

```
    mkdir gubbi-rwa && cd gubbi-rwa
    forge init
    forge install OpenZeppelin/openzeppelin-contracts
    forge install smartcontractkit/chainlink
```
add following section to foundry.toml
```
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "@chainlink/=lib/chainlink/",
    "@lib/=lib/",
]
```
Note:  I used solidity compiler version 0.8.24 at contracts, so added this to foundry.toml
```
solc = "0.8.24"
```


<br><br>

## Deployed to Base Sepolia
ChainId: 84532 
RPC: https://sepolia.base.org
Explorer: https://sepolia.basescan.org

  ERC1155Gubbi deployed to: 0xecfd94B71Fb7f4D0036D3f25c049DF97A2Adb891 
  Hash: 0xd6395d68c150e4d5ae56efb9248729aed8b2548220bf8eda0c480e2c67fc2576

  GubbiRWATokenization deployed to: 0xfb5E7d9947cf79554852e5df5650d6b4cDb9C982   
  Hash: 0x75a455c115f46bfba452a50271c7cbfd5bf418a719cf048d701177b8fd745132


## Command to deploy:
``forge script script/deployGubbiCts.s.sol --rpc-url $FORK_TEST --private-key $PVTE_KEY --broadcast --verify``


# Useful Forge boilerplate
**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
.