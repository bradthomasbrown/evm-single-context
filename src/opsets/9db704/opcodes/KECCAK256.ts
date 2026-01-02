import type { Context } from "../../../types.js";
import { byteSliceToBigInt_be, keccak256, pop, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0x20,

    executor(context:Context) {
        const [offset, size] = pop(context.stack, 2);
        context.gas -= 30n + 6n * (size! + 0x1fn >> 5n);
        memoryExpand(context, Number(offset) + Number(size));
        context.stack.push(byteSliceToBigInt_be(keccak256(new Uint8Array(context.memory!.slice(Number(offset), Number(offset) + Number(size)))), 0, 0x20, false));
        context.pc++;
    },

    instructionToString() {
        return "KECCAK256";
    }

};