# 9TO5: Battle Cards

A corporate fantasy arcade game about surviving one completely normal workday. Create a workplace fighter, clock in, and face The Scrum Lord as the first encounter on a local, persistent run.

## Run and verify

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run test:e2e
node --import tsx scripts/balance.ts
```

Open the URL printed by Next.js. The existing local session uses http://localhost:3001. Browser tests expect that address and use installed Google Chrome; their executable is configured in `playwright.config.ts`. No account, API key, backend, or external runtime assets are needed.

## Phase 3 create your fighter

The current flow is Landing -> Create Fighter -> Fighter Reveal -> Workday -> Scrum Lord Battle -> Result -> Office Loot -> Workday. Creation is a five-step arcade sequence:

1. Display name, capped at 18 characters.
2. Profession: Developer, Designer, Product, Marketing, Sales, Management or Other.
3. Exactly three strengths from Technical, Creative, Fast, Strategic, Social, Organized, Curious and Chaotic.
4. One corporate kryptonite.
5. Fighting style: Builder, Creative, Operator or Seller.

`lib/fighter.ts` owns the deterministic modifier tables. Every generated fighter starts at 60 in Craft, Shipping, Creativity, People and Chaos, then receives strength, weakness and style redistribution. The final normalization keeps every stat in the 25-95 guideline range and every fighter at exactly 300 total points. Profession changes identity and flavor only; it does not grant raw power.

The creator reuses the approved hard-edged arcade visual direction: selectable cards, paper fighter file, Impact headings, monospace labels and compact responsive grids. The battle engine is unchanged. The selected fighter name, profession and style feed into the title card, reveal, VS screen, HUD, battle floor label, battle log and result text.

## Phase 4B Workday shell

The Workday is a fictional internal-operations schedule rather than a fantasy map. A versioned `9to5-workday-run` localStorage object holds the fighter, narrative time, current encounter, Mental Capacity, completed encounters and run status. Refreshing an active, completed or failed run returns to its Workday state.

Narrative time begins at 09:00, advances to 09:30 when the player enters The Scrum Lord meeting, and resolves to 09:47 on victory or 09:42 on defeat. It is event-driven rather than real time. The schedule promises locked 11:15, 14:00 and 16:59 problems and presents 17:00 CLOCK OUT as the destination without implementing those encounters.

The battle starts from the run's current Mental Capacity. Victory persists the remaining value, marks The Scrum Lord complete and enters Office Loot through CLAIM YOUR COMPENSATION. Defeat retains PUT ON A PIP, then END SHIFT opens a failed-workday form. CLOCK IN AGAIN resets health, time, completion, desk items and battle state while keeping the fighter; NEW EMPLOYEE returns to creation.

The existing 4:59 PM chaos resolver remains available through the battle engine's `allowChaos` option. The 09:30 Workday encounter explicitly disables it so the morning timeline remains coherent.

## Phase 4C office loot

Victory now creates a persisted `reward-pending` run with three distinct choices. `lib/items.ts` contains six handcrafted, typed definitions and a Fisher–Yates generator with injectable randomness for deterministic tests. The choices survive refresh; selecting one atomically adds it to the run, clears the offers and completes the prototype. The Workday condition report then shows a compact **YOUR DESK** slot beside persistent Mental Capacity.

The pool contains Noise Cancelling Headphones (first enemy attack −40%), Double Espresso (maximum and starting Caffeine +1), Second Monitor (all damaging attacks +3), Ergonomic Chair (incoming attacks −2), Company MacBook (first damaging card +8) and intentionally useless rare LinkedIn Premium. Battle state tracks per-battle Headphones and MacBook consumption, the dynamic Caffeine maximum and future-compatible item arrays. Arena receipts name equipment bonuses or reductions directly; permanent desk items stay separate from temporary **ACTIVE BULLSHIT** statuses.

The reward screen combines physical trading cards with procurement paperwork: rarity, category, full effect and flavour remain visible on every offer. Keyboard selection is native, chosen state has a structural border and confirmation receipt, and both rejected cards receive a readable BUDGET DENIED stamp. Mobile uses full-width stacked comparison cards. Reduced motion removes transforms while preserving selection and confirmation states.

## Phase 4A comprehension

The first battle opens with three short, keyboard-accessible prompts for Mental Capacity, caffeine and cards. The first turn marks Ship It as a good place to start. Acting once persists `9to5-battle-tutorial-seen`; later battles and rematches go directly to player control. The first Scope Creep adds a separate one-time explanation persisted as `9to5-status-tutorial-seen`. A compact `? HELP` desk reference remains available without resetting either tutorial.

The persistent **ACTIVE BULLSHIT** area is the source of truth for temporary effects. Works On My Machine appears as a 70% block, stays visible through the enemy announcement, shows `CONSUMED` on impact, then disappears. Scope Creep appears after it is added, persists across the next player action and enemy anticipation, shows `CONSUMED` with the enhanced hit, then disappears.

Every common round now presents one important event at a time: caffeine spend (600ms), player move announcement (700ms), player impact and health consequence (750ms), enemy turn handoff (650ms), named enemy move (700ms), enemy impact and health consequence (750ms), then caffeine refill (700ms). A common round is about 4.85 seconds. Recoil, heal, status and chaos branches add their own readable beat. Result presentation waits for a 1.2 second defeated-fighter reaction after Mental Capacity reaches zero.

Caffeine shows cups plus an exact `n / 3` count. Spend and refill beats display before/after values; unaffordable cards state both the requirement and current amount. Cards now separate type, expected effect, cost and a short description. Damage receipts in the arena show health before/after, Scope Creep base/bonus/total, and Works On My Machine incoming/blocked/final damage. Combat Receipts remain supporting flavour.

## Phase 2 game feel

Each round is an immutable timeline: selection/caffeine spend → named anticipation → player impact → separate recoil if needed → enemy turn handoff → named NPC anticipation → enemy impact → buff/heal → optional chaos warning and explicit dual damage → refill → next input.

- Defence: debug terminal, shield frame, blocked amount, incoming damage before/after, and a situational “Declined.”
- Ship It: deployment progress, forward card snap, orange streak and impact.
- Force Push: git flash, stronger restrained shake, burst, then a distinct “Production incident” recoil beat.
- Summon: ghost of the actual previous damaging card, 70% power label, accepted-answer feedback.
- Quick Call: original calendar-style invitation.
- Scope Creep: persistent Active Bullshit ticket and explicit base/+8/total damage receipt when consumed.
- Standup: three checklist lines followed by green +health, separate from damage.
- Ceremony: short stack of calendar blocks and heavier impact.
- Health: delayed damage trail, numeric HP, subtle burnout warning below 25, defeat reaction.
- Caffeine: individual spend/refill cup reactions with before/after counts; unavailable cards remain focusable with `aria-disabled` and explain the exact constraint when activated. Resolving/result actions remain natively disabled.
- Chaos: only the existing 4:59 PM message. Warning first, then a separate receipt shows both fighters taking 5. The office clock stays at 4:59 until rematch.

## Balance

Ship It is now **24–32** (previously 22–30). Standup heals **4** (previously 5). Base NPC weights are **45% Quick Call / 20% Standup / 20% Scope Creep / 15% Ceremony**, redistributed when preventing repetition. Standup and Scope cannot repeat consecutively; other moves cannot repeat three times. All other card costs, damage ranges, defence percentage, recoil chance, summon multiplier and chaos odds are unchanged.

Reproducible 2,000-battle samples per strategy (10,000 total):

| Strategy | Average rounds | Median | 90th percentile | Within 4–6 rounds |
| --- | ---: | ---: | ---: | ---: |
| Ship only | 4.00 | 4 | 4 | 98.7% |
| Force Push when affordable | 3.03 | 3 | 3 | 3.4% |
| Mixed, 20% defence | 4.57 | 4 | 6 | 69.0% |
| Defensive, 50% defence | 6.06 | 6 | 9 | 54.5% |
| Defence only | 15.23 | 15 | 17 | 0% |

These are simulated strategies, not human playtest claims. Pure blocking still prolongs fights; aggressive Force Push can finish in three. No turn cap, new damage penalty or new mechanic was added to force those extremes into the target window.

## Sound

`lib/sound.ts` synthesizes original short oscillator envelopes through Web Audio: hover, selection, light/heavy attack, block, heal, refill, chaos, recoil, denied input, victory and defeat. There are no copied notification sounds, samples, downloads or licensed dependencies. Master gain is kept low. AudioContext is created/resumed only after a user gesture. Mute stops output immediately and is remembered as `9to5-muted` in localStorage. Unsupported/blocked audio or storage gracefully leaves the game playable. No audio plays on initial page load.

## Files

- `lib/fighter.ts`: creator choices, deterministic modifiers, stat normalization and default fighter.
- `lib/workday.ts`: versioned local run state, schedule data and victory/defeat transitions.
- `lib/items.ts`: six office item definitions, effect metadata and deterministic reward generation.
- `components/FighterCreator.tsx`: five-step fighter creation and reveal preview.
- `components/WorkdayScreen.tsx`, `CalendarTransition.tsx`: schedule, encounter briefing, prototype outcomes and meeting transition.
- `components/OfficeLoot.tsx`: three-item benefits selection, denial states and acquisition confirmation.
- `lib/battle.ts`: typed definitions, weighted choice, rules, immutable beat snapshots and timing.
- `lib/sound.ts`, `components/useArcadeSound.ts`: gesture-gated audio and mute lifecycle.
- `components/BattleScreen.tsx`: unchanged screen hierarchy, input lock, tutorial persistence and paced timeline playback.
- `components/BattleHelp.tsx`, `StatusPanel.tsx`: contextual teaching, replayable help and temporary-effect lifecycle.
- `components/BattleArena.tsx`, `MoveEffects.tsx`: office arena, ability-specific presentations and reactions.
- `components/CaffeineMeter.tsx`, `FighterHUD.tsx`, `AbilityCard.tsx`: resource, health and input feedback.
- `components/ChaosEvent.tsx`: advance warning before damage.
- `components/FighterPortrait.tsx`, `ResultOverlay.tsx`, `BattleLog.tsx`: retained Phase 1 components.
- `app/globals.css`: original styling plus scoped game-feel animations and reduced-motion overrides.
- `tests/battle.test.ts`, `tests/browser/game.spec.ts`: mechanics, sequencing, full battles and browser checks.
- `scripts/balance.ts`: seeded balance observations.

## Edge cases and limits

Player damage resolves first. A lethally hit enemy does not retaliate, but Force Push recoil still resolves and may cause a simultaneous knockout. Defence blocks the enemy attack including Scope's bonus, not recoil or chaos. Summon copies the actual prior rolled damage, including a previous summon. Percentage damage rounds to the nearest integer. Healing cannot exceed 100. Completed nonterminal rounds refill up to three caffeine. Simultaneous knockout displays mutual burnout. Rematch restores the encounter's starting Mental Capacity; continuing commits the final value to the run.

Reduced motion disables shakes, recoil transforms, pulses, reward-card transforms and Workday paper rotations while keeping every timed text and state beat intact. The prototype intentionally stops at 09:47; locked schedule entries have no mechanics. One item can currently be earned and a fresh run clears it; there are no permanent unlocks, duplicates, currencies or rarity upgrades. Phase 4A deliberately leaves the battle more verbose during special branches, and repeated long defensive rounds can still feel slow. Sound output and pacing still merit human listening/playtesting on real devices. There are no new bosses, online features, AI generation or accounts.
# 9to5
