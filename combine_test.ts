import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createMachine } from "./create.ts";
import { combineMachines } from "./combine.ts";

function getToggleMachine() {
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

function getLoadingMachine() {
  const machine = createMachine({
    initial: "idle",
    states: {
      idle: {
        on: {
          load: () => "loading",
        },
      },
      loading: {
        on: {
          loaded: () => "idle",
        },
      },
    },
  });

  return machine;
}

const emptyState = {
  on: {},
};

function getEventMachine() {
  const machine = createMachine({
    initial: "open",
    states: {
      open: {
        on: {
          close: () => "closed",
          suspend: () => "suspended",
        },
      },
      closed: emptyState,
      suspended: emptyState,
    },
  });

  return machine;
}

Deno.test("should allow combine several machines in to one", () => {
  const toggleMachine = getToggleMachine();
  const loadMachine = getLoadingMachine();

  const machine = combineMachines({
    load: loadMachine,
    toggle: toggleMachine,
  });

  assertEquals(machine.state(), {
    toggle: "OFF",
    load: "idle",
  });
});

Deno.test("should allow send any type of event supported by at least one of the machines combined", () => {
  const toggleMachine = getToggleMachine();
  const loadMachine = getLoadingMachine();

  const machine = combineMachines({
    load: loadMachine,
    toggle: toggleMachine,
  });

  machine.send({ event: "toggle" });
  assertEquals(machine.state().toggle, "ON");

  machine.send({ event: "load" });
  assertEquals(machine.state().load, "loading");
});

Deno.test("should allow use the combination result to combine new machines", () => {
  const toggleMachine = getToggleMachine();
  const loadMachine = getLoadingMachine();

  const betslip = combineMachines({
    load: loadMachine,
    toggle: toggleMachine,
  });

  const event = getEventMachine();

  const machine = combineMachines({
    betslip,
    event,
  });

  machine.send({ event: "toggle" });
  assertEquals(machine.state().betslip.toggle, "ON");

  machine.send({ event: "load" });
  assertEquals(machine.state().betslip.load, "loading");

  machine.send({ event: "close" });
  assertEquals(machine.state().event, "closed");
});
