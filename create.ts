type Obj = Record<string, unknown>;

type TransitionArgs<C extends Obj> = {
    context: C;
};

type DFA<S extends Obj> = {
    type: "D";
    initial: keyof S;
    states: {
        [K in keyof S]: {
            [ON in keyof S[K]]: {
                [E in keyof S[K][ON]]: () => { target: keyof S } | keyof S;
            };
        };
    };
};

type NDFA<S extends Obj, C extends Obj> = {
    type: "ND";
    context: C;
    initial: keyof S;
    states: {
        [K in keyof S]: {
            [ON in keyof S[K]]: {
                [E in keyof S[K][ON]]: (args: TransitionArgs<C>) => { target: keyof S } | keyof S;
            };
        };
    };
};

type MachineDefinition<S extends Obj, C extends Obj> = DFA<S> | NDFA<S, C>;

type GenericMachine<States = any, Args extends Obj = any> = {
    state: () => States;
    send: (args: Args) => void;
};

type Machine<S extends Obj> = GenericMachine<
    keyof S,
    { event: ExtractEvents<MachineDefinition<S, any>> }
>;

type ExtractEvents<M extends MachineDefinition<any, any>> = {
    [K in keyof M["states"]]: keyof M["states"][K]["on"];
}[keyof M["states"]];

const isString = (v: unknown): v is string => typeof v === "string";

function createDFA<S extends Obj, C extends Obj>(machine: DFA<S>): Machine<S> {
    let state = machine.initial;

    function send(action: { event: ExtractEvents<MachineDefinition<S, C>> }) {
        // @ts-ignore correctness ensure in function signature
        const transitionFn = machine["states"][state]["on"][action.event as any];
        if (transitionFn !== undefined) {
            const newState = transitionFn();
            if (isString(newState)) {
                state = newState;
            } else {
                state = newState.target;
            }
        }
    }

    function stateGetter() {
        return state;
    }

    return {
        send,
        state: stateGetter,
    };
}

function createNDFA<S extends Obj, C extends Obj>(machine: NDFA<S, C>): Machine<S> {
    let state = machine.initial;
    let context = {...machine.context};

    function send(action: { event: ExtractEvents<MachineDefinition<S, C>> }) {
        // @ts-ignore correctness ensure in function signature
        const transitionFn = machine["states"][state]["on"][action.event as any];
        if (transitionFn !== undefined) {
            const newState = transitionFn({ context });
            if (isString(newState)) {
                state = newState;
            } else {
                state = newState.target;
            }
        }
    }

    function stateGetter() {
        return state;
    }

    return {
        send,
        state: stateGetter,
    };
}

function createMachine<S extends Obj, C extends Obj>(machine: MachineDefinition<S, C>): Machine<S> {
    return machine.type === "D" ? createDFA(machine) : createNDFA(machine);
}

export type { GenericMachine, Machine, MachineDefinition };
export { createMachine };
