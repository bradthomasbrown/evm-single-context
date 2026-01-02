import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x13,

    executor(context:Context) {
        let [a, b] = pop(context.stack, 2);
        a = BigInt.asIntN(256, a!);
        b = BigInt.asIntN(256, b!);
        context.stack.push(a! > b! ? 1n : 0n);
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString() {
        return "SGT";
    }

};