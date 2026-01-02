import type { Context } from "../../../types.js";
import { pop, getStateValue } from "../../../lib.js";

export default {

    identifier: 0x5c,

    executor(context:Context) {
        const [key] = pop(context.stack, 1);
        context.gas -= 100n;
        const value = getStateValue(context.states, null, "transientStorage", [context.address!, key!]) ?? 0n;
        context.stack.push(value);
        context.pc++;
    },

    instructionToString() {
        return "TLOAD";
    }

};