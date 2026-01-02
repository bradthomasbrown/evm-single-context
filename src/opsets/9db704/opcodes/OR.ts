import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x17,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        context.stack.push(a! | b!);
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "OR";
    }

};