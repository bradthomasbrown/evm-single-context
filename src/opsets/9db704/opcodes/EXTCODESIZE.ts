import type { Context } from "../../../types.js";
import { numberToHex, pop, getStateValue } from "../../../lib.js";

export default {

    identifier: 0x3b,

    executor(context:Context) {
        const [address] = pop(context.stack, 1);
        const addressHex = `0x${numberToHex(address!, 40)}`;
        let C_aaccess = 2600n;
        if (context.accountAccessSet.has(addressHex)) C_aaccess = 100n;
        else (context.accountAccessSet.add(addressHex));
        context.gas -= C_aaccess;
        const account = getStateValue(context.states, null, "accounts", [addressHex]);
        context.stack.push((account === null) || (account.code === null) ? 0n : BigInt(account.code.byteLength));
        context.pc++;
    },

    instructionToString() {
        return "EXTCODESIZE";
    }

};