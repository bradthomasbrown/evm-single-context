import type { Context } from "../../../types.js";
import { pop, getStateValue } from "../../../lib.js";

export default {

    identifier: 0x54,

    executor(context:Context) {
        const [key] = pop(context.stack, 1);
        let C_aaccess = 2100n;
        if (context.storageAccessSet.has(context.address!) === false) context.storageAccessSet.set(context.address!, new Set());
        if (context.storageAccessSet.get(context.address!)!.has(key!) === true) C_aaccess = 100n;
        else (context.storageAccessSet.get(context.address!)!.add(key!));
        context.gas -= C_aaccess;
        const value = getStateValue(context.states, null, "storage", [context.address!, key!]) ?? 0n;
        context.stack.push(value);
        context.pc++;
    },

    instructionToString() {
        return "SLOAD";
    }

};