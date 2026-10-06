# 9Ate8 Shifts — GTOP Butterfly Visual Aid

Rexercise's Pine v6 indicator: automatic range boxes for top-down review, the
GTOP shift ribbon, and a watermark with an optional personal sticky note.

**v2.2 draft: TradingView compilation and visual acceptance remain pending.**
[Complete Pine source](Rexercise_GTOP_Ribbon_and_Ranges.pine).

## Changes

- Replaced the generated sequence/context card with an editable, multiline
  sticky note in the watermark settings. Its text does not drive range logic.
- Removed preselected July, September, Week3Sep, Thursday, London Lunch, and the
  October 5 bullish annotation. Dates start unset; shift biases start neutral.
  Manual H4 selection now supports any GTOP window.
- Automatic boxes are on by default. Manual anchors, gray context, and extra
  scheduled/historical range boxes are off by default.
- Each range keeps its box and **only its DOL extends**. No paired high/low rays.
  Optional internal 50% lines are off by default.

## Automatic selection: starting assumptions for review

This is a **mechanical candidate filter**, not a claim that Rexercise's complete
GTOP Butterfly criteria have been formalized or that a setup is confirmed.

1. Consider completed source candles within a bounded lookback (default 120
   source ranges per context layer), using their full wick high/low.
2. Retain older ranges through inside candles and single-side purges. A confirmed
   source-timeframe close strictly outside retires a range. A wick alone, or a
   close exactly on the boundary, does not invalidate it.
3. By default, also retire a range after both extremes have been reached by
   later completed source candles. This optional display rule identifies
   consumed outer liquidity; it does not infer intrabar order or count a win.
   A 50% touch alone never retires a range.
4. After a strict one-side purge and close inside, extend the opposite untaken
   extreme as DOL. Untouched ranges remain boxed without an inferred DOL line.
5. Display the three most recent survivors per context layer (adjustable 1–8).
   Older survivors remain eligible within the lookback, but the display cap can
   hide them. This is not an all-history scan.

| Layer | Source and visibility |
| --- | --- |
| Monthly | Native completed monthly candles; monthly charts or lower |
| Weekly | Native completed weekly candles; weekly charts or lower |
| Daily | Native completed daily candles; daily charts or lower |
| GTOP H4 | Complete New York windows from hourly data; H4 charts or lower |
| Hourly shift CRT | Chronological 8/9/10/11 selection; H1 charts or lower |

GTOP H4 windows: 1–5 AM Asia Expansion, 5–9 AM London Lunch, 9 AM–1 PM
GCT / New York AM, 1–5 PM New York PM, 5–9 PM CBDR + Early Asia, and
9 PM–1 AM Asia Open. The separate 2–8 PM CBDR and Monday boxes remain optional
scheduled overlays; this version does not automatically rank them as candidates.

Hourly selection begins with the completed 8 AM/PM range. Only a close outside
rolls to the candle that invalidated it while time remains in the 9–12 shift.
Replacements are labeled **Shift CRT**, not another 9ate8. Both-extremes
consumption stops reselection for that shift under the default rule. Noon and
midnight clear the hourly selection. Missing hourly coverage stops the affected
sequence; missing H4 coverage clears unverified H4 state.

## Confirmation timing and limits

State uses **closed source candles**, available at the next source bar opening.
Daily purge/retirement updates therefore follow a daily close, weekly updates a
weekly close, and monthly updates a monthly close. This is **not live intraday
purge detection** for those layers. GTOP H4 updates with the next hourly sample
following its window. This conservative timing is a limitation of this draft.

Historical scrolling shows confirmed source state available at the viewport's
right edge. M/W/D boundaries follow the symbol's native session; named GTOP
windows and ribbons use **America/New_York**. Use standard time-based candles.

Layers remain independent: internal DOL is not discarded merely because a
higher-timeframe box exists. The engine does not force directional agreement,
confirm a parent-child Butterfly, classify CSD, estimate probability, or place
orders. The older optional manual execution overlays remain available.

## Install and watermark

1. Open the Pine source, choose Raw, and paste the complete script into a new
   TradingView Pine Editor indicator. Save and Add to chart.
2. Remove the old indicator instance, or reset inputs, to clear saved example
   settings. Editing source does not necessarily replace saved chart inputs.
3. Under **Watermark and sticky note**, enter **My sticky note**. **Sticky note**
   toggles the note; **Watermark** toggles the whole watermark. Blank notes draw
   nothing. The title, motto, symbol/date, note size, and colors are configurable.
4. Use H1 or lower for hourly shift analysis. For a ribbon-only view, turn off
   automatic boxes and leave manual/scheduled boxes off.

The connected Not The Job / The Job / Nightshift ribbon, visible-chart placement,
and optional H4 row are retained. Recreate TradingView alerts after script/input
changes. Existing eight-o'clock alerts remain separate from the automatic display.

## Validation

Run `npm ci && npm test`. Tests execute exact extracted Pine lifecycle functions
against synthetic OHLC fixtures with pinned **PineTS 0.11.0**, and parse the full
source. PineTS is a third-party runtime, not TradingView's compiler.

- **14 checks passed**: parsing; wick/close/boundary invalidation; midpoint
  retention; consumed extremes; older nested ranges; chronological rollover;
  shift expiry and delivery stop; missing shift data; complete H4 and missing-hour
  aggregation; a single DOL extension without paired rays.
- **2 DST fixtures skipped**: an isolated probe demonstrated that PineTS returns
  the wrong UTC timestamp for 5 AM New York on both 2026 transition dates. These
  are explicitly reported as skips, not passes.
- A full-source local smoke run reached the watermark/ribbon renderer.
  Multi-timeframe range integration remains unverified: a minimal PineTS
  `request.security()` conditional-array reproduction returned `na`, whereas
  the identical local function returned the expected array.

**Required in TradingView:** compile/add-to-chart; validate M/W/D and H4 snapshots
on live and historical charts; verify source-close timing and historical
scrolling; check March 8 and November 1, 2026 NY DST; inspect note toggles, single
DOL rays, box readability, and ribbon layout. Confirm the mechanical
selection/retirement assumptions against the intended Butterfly process before
treating this draft as final.

Implementation references: [confirmed HTF data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/),
[conditional collections](https://www.tradingview.com/pine-script-docs/errors/RE10139/),
[multiline input](https://www.tradingview.com/pine-script-docs/concepts/inputs/).
