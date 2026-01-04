import type { Context } from "../../../types.js";
import { getStateValue } from "../../../lib.js";

export default {

    identifier: 0x47,

    executor(context:Context) {
        const addressHex = context.address!;
        const account = getStateValue(context.states, null, "accounts", [addressHex]);
        context.stack.push(account === null ? 0n : BigInt(account.balance));
        context.gas -= 5n;
        context.pc++;
    },

    instructionToString() {
        return "SELFBALANCE";
    }

};