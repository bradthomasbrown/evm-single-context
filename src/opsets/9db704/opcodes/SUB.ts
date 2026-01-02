import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x03,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        context.stack.push(F.subtract(a!, b!));
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "SUB";
    }

};