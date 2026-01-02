import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x15,

    executor(context:Context) {
        const [a] = pop(context.stack, 1);
        context.stack.push(a! == 0n ? 1n : 0n);
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "ISZERO";
    }

};