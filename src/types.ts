type MapComponents<M, V = never, A extends unknown[] = []> =
    M extends Map<infer K, infer V>
        ? MapComponents<V, V, [...A, K]>
        : { keyPath:A, value:V };

type Context = {
    origin:string,
    sender:string,
    to:null|string,
    address:null|string,
    pc:number,
    gas:bigint,
    stack:Array<bigint>
    memory:null|ArrayBuffer
    C_mem_prev:bigint,
    returndata:null|ArrayBuffer
    accountAccessSet:Set<string>,
    storageAccessSet:Map<string,Set<bigint>>,
    depth:number,
    calldata:null|ArrayBuffer,
    value:bigint,
    subcontext:null|Context,
    blocked:boolean,
    reverted:null|boolean,
    states:Array<{
        accounts:null|Map<string,{ nonce:bigint, balance:bigint, code:null|ArrayBuffer }>,
        transientStorage:null|Map<string,Map<bigint,bigint>>,
        storage:null|Map<string,Map<bigint,bigint>>
    }>,
    refund:{ value:bigint },
    code:null|ArrayBuffer,
    memoryWords:number,
    L:null|bigint,
    delegatecall:boolean
};

type Artifact = {
    variant:null|number
    width:number,
    literal:null|bigint,
};


type PartialContext = {
    origin:string,
    sender:string,
} & Partial<Context>;

export type { MapComponents, Context, Artifact, PartialContext };