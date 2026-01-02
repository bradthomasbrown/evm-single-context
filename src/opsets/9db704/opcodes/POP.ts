import type { Context } from "../../../types.js";

export default {

    identifier: 0x50,

    executor(context:Context) {
        context.stack.pop();
        context.gas -= 2n;
        context.pc++;
    },

    instructionToString(instruction:number) {
        return `POP`;
    }

};