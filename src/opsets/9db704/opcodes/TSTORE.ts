import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x5d,

    executor(context:Context) {
        const [key, value] = pop(context.stack, 2);

        context.gas -= 100n;

        const state = context.states.at(-1)!;
        if (state.transientStorage === null) state.transientStorage = new Map();
        if (state.transientStorage.has(context.address!) === false) state.transientStorage.set(context.address!, new Map());
        state.transientStorage.get(context.address!)!.set(key!, value!);

        context.pc++;
    },

    instructionToString() {
        return "TSTORE";
    }

};