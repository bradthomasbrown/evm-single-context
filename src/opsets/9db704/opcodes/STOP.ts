import type { Context } from "../../../types.js";

export default {

    identifier: 0x00,

    executor(context:Context) {
        context.reverted = false;
    },

    instructionToString() {
        return "STOP";
    }

};