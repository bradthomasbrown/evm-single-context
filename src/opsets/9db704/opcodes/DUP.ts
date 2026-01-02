import type { Context, Artifact } from "../../../types.js";

export default {

    identifier: 0x80,

    executor(context:Context, artifact:Artifact) {
        context.stack.push(context.stack[context.stack.length - artifact.variant! - 1]!);
        context.gas -= 3n;
        context.pc++;
    },

    instructionToString(instruction:number) {
        return `DUP${instruction - 0x7f}`;
    }

};