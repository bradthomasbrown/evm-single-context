import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x01,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        context.stack.push(F.add(a!, b!));
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "ADD";
    }

};