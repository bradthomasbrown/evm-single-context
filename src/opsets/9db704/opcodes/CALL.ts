import type { Context, MapComponents } from "../../../types.js";
import { keccak256 } from "@bradthomasbrown/keccak/keccak256";
import { _780119_ } from "@bradthomasbrown/ecdsa/concrete";
import { peek, pop, memoryExpand, createContext, numberToHex, getStateValue, byteSliceToBigInt_be, copy } from "../../../lib.js";

export default {

    identifier: 0xf1,

    executor(context:Context) {
        if (context.blocked) {
            // if there was no code at the address
            if (context.subcontext!.code === null) {
                const [_gas, address, _value, argsOffset, argsSize, retOffset, retSize] = pop(context.stack, 7);
                let C_precompile = 0n;
                // can you non-staticcall precompiles?
                // what happens if you try that?
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
                context.stack.push(context.subcontext!.reverted === false ? 1n: 0n);
                context.gas += context.L! - C_precompile;
                context.blocked = false;
                context.pc++;
            } else {
                if (context.subcontext!.reverted === null) return;
                const [_gas, _address, _value, _argsOffset, _argsSize, retOffset, retSize] = pop(context.stack, 7);
                copy(context.memory!, context.subcontext!.returndata, Number(retOffset), 0, Number(retSize), false);
                context.stack.push(context.subcontext!.reverted === false ? 1n : 0n);
                context.gas += context.subcontext!.gas;
                context.blocked = false;
                context.pc++;
            }
        } else {
            const [gas, address, value, argsOffset, argsSize, retOffset, retSize] = peek(context.stack, 7);

            // going to have to make a lot more opcodes work like this
            // where if the size is zero, we don't count it at all
            memoryExpand(
                context,
                Math.max(
                    argsSize! == 0n ? 0 : Number(argsOffset!) + Number(argsSize!),
                    retSize! == 0n ? 0 : Number(retOffset!) + Number(retSize)
                )
            );

            const addressHex = `0x${numberToHex(address!, 40)}`;

            const originalAccount = getStateValue(context.states, 0, "accounts", [addressHex]);
            let C_new = 0n;
            if (
                (   originalAccount === null
                 || (originalAccount.code === null && originalAccount.nonce == 0n && originalAccount.balance == 0n) )
                && value != 0n
            ) C_new = 25000n;

            // i don't think i get the call stipend thing at all
            // what does it mean "subtracted from G_callvalue for z non-zero value transfer"?
            // wouldn't G_callvalue then never be used?
            // i'm probably missing something here
            //
            // it seems that we don't "subtract from G_callvalue"?
            let C_xfer = 0n;
            if (value != 0n) C_xfer = 9000n;

            let C_aaccess = 2600n;
            if (context.accountAccessSet.has(addressHex)) C_aaccess = 100n;
            else (context.accountAccessSet.add(addressHex));

            const C_extra = C_aaccess + C_xfer + C_new;

            let C_gascap = gas!;
            if (context.gas >= C_extra) {
                const _ad_ = context.gas - C_extra;
                const L = _ad_ - (_ad_ >> 6n); 
                C_gascap = L < gas! ? L : gas!;
            }

            let C_callgas = C_gascap;
            if (value != 0n) C_callgas += 2300n;

            const C_call = C_gascap + C_extra;
            
            context.gas -= C_call;
            context.L = C_callgas;

            const account = getStateValue(context.states, null, "accounts", [addressHex]);
            const code = account === null ? null : account.code;
            if (code === null) {
                context.blocked = true;
                // can take this out to simplify what it has in common if there is code
                context.subcontext = createContext({
                    origin: context.origin,
                    sender: context.address!,
                    to: addressHex,
                    calldata: argsSize! === 0n ? null : context.memory!.slice(Number(argsOffset), Number(argsOffset) + Number(argsSize)),
                    address: addressHex,
                    gas: C_callgas,
                    value: value!,
                    states: context.states,
                    accountAccessSet: context.accountAccessSet,
                    storageAccessSet: context.storageAccessSet,
                    depth: context.depth + 1,
                    code,
                    // reverted: notEnoughValue ? true : false,
                    refund: context.refund
                });
            } else {
                context.subcontext = createContext({
                    origin: context.origin,
                    sender: context.address!,
                    to: addressHex,
                    calldata: argsSize! === 0n ? null : context.memory!.slice(Number(argsOffset), Number(argsOffset) + Number(argsSize)),
                    address: addressHex,
                    gas: C_callgas,
                    value: value!,
                    states: context.states,
                    accountAccessSet: context.accountAccessSet,
                    storageAccessSet: context.storageAccessSet,
                    depth: context.depth + 1,
                    code,
                    // reverted: notEnoughValue ? true : null,
                    refund: context.refund
                });
                context.blocked = true;
            }
        }
    },

    instructionToString() {
        return "CALL";
    }

};