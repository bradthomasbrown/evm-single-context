import type { Context } from "../../../types.js";

export default {

    identifier: 0x59,

    executor(context:Context) {
        context.stack.push(context.memory === null ? 0n : BigInt(context.memoryWords << 5));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "MSIZE";
    }

};