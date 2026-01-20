import type { Context } from "../../../types.js";
import { pop, getStateValue } from "../../../lib.js";

export default {

    identifier: 0x55,

    executor(context:Context) {
        const [key, newValue] = pop(context.stack, 2);

        let C_sstore_0 = 2100n;
        if (context.storageAccessSet.has(context.address!) === false) context.storageAccessSet.set(context.address!, new Set());
        if (context.storageAccessSet.get(context.address!)!.has(key!) === true) C_sstore_0 = 0n;
        else (context.storageAccessSet.get(context.address!)!.add(key!));

        const originalValue = getStateValue(context.states, 0, "storage", [context.address!, key!]) ?? 0n;
        const currentValue = getStateValue(context.states, context.states.length - 1, "storage", [context.address!, key!]) ?? 0n;

        let C_sstore_1:null|bigint = null;
        if ((currentValue == newValue) || (originalValue != currentValue)) C_sstore_1 = 100n;
        if ((currentValue != newValue) && (originalValue == currentValue) && (originalValue == 0n)) C_sstore_1 = 20000n;
        if ((currentValue != newValue) && (originalValue == currentValue) && (originalValue != 0n)) C_sstore_1 = 2900n;

        let r_dirtyclear = 0n;
        if ((originalValue != 0n) && (currentValue == 0n)) r_dirtyclear = -4800n;
        if ((originalValue != 0n) && (newValue == 0n)) r_dirtyclear = 4800n;

        let r_dirtyreset = 0n;
        if ((originalValue == newValue) && (originalValue == 0n)) r_dirtyreset = 19900n;
        if ((originalValue == newValue) && (originalValue != 0n)) r_dirtyreset = 2800n;

        let A_r = 0n;
        if ((currentValue != newValue) && (originalValue == currentValue) && (newValue == 0n)) A_r = 4800n;
        if ((currentValue != newValue) && (originalValue != currentValue)) A_r = r_dirtyclear + r_dirtyreset;

        context.gas -= C_sstore_0 + C_sstore_1!;
        context.refund += A_r;

        const state = context.states.at(-1)!;
        if (state.storage === null) state.storage = new Map();
        if (state.storage.has(context.address!) === false) state.storage.set(context.address!, new Map());
        state.storage.get(context.address!)!.set(key!, newValue!);

        context.pc++;
    },

    instructionToString() {
        return "SSTORE";
    }

};