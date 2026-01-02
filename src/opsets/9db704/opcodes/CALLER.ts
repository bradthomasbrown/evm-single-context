import type { Context } from "../../../types.js";

export default {

    identifier: 0x33,

    executor(context:Context) {
        context.gas -= 2n;
        context.stack.push(BigInt(context.sender));
        context.pc++;
    },

    instructionToString() {
        return "CALLER";
    }

};