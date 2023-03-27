import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createMachine } from "./create.ts";

function getTestMachine() {
    const machine = createMachine({
        type: "D",
        initial: "OFF",
        states: {
            ON: {
                on: {
                    toggle: () => "OFF",
                },
            },
            OFF: {
                on: {
                    toggle: () => ({ target: "ON" }),
                },
            },
        },
    });

    return machine;
}

function getCounterMachine() {
    return createMachine({
        type: "ND",
        context: {
            count: 0,
        },
        initial: "empty",
        states: {
            empty: {
                on: {
                    inc: ({ context }) => {
                        context.count++;
                        return "not_empty";
                    },
                },
            },
            not_empty: {
                on: {
                    inc: ({ context }) => {
                        context.count++;
                        return { target: "not_empty" };
                    },
                    dec: ({ context }) => {
                        context.count--;
                        return context.count === 0 ? "empty" : { target: "not_empty" };
                    },
                },
            },
        },
    });
}

Deno.test("create a machine with some initial state", () => {
    const machine = getTestMachine();
    assertEquals(machine.state(), "OFF");
});

Deno.test("should create a machine that can receive events to modify its state", () => {
    const machine = getTestMachine();

    machine.send({ event: "toggle" });
    assertEquals(machine.state(), "ON");

    machine.send({ event: "toggle" });
    assertEquals(machine.state(), "OFF");
});

Deno.test("it should support internal context", () => {
    const counterMachine = getCounterMachine();

    counterMachine.send({ event: "inc" });
    counterMachine.send({ event: "inc" });
    counterMachine.send({ event: "dec" });

    assertEquals(counterMachine.state(), "not_empty");

    counterMachine.send({ event: "dec" });
    assertEquals(counterMachine.state(), "empty");
});
