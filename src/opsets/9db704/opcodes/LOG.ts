import type { Artifact, Context } from "../../../types.js";
import { pop, memoryExpand } from "../../../lib.js";

export default {

    identifier: 0xa0,

    // only partially implemented
    executor(context:Context, artifact:Artifact) {
        const [offset, size, ...topics] = pop(context.stack, 2 + artifact.variant!);
        memoryExpand(context, Number(offset!) + Number(size!));
        context.gas -= 375n * BigInt(topics.length + 1) + 8n * size!;
        context.pc++;
    },

    instructionToString(identifier:number) {
        return `LOG${identifier - 0xa0}`;
    }

};