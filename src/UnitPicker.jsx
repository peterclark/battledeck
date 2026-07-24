import { useEffect, useRef } from "react";
import { capitalize, map, range } from "lodash";
import classNames from "classnames";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { GiBowArrow, GiCrossedSwords } from "react-icons/gi";
import { FACTIONS, KEYWORDS } from "./data";
import { buzz, playTick } from "./sounds";

// The card's green/yellow/red damage track, one square per box
const DamageTrack = ({ damage }) => (
  <span className="flex items-center gap-0.5" aria-hidden>
    {map(range(damage.green), (i) => (
      <span key={`g${i}`} className="h-2 w-2 rounded-[2px] bg-moss-500" />
    ))}
    {map(range(damage.yellow), (i) => (
      <span key={`y${i}`} className="h-2 w-2 rounded-[2px] bg-ember-500" />
    ))}
    {map(range(damage.red), (i) => (
      <span key={`r${i}`} className="h-2 w-2 rounded-[2px] bg-blood-500" />
    ))}
  </span>
);

const Profile = ({ icon: Icon, profile }) => (
  <span className="flex items-center gap-1">
    <Icon className="text-xs text-ember-600" aria-hidden />
    {profile.dice}d · OS {profile.offensiveSkill} · P {profile.offensivePower}
    {profile.range ? ` · ${profile.range}″` : ""}
    {profile.ammo ? ` · ${profile.ammo} ammo` : ""}
  </span>
);

const UnitRow = ({ unit, selected, onSelect }) => (
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
      </span>
      <span className="shrink-0 font-mono text-[10px] text-bone-500">
        {unit.points} pts · {capitalize(unit.class)}
      </span>
    </span>
    <span className="flex w-full flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] leading-tight text-bone-300">
      {unit.melee && <Profile icon={GiCrossedSwords} profile={unit.melee} />}
      {unit.ranged && <Profile icon={GiBowArrow} profile={unit.ranged} />}
      <span>
        DS {unit.defensiveSkill} · T {unit.defensivePower}
      </span>
      <span>Cg {unit.courage}</span>
      <span>Mv {unit.move}″</span>
    </span>
    <span className="flex w-full items-center justify-between gap-2">
      <DamageTrack damage={unit.damage} />
      <span className="sr-only">
        Damage boxes: {unit.damage.green} green, {unit.damage.yellow} yellow,{" "}
        {unit.damage.red} red
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

// Full-screen unit picker, one section per faction. Same modal conventions
// as the rules help: focus moves in on open, the page behind is locked,
// Escape closes, Tab is trapped.
const UnitPicker = ({ role, selectedUid, onSelect, onClose }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    overlayRef.current?.focus();
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  const close = () => {
    onClose();
    playTick();
    buzz();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = overlayRef.current?.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === overlayRef.current)
    ) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="UnitPicker fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-iron-900"
      ref={overlayRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
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
            onClick={close}
            aria-label="Back to BattleDeck"
          >
            <FaArrowLeft />
          </button>
          <h2 className="flex min-w-0 flex-1 items-center justify-center font-display text-base font-bold uppercase tracking-[0.15em] text-ember-400">
            Pick {role}
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
          {map(FACTIONS, (faction) => (
            <div key={faction.id} className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
                {faction.name}
              </div>
              {map(faction.abilities, ({ name, text }) => (
                <div
                  key={name}
                  className="FactionAbility border-l-2 border-ember-600 pl-2.5 text-[10px] leading-snug text-bone-500"
                >
                  <span className="font-bold text-ember-500">
                    {name}.
                  </span>{" "}
                  {text}
                </div>
              ))}
              {map(faction.units, (unit) => {
                const uid = `${faction.id}/${unit.id}`;
                return (
                  <UnitRow
                    key={uid}
                    unit={unit}
                    selected={uid === selectedUid}
                    onSelect={() => onSelect(uid)}
                  />
                );
              })}
            </div>
          ))}
          <p className="text-center text-[10px] italic leading-snug text-bone-500">
            More factions and units are added as their cards are transcribed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitPicker;
