import type { Context } from "../../../types.js";

export default {

    identifier: 0x30,

    executor(context:Context) {
        context.stack.push(BigInt(context.address!));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "ADDRESS";
    }

};