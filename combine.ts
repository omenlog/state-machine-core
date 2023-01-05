import { GenericMachine } from "./create.ts";

function combineMachines<M extends Record<string, GenericMachine>>(machines: M) {
    function send(action: Parameters<M[keyof M]['send']>[0]) {
        for (const machine of Object.values(machines)) {
            machine.send(action);
        }
    }

    function stateGetter() {
        const state = {} as {
            [K in keyof M]: ReturnType<M[K]['state']>
        };

        for (const [machineName, machine] of Object.entries(machines)) {
            //@ts-ignore
            state[machineName] = machine.state();
        }

        return state;
    }

    return {
        state: stateGetter,
        send
    }
}

export { combineMachines };
