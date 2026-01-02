import type { Context } from "../../../types.js";

export default {

    identifier: 0x36,

    executor(context:Context) {
        context.stack.push(context.calldata === null ? 0n : BigInt(context.calldata.byteLength));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "CALLDATASIZE";
    }

};