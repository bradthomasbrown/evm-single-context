import type { Context } from "../../../types.js";
import { pop, F } from "../../../lib.js";

export default {

    identifier: 0x0a,

    executor(context:Context) {
        let [a, exponent] = pop(context.stack, 2);
        context.stack.push(F.power(a!, exponent!));
        let byteSize = 0n; for (; exponent! > 0n; byteSize++, exponent! >>= 8n);
        context.gas -= 10n + 50n * byteSize;
        context.pc++;
    },

    instructionToString() {
        return "EXP";
    }

};