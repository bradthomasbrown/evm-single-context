import type { Context } from "../../../types.js";

export default {

    identifier: 0x38,

    executor(context:Context) {
        context.stack.push(context.code === null ? 0n : BigInt(context.code.byteLength));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "CODESIZE";
    }

};