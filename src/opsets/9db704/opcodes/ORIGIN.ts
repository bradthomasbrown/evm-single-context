import type { Context } from "../../../types.js";

export default {

    identifier: 0x32,

    executor(context:Context) {
        context.stack.push(BigInt(context.origin));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "ORIGIN";
    }

};