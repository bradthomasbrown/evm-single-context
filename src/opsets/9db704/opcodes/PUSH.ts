import type { Context, Artifact } from "../../../types.js";

export default {

    identifier: 0x60,

    executor(context:Context, artifact:Artifact) {
        context.stack.push(artifact.literal!);
        context.gas -= artifact.variant! == 0 ? 2n : 3n;
        context.pc += artifact.variant! + 1;
    },

    instructionToString(instruction:number) {
        return `PUSH${instruction - 0x5f}`;
    }

};