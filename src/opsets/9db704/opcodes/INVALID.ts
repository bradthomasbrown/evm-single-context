import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0xfe,

    executor(context:Context) {
        pop(context.stack, 2);
        // console.log("REVERT: INVALID");
        context.reverted = true;
        context.gas = 0n;
    },

    instructionToString() {
        return "INVALID";
    }

};