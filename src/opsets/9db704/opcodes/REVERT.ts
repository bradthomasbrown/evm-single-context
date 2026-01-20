import type { Context } from "../../../types.js";
import { pop, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0xfd,

    executor(context:Context) {
        const [offset, size] = pop(context.stack, 2);
        // console.log("REVERT: REVERT");
        context.reverted = true;
        if (size === 0n) return;
        memoryExpand(context, Number(offset) + Number(size));
        context.returndata = context.memory!.slice(Number(offset), Number(offset) + Number(size));
    },

    instructionToString() {
        return "REVERT";
    }

};