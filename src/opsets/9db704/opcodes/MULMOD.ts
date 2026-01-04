import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x09,

    executor(context:Context) {
        const [a, b, N] = pop(context.stack, 3);
        context.stack.push(a! * b! % N!);
        context.gas -= 8n;
        context.pc++;
    },

    instructionToString() {
        return "MULMOD";
    }

};