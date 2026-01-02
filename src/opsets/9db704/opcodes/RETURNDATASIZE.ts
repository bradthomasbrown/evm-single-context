import type { Context } from "../../../types.js";

export default {

    identifier: 0x3d,

    executor(context:Context) {
        context.stack.push(context.subcontext === null ? 0n : (context.subcontext.to === null ? 0n : (context.subcontext.returndata === null ? 0n : BigInt(context.subcontext.returndata.byteLength))));
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString() {
        return "RETURNDATASIZE";
    }

};