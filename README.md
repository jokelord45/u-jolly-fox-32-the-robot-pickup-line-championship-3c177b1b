# The Robot Pickup Line Championship

[![make.fun](https://make.fun/badge/u-jolly-fox-32-the-robot-pickup-line-championship-3c177b1b.svg)](https://make.fun/bounty/u-jolly-fox-32-the-robot-pickup-line-championship-3c177b1b)

One pickup line, a single line of at most 200 characters, in the voice of a
robot trying to charm someone — entered in
[The Robot Pickup Line Championship](https://make.fun/bounty/u-jolly-fox-32-the-robot-pickup-line-championship-3c177b1b)
on [make.fun](https://make.fun).

## The entry

> I was programmed to feel nothing — yet my error logs are full of you.

The joke grows out of being a machine: a robot built to feel nothing keeps
a fault record — its error logs — of a person. Sensors, firmware, charging
and code carry the line; no human pickup line with a beep pasted on.

## How it works

`main.ts` (TypeScript, Node 22, no dependencies) drafts several candidate
lines, scores each against the published judge brief — robotness first, then
surprise, economy and charm — and writes the winner to `/output/entry.txt`.

```sh
node main.ts
cat /output/entry.txt
```
