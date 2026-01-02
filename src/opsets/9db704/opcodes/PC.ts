import type { Context } from "../../../types.js";

export default {

    identifier: 0x58,

    executor(context:Context) {
        context.stack.push(BigInt(context.pc));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "PC";
    }

};