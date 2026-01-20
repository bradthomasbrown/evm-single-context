import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x56,

    executor(context:Context) {
        const [counter] = pop(context.stack, 1);
        context.gas -= 8n;
        if (new Uint8Array(context.code!)[Number(counter)] !== 0x5b) {
            console.log("REVERT: JUMP TO NON-JUMPDEST (JUMP)");
            context.reverted = true;
            return;
        }
        context.pc = Number(counter);
    },

    instructionToString() {
        return "JUMP";
    }

};