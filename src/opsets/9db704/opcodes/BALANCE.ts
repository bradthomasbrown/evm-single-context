import type { Context } from "../../../types.js";
import { getStateValue, numberToHex, pop } from "../../../lib.js";

export default {

    identifier: 0x31,

    executor(context:Context) {
        const [address] = pop(context.stack, 1);
        const addressHex = `0x${numberToHex(address!, 40)}`;
        const account = getStateValue(context.states, null, "accounts", [addressHex]);
        let C_aaccess = 2600n;
        if (context.accountAccessSet.has(addressHex)) C_aaccess = 100n;
        else (context.accountAccessSet.add(addressHex));
        context.stack.push(account === null ? 0n : BigInt(account.balance));
        context.gas -= C_aaccess;
        context.pc++;
    },

    instructionToString() {
        return "BALANCE";
    }

};