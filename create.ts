type Obj = Record<string, unknown>;

type MachineDefinition<S extends Obj> = {
    initial: keyof S,
    states: {
        [K in keyof S]: {
            [ON in keyof S[K]]: {
                [E in keyof S[K][ON]]: () => keyof S
            }
        }
    }
}

type GenericMachine<States = any, Args extends Obj = any> = {
    state: () => States,
    send: (args: Args) => void
}

type Machine<S extends Obj> = GenericMachine<keyof S, { event: ExtractEvents<MachineDefinition<S>> }>

type ExtractEvents<M extends MachineDefinition<any>> = {
    [K in keyof M['states']]: keyof M['states'][K]['on']
}[keyof M['states']]

function createMachine<S extends Obj>(machine: MachineDefinition<S>): Machine<S> {
    let state = machine.initial;

    function send(action: { event: ExtractEvents<MachineDefinition<S>>}) {
        // @ts-ignore
        const transitionFn = machine['states'][state]['on'][action.event as any];
        if (transitionFn !== undefined) {
            state = transitionFn();
        }
    }

    function stateGetter() {
        return state;
    }

    return {
        send,
        state: stateGetter
    };
}

export type { MachineDefinition, Machine, GenericMachine };
export { createMachine };
