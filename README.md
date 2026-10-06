# 9Ate8 Shifts — GTOP Butterfly of Relevance

Rexercise's Pine v6 indicator: automatic range boxes for top-down review, the
GTOP shift ribbon, and a watermark with an optional personal sticky note.

**v2.3 draft: TradingView compilation and visual acceptance remain pending.**
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

## Butterfly of Relevance

Rexercise's clarified definition is **one side purged, with its objective still
pending**. Being unbroken or untouched is not enough. This same relevance test
and chronological evaluation apply across the timeframe layers.

1. Keep completed full-wick source candles as hidden candidates within the
   lookback (default 120 source ranges per layer). Do not box them yet.
2. A strict buy-side purge activates the range with its low as pending DOL; a
   strict sell-side purge activates it with its high as pending DOL. Equal-edge
   touches alone do not activate relevance. The source candle must not close
   outside the range.
3. Keep that range while its objective remains pending. Inside candles and a
   repeat purge of the same side do not replace it or change its DOL. A 50%
   touch alone does not complete the opposite-extreme objective.
4. Retire it when the DOL is reached after activation, or a confirmed source
   close strictly outside invalidates it. A touch before the first purge is
   not counted as delivery after that purge. If the activation candle reaches
   both extremes, no still-pending objective can be established from its OHLC;
   omit it without claiming an intrabar path or a trade result.
5. Evaluate candidates chronologically and give older still-relevant ranges
   priority. Filter for relevance **before** applying the display cap (default
   three per layer, adjustable 1–8), so newer untouched candles cannot displace
   a relevant range. After delivery/invalidation, the next qualifying range
   moves forward in the displayed sequence. Untouched replacements stay hidden
   until they too have a purge with pending DOL.

The renderer repeats the relevance check; every automatic box must pass it.
Completed/invalidated ranges cannot be kept visible by a retirement toggle.
Lookback and display caps still apply; this is not an all-history scan.

| Layer | Source and visibility |
| --- | --- |
| Monthly | Native completed monthly candles; monthly charts or lower |
| Weekly | Native completed weekly candles; weekly charts or lower |
| Daily | Native completed daily candles; daily charts or lower |
| GTOP H4 | Complete New York windows from hourly data; H4 charts or lower |
| Hourly shift CRT | Chronological 8/9/10/11 selection; H1 charts or lower |
| M15 / M5 | Same relevance sequence on completed M15/M5 candles; respective TF or lower |
| Other chart TFs | Same sequence on the current chart TF, e.g. M1, M30, H2; avoids duplicate standard layers |

GTOP H4 windows: 1–5 AM Asia Expansion, 5–9 AM London Lunch, 9 AM–1 PM
GCT / New York AM, 1–5 PM New York PM, 5–9 PM CBDR + Early Asia, and
9 PM–1 AM Asia Open. The separate 2–8 PM CBDR and Monday boxes remain optional
scheduled overlays; this version does not automatically rank them as candidates.

Hourly selection begins with the completed 8 AM/PM range. Only a close outside
rolls to the candle that invalidated it while time remains in the 9–12 shift.
Replacements remain hidden until purged with pending DOL, then are labeled
**Shift CRT**, not another 9ate8. Objective delivery stops reselection for that
shift. Noon and
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
   The corrected purge/pending filter itself is mandatory for automatic boxes.
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

- **24 checks passed**: full-source parsing and exact Pine fixtures for hidden
  untouched/equal-touch ranges, one-side purge activation, pending objectives,
  same-side re-purges, pre-purge touches, invalidation/retirement, filter-before-cap
  ordering, chronological rollover and delayed replacement visibility, source
  layers, H4 coverage, and DOL-only drawing with a defensive rendering filter.
- **2 DST fixtures skipped**: an isolated probe demonstrated that PineTS returns
  the wrong UTC timestamp for 5 AM New York on both 2026 transition dates. These
  are explicitly reported as skips, not passes.
- A full-source local smoke run reached the watermark/ribbon renderer.
  Multi-timeframe range integration remains unverified: a minimal PineTS
  `request.security()` conditional-array reproduction returned `na`, whereas
  the identical local function returned the expected array.

**Required for v2.3 in TradingView:** compile/add-to-chart; validate M/W/D and H4 snapshots
on live and historical charts; verify source-close timing and historical
scrolling; check March 8 and November 1, 2026 NY DST; inspect note toggles, single
DOL rays, box readability, and ribbon layout. The user-supplied v2.2 screenshot
shows that build rendering in TradingView; this is not a validation of the new
v2.3 source or every timeframe path.

Implementation references: [confirmed HTF data](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/),
[conditional collections](https://www.tradingview.com/pine-script-docs/errors/RE10139/),
[multiline input](https://www.tradingview.com/pine-script-docs/concepts/inputs/).
