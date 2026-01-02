import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x1b,

    executor(context:Context) {
        const [shift, value] = pop(context.stack, 2);
        context.stack.push((value! << shift!) % F.p);
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "SHL";
    }

};