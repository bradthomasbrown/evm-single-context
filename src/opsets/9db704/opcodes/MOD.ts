import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x06,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        context.stack.push(b! == 0n ? 0n : a! % b!);
        context.gas -= 5n;
        context.pc++;
    },

    instructionToString() {
        return "MOD";
    }

};