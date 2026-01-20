import type { Context } from "../../../types.js";
import { byteSliceToBigInt_be, pop } from "../../../lib.js";

export default {

    identifier: 0x35,

    executor(context:Context) {
        const [i] = pop(context.stack, 1);
        context.gas -= 3n;
        if (context.calldata === null) {
            context.stack.push(0n);
        } else {
            context.stack.push(byteSliceToBigInt_be(new Uint8Array(context.calldata), Number(i!), 0x20, true));
        }
        context.pc++;
    },

    instructionToString() {
        return "CALLDATALOAD";
    }

};