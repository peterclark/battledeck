import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, within } from "@testing-library/react";
import { find } from "lodash";
import ArmyBuilder from "./ArmyBuilder";
import { UNITS } from "./data";
import { loadArmy } from "./persistence";

const setup = () => {
  const utils = render(<ArmyBuilder onClose={vi.fn()} />);
  const summary = () => utils.container.querySelector(".ArmySummary");
  // the builder opens on its faction list and remembers where it was left,
  // so step back out to the list before going into a faction
  const toList = () => {
    if (!utils.container.querySelector(".FactionRow")) {
      fireEvent.click(utils.getByLabelText("Back to factions"));
    }
  };
  const openFor = (name) => {
    toList();
    fireEvent.click(utils.getByText(find(UNITS, { name }).factionName));
  };
  const add = (name) => {
    openFor(name);
    fireEvent.click(utils.getByLabelText(`Add one ${name}`));
  };
  const remove = (name) => {
    openFor(name);
    fireEvent.click(utils.getByLabelText(`Remove one ${name}`));
  };
  return { ...utils, summary, add, remove, openFor, toList };
};

describe("ArmyBuilder", () => {
  it("starts empty with a 2000 point budget and 4 Command Actions", () => {
    const { summary } = setup();
    expect(within(summary()).getByText("0")).toBeInTheDocument();
    expect(within(summary()).getByText("2000")).toBeInTheDocument();
    expect(within(summary()).getByText("2000 pts left")).toBeInTheDocument();
    expect(
      within(summary()).getByLabelText("4 Command Actions per turn")
    ).toHaveTextContent("4");
  });

  it("adding and removing units updates the totals", () => {
    const { summary, add, remove } = setup();
    add("Swordsmen"); // 197
    add("Swordsmen");
    add("Militia"); // 115
    expect(within(summary()).getByText("509")).toBeInTheDocument();
    expect(within(summary()).getByText("1491 pts left")).toBeInTheDocument();
    remove("Militia");
    expect(within(summary()).getByText("394")).toBeInTheDocument();
    expect(
      within(summary()).queryByText(/over by/)
    ).not.toBeInTheDocument();
  });

  it("shows how far over budget the roster is", () => {
    const { summary, add, getByLabelText } = setup();
    const lower = getByLabelText("Lower budget by 250");
    for (let i = 0; i < 6; i += 1) fireEvent.click(lower); // 2000 -> 500
    expect(within(summary()).getByText("500")).toBeInTheDocument();
    expect(
      within(summary()).getByLabelText("1 Command Actions per turn")
    ).toBeInTheDocument();
    add("Knights"); // 413
    add("Militia"); // 115 -> 528, over by 28
    expect(within(summary()).getByText("over by 28")).toBeInTheDocument();
  });

  it("clamps the budget to its floor", () => {
    const { getByLabelText } = setup();
    const lower = getByLabelText("Lower budget by 250");
    for (let i = 0; i < 12; i += 1) fireEvent.click(lower);
    expect(lower).toBeDisabled(); // stuck at 500, not below
  });

  it("caps Unique units at one copy", () => {
    const { add, getByLabelText } = setup();
    add("Sir Steaphen's Free Company");
    expect(
      getByLabelText("Add one Sir Steaphen's Free Company")
    ).toBeDisabled();
    expect(
      getByLabelText("Add one Swordsmen")
    ).toBeEnabled();
  });

  it("clear requires a second tap and empties the roster", () => {
    const { summary, add, getByText, toList } = setup();
    add("Peasant Mob");
    toList(); // clearing the whole roster lives on the faction list
    fireEvent.click(getByText("Clear army"));
    expect(within(summary()).getByText("70")).toBeInTheDocument(); // armed, not cleared
    fireEvent.click(getByText("Tap again to clear"));
    expect(within(summary()).getByText("0")).toBeInTheDocument();
  });

  it("drills from factions into one faction and back", () => {
    const utils = setup();
    // the list shows factions, not units
    expect(utils.getByText("Orc Army")).toBeInTheDocument();
    expect(utils.queryByLabelText("Add one Militia")).not.toBeInTheDocument();

    fireEvent.click(utils.getByText("Men of Hawkshold"));
    expect(utils.getByLabelText("Add one Militia")).toBeInTheDocument();
    // and only that faction's units
    expect(
      utils.queryByLabelText("Add one Orc Axemen")
    ).not.toBeInTheDocument();
    // clearing the whole roster belongs to the whole roster
    expect(utils.queryByText("Clear army")).not.toBeInTheDocument();

    fireEvent.click(utils.getByLabelText("Back to factions"));
    expect(utils.queryByLabelText("Add one Militia")).not.toBeInTheDocument();
    expect(utils.getByText("Clear army")).toBeInTheDocument();
  });

  it("faction rows count what you have fielded from each", () => {
    const utils = setup();
    const row = (name) =>
      [...utils.container.querySelectorAll(".FactionRow")].find((el) =>
        el.textContent.startsWith(name)
      );
    expect(row("Men of Hawkshold")).toHaveTextContent("13 units");
    utils.add("Swordsmen"); // 197
    utils.add("Swordsmen");
    utils.toList();
    expect(row("Men of Hawkshold")).toHaveTextContent("2 fielded · 394 pts");
    // untouched factions still advertise their size
    expect(row("Orc Army")).toHaveTextContent("12 units");
  });

  it("reopens on the faction it was left in", () => {
    const first = setup();
    first.add("Zombies");
    first.unmount();
    const second = setup();
    // straight back into the Undead, not the faction list
    expect(second.getByLabelText("Add one Zombies")).toBeInTheDocument();
    expect(second.getByLabelText("Back to factions")).toBeInTheDocument();
  });

  it("the Enemy army toggle edits a separate roster", () => {
    const utils = setup();
    utils.add("Swordsmen"); // into my army
    fireEvent.click(utils.getByText("Enemy army"));
    // the enemy roster starts empty — my Swordsmen aren't in it
    expect(within(utils.summary()).getByText("0")).toBeInTheDocument();
    fireEvent.click(utils.getByText("Orc Army"));
    fireEvent.click(utils.getByLabelText("Add one Trolls")); // 406
    expect(within(utils.summary()).getByText("406")).toBeInTheDocument();

    // each record landed under its own key
    expect(loadArmy().counts).toEqual({ "menOfHawkshold/swordsmen": 1 });
    expect(loadArmy("enemy").counts).toEqual({ "orcArmy/trolls": 1 });

    // and toggling back shows my roster again
    fireEvent.click(utils.getByText("Your army"));
    expect(within(utils.summary()).getByText("197")).toBeInTheDocument();
  });

  it("clearing the enemy army leaves yours standing", () => {
    const utils = setup();
    utils.add("Swordsmen");
    fireEvent.click(utils.getByText("Enemy army"));
    fireEvent.click(utils.getByText("Orc Army"));
    fireEvent.click(utils.getByLabelText("Add one Trolls"));
    fireEvent.click(utils.getByLabelText("Back to factions"));
    fireEvent.click(utils.getByText("Clear enemy army"));
    fireEvent.click(utils.getByText("Tap again to clear"));
    expect(loadArmy("enemy").counts).toEqual({});
    expect(loadArmy().counts).toEqual({ "menOfHawkshold/swordsmen": 1 });
  });

  it("each roster remembers its own browsed faction", () => {
    const utils = setup();
    utils.openFor("Swordsmen"); // mine -> Hawkshold
    fireEvent.click(utils.getByText("Enemy army"));
    // the enemy roster has its own place: still on the faction list
    expect(utils.getByText("Orc Army")).toBeInTheDocument();
    fireEvent.click(utils.getByText("Orc Army"));
    fireEvent.click(utils.getByText("Your army"));
    // mine is still where it was left
    expect(utils.getByLabelText("Add one Militia")).toBeInTheDocument();
  });

  it("persists the roster and budget across remounts", () => {
    const first = setup();
    first.add("Lancers");
    first.add("Lancers");
    fireEvent.click(first.getByLabelText("Raise budget by 250"));
    first.unmount();
    const second = setup();
    expect(
      within(second.summary()).getByText("480")
    ).toBeInTheDocument(); // 2 x 240
    expect(within(second.summary()).getByText("2250")).toBeInTheDocument();
    expect(
      second.getByLabelText("2 Lancers in army")
    ).toBeInTheDocument();
  });

  it("loadArmy drops unknown units and clamps stored counts and marks", () => {
    localStorage.setItem(
      "battledeck-army-v1",
      JSON.stringify({
        budget: 99999,
        counts: {
          "menOfHawkshold/lancers": 3,
          "menOfHawkshold/sirSteaphensFreeCompany": 5, // unique: clamp to 1
          "menOfHawkshold/retiredUnit": 2, // gone from the data: drop
          "menOfHawkshold/militia": "many", // not a number: drop
        },
        marks: {
          // lancers have 6 boxes: 99 clamps down, -2 clamps up, missing
          // copies fill with 0
          "menOfHawkshold/lancers": [99, -2],
          "menOfHawkshold/retiredUnit": [1],
        },
      })
    );
    expect(loadArmy()).toEqual({
      budget: 2000, // out-of-range budget falls back
      counts: {
        "menOfHawkshold/lancers": 3,
        "menOfHawkshold/sirSteaphensFreeCompany": 1,
      },
      marks: {
        "menOfHawkshold/lancers": [6, 0, 0],
        "menOfHawkshold/sirSteaphensFreeCompany": [0],
      },
      // no stored per-turn state, so every fielded copy starts unraised
      reanimated: {
        "menOfHawkshold/lancers": [false, false, false],
        "menOfHawkshold/sirSteaphensFreeCompany": [false],
      },
      // and with an unmarked Bravery box
      boxes: {
        "menOfHawkshold/lancers": [0, 0, 0],
        "menOfHawkshold/sirSteaphensFreeCompany": [0],
      },
      boxesThisTurn: {
        "menOfHawkshold/lancers": [0, 0, 0],
        "menOfHawkshold/sirSteaphensFreeCompany": [0],
      },
      // and un-Lashed (an Orc-only state, but every copy tracks it)
      lashed: {
        "menOfHawkshold/lancers": [false, false, false],
        "menOfHawkshold/sirSteaphensFreeCompany": [false],
      },
      // nothing stored for the builder's page, so it opens on its list
      faction: null,
    });
  });

  it("loadArmy clamps box marks to the boxes the card prints", () => {
    localStorage.setItem(
      "battledeck-army-v1",
      JSON.stringify({
        budget: 2000,
        counts: {
          "menOfHawkshold/swordsmen": 1, // Bravery: one box
          "monstersAndMercenaries/ogres": 1, // Spoils: one box
          "undeadArmy/zombies": 1, // faction has no box ability
        },
        boxes: {
          "menOfHawkshold/swordsmen": [9], // clamps to the single box
          "monstersAndMercenaries/ogres": [-3], // clamps up to 0
          "undeadArmy/zombies": [1], // no box to mark at all
        },
        // marks claimed for this turn can never exceed the marks standing
        boxesThisTurn: { "menOfHawkshold/swordsmen": [5] },
      })
    );
    const army = loadArmy();
    expect(army.boxes).toEqual({
      "menOfHawkshold/swordsmen": [1],
      "monstersAndMercenaries/ogres": [0],
      "undeadArmy/zombies": [0],
    });
    expect(army.boxesThisTurn["menOfHawkshold/swordsmen"]).toEqual([1]);
  });

  it("marking damage walks the copy through yellow, red, and destroyed", () => {
    const { add, getByLabelText, queryByText, getByText } = setup();
    add("Swordsmen"); // 5/2/3 damage track
    expect(queryByText("In the Yellow")).not.toBeInTheDocument();
    fireEvent.click(getByLabelText("Swordsmen damage box 5"));
    expect(getByText("In the Yellow")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Swordsmen damage box 7"));
    expect(getByText("In the Red")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Swordsmen damage box 10"));
    expect(getByText("Destroyed")).toBeInTheDocument();
    // tapping the last marked box heals it back off
    fireEvent.click(getByLabelText("Swordsmen damage box 10"));
    expect(getByText("In the Red")).toBeInTheDocument();
  });

  it("each fielded copy tracks damage separately and persists", () => {
    const first = setup();
    first.add("Lancers");
    first.add("Lancers");
    fireEvent.click(first.getByLabelText("Lancers #2 damage box 3"));
    expect(first.getByText("In the Yellow")).toBeInTheDocument(); // 3/2/1 track
    first.unmount();
    const second = setup();
    // copy #1 untouched, copy #2 still in the yellow
    expect(second.getByLabelText("Lancers #1 damage box 3")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(second.getByLabelText("Lancers #2 damage box 3")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("reanimating heals one damage and locks the unit until the next turn", () => {
    const utils = setup();
    utils.add("Zombies"); // Lesser Undead: 1 CA, 2/2/2 track
    const reanimate = () => utils.getByLabelText(/Reanimate Zombies/);
    // nothing to heal yet
    expect(utils.getByLabelText(/already Reanimated|Reanimate Zombies/))
      .toBeDisabled();
    fireEvent.click(utils.getByLabelText("Zombies damage box 4"));
    expect(utils.getByText("In the Red")).toBeInTheDocument();

    fireEvent.click(reanimate());
    // one box healed: 3 marked leaves it In the Yellow
    expect(utils.getByText("In the Yellow")).toBeInTheDocument();
    // and the copy is locked for the rest of the turn
    expect(
      utils.getByLabelText("Zombies already Reanimated this turn")
    ).toBeDisabled();
    expect(
      within(utils.container.querySelector(".TurnTally")).getByText("1 CA")
    ).toBeInTheDocument();

    fireEvent.click(utils.getByText("New turn"));
    expect(utils.container.querySelector(".TurnTally")).not.toBeInTheDocument();
    expect(reanimate()).toBeEnabled();
  });

  it("costs follow the classification and destroyed units can't be raised", () => {
    const utils = setup();
    utils.add("Death Knights"); // Greater Undead: 3 CA, 3/2/2 track
    fireEvent.click(utils.getByLabelText("Death Knights damage box 3"));
    expect(
      utils.getByLabelText("Reanimate Death Knights for 3 Command Actions")
    ).toBeEnabled();
    // destroyed: every box marked, so it is beyond Reanimating
    fireEvent.click(utils.getByLabelText("Death Knights damage box 7"));
    expect(utils.getByText("Destroyed")).toBeInTheDocument();
    expect(
      utils.getByLabelText(/Reanimate Death Knights/)
    ).toBeDisabled();
  });

  it("units without an Undead classification get no Reanimate button", () => {
    const utils = setup();
    utils.add("Swarm of Rats"); // Undead army, but no classification
    fireEvent.click(utils.getByLabelText("Swarm of Rats damage box 2"));
    expect(utils.container.querySelectorAll(".Reanimate")).toHaveLength(0);
    // its classified faction-mates still get one
    utils.add("Zombies");
    expect(utils.container.querySelectorAll(".Reanimate")).toHaveLength(1);
  });

  it("the once-per-turn lock survives a remount", () => {
    const first = setup();
    first.add("Zombies");
    fireEvent.click(first.getByLabelText("Zombies damage box 2"));
    fireEvent.click(first.getByLabelText(/Reanimate Zombies/));
    first.unmount();
    const second = setup();
    expect(
      second.getByLabelText("Zombies already Reanimated this turn")
    ).toBeDisabled();
  });

  it("marking an army-ability box costs a Command Action and can be erased", () => {
    const utils = setup();
    utils.add("Swordsmen"); // Hawkshold: one Bravery box
    const mark = () => utils.getByLabelText(/(Mark|Erase) Bravery on Swordsmen/);
    expect(mark()).toHaveTextContent("0/1");
    expect(utils.container.querySelector(".TurnTally")).not.toBeInTheDocument();

    fireEvent.click(mark());
    expect(
      utils.getByLabelText("Erase Bravery on Swordsmen")
    ).toHaveTextContent("1/1");
    expect(
      within(utils.container.querySelector(".TurnTally")).getByText("1 CA")
    ).toBeInTheDocument();

    // erasing a mark made this turn hands the Command Action back
    fireEvent.click(mark());
    expect(mark()).toHaveTextContent("0/1");
    expect(utils.container.querySelector(".TurnTally")).not.toBeInTheDocument();
  });

  it("a Spoils card cycles through every box it prints", () => {
    const utils = setup();
    utils.add("Elementalist"); // Mercenary: two Spoils boxes
    const mark = () =>
      utils.getByLabelText(/(Mark|Erase) Spoils on Elementalist/);
    fireEvent.click(mark());
    expect(mark()).toHaveTextContent("1/2");
    fireEvent.click(mark());
    expect(mark()).toHaveTextContent("2/2");
    expect(
      within(utils.container.querySelector(".TurnTally")).getByText("2 CA")
    ).toBeInTheDocument();
    // at the last box the next tap wipes the card clean
    fireEvent.click(mark());
    expect(mark()).toHaveTextContent("0/2");
  });

  it("marks outlive the turn even though their Command Actions don't", () => {
    const first = setup();
    first.add("Swordsmen");
    fireEvent.click(first.getByLabelText(/Mark Bravery on Swordsmen/));
    fireEvent.click(first.getByText("New turn"));
    // the turn's spend is gone, the mark is not
    expect(first.container.querySelector(".TurnTally")).not.toBeInTheDocument();
    expect(
      first.getByLabelText("Erase Bravery on Swordsmen")
    ).toHaveTextContent("1/1");

    // and erasing it next turn costs nothing and refunds nothing
    first.unmount();
    const second = setup();
    const mark = second.getByLabelText("Erase Bravery on Swordsmen");
    expect(mark).toHaveTextContent("1/1");
    fireEvent.click(mark);
    expect(second.container.querySelector(".TurnTally")).not.toBeInTheDocument();
  });

  it("Reanimating and box marks share one Command Action tally", () => {
    const utils = setup();
    utils.add("Elementalist"); // Mercenary: 1 CA per Spoils box
    fireEvent.click(utils.getByLabelText(/Mark Spoils on Elementalist/));
    // the tally spans factions, so cross into the Undead for the rest
    utils.add("Death Knights"); // Greater Undead: 3 CA to Reanimate
    fireEvent.click(utils.getByLabelText("Death Knights damage box 3"));
    fireEvent.click(utils.getByLabelText(/Reanimate Death Knights/));
    expect(
      within(utils.container.querySelector(".TurnTally")).getByText("4 CA")
    ).toBeInTheDocument();
  });

  it("units their army ability can't empower get no box button", () => {
    const utils = setup();
    utils.add("Antonian Horsemen"); // card back rules out Rune of Uruz
    utils.add("Zombies"); // Undead: the faction has no box ability
    expect(utils.container.querySelectorAll(".BoxMark")).toHaveLength(0);
    utils.add("Dwarven Axemen"); // but its faction-mates keep theirs
    expect(utils.container.querySelectorAll(".BoxMark")).toHaveLength(1);
  });

  it("Lash spends a Command Action for the turn and can be taken back", () => {
    const utils = setup();
    utils.add("Orc Axemen");
    const lash = () => utils.getByLabelText(/Lash Orc Axemen|Undo Lash/);
    expect(utils.container.querySelector(".TurnTally")).not.toBeInTheDocument();

    fireEvent.click(lash());
    expect(utils.getByLabelText("Undo Lash on Orc Axemen")).toBeInTheDocument();
    expect(
      within(utils.container.querySelector(".TurnTally")).getByText("1 CA")
    ).toBeInTheDocument();

    // taking an accidental Lash back refunds it
    fireEvent.click(lash());
    expect(
      utils.getByLabelText("Lash Orc Axemen for 1 Command Action")
    ).toBeInTheDocument();
    expect(utils.container.querySelector(".TurnTally")).not.toBeInTheDocument();

    // a new turn releases the Lash without a refund fuss
    fireEvent.click(lash());
    fireEvent.click(utils.getByText("New turn"));
    expect(utils.container.querySelector(".TurnTally")).not.toBeInTheDocument();
    expect(
      utils.getByLabelText("Lash Orc Axemen for 1 Command Action")
    ).toBeInTheDocument();
  });

  it("the Crazed Goblins get no Lash button", () => {
    const utils = setup();
    utils.add("Crazed Goblins");
    expect(utils.container.querySelectorAll(".TurnBuff")).toHaveLength(0);
    utils.add("Goblin Raiders"); // their faction-mates keep theirs
    expect(utils.container.querySelectorAll(".TurnBuff")).toHaveLength(1);
  });

  it("removing a copy drops its damage track", () => {
    const { add, remove, getByLabelText, queryByLabelText } = setup();
    add("Lancers");
    add("Lancers");
    fireEvent.click(getByLabelText("Lancers #2 damage box 1"));
    remove("Lancers");
    expect(queryByLabelText(/Lancers #2/)).not.toBeInTheDocument();
    // the remaining copy is the unmarked first one
    expect(getByLabelText("Lancers damage box 1")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
