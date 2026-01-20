import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x1d,

    executor(context:Context) {
        const [shift, value] = pop(context.stack, 2);
        context.stack.push(BigInt.asUintN(256, BigInt.asIntN(256, value!) >> shift!));
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "SAR";
    }

};