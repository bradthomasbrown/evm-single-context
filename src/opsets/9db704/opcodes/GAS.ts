import type { Context } from "../../../types.js";

export default {

    identifier: 0x5a,

    executor(context:Context) {
        context.gas -= 2n;
        context.stack.push(BigInt(context.gas));
        context.pc++;
    },

    instructionToString() {
        return "GAS";
    }

};