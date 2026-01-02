# evm-single-context
This is an implementation of a "single-context machine" partial interpretation of an Ethereum Virtual Machine (EVM). 
By "single-context machine", we mean that an instance of one of these machines will run until the point where most EVM implementations would recurse into a new execution context, like on any CALL-type or CREATE-type opcode.
This kind of machine will be different in that instances will simply block when these opcodes are reached and will wait for a higher machine or coordinator to do what is necessary and then unblock the machine.

## Why?
For local testing, we found quickly that Anvil has execution consensus divergences (bugs) with go-ethereum (`geth`). If we want to deploy a contract on Ethereum Mainnet, we should not use Anvil.
`geth` itself is very inflexible and not friendly for local development work and testing. If you want to test handling chain reorganizations, this will end up being a lot of work. Anvil allows easy testing of this, but has the aformentioned bugs.
Both require spinning up a node with an external application/binary and probably some form of container runtime.
The official JS/TS implementation is just as inflexible since it is designed to closely mirror `geth` and contains a lot of complexity and bloat since it aims to be as close to full EVM functionality as possible.
This will be the first of a set of light, simple, and flexible implementations designed to be easy to work with and use for developing/testing/verification.

## Installation
```sh
npm i @bradthomasbrown/evm-single-context
```

## Usage
```js
import type { Context } from "@bradthomasbrown/evm-single-context/types";
import { EvmEntity } from "@bradthomasbrown/entity/evm";
import { createContext } from "@bradthomasbrown/evm-single-context/lib";
import { SingleContextMachine, traceObjects } from "@bradthomasbrown/evm-single-context";

// set up some test parameters
const parameters = {
    from: "0x45c3bde5d2cc59a626bee55ac8e494cf128e866e",
    gas: 217590n,
    value: 111360000000000000n,
    input: await Bun.file("testinput.hex").text(), // or any other way to set the input/data/calldata, which should appear as `0x<hex>...`
    code: await Bun.file("testcode.hex").text(), // or any other way to set the code, which should appear as `0x<hex>...`
};

// assign a random address for a contract
const contract = EvmEntity.random();

// get the code as a uint8array
const code = parameters.code === null
    ? Uint8Array.fromHex(parameters.input.slice(2)).buffer
    : Uint8Array.fromHex(parameters.code.slice(2)).buffer;

// create state
const accounts:Context["states"][number]["accounts"] = new Map([ [contract.address, { nonce: 1n, balance: 0n, code }] ]);
const states:Context["states"] = [{ accounts, transientStorage: null, storage: null }];

// create a context
const context = createContext({
    origin:parameters.from,
    sender:parameters.from,
    value:parameters.value,
    to:contract.address,
    gas:parameters.gas,
    calldata:Uint8Array.fromHex(parameters.input.slice(2)).buffer,
    code,
    states
});

// do some initial context handling (more related to transactions, not single-contexts),
// like initial transaction cost and pre-warming precompile addresses
let g0_data = 0n;
if (context.calldata !== null)
    for (const byte of new Uint8Array(context.calldata))
        g0_data += byte === 0 ? 4n : 16n;
let g0_create = 0n;
if (context.to === null) {
    const codeArray = new Uint8Array(context.calldata!);
    g0_create += 32000n;
    g0_create += 2n * BigInt((codeArray.byteLength + 0x1f & ~0x1f) >> 5);
}
const g0_transaction = 21000n;
const g0 = g0_data + g0_create + g0_transaction;
context.gas -= g0;
context.accountAccessSet.add(`0x${"1".padStart(40, '0')}`);

// create a single-context machine from this context, initialize and run it, then log trace objects
// should replicate go-ethereum's traces
const machine = new SingleContextMachine(context);
machine.initializeAndRun();
console.log(traceObjects);
/* ..., {
    pc: 409,
    op: "JUMP",
    gas: 189836,
    gasCost: 8,
    depth: 1,
    stack: [ "0x0", "0x19a", "0x36c", "0x13c" ],
    memory: [ "0000000000000000000000000000000000000000000000000000000000000000", "0000000000000000000000000000000000000000000000000000000000000000",
        "0000000000000000000000000000000000000000000000000000000000000080"
    ],
}, ... */
```