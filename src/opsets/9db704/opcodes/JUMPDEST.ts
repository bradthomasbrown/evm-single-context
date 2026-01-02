import type { Context } from "../../../types.js";

export default {

    identifier: 0x5b,

    executor(context:Context) {
        context.gas -= 1n;
        context.pc++;
    },

    instructionToString() {
        return "JUMPDEST";
    }

};