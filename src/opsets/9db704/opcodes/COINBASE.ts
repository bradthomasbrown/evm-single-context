import type { Context } from "../../../types.js";

export default {

    identifier: 0x41,

    // will need to use the block header
    executor(context:Context) {
        context.stack.push(0n);
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "COINBASE";
    }

};