import type { Context, Artifact } from "./types.js";
import { createMachine } from "@bradthomasbrown/machine/6873f5";
import { byteSliceToBigInt_be, numberToHex, peek, copy, getStateValue, deriveAddress } from "./lib.js";
import * as opset from "./opsets/9db704/opset.js";

function continuePredicate(context:Context) {

    // if revert is known (true or false, not null), don't continue
    if (context.reverted !== null) return false;

    // if there is no code, don't continue
    if (context.code === null) return false;

    // if the program counter is beyond the code length, don't continue
    if (context.pc >= context.code.byteLength) return false;

    // if there is an incomplete subcontext, don't continue
    if (context.subcontext !== null && context.subcontext.reverted === null) return false;

    // otherwise, continue
    return true;

}

function parseInstruction(context:Context):[number,Artifact] {

    const codeArray = new Uint8Array(context.code!);
    const instruction = codeArray[context.pc]!;

    // PUSH handling
    if (instruction >= 0x5f && instruction < 0x80) {
        const variant = instruction - 0x5f;
        const width = variant + 1;
        const literal = byteSliceToBigInt_be(codeArray, context.pc + 1, variant, true);
        return [0x60, { variant, width, literal }];
    }

    // DUP handling
    if (instruction >= 0x80 && instruction < 0x90) {
        const variant = instruction - 0x80;
        const width = 1;
        const literal = null;
        return [0x80, { variant, width, literal }];
    }

    // SWAP handling
    if (instruction >= 0x90 && instruction < 0xa0) {
        const variant = instruction - 0x90;
        const width = 1;
        const literal = null;
        return [0x90, { variant, width, literal }];
    }

    // LOG handling
    if (instruction >= 0xa0 && instruction < 0xa5) {
        const variant = instruction - 0xa0;
        const width = 1;
        const literal = null;
        return [0xa0, { variant, width, literal }];
    }

    // default handling
    const variant = null;
    const width = 1;
    const literal = null;
    return [instruction, { variant, width, literal }];

}

const debug = true as boolean;

const identifierToString:Map<number,(instruction:number)=>string> = new Map();
for (const opcode of Object.values(opset))
    identifierToString.set(opcode.identifier, (instruction:number) => opcode.instructionToString(instruction));

let traceHelper:{
    instruction:null|number,
    pc:null|number,
    op:null|string,
    gas:null|number
    depth:null|number,
    stack:null|Array<string>,
    returnData:null|string,
    memoryWords:null|Array<string>,
    storage:null|{ [key:string]: string },
    stop:null|boolean
} = { instruction:null, gas:null, pc:null, op:null, depth:null, stack:null, returnData:null, memoryWords:null, storage:null, stop:null };

// NOTE: the entirety of this is just debug-related as of now
function preExecute(context:Context) {
    if (debug === false) return;
    const instruction = new Uint8Array(context.code!)[context.pc]!;
    let identifier = instruction;
    if (instruction >= 0x5f && instruction < 0x80) identifier = 0x60; // PUSH
    if (instruction >= 0x80 && instruction < 0x90) identifier = 0x80; // DUP
    if (instruction >= 0x90 && instruction < 0xa0) identifier = 0x90; // SWAP
    if (instruction >= 0xa0 && instruction < 0xa5) identifier = 0xa0; // LOG
    if (identifierToString.has(identifier) === false) throw new Error(`missing identiferToString.get(${numberToHex(identifier, 2)})`);
    traceHelper.instruction = instruction;
    traceHelper.pc = context.pc;
    traceHelper.op = identifierToString.get(identifier)!(instruction);
    traceHelper.gas = Number(context.gas);
    traceHelper.depth = context.depth;
    traceHelper.stack = context.stack.map(value => `0x${value.toString(16)}`);
    if (context.subcontext !== null && context.subcontext.to !== null && context.subcontext.returndata !== null)
        traceHelper.returnData = `0x${new Uint8Array(context.subcontext.returndata).toHex()}`;
    else traceHelper.returnData = null;
    if (context.memory !== null) {
        traceHelper.memoryWords = [];
        for (let i = 0; i < context.memoryWords << 5; i += 0x20) {
            const wordBytes = new ArrayBuffer(32);
            copy(wordBytes, context.memory, 0, i, 0x20, true);
            traceHelper.memoryWords.push(new Uint8Array(wordBytes).toHex());
        }
    }
    if (instruction == 0x54) {
        const [key] = peek(context.stack, 1);
        const value = getStateValue(context.states, null, "storage", [context.address!, key!]) ?? 0n;
        if (traceHelper.storage === null) traceHelper.storage = {};
        traceHelper.storage[numberToHex(key!, 64)] = numberToHex(value, 64);
    } else if (instruction == 0x55) {
        const [key, value] = peek(context.stack, 2);
        if (traceHelper.storage === null) traceHelper.storage = {};
        traceHelper.storage[numberToHex(key!, 64)] = numberToHex(value!, 64);
    }
    traceHelper.stop = instruction == 0x00;
}

const dispatch:Map<number,(context:Context, artifact:Artifact)=>void> = new Map();
for (const opcode of Object.values(opset))
    dispatch.set(opcode.identifier, opcode.executor);

function getExecutor(identifier:number) {
    if (dispatch.has(identifier)) return dispatch.get(identifier)!;
    throw new Error(`no executor found for identifier ${numberToHex(identifier, 2)}`);
}

function buildTraceObject(context:Context) {
    let gasCost:null|number = null;
    if ([0xf0, 0xf5].includes(traceHelper.instruction!)) gasCost = traceHelper.gas! - Number(context.gas) - Number(context.L);
    else gasCost = traceHelper.gas! - Number(context.gas);
    const traceObject:{
        pc:number,
        op:string,
        gas:number,
        gasCost:number
        depth:number,
        error?:string
        stack:Array<string>,
        returnData?:string,
        memory?:Array<string>,
        storage?:{ [key:string]: string },
        refund?:number
    } = {
        pc: traceHelper.pc!,
        op: traceHelper.op!,
        gas: traceHelper.gas!,
        gasCost,
        depth: traceHelper.depth!,
        stack: traceHelper.stack!
    };
    if (traceHelper.op == "INVALID") traceObject.gasCost = 0; // i don't know why
    if (gasCost > traceHelper.gas!) traceObject.error = "out of gas";
    if (traceHelper.returnData !== null) traceObject.returnData = traceHelper.returnData;
    if (traceHelper.memoryWords !== null) traceObject.memory = traceHelper.memoryWords;
    if (traceHelper.op! == "SLOAD" || traceHelper.op! == "SSTORE") traceObject.storage = traceHelper.storage!;
    if (context.refund != 0n) traceObject.refund = Number(context.refund);
    return traceObject;
}

const traceObjects:Array<ReturnType<typeof buildTraceObject>> = []

function postExecute(context:Context) {

    if (debug === true) traceObjects.push(buildTraceObject(context));

    if (context.gas < 0n) { context.reverted = true; return; }

    if (context.pc < context.code!.byteLength) return;

    if (context.reverted !== null) return;

    // if program counter is past code and we haven't yet decided on reverted
    // reverted is false
    // this detects end of execution if no STOP, REVERT, RETURN, etc. was provided in code
    context.reverted = false;

}

function initialize(context:Context) {

    if (context.address === null && context.to !== null) context.address = context.to;

    // for EoA deployments, address is null, but we'll need it in execution
    if (context.address === null && context.to === null) {
        context.address = deriveAddress(context);
        context.code = context.calldata;
    }

}

const SingleContextMachine = createMachine(
    continuePredicate,
    parseInstruction,
    preExecute,
    getExecutor,
    postExecute,
    initialize
);

export { SingleContextMachine, traceObjects, traceHelper };