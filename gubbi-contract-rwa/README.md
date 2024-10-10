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