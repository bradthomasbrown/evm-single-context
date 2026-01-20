import type { Artifact, Context } from "../../../types.js";
import { pop, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0xa0,

    // only partially implemented
    executor(context:Context, artifact:Artifact) {
        const [offset, size, ...topics] = pop(context.stack, 2 + artifact.variant!);
        context.gas -= 375n * BigInt(topics.length + 1) + 8n * size!;
        if (context.gas < 0n) {
            console.log("REVERT: OUT OF GAS (LOG)");
            context.reverted = true;
            return;
        }
        memoryExpand(context, Number(offset!) + Number(size!));
        context.pc++;
    },

    instructionToString(identifier:number) {
        return `LOG${identifier - 0xa0}`;
    }

};