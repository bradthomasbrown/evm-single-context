import type { Context, Artifact } from "../../../types.js";

export default {

    identifier: 0x90,

    executor(context:Context, artifact:Artifact) {
        const i = context.stack.length - 1;
        const j = context.stack.length - (artifact.variant! + 2);
        const a = context.stack[i];
        context.stack[i] = context.stack[j]!;
        context.stack[j] = a!;
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString(instruction:number) {
        return `SWAP${instruction - 0x8f}`;
    }

};