import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x1a,

    executor(context:Context) {
        const [i, x] = pop(context.stack, 2);
        context.stack.push(x! >> (0x1fn - i! << 3n) & 0xffn);
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "BYTE";
    }

};