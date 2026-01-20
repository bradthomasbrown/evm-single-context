import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x02,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        context.stack.push(a! * b! % F.p);
        context.gas -= 5n;
        context.pc++;
    },

    instructionToString() {
        return "MUL";
    }

};