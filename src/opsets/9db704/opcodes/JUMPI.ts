import type { Context } from "../../../types.js";
import { pop } from "../../../lib.js";

export default {

    identifier: 0x57,

    executor(context:Context) {
        const [counter, b] = pop(context.stack, 2);
        context.gas -= 10n;
        if (b === 0n) { context.pc++; return; }
        if (new Uint8Array(context.code!)[Number(counter)] !== 0x5b) {
            console.log("REVERT: JUMP TO NON-JUMPDEST (JUMPI)");
            context.reverted = true;
            return;
        }
        context.pc = Number(counter);
    },

    instructionToString() {
        return "JUMPI";
    }

};