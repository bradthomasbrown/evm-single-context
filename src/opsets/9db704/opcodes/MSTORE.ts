import type { Context } from "../../../types.js";
import { pop, memoryExpand, write } from "../../../lib.js";

export default {

    identifier: 0x52,

    executor(context:Context) {
        const [offset, value] = pop(context.stack, 2);
        context.gas -= 3n;
        memoryExpand(context, Number(offset) + 0x20);
        write(context.memory!, value!, Number(offset!), 0x20);
        context.pc++;
    },

    instructionToString() {
        return "MSTORE";
    }

};