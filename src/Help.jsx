import { useEffect, useState } from "react";
import { map } from "lodash";
import classNames from "classnames";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { PLATE_ON } from "./constants";
import { HELP_PAGES, HELP_ROOT } from "./helpContent";
import { useModalOverlay } from "./hooks";
import { buzz, playTick } from "./sounds";

// "Disrupt\n-ed" -> "Disrupted", "In the\nYellow" -> "In the Yellow"
const flatName = (name) => name.replace(/\n-/g, "").replace(/\n/g, " ");

// A live battle-screen toggle rendered beside the rule that mentions it —
// same state, sounds, and exclusion rules as the main grid.
const ActionChip = ({ mod, disabled, onToggle }) => (
  <button
    className={classNames(
      `HelpAction-${mod.id}`,
      "plate shrink-0 px-2 py-1.5 text-[10px] leading-tight",
      mod.on && PLATE_ON[mod.color]
    )}
    disabled={disabled}
    aria-pressed={mod.on}
    onClick={() => onToggle(mod)}
  >
    {flatName(mod.name)}
    {mod.count > 1 ? ` ×${mod.count}` : ""}
  </button>
);

const LinkCard = ({ to, note, index, numbered, onOpen }) => {
  const target = HELP_PAGES[to];
  const Icon = target.icon;
  return (
    <button
      className="plate flex w-full items-center gap-3 px-3 py-3 text-left"
      onClick={() => onOpen(to)}
    >
      {numbered && (
        <span className="font-display text-2xl leading-none text-ember-400">
          {index + 1}
        </span>
      )}
      <Icon className="shrink-0 text-2xl text-ember-600" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-sm tracking-wider text-bone-100">
          {target.title}
        </span>
        <span className="text-[11px] leading-tight text-bone-500">{note}</span>
      </span>
      <span className="text-bone-500" aria-hidden>
        &rsaquo;
      </span>
    </button>
  );
};

// Full-screen rules help. The app has no router, so navigation is a simple
// page-id stack: link cards push, back links pop, and backing out of the
// root page closes the overlay.
const Help = ({ onClose, modifiers, disabledModifiers, onToggleModifier }) => {
  const [stack, setStack] = useState([HELP_ROOT]);

  const pageId = stack[stack.length - 1];
  const page = HELP_PAGES[pageId];
  const parent = stack.length > 1 ? HELP_PAGES[stack[stack.length - 2]] : null;
  const Icon = page.icon;

  const openPage = (id) => {
    setStack((s) => [...s, id]);
    playTick();
    buzz();
  };

  const back = () => {
    if (parent) setStack((s) => s.slice(0, -1));
    else onClose();
    playTick();
    buzz();
  };

  // Escape pops one level (closing from the root, like the back button)
  const { overlayRef, overlayProps } = useModalOverlay(back);

  useEffect(() => {
    overlayRef.current?.scrollTo(0, 0);
  }, [overlayRef, pageId]);

  return (
    <div
      className="Help fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-iron-900"
      {...overlayProps}
      role="dialog"
      aria-modal="true"
      aria-label={`Rules help: ${page.title}`}
    >
      <div
        className="mx-auto flex min-h-dvh max-w-md flex-col text-bone-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-iron-500 bg-iron-900/95 px-3 py-2 backdrop-blur-sm">
          <button
            className="plate flex h-9 w-9 shrink-0 items-center justify-center text-bone-300"
            onClick={back}
            aria-label={parent ? `Back to ${parent.title}` : "Close help"}
          >
            <FaArrowLeft />
          </button>
          <h2 className="flex min-w-0 flex-1 items-center justify-center gap-2 font-display text-base font-bold tracking-[0.15em] text-ember-400">
            <Icon className="shrink-0 text-xl text-ember-600" aria-hidden />
            <span className="truncate">{page.title}</span>
          </h2>
          <button
            className="plate flex h-9 w-9 shrink-0 items-center justify-center text-bone-300"
            onClick={onClose}
            aria-label="Close help"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-3 pb-6 pt-3">
          {page.blurb && (
            <p className="text-center text-xs italic leading-snug text-bone-500">
              {page.blurb}
            </p>
          )}

          {map(page.sections, ({ heading, items }) => (
            <div key={heading} className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
                {heading}
              </div>
              <ul className="flex flex-col gap-1.5">
                {map(items, (item) => {
                  const { text, actions } =
                    typeof item === "string" ? { text: item } : item;
                  return (
                    <li
                      key={text}
                      className="flex items-start gap-2 border-l-2 border-iron-400 pl-2.5 text-xs leading-snug text-bone-300"
                    >
                      <span className="flex-1">{text}</span>
                      {actions && modifiers && onToggleModifier && (
                        <span className="flex shrink-0 flex-col items-stretch gap-1">
                          {map(
                            actions,
                            (id) =>
                              modifiers[id] && (
                                <ActionChip
                                  key={id}
                                  mod={modifiers[id]}
                                  disabled={disabledModifiers?.[id]}
                                  onToggle={onToggleModifier}
                                />
                              )
                          )}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {page.links && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
                {page.numbered ? "Order of play" : "Go deeper"}
              </div>
              {map(page.links, ({ to, note }, index) => (
                <LinkCard
                  key={to}
                  to={to}
                  note={note}
                  index={index}
                  numbered={page.numbered}
                  onOpen={openPage}
                />
              ))}
            </div>
          )}

          <button
            className="plate mt-2 flex h-10 items-center justify-center gap-2 text-xs tracking-widest text-bone-300"
            onClick={back}
          >
            <FaArrowLeft aria-hidden />
            {parent ? `Back to ${parent.title}` : "Back to BattleDeck"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;
