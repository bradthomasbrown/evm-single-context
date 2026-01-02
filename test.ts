import type { Context } from "@bradthomasbrown/evm-single-context/types";
import { createContext } from "@bradthomasbrown/evm-single-context/lib";
import { SingleContextMachine, traceHelper, traceObjects } from "@bradthomasbrown/evm-single-context";
import { _900ef2_ } from "@bradthomasbrown/900ef2";
import { EvmEntity } from "@bradthomasbrown/entity/evm";
import { _e4e1df_ } from "@bradthomasbrown/75bb14/e4e1df";
import { expect } from "bun:test";

const parameters = {
    from: "0x45c3bde5d2cc59a626bee55ac8e494cf128e866e",
    gas: 217590n,
    value: 111360000000000000n,
    input: await Bun.file("testinput.hex").text(),
    code: await Bun.file("testcode.hex").text(),
};

// create a geth dev node test thing wrapper class
const _f5_ = _900ef2_("ethereum/client-go", ["--dev", "--http", "--http.addr", "0.0.0.0", "--http.api", "eth,debug"]);
const node = await _f5_.make(8545);
const client = node.client; 
const entity = new EvmEntity(0xb71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291n);
const _65_ = new _e4e1df_(entity, node as any, null); // wrapper for an evm entity allowing easier sends and deploys. works in transaction primitives instead of raw cryptographic data

// if there is code, deploy it, then get the trace steps
let to:string|null = null;
if (parameters.code) {
    const codeHex = parameters.code.slice(2);
    const size = codeHex.length >> 1;
    let sizeHex = size.toString(16).padStart(4, '0');
    // prepend a simple payload that will deploy the input as code
    const calldata = "0x" + "61" + sizeHex + "60" + "0a" + "81" + "5f" + "5f" + "39" + "f3" + parameters.code.slice(2);
    const _67_ = await _65_.deploy(calldata);
    await _67_[2];
    to = _67_[0]
    const txHash = _67_[1];
    while (await _65_.wait(txHash).then(() => false).catch((error:any) => {
        if (error.message == "-32000: transaction indexing is in progress") return new Promise(r => setTimeout(r, 250))
        else throw error;
    }));
}
const [txHash, sent] = await _65_.send(parameters.from, null, parameters.value);
await Promise.all([sent, _65_.wait(txHash)]);
const trace = await client.request("debug_traceCall", [
    { from:parameters.from, to, gas:`0x${parameters.gas.toString(16)}`, value:`0x${parameters.value.toString(16)}`, input:parameters.input },
    "latest",
    { enableMemory:true, enableReturnData:true }
]) as any;
// struct logs is then our geth trace steps
const structLogs = trace.structLogs;

// now we start building our execution client's setup
const code = parameters.code === null
    ? Uint8Array.fromHex(parameters.input.slice(2)).buffer
    : Uint8Array.fromHex(parameters.code.slice(2)).buffer;
const accounts:Context["states"][number]["accounts"] = new Map([

]);
const states:Context["states"] = [{ accounts, transientStorage: null, storage: null }];
const context = createContext({
    origin:parameters.from,
    sender:parameters.from,
    value:parameters.value,
    to,
    gas: parameters.gas,
    calldata: Uint8Array.fromHex(parameters.input.slice(2)).buffer,
    code,
    states
});
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
const machine = new SingleContextMachine(context);
machine.initialize();
// since geth traces have a gasCost, we are actually looking one step behind where the machine is at all times
// since to get gasCost, we have to compare the current gas with the previous step's gas usage
// so only *after* our first step will our most recent trace object will be for the first instruction
machine.step();

await new Promise(r => setTimeout(r, 3000));

const opsTraversed:Set<string> = new Set();
let pa, pb;
let i = 0;
let _df_ = true;
try {
    for (; _df_; i++) {
        if (machine.continue() === false) _df_ = false;
        const a = structLogs.at(i);
        const b = traceObjects.at(-1);

        // for now, we'll just yank geth's block header data and use it as our own
        if (["TIMESTAMP", "CHAINID"].includes(traceHelper.op!)) {
            context.stack[context.stack.length - 1] = BigInt(structLogs.at(i + 1).stack.at(-1));
        }

        try {
            expect(b).toStrictEqual(a);
        } catch (e) {
            console.log({ step: i, lastConsensusTraceObject_a: pa, lastConsensusTraceObject_b: pb, currentConsensusTraceObject_a: a, currentConsensusTraceObject_b: b, opsTraversed });
            throw e;
        }

        if (machine.context.blocked && machine.context.subcontext === null) machine.step();

        opsTraversed.add(b!.op);
        try { 
            machine.step();
        } catch (e) {
            console.log({ step: i, opsTraversed, traceHelper });
            throw e;
        }
        pa = a;
        pb = b;
    }
} catch (e) {
    throw e;
}

console.log({ lastConsensusTraceObject_a: pa, lastConsensusTraceObject_b: pb, opsTraversed, steps: i });
console.log("verified!");

export {};