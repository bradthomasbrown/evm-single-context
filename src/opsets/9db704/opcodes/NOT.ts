import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x19,

    executor(context:Context) {
        const [a] = pop(context.stack, 1);
        context.stack.push(F.subtract(F.inverse(a!), 1n));
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "NOT";
    }

};