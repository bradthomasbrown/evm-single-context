import type { Context } from "../../../types.js";
import { pop, copy, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0x5e,

    executor(context:Context) {
        const [destOffset, offset, size] = pop(context.stack, 3);
        context.gas -= 3n + 3n * (size! + 0x1fn >> 5n);
        memoryExpand(context, Math.max(Number(offset) + Number(size), Number(destOffset) + Number(size)));
        copy(context.memory!, context.memory, Number(destOffset), Number(offset), Number(size), true);
        context.pc++;
    },

    instructionToString() {
        return "MCOPY";
    }

};