import type { Context } from "../../../types.js";
import { keccak256 } from "@bradthomasbrown/keccak/keccak256";
import { _780119_ } from "@bradthomasbrown/ecdsa/concrete";
import { peek, pop, memoryExpand, createContext, numberToHex, getStateValue, byteSliceToBigInt_be, copy } from "../../../lib.js";

export default {

    identifier: 0xfa,

    executor(context:Context) {
        if (context.blocked) {
            // if there was no code at the address
            if (context.subcontext === null) {
                const [_gas, address, argsOffset, argsSize, retOffset, retSize] = pop(context.stack, 6);
                let C_precompile = 0n;
                if (address == 1n) {
                    C_precompile = 3000n;
                    const data = new Uint8Array(context.memory!.slice(Number(argsOffset), Number(argsOffset) + Number(argsSize)));
                    const hash = data.slice(0, 32);
                    const v = byteSliceToBigInt_be(data, 32, 32, false) - 27n;
                    const r = byteSliceToBigInt_be(data, 64, 32, false);
                    const s = byteSliceToBigInt_be(data, 96, 32, false);
                    const q = _780119_.recover({ r, s, v }, hash);
                    const qBytes = new Uint8Array(64);
                    let i;
                    let x = q.x!;
                    let y = q.y!;
                    for (i = qBytes.byteLength - 1; y > 0n; y >>= 8n, i--) qBytes[i] = Number(y & 0xffn);
                    for (i = (qBytes.byteLength >> 1) - 1; x > 0n; x >>= 8n, i--) qBytes[i] = Number(x & 0xffn);
                    const returndata = new ArrayBuffer(32);
                    const addressBytes = keccak256(qBytes).fill(0, 0, 12).buffer as ArrayBuffer;
                    copy(returndata, addressBytes, 12, 12, 20, false);
                    memoryExpand(context, Number(retOffset) + Number(retSize));
                    copy(context.memory!, addressBytes, Number(retOffset), 0, Number(retSize), false);
                    context.subcontext = createContext({
                        origin: context.origin,
                        sender: context.address!,
                        to: `0x${"1".padStart(40, '0')}`,
                        code: new ArrayBuffer(),
                        returndata,
                        reverted: false // machine will not continue without this, rightfully so
                    });
                }
                context.stack.push(1n);
                context.gas += context.L! - C_precompile;
                context.blocked = false;
                context.pc++;
            } else {
                if (context.subcontext!.reverted === null) return;
                const [_gas, _address, _argsOffset, _argsSize, _retOffset, _retSize] = pop(context.stack, 6);
                if (context.states.at(-1)!.accounts === null) context.states.at(-1)!.accounts = new Map();
                context.stack.push(context.subcontext!.reverted === false ? 1n : 0n);
                context.states.at(-1)!.accounts!.set(context.subcontext!.address!, { nonce: 1n, balance: context.subcontext!.value, code: context.subcontext!.returndata });
                context.gas += context.subcontext!.gas - (context.subcontext!.returndata === null ? 0n : 200n * BigInt(context.subcontext!.returndata.byteLength!));
                context.blocked = false;
                context.pc++;
            }
        } else {
            const [gas, address, argsOffset, argsSize, retOffset, retSize] = peek(context.stack, 6);

            memoryExpand(context, Math.max(Number(argsOffset!) + Number(argsSize!), Number(retOffset!) + Number(retSize)));

            const addressHex = `0x${numberToHex(address!, 40)}`;

            const C_new = 0n;

            const C_xfer = 0n;

            let C_aaccess = 2600n;
            if (context.accountAccessSet.has(addressHex)) C_aaccess = 100n;
            else (context.accountAccessSet.add(addressHex));

            const C_extra = C_aaccess + C_xfer + C_new;

            const _ad_ = context.gas - C_extra;
            const L = _ad_ < 0n ? 0n: _ad_ - (_ad_ >> 6n);
            const C_gascap = L < gas! ? L : gas!;

            const C_callgas = C_gascap;

            const C_call = C_gascap + C_extra;

            context.gas -= C_call;
            context.L = C_callgas;

            const code = getStateValue(context.states, null, "accounts", [addressHex])?.code ?? null;
            if (code === null) {
                context.blocked = true; // sketchy, needed for gas cost to be "right"
                context.subcontext = null;
            } else {
                context.subcontext = createContext({
                    origin: context.origin,
                    sender: context.address!,
                    address: addressHex,
                    gas: C_callgas,
                    states: context.states,
                    accountAccessSet: context.accountAccessSet,
                    storageAccessSet: context.storageAccessSet,
                    depth: context.depth + 1,
                    code
                });
                context.states.push({ accounts: null, transientStorage: null, storage: null });
                context.blocked = true;
            }
        }
    },

    instructionToString() {
        return "STATICCALL";
    }

};