import type { MapComponents, Context, PartialContext } from "./types.js";
import { _7c3dda_ } from "@bradthomasbrown/finite-field";
import { keccak256 } from "@bradthomasbrown/keccak/keccak256";
import { encode } from "@bradthomasbrown/rlp";

function byteSliceToBigInt_be(bytes:Uint8Array, offset:number, size:number, permitOobZeroes:boolean) {
    if ((permitOobZeroes === false) && (offset + size > bytes.byteLength))
        throw new Error("out of bounds", { cause: { bytes, offset, size } });
    let value = 0n;
    for (let i = offset; i < offset + size; i++)
        value = (value << 8n) + (i >= bytes.byteLength ? 0n : BigInt(bytes[i]!));
    return value;
}

function numberToHex(value:number|bigint, padding:number) {
    return value.toString(16).padStart(padding, '0');
}

// shouldn't use p3mod4 field implementation here, so we make our own field implementation
function sqrt() { throw new Error("sqrt unsupported"); return 0n; }
const FiniteField = _7c3dda_(sqrt);
const p = (1n << 256n);
const F = new FiniteField(p);

function pop(stack:Array<bigint>, count:number) {
    const array = new Array<bigint>(count);
    for (let j = 0; j < count; j++)
        array[j] = stack.pop()!;
    return array;
}

function peek(stack:Array<bigint>, count:number) {
    const array = new Array<bigint>(count);
    for (let j = 0; j < count; j++)
        array[j] = stack.at(0 - (j + 1))!;
    return array;
}

function copy(destinationBuffer:ArrayBuffer, sourceBuffer:null|ArrayBuffer, destinationOffset:number, sourceOffset:number, size:number, permitOobZeroes:boolean) {
    if (size == 0) return;
    let sourceBytesAvailable = 0;
    if (sourceBuffer !== null && sourceOffset < sourceBuffer.byteLength) sourceBytesAvailable = Math.min(sourceBuffer.byteLength - sourceOffset, size);
    const destinationArray = new Uint8Array(destinationBuffer);
    if (sourceBytesAvailable > 0) {
        const sourceArray = new Uint8Array(sourceBuffer!.slice(sourceOffset, sourceOffset + sourceBytesAvailable));
        destinationArray.set(sourceArray, destinationOffset);
    }
    const bytesRemaining = size - sourceBytesAvailable;
    if (bytesRemaining == 0) return;
    if (permitOobZeroes === false) throw new Error(`outOfBoundsCopy`, { cause: { destinationBuffer, sourceBuffer, destinationOffset, sourceOffset, size }});
    destinationArray.fill(0, destinationOffset + sourceBytesAvailable, bytesRemaining);
}

function memoryExpand(context:Context, size:number) {
    if (size == 0) return;
    if (context.memory === null) context.memory = new ArrayBuffer(1);
    const memoryWords = (size + 0x1f) >> 5;
    if (context.memoryWords >= memoryWords) return;
    const C_mem = 3n * BigInt(memoryWords) + BigInt(memoryWords) ** 2n / 512n;
    context.gas -= C_mem - context.C_mem_prev;
    context.memoryWords = memoryWords;
    context.C_mem_prev = C_mem;
    while (context.memory.byteLength < size)
        context.memory = context.memory.transfer(context.memory.byteLength << 1);
}

function getStateValue<
    I extends keyof Context["states"][number],
    M extends Context["states"][number][I],
    C extends MapComponents<NonNullable<M>>,
    K extends C["keyPath"],
    V extends C["value"]
>(states:Context["states"], maxIndex:null|number, mapIdentifier:I, keyPath:K):null|V {
    let value:null|V = null;
    l0: for (let i = Math.min(maxIndex ?? states.length - 1, states.length - 1); i >= 0; i--) {
        let map = states[i]![mapIdentifier];
        if (map === null) continue;
        for (let j = 0; j < keyPath.length - 1; j++) {
            if ((map as any).has(keyPath[j]) === false) continue l0;
            map = (map as any).get(keyPath[j]);
        }
        const lastKeyComponent = keyPath[keyPath.length - 1];
        if ((map as any).has(lastKeyComponent) === false) continue;
        value = (map as any).get(lastKeyComponent);
        break;
    }
    return value;
}

function createContext(partialContext:PartialContext):Context {
    return {
        origin: partialContext.origin,
        sender: partialContext.sender,
        to: partialContext.to ?? null,
        address: partialContext.address ?? null,
        pc: partialContext.pc ?? 0,
        gas: partialContext.gas ?? 0n,
        stack: partialContext.stack ?? [],
        memory: partialContext.memory ?? null,
        C_mem_prev: partialContext.C_mem_prev ?? 0n,
        returndata: partialContext.returndata ?? null,
        accountAccessSet: partialContext.accountAccessSet ?? new Set(),
        storageAccessSet: partialContext.storageAccessSet ?? new Map(),
        depth: partialContext.depth ?? 1,
        calldata: partialContext.calldata ?? null,
        subcontext: partialContext.subcontext ?? null,
        blocked: partialContext.blocked ?? false,
        reverted: partialContext.reverted ?? null,
        states: partialContext.states ?? [{ accounts: null, transientStorage: null, storage: null }],
        refund: partialContext.refund ?? 0n,
        code: partialContext.code ?? null,
        memoryWords: 0,
        L: null
    };
}

function deriveAddress(context:Context) {
    const account = getStateValue(context.states, null, "accounts", [context.sender])!;
    const addressBytes = Uint8Array.fromHex(context.sender.slice(2));
    return `0x${keccak256(encode([addressBytes, account.nonce])).slice(12).toHex()}`;
}

function deriveAddress2(sender:string, salt:bigint, code:ArrayBuffer) {
    const bytes = new Uint8Array(1 + 20 + 32 + 32);
    bytes[0] = 0xff;
    bytes.set(Uint8Array.fromHex(sender.slice(2)), 1);
    write(bytes.buffer, salt, 1 + 20, 0x20);
    bytes.set(keccak256(new Uint8Array(code)), 1 + 20 + 0x20);
    return `0x${keccak256(bytes).slice(12).toHex()}`;
}

function write(destination:ArrayBuffer, value:bigint, offset:number, size:number) {
    const array = new Uint8Array(destination);
    for (let i = offset + size - 1; i >= offset; i--, value >>= 8n)
        array[i] = Number(value & 0xffn);
}

export { byteSliceToBigInt_be, numberToHex, F, keccak256, pop, peek, copy, memoryExpand, getStateValue, write, createContext, deriveAddress, deriveAddress2 };