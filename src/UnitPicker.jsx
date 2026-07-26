import { useState } from "react";
import { capitalize, filter, map, range, some, sumBy } from "lodash";
import classNames from "classnames";
import { FaArrowLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { GiBowArrow, GiCrossedSwords } from "react-icons/gi";
import { FACTIONS, FACTIONS_BY_ID, KEYWORDS, damageStatus } from "./data";
import { useModalOverlay } from "./hooks";
import { loadArmy } from "./persistence";
import { buzz, playTick } from "./sounds";

const STATUS_LABEL = {
  yellow: "In the Yellow",
  red: "In the Red",
  destroyed: "Destroyed",
};

const STATUS_TONE = {
  yellow: "text-ember-400",
  red: "text-blood-400",
  destroyed: "text-blood-500",
};

// The card's green/yellow/red damage track, one square per box; boxes
// under `marked` render dimmed (damage already taken)
const DamageTrack = ({ damage, marked = 0 }) => {
  const bands = [
    ...map(range(damage.green), () => "bg-moss-500"),
    ...map(range(damage.yellow), () => "bg-ember-500"),
    ...map(range(damage.red), () => "bg-blood-500"),
  ];
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {map(bands, (tone, box) => (
        <span
          key={box}
          className={classNames(
            "h-2 w-2 rounded-[2px]",
            tone,
            box < marked && "opacity-25"
          )}
        />
      ))}
    </span>
  );
};

const Profile = ({ icon: Icon, profile }) => (
  <span className="flex items-center gap-1">
    <Icon className="text-xs text-ember-600" aria-hidden />
    {profile.dice}d · OS {profile.offensiveSkill} · P {profile.offensivePower}
    {profile.range ? ` · ${profile.range}″` : ""}
    {profile.ammo ? ` · ${profile.ammo} ammo` : ""}
  </span>
);

const UnitRow = ({ unit, copy = null, copies = 0, marked = 0, selected, onSelect }) => {
  const status = copy === null ? null : damageStatus(unit, marked);
  return (
  <button
    className={classNames(
      "UnitRow plate flex w-full flex-col gap-1 px-3 py-2 text-left",
      selected && "plate-on-gold"
    )}
    aria-pressed={selected}
    onClick={onSelect}
  >
    <span className="flex w-full items-baseline justify-between gap-2">
      <span className="font-display text-sm tracking-wider text-bone-100">
        {unit.name}
        {copies > 1 ? ` #${copy + 1}` : ""}
      </span>
      <span className="shrink-0 font-mono text-[10px] text-bone-500">
        {unit.points} pts
        {unit.class ? ` · ${capitalize(unit.class)}` : ""}
      </span>
    </span>
    <span className="flex w-full flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] leading-tight text-bone-300">
      {unit.melee && <Profile icon={GiCrossedSwords} profile={unit.melee} />}
      {unit.ranged && <Profile icon={GiBowArrow} profile={unit.ranged} />}
      <span>
        DS {unit.defensiveSkill} · T {unit.defensivePower}
      </span>
      <span>Cg {unit.courage ?? "—"}</span>
      <span>Mv {unit.move}″</span>
      {unit.fly && <span>Fly {unit.fly}″</span>}
      {unit.spoils && <span>Spoils ×{unit.spoils}</span>}
    </span>
    <span className="flex w-full items-center justify-between gap-2">
      <DamageTrack damage={unit.damage} marked={marked} />
      {status && STATUS_LABEL[status] && (
        <span
          className={classNames("font-mono text-[9px]", STATUS_TONE[status])}
        >
          {STATUS_LABEL[status]}
        </span>
      )}
      <span className="sr-only">
        Damage boxes: {unit.damage.green} green, {unit.damage.yellow} yellow,{" "}
        {unit.damage.red} red{copy !== null ? `, ${marked} marked` : ""}
      </span>
    </span>
    {map(unit.abilities, ({ name, text }) => (
      <span
        key={name}
        className="text-[10px] leading-snug text-bone-500"
      >
        <span className="font-bold text-bone-300">{name}.</span> {text}
      </span>
    ))}
    {map(unit.keywords, (id) => (
      <span key={id} className="text-[10px] leading-snug text-bone-500">
        <span className="font-bold text-ember-500">{KEYWORDS[id].name}.</span>{" "}
        {KEYWORDS[id].text}
      </span>
    ))}
  </button>
  );
};

// One faction's card on the picker's front page: tapping it opens that
// faction's units. The count reflects the current army/all filter, so it
// matches what's actually behind the card.
const FactionRow = ({ faction, count, onOpen }) => (
  <button
    className="FactionRow plate flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
    onClick={onOpen}
  >
    <span className="font-display text-sm tracking-wider text-bone-100">
      {faction.name}
    </span>
    <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-bone-500">
      {`${count} unit${count === 1 ? "" : "s"}`}
      <FaChevronRight className="text-[9px] text-ember-600" aria-hidden />
    </span>
  </button>
);

// Full-screen unit picker. Two levels, like the rules help's page stack:
// a faction list, then one faction's units. Back steps up a level and
// closes from the list. Same modal conventions as the help overlay: focus
// moves in on open, the page behind is locked, Escape closes, Tab is
// trapped.
const UnitPicker = ({
  role,
  selectedUid,
  selectedCopy,
  factionId,
  onFactionChange,
  onSelect,
  onClose,
}) => {
  // A built army narrows the picker to its own units by default; with no
  // army yet, everything shows. "Show all" covers picking an enemy
  // defender that isn't in the player's roster.
  const [army] = useState(loadArmy);
  const armyCounts = army.counts;
  const hasArmy = some(armyCounts, (count) => count > 0);
  const [showAll, setShowAll] = useState(!hasArmy);

  const visibleUnits = (faction) =>
    filter(
      faction.units,
      (unit) => showAll || armyCounts[`${faction.id}/${unit.id}`] > 0
    );

  const toggleShowAll = () => {
    setShowAll((all) => !all);
    playTick();
    buzz();
  };

  const faction = FACTIONS_BY_ID[factionId] ?? null;
  const factionUnits = faction ? visibleUnits(faction) : [];

  // What the faction card advertises: the number of rows behind it, so a
  // unit fielded three times counts three times, exactly as it lists
  const rowCount = (f) =>
    sumBy(visibleUnits(f), (unit) =>
      Math.max(armyCounts[`${f.id}/${unit.id}`] ?? 0, 1)
    );

  const openFaction = (id) => {
    onFactionChange(id);
    playTick();
    buzz();
  };

  const close = () => {
    onClose();
    playTick();
    buzz();
  };

  // Back steps up to the faction list; from the list there's nowhere left
  // to go, so it closes the picker
  const back = () => (faction ? openFaction(null) : close());

  const { overlayProps } = useModalOverlay(close);

  return (
    <div
      className="UnitPicker fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-iron-900"
      {...overlayProps}
      role="dialog"
      aria-modal="true"
      aria-label={`Pick ${role} unit`}
    >
      <div
        className="mx-auto flex min-h-dvh max-w-md flex-col text-bone-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-iron-500 bg-iron-900/95 px-3 py-2 backdrop-blur-sm">
          <button
            className="plate flex h-9 w-9 shrink-0 items-center justify-center text-bone-300"
            onClick={back}
            aria-label={faction ? "Back to factions" : "Back to BattleDeck"}
          >
            <FaArrowLeft />
          </button>
          <h2 className="flex min-w-0 flex-1 flex-col items-center justify-center text-center font-display font-bold uppercase tracking-[0.15em] text-ember-400">
            <span className="text-base leading-none">Pick {role}</span>
            {faction && (
              <span className="truncate text-[10px] leading-tight tracking-[0.25em] text-bone-500">
                {faction.name}
              </span>
            )}
          </h2>
          <button
            className="plate flex h-9 w-9 shrink-0 items-center justify-center text-bone-300"
            onClick={close}
            aria-label="Close unit picker"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-3 pb-6 pt-3">
          {hasArmy && (
            <button
              className="ShowAllUnits plate h-9 text-[11px] font-bold uppercase tracking-[0.25em] text-bone-300"
              aria-pressed={showAll}
              onClick={toggleShowAll}
            >
              {showAll ? "Show only my army" : "Show all units"}
            </button>
          )}
          {!faction &&
            map(
              filter(FACTIONS, (f) => visibleUnits(f).length),
              (f) => (
                <FactionRow
                  key={f.id}
                  faction={f}
                  count={rowCount(f)}
                  onOpen={() => openFaction(f.id)}
                />
              )
            )}

          {faction && (
            <div className="flex flex-col gap-1.5">
              {map(faction.abilities, ({ name, text }) => (
                <div
                  key={name}
                  className="FactionAbility border-l-2 border-ember-600 pl-2.5 text-[10px] leading-snug text-bone-500"
                >
                  <span className="font-bold text-ember-500">{name}.</span>{" "}
                  {text}
                </div>
              ))}
              {map(factionUnits, (unit) => {
                const uid = `${faction.id}/${unit.id}`;
                const copies = armyCounts[uid] ?? 0;
                // fielded units list one row per copy, each with its own
                // damage state; everything else is a plain row
                if (!copies) {
                  return (
                    <UnitRow
                      key={uid}
                      unit={unit}
                      selected={uid === selectedUid && selectedCopy === null}
                      onSelect={() => onSelect(uid, null)}
                    />
                  );
                }
                return map(range(copies), (copy) => (
                  <UnitRow
                    key={`${uid}#${copy}`}
                    unit={unit}
                    copy={copy}
                    copies={copies}
                    marked={army.marks[uid]?.[copy] ?? 0}
                    selected={uid === selectedUid && copy === selectedCopy}
                    onSelect={() => onSelect(uid, copy)}
                  />
                ));
              })}
              {/* the remembered faction can outlive the army that filtered
                  it — say so rather than showing a blank page */}
              {!factionUnits.length && (
                <p className="text-center text-[10px] italic leading-snug text-bone-500">
                  No {faction.name} units in your army. Tap Show all units to
                  see the rest.
                </p>
              )}
            </div>
          )}

          {!faction && (
            <p className="text-center text-[10px] italic leading-snug text-bone-500">
              More factions and units are added as their cards are transcribed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitPicker;
