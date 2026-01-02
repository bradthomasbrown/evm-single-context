import type { Context } from "../../../types.js";
import { numberToHex, pop, copy, memoryExpand, getStateValue } from "../../../lib.js";

export default {

    identifier: 0x3c,

    executor(context:Context) {
        const [address, destOffset, offset, size] = pop(context.stack, 4);
        const addressHex = `0x${numberToHex(address!, 40)}`;
        let C_aaccess = 2600n;
        if (context.accountAccessSet.has(addressHex)) C_aaccess = 100n;
        else (context.accountAccessSet.add(addressHex));
        context.gas -= C_aaccess + 3n * (size! + 0x1fn >> 5n);
        memoryExpand(context, Number(offset) + Number(size));
        const account = getStateValue(context.states, null, "accounts", [addressHex]);
        copy(context.memory!, account === null ? null : account.code, Number(destOffset), Number(offset), Number(size), true);
    },

    instructionToString() {
        return "EXTCODECOPY";
    }

};