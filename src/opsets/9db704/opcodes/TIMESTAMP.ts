import type { Context } from "../../../types.js";

export default {

    identifier: 0x42,

    // this one is a bit weird
    // will need to use the timestamp in the block header
    executor(context:Context) {
        context.stack.push(BigInt(Date.now()) / 1000n);
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "TIMESTAMP";
    }

};