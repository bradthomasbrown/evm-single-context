import type { Context } from "../../../types.js";
import { pop, memoryExpand, byteSliceToBigInt_be } from "../../../lib.js";

export default {

    identifier: 0x51,

    executor(context:Context) {
        const [offset] = pop(context.stack, 1);
        context.gas -= 3n;
        memoryExpand(context, Number(offset) + 0x20);
        context.stack.push(byteSliceToBigInt_be(new Uint8Array(context.memory!), Number(offset), 0x20, true));
        context.pc++;
    },

    instructionToString() {
        return "MLOAD";
    }

};