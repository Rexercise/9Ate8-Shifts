# 9Ate8 Shifts — GTOP Ribbon + Ranges

Rexercise's Pine Script v6 indicator for a continuous session ribbon beneath
price, selected GTOP ranges, and manual higher-timeframe context.

**Current source: v2.1.**
[Open the complete Pine script](Rexercise_GTOP_Ribbon_and_Ranges.pine).
This is the saved October 5, 2026 version matching the higher hand-drawn ribbon.
The source is now tracked here; compilation and visual acceptance in TradingView
remain pending. It is an indicator, not an order-execution bot or a backtested
strategy.

## Install in TradingView

1. Open the script above, choose **Raw**, and copy the complete contents.
2. In TradingView's Pine Editor, create a new indicator and replace its contents.
3. Save and select **Add to chart**. Report any compiler error with its line number.
4. Use standard candles. Session ribbons and intraday range tracking run on
   1-minute through 4-hour charts; higher chart timeframes show selected context.
5. If replacing an older separate-pane version, remove that chart instance and
   add this version again.

## Ribbon defaults

All session boundaries use **America/New_York**, including daylight saving.

| Block | New York time |
| --- | --- |
| Not The Job | Midnight–9 AM |
| The Job / Day Shift | 9 AM–noon |
| Not The Job | Noon–9 PM |
| Nightshift | 9 PM–midnight |

The ribbon uses soft colors, one row, centered labels, and adjustable height and
gap beneath the visible candles. Labels shorten or hide when zoomed out. Matching
name-only blocks can join across market closures to avoid crowded repeated labels.
The current block extends to its scheduled end; the complete future-day schedule
is off by default. These extensions represent time windows only.

The green October 5 Day Shift block is a **manual annotation** from the drawing.
Other dates stay neutral with the default selected-date scope. Reset the bias,
date, and context-anchor inputs for a new analysis. The July/September, weekly,
Thursday, and London Lunch context selections are saved examples, not dynamically
chosen current-market recommendations.

For a ribbon-only view, disable **Selected context stack** and **Enable price
range boxes**, and set **Gray context range** to **Off**. Ribbon height, gap, text
size, optional times, and a second H4 row are in Inputs. If distant selected
objectives compress price, use the chart's **Scale price chart only** setting.

## Ranges and observations

- 8 AM and 8 PM range boxes are enabled by default, with optional 50% lines.
- Optional 7, 9, 10, and 11 o'clock ranges, six H4 windows, CBDR 2–8 PM, and Monday
  ranges are available. GCT is the 9 AM–1 PM New York AM H4 window.
- Developing ranges change until complete. Missing coverage is marked PARTIAL or
  omitted; unavailable older intrabars are not reconstructed as known prices.
- Optional 8 o'clock observations report extreme sweeps and completed hourly
  closes outside that range during its following shift. They do not automatically
  roll to the next range, classify a CRT variant, or establish an entry.
- Model1 selection, direction, anchor relevance, narrative, and objectives are
  manual. The selected Model1 CISD check uses a confirmed assigned-timeframe close
  strictly beyond that candle's full high/low.

**9ate8** refers to the 8 o'clock CRT in its following shift. A later chronological
range can be a Shift trade without becoming another 9ate8. This script makes no
statistical-edge, profitability, or automatic Butterfly claim.

## Validation status

The imported `.pine` file was checked byte-for-byte against the saved v2.1 source.
Source review and text-integrity checks are not a TradingView compiler run.
The following platform checks remain **NOT RUN** for this GitHub publication:

- Compile in Pine Editor and add to a standard 1m/5m chart without errors.
- Compare the ribbon with the supplied drawing, including Friday–Monday closures,
  zoomed-out labels, historical scrolling, and the current-block end.
- Check 9 AM/noon/9 PM/midnight boundaries and New York daylight-saving transitions.
- Compare complete 8 AM/PM highs, lows, and midpoints with source candles; check
  PARTIAL behavior when coverage is missing and on bars crossing hour boundaries.
- Confirm sweeps do not imply entry confirmation and invalidation waits for a
  completed hourly close strictly outside the selected 8 o'clock range.
- Check manual context/Model1 selection, prior confirmed source candles, and
  timeframe restrictions using Bar Replay and a live chart.

Record the chart symbol, timeframe, timezone, source commit, and result when these
checks are performed. Existing TradingView alerts should be recreated after
changing their script or input settings.
