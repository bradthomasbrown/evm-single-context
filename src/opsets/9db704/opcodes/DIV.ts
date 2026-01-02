import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x04,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        // we wonder if making this an explicit branch would be more optimized
        // if ternaries are "optimized" into CMOVES
        // then F.divide would always be executed, which is probably more expensive than just branching
        context.stack.push(b == 0n ? 0n : F.divide(a!, b!));
        context.gas -= 5n;
        context.pc++;
    },

    instructionToString() {
        return "DIV";
    }

};