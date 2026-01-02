import type { Context } from "../../../types.js";
import { pop, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0xf3,

    executor(context:Context) {
        const [offset, size] = pop(context.stack, 2);
        context.reverted = false;
        if (size === 0n) return;
        memoryExpand(context, Number(offset) + Number(size));
        context.returndata = context.memory!.slice(Number(offset), Number(offset) + Number(size));
    },

    instructionToString() {
        return "RETURN";
    }

};