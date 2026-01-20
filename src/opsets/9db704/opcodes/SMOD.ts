import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x07,

    executor(context:Context) {
        const [a, b] = pop(context.stack, 2);
        context.stack.push(b! == 0n ? 0n : BigInt.asUintN(256, BigInt.asIntN(256, a!) % BigInt.asIntN(256, b!)));
        context.gas -= 5n;
        context.pc++;
    },

    instructionToString() {
        return "SMOD";
    }

};