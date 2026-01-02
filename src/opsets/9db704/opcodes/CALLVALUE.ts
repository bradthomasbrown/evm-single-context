import type { Context } from "../../../types.js";

export default {

    identifier: 0x34,

    executor(context:Context) {
        context.gas -= 2n;
        context.stack.push(context.value);
        context.pc++;
    },

    instructionToString() {
        return "CALLVALUE";
    }

};