---
title: "What Broke on Launch Night, and How I Chased It Down"
date: 2026-08-31
author: Hrishikesh Gade
slug: launch-night-regressions
order: 3
---

I want this blog to be honest about the parts of building Astra that don't go smoothly, so here's one of them.

Right before a planned release, I ran the actual build — not a quick local test, the real CI pipeline, all platforms — and it passed clean. Every job green. I took screenshots of the shipped binary to do a final visual check before calling it done.

Four things were broken that nothing in the automated pipeline had caught:

A layout option that was supposed to be disabled was still selectable in Settings — the underlying feature was correctly gated off, but the settings card itself was never wrapped in the same check.
Compact Mode's sidebar showed stale, overlapping visuals the very first time you opened it — a sync function that was supposed to keep things in order only ran when you hovered the mouse, so the very first paint, before any hover happened, showed the wrong state.
An icon landed in the wrong toolbar group in one specific layout combination, and clicking it didn't cleanly close the panel it opened.
The address bar became completely unclickable the moment Compact Mode was turned on — a stacking-order bug where one UI layer was silently sitting on top of another.
None of these were visible in headless testing. All four only showed up when I actually looked at the running browser.

I root-caused and fixed each one individually, verified with real automated browser tests — not just reading the code and assuming it was right — and pushed the fixes as a chain of small, focused commits rather than one giant change. One of the fixes even introduced a second, smaller regression of its own (an icon ended up 38 pixels out of place), which I caught the same way: by actually looking, not just trusting that "it compiled" meant "it works."

The lesson I keep re-learning on this project: a build passing CI tells you the code compiles and the automated checks pass. It does not tell you the browser looks or behaves correctly when a human opens it. Screenshots and manual passes on the actual shipped binary aren't optional extra polish — for a UI-heavy project like a browser, they're the only step that catches what automation structurally can't see.

Astra shipped that release with all four issues fixed before real users saw them. That's not a story about writing perfect code the first time — it's a story about not trusting "the pipeline is green" as the finish line.
