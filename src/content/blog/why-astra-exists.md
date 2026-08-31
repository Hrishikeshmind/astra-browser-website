---
title: "Why I'm Building Astra"
date: 2026-08-31
author: Hrishikesh Gade
slug: why-astra-exists
order: 1
---

I didn't set out to build a company. I set out to build a browser I actually wanted to use.

I'm a student, and most of the browsers I used every day were built for someone else's defaults — someone else's search engine, someone else's idea of what "privacy" means, someone else's assumptions about what an Indian user needs. Astra started as a personal itch: what if the browser just worked the way I wanted it to, out of the box, without digging through ten menus?

Astra is a fork of Zen Browser, which is itself built on Firefox and Gecko. I didn't want to reinvent the engine — Firefox's engine is solid, open, and battle-tested. What I wanted to change was everything layered on top of it: the defaults, the workflow, the small frictions nobody bothers to fix because they're "good enough."

A few things I cared about from day one:

- **Local-first, always.** No Astra account, no forced cloud sync, no silent telemetry pipeline back to some dashboard I control. Your profile lives on your machine.
- **Vertical tabs and a real workspace model**, because horizontal tabs stop scaling the moment you have more than eight open.
- **Compact Mode** — a sidebar that gets out of your way until you need it, instead of permanently eating screen space.
- **Boost**, which lets you re-theme and re-font individual sites — including proper support for Indic scripts, which most browsers treat as an afterthought.
- **An AI sidebar** that docks whichever assistant you actually use, instead of bolting on one vendor's chatbot.

None of this is revolutionary on its own. What's different is that it's all built by one person, in the open, with no venture money and no roadmap dictated by an ads business. That means it's slower. It also means every feature that ships, ships because it solved a real problem I hit myself — not because it tested well with a focus group.

Astra is still in Public Beta. It has bugs. I find new ones constantly, sometimes hours before a release. But it's mine to fix, and yours to inspect — the whole thing is open source under MPL 2.0, same license as Firefox itself.

This blog is where I'll write about what I'm building, what breaks, and how I fixed it. Starting with the engine rebase — which was, without exaggeration, the hardest technical work I've done on this project so far.
