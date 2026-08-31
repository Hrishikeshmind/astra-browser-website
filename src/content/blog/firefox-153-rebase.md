---
title: "The Firefox 153 Rebase: 69 Security Bugs, 138 Patches, One Person"
date: 2026-08-31
author: Hrishikesh Gade
slug: firefox-153-rebase
order: 2
---

Astra is a fork. That means every few months, upstream Firefox and Zen Browser move forward, and I have to catch up — pulling in their changes without breaking the things I've already built on top.

The most recent rebase moved Astra's engine base from Firefox 149.0.2 to Firefox 153.0.4 (tracking Zen 1.21.14b). On paper that's "update the version number." In practice, it meant going through Mozilla's security advisory for that release cycle — MFSA 2026-77 — line by line.

That advisory listed 15 individually-numbered HIGH-severity CVEs plus 3 grouped batches of additional fixes across Firefox 153 and ESR 153.0. Every one of those had to be checked: does Astra's forked code already have this fix from a previous rebase? Does our custom patch set conflict with it? Is there even a public record of the fix I can pull from Mozilla's repository?

The final count: 69 out of 69 tracked security bugs integrated, spread across 138 individual patch files, validated clean against the real 153.0.4 source tree. Three of those bugs had no public Mercurial record to pull from at all — I documented the gap rather than guess at a fix, which felt like the more honest call than pretending it was handled.

A few things I learned doing this the hard way:

Static review isn't enough. More than once, a patch that looked correct on paper failed to apply cleanly against the real source — because line numbers had shifted, or a function had been refactored upstream. The only way to know a fix actually works is to apply it against a clean checkout and watch it either succeed or fail. No amount of reading diffs replaces that.

One constraint never moves: Astra's user-agent string has to keep reporting "Firefox." Not for branding reasons — because a huge number of services (GeForce NOW being the most visible example) gate functionality based on UA sniffing, and anything other than "Firefox" breaks compatibility for users. Astra's identity lives in the UI, not the UA string.

Some things get deliberately deferred. I chose not to do a full Firefox 154 rebase in the same pass, and macOS support stayed off the table entirely — I don't have Apple developer hardware or certificates, and I'd rather ship something solid for Windows and Linux than something half-working everywhere.

The security patch batch itself is validated and ready, but hasn't shipped in a release yet — I'm holding it for its own dedicated release once the launch-critical UI work is settled, rather than bundling it in with feature changes and making it harder to verify either one went well.

This is the unglamorous part of running a browser fork: most of the work isn't a new feature, it's making sure the ground underneath the features you already shipped doesn't have a hole in it.
