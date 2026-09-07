# 9TO5: Battle Cards

A corporate fantasy arcade game: Hrishi, Frontend Developer, versus The Scrum Lord. Phase 2 refines game feel while retaining the original title, palette, portraits, card hand and battle layout. All combat remains local React state.

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

## Phase 2 game feel

Each round is an immutable timeline: selection/caffeine spend → named anticipation → player impact → separate recoil if needed → named NPC anticipation → enemy impact → buff/heal → optional chaos warning and simultaneous damage → refill → next input. Normal rounds take roughly 2–2.5 seconds; recoil and chaos add short beats. Terminal impact to result is approximately 1.5 seconds, including a defeated-fighter reaction and original audio stinger.

- Defence: debug terminal, shield frame, blocked amount, incoming damage before/after, and a situational “Declined.”
- Ship It: deployment progress, forward card snap, orange streak and impact.
- Force Push: git flash, stronger restrained shake, burst, then a distinct “Production incident” recoil beat.
- Summon: ghost of the actual previous damaging card, 70% power label, accepted-answer feedback.
- Quick Call: original calendar-style invitation.
- Scope Creep: sticky-note requirement and persistent +8 badge until the attack consumes it.
- Standup: three checklist lines followed by green +health, separate from damage.
- Ceremony: short stack of calendar blocks and heavier impact.
- Health: delayed damage trail, numeric HP, subtle burnout warning below 25, defeat reaction.
- Caffeine: individual spend/refill cup reactions; unavailable cards remain focusable with `aria-disabled` and explain the constraint when activated. Resolving/result actions remain natively disabled.
- Chaos: only the existing 4:59 PM message. Warning first, then both take 5. The office clock stays at 4:59 until rematch.

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

`lib/sound.ts` synthesizes original short oscillator envelopes through Web Audio: hover, selection, light/heavy attack, block, heal, refill, chaos, recoil, denied input, victory and defeat. There are no copied notification sounds, samples, downloads or licensed dependencies. Master gain is kept low. AudioContext is created/resumed only after a user gesture. Mute stops output immediately and is remembered as `9to5-muted` in localStorage; this is the only persisted state. Unsupported/blocked audio or storage gracefully leaves the game playable. No audio plays on initial page load.

## Files

- `lib/battle.ts`: typed definitions, weighted choice, rules, immutable beat snapshots and timing.
- `lib/sound.ts`, `components/useArcadeSound.ts`: gesture-gated audio and mute lifecycle.
- `components/BattleScreen.tsx`: unchanged screen hierarchy, input lock and timeline playback.
- `components/BattleArena.tsx`, `MoveEffects.tsx`: office arena, ability-specific presentations and reactions.
- `components/CaffeineMeter.tsx`, `FighterHUD.tsx`, `AbilityCard.tsx`: resource, health and input feedback.
- `components/ChaosEvent.tsx`: advance warning before damage.
- `components/FighterPortrait.tsx`, `ResultOverlay.tsx`, `BattleLog.tsx`: retained Phase 1 components.
- `app/globals.css`: original styling plus scoped game-feel animations and reduced-motion overrides.
- `tests/battle.test.ts`, `tests/browser/game.spec.ts`: mechanics, sequencing, full battles and browser checks.
- `scripts/balance.ts`: seeded balance observations.

## Edge cases and limits

Player damage resolves first. A lethally hit enemy does not retaliate, but Force Push recoil still resolves and may cause a simultaneous knockout. Defence blocks the enemy attack including Scope's bonus, not recoil or chaos. Summon copies the actual prior rolled damage, including a previous summon. Percentage damage rounds to the nearest integer. Healing cannot exceed 100. Completed rounds refill up to three caffeine. Simultaneous knockout displays mutual burnout. Rematch resets all battle state, clock and timers while keeping the sound preference.

Reduced motion disables shakes, recoil transforms, pulses and other animations while keeping text, numbers and sequenced effects visible. Sound output and pacing still merit human listening/playtesting on real devices. Phase 2 does not introduce any new fighters, bosses, progression or online features.
# 9to5
