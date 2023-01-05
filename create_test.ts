import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createMachine } from "./create.ts";

function getTestMachine() {
  const machine = createMachine({
    initial: "OFF",
    states: {
      ON: {
        on: {
          toggle: () => "OFF",
        },
      },
      OFF: {
        on: {
          toggle: () => "ON",
        },
      },
    },
  });

  return machine;
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
