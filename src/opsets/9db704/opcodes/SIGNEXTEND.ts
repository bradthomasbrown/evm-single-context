import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x0b,

    executor(context:Context) {
        const [b, x] = pop(context.stack, 2);
        context.stack.push(BigInt.asUintN(256, BigInt.asIntN(Number(b!) + 1 << 3, x!)));
        context.gas -= 5n;
        context.pc++;
    },

    instructionToString() {
        return "SIGNEXTEND";
    }

};