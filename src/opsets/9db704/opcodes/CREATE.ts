import type { Context } from "../../../types.js";
import { peek, pop, memoryExpand, createContext, deriveAddress, getStateValue } from "../../../lib.js";

export default {

    identifier: 0xf0,

    executor(context:Context) {
        if (context.blocked) {
            if (context.subcontext!.reverted === null) return;
            const [_value, _offset, _size] = pop(context.stack, 3);
            if (context.states.at(-1)!.accounts === null) context.states.at(-1)!.accounts = new Map();
            context.stack.push(BigInt(context.subcontext!.address!));
            context.states.at(-1)!.accounts!.set(context.subcontext!.address!, { nonce: 1n, balance: context.subcontext!.value, code: context.subcontext!.returndata });
            const account = getStateValue(context.states, null, "accounts", [context.address!]);
            if (context.states.at(-1)!.accounts!.has(context.address!) == true) context.states.at(-1)!.accounts!.get(context.address!)!.nonce++;
            else context.states.at(-1)!.accounts!.set(context.address!, { nonce:account!.nonce+1n, balance:account!.balance, code:account!.code });
            context.gas += context.subcontext!.gas; // - (context.subcontext!.returndata === null ? 0n : 200n * BigInt(context.subcontext!.returndata.byteLength!));
            context.blocked = false;
            context.pc++;
        } else {
            const [value, offset, size] = peek(context.stack, 3);
            memoryExpand(context, Number(offset) + Number(size));
            context.gas -= 32000n + 2n * (size! + 0x1fn >> 5n);
            const L = context.gas < 0n ? 0n : context.gas - (context.gas >> 6n);
            context.gas -= L;
            // context.value -= value!;
            context.L = L;

            // TODO: is calldata null on deployments?
            //       or is it the same as code?
            //       for instance, are CODESIZE and CALLDATASIZE the same on deployments? CODECOPY and CALLDATACOPY?
            context.subcontext = createContext({
                origin: context.origin,
                sender: context.address!,
                value: value!,
                gas: L,
                states: context.states,
                accountAccessSet: context.accountAccessSet,
                storageAccessSet: context.storageAccessSet,
                depth: context.depth + 1,
                code: context.memory!.slice(Number(offset), Number(offset) + Number(size)),
                refund: context.refund
            });
            context.subcontext.address = deriveAddress(context.subcontext);
            if (context.accountAccessSet.has(context.subcontext.address!) == false) context.accountAccessSet.add(context.subcontext.address!);
            // context.states.push({ accounts: null, transientStorage: null, storage: null });

            context.blocked = true;
        }
    },

    instructionToString() {
        return "CREATE";
    }

};