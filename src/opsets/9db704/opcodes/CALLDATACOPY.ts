import type { Context } from "../../../types.js";
import { pop, copy, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0x37,

    executor(context:Context) {
        const [destOffset, offset, size] = pop(context.stack, 3);
        context.gas -= 3n + 3n * (size! + 0x1fn >> 5n);
        memoryExpand(context, Number(destOffset) + Number(size));
        copy(context.memory!, context.calldata, Number(destOffset), Number(offset), Number(size), true);
        context.pc++;
    },

    instructionToString() {
        return "CALLDATACOPY";
    }

};