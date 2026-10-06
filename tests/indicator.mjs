import { PineTS, Indicator } from 'pinets';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('../Rexercise_GTOP_Ribbon_and_Ranges.pine',import.meta.url),'utf8');
const helpers=src.slice(src.indexOf('f_day(int t)'),src.indexOf('f_ink(string bias'));
const engine=src.slice(src.indexOf('type ActiveRange'),src.indexOf('var array<ActiveRange> visibleMonthly'));
const preamble=`//@version=6
indicator("GTOP fixture checks")
string TZ = "America/New_York"
int autoLookback = 120
int autoKeep = 8
int viewRight = chart.right_visible_bar_time
`+helpers+'\n'+engine;

function bars(rows,start='2026-10-05T12:00:00Z',ms=3600000){
 return rows.map(([h,l,c],i)=>({openTime:Date.parse(start)+i*ms,closeTime:Date.parse(start)+(i+1)*ms,open:c,high:h,low:l,close:c,volume:100}));
}
async function run(data,tail,tf='60',overrides={}){
 const pine=new PineTS(data,'TEST',tf);
 const result=await pine.run(new Indicator(preamble+'\n'+tail,overrides));
 return result;
}
function values(result,key){return result.plots[key].data.map(x=>x.value);}
const inspect=`
var array<ActiveRange> pool = array.new<ActiveRange>()
f_active_step(pool, high, low, close, time, time_close, bar_index, "test")
bool original = false
bool up = false
bool down = false
for r in pool
    if r.born == 0
        original := true
        up := r.upperPurged
        down := r.lowerPurged
plot(original ? 1 : 0, "original")
plot(up ? 1 : 0, "upper")
plot(down ? 1 : 0, "lower")
plot(array.size(pool), "count")
snapshot = f_active_snapshot(pool, true)
plot(array.size(snapshot), "relevantCount")
plot(array.size(snapshot) > 0 ? array.get(snapshot, 0).born : -1, "firstRelevant")
`;
const checks=[];
const skipped=[];
async function check(name,fn){await fn();checks.push(name);console.log('PASS '+name);}
async function dstCheck(name,month,day,expected,fn){
 const data=bars([[100,90,95]],'2026-01-01T00:00:00Z');
 const runtime=await new PineTS(data,'TEST','60').run(`//@version=6\nindicator("timestamp probe")\nplot(timestamp("America/New_York",2026,${month},${day},5,0),"stamp")`);
 const actual=values(runtime,'stamp').at(-1);
 if(actual!==Date.parse(expected)){
  skipped.push(name);console.log('SKIP '+name+': PineTS timestamp returned '+new Date(actual).toISOString()+'; expected '+expected+'. Run in TradingView.');
 }else await check(name,fn);
}
try {
 const full=new Indicator(src);full.prepare();
 await check('full v2.3 source parses in PineTS 0.11.0',async()=>assert(full.getInputsMeta().length>100));
 await check('untouched ranges remain candidates but are never displayed',async()=>{
  const r=await run(bars([[100,90,95],[99,91,95],[98,92,95]]),inspect);
  assert.equal(values(r,'count').at(-1),3);assert.deepEqual(values(r,'relevantCount'),[0,0,0]);
 });
 await check('equal-edge touches alone do not establish a purge',async()=>{
  const r=await run(bars([[100,90,95],[100,90,95]]),inspect);assert.equal(values(r,'relevantCount').at(-1),0);
 });
 await check('wick above retains original and records upper purge',async()=>{
  const r=await run(bars([[100,90,95],[102,94,98]]),inspect);
  assert.deepEqual(values(r,'original'),[1,1]);assert.deepEqual(values(r,'upper'),[0,1]);
  assert.deepEqual(values(r,'relevantCount'),[0,1]);
 });
 await check('sell-side purge activates the opposite high DOL',async()=>{
  const r=await run(bars([[100,90,95],[97,88,92]]),inspect);
  assert.equal(values(r,'lower').at(-1),1);assert.equal(values(r,'relevantCount').at(-1),1);
 });
 await check('strict close outside invalidates original',async()=>{
  const r=await run(bars([[100,90,95],[102,94,101]]),inspect);assert.equal(values(r,'original').at(-1),0);
 });
 await check('close exactly on boundary does not invalidate',async()=>{
  const r=await run(bars([[100,90,95],[102,94,100]]),inspect);assert.equal(values(r,'original').at(-1),1);
 });
 await check('midpoint touch retains original',async()=>{
  const r=await run(bars([[100,90,95],[102,97,98],[99,95,96]]),inspect);assert.equal(values(r,'original').at(-1),1);
 });
 await check('opposite extreme touch retires consumed range',async()=>{
  const r=await run(bars([[100,90,95],[102,94,98],[99,90,95]]),inspect);assert.equal(values(r,'original').at(-1),0);
 });
 await check('two extremes in one candle never remain as a directional DOL',async()=>{
  const r=await run(bars([[100,90,95],[102,88,95]]),inspect);assert.equal(values(r,'original').at(-1),0);
 });
 await check('multiple older valid ranges survive inside bars',async()=>{
  const r=await run(bars([[100,90,95],[99,91,95],[98,92,95],[97,93,95]]),inspect);assert.equal(values(r,'count').at(-1),4);
  assert.equal(values(r,'relevantCount').at(-1),0);
 });
 await check('a touch before the purge is not a delivered post-purge objective',async()=>{
  const r=await run(bars([[100,90,95],[99,90,96],[102,96,98]]),inspect);
  assert.equal(values(r,'original').at(-1),1);assert.equal(values(r,'firstRelevant').at(-1),0);
 });
 await check('re-souping the same side preserves the pending original DOL',async()=>{
  const r=await run(bars([[100,90,95],[102,94,98],[103,96,97]]),inspect);
  assert.equal(values(r,'original').at(-1),1);assert.equal(values(r,'firstRelevant').at(-1),0);
 });
 await check('display cap filters first and preserves the older pending range',async()=>{
  const source=preamble.replace('int autoKeep = 8','int autoKeep = 1')+'\n'+inspect;
  const rows=[[100,90,95],[102,94,98],[103,96,97],...Array(10).fill([99,97,98])];
  const r=await new PineTS(bars(rows),'TEST','60').run(source);
  assert.equal(values(r,'relevantCount').at(-1),1);assert.equal(values(r,'firstRelevant').at(-1),0);
 });
 await check('selection advances after invalidation and waits for the next purge',async()=>{
  const r=await run(bars([[100,90,95],[102,94,98],[104,96,103],[105,98,101]]),inspect);
  assert.deepEqual(values(r,'relevantCount'),[0,1,0,1]);assert.equal(values(r,'firstRelevant').at(-1),2);
 });
 await check('daily, M15 and M5 source layers apply the same pending-DOL sequence',async()=>{
  const native=`\nsnapshot=f_native_active("fixture")\nplot(not na(snapshot) ? array.size(snapshot) : -1,"count")\nplot(not na(snapshot) and array.size(snapshot)>0 ? array.get(snapshot,0).begins : na,"starts")\n`;
  for(const [tf,ms] of [['1D',86400000],['15',900000],['5',300000]]){
   const data=bars([[100,90,95],[102,94,98],[99,95,97],[99,95,97]],'2026-10-01T00:00:00Z',ms);
   const r=await run(data,native,tf);assert.equal(values(r,'count').at(-1),1);assert.equal(values(r,'starts').at(-1),data[0].openTime);
  }
 });
 const shift=`
snapshot = f_shift_active()
plot(not na(snapshot) ? array.size(snapshot) : -1, "count")
plot(not na(snapshot) and array.size(snapshot) > 0 ? array.get(snapshot, 0).begins : na, "starts")
`;
 await check('8 to 9 rollover stays hidden until 9 is purged; noon expires',async()=>{
  const data=bars([[100,90,95],[102,94,101],[103,96,100],[101,96,98],[100,96,98]]);
  const r=await run(data,shift);
  assert.equal(values(r,'count').at(-1),0);
  // At 10 the replacement 9 range has no purge yet and must remain hidden.
  const pine=new PineTS(data,'TEST','60');pine.setVisibleRange(data[0].openTime,data[2].openTime);
  const at10=await pine.run(preamble+'\n'+shift);
  assert.equal(values(at10,'count')[2],0);
  const pine11=new PineTS(data,'TEST','60');pine11.setVisibleRange(data[0].openTime,data[3].openTime);
  const at11=await pine11.run(preamble+'\n'+shift);
  assert.equal(values(at11,'starts')[3],data[1].openTime);
 });
 await check('delivery stops hourly reselection for the rest of shift',async()=>{
  const data=bars([[100,90,95],[102,90,95],[105,89,95],[105,89,95]]);
  const r=await run(data,shift);assert.equal(values(r,'count').at(-1),0);
 });
 await check('missing first shift hour cannot resurrect the 8 range',async()=>{
  const data=bars([[100,90,95],[102,90,95],[105,89,95]]);data.splice(1,1);
  const r=await run(data,shift);assert.equal(values(r,'count').at(-1),0);
 });
 const h4=`
snapshot = f_h4_active()
plot(not na(snapshot) ? array.size(snapshot) : -1, "count")
plot(not na(snapshot) and array.size(snapshot) > 0 ? array.get(snapshot, array.size(snapshot)-1).begins : na, "starts")
plot(not na(snapshot) and array.size(snapshot) > 0 ? array.get(snapshot, array.size(snapshot)-1).hi : na, "hi")
`;
 await check('completed but unpurged London Lunch stays hidden',async()=>{
  const data=bars([[100,90,95],[101,91,96],[103,92,97],[102,93,98],[104,94,99]],'2026-10-05T09:00:00Z');
  const r=await run(data,h4);assert.equal(values(r,'count').at(-1),0);
 });
 await check('a subsequent H4 purge activates London Lunch with its low pending',async()=>{
  const data=bars([[100,90,95],[101,91,96],[103,92,97],[102,93,98],[104,95,99],[105,94,100],[103,96,99],[102,95,99],[101,96,98]],'2026-10-05T09:00:00Z');
  const r=await run(data,h4);assert.equal(values(r,'count').at(-1),1);assert.equal(values(r,'hi').at(-1),103);assert.equal(values(r,'starts').at(-1),data[0].openTime);
 });
 await check('incomplete H4 window is omitted',async()=>{
  const data=bars([[100,90,95],[101,91,96],[103,92,97],[102,93,98],[104,94,99]],'2026-10-05T09:00:00Z');data.splice(1,1);
  const r=await run(data,h4);assert.equal(values(r,'count').at(-1),0);
 });
 await check('a purged range draws one DOL extension and no paired rays',async()=>{
  const drawing=src.slice(src.indexOf('var array<box> autoBoxes'),src.indexOf('var table brandMark'));
  const settings=`\nbool rangeLabels=true\nbool autoDol=true\nbool autoMidpoints=false\nint autoFill=96\nfloat chartSeconds=3600\nint viewLeft=chart.left_visible_bar_time\n`;
  const tail=`\nif barstate.islast\n    ranges=array.new<ActiveRange>()\n    r=ActiveRange.new(100,90,time[1],time_close[1],0,"fixture")\n    r.upperPurged:=true\n    r.highTaken:=true\n    array.push(ranges,r)\n    f_draw_active(ranges,color.gray,time_close)\nplot(array.size(autoLines),"lineCount")\nplot(array.size(autoBoxes),"boxCount")\n`;
  const data=bars([[100,90,95],[102,94,98]]);
  const r=await new PineTS(data,'TEST','60').run(preamble+settings+drawing+tail);
  assert.equal(values(r,'lineCount').at(-1),1);assert.equal(values(r,'boxCount').at(-1),1);
 });
 await check('renderer also refuses untouched candidates',async()=>{
  const drawing=src.slice(src.indexOf('var array<box> autoBoxes'),src.indexOf('var table brandMark'));
  const settings=`\nbool rangeLabels=true\nbool autoDol=true\nbool autoMidpoints=false\nint autoFill=96\nfloat chartSeconds=3600\nint viewLeft=chart.left_visible_bar_time\n`;
  const tail=`\nif barstate.islast\n    ranges=array.new<ActiveRange>()\n    array.push(ranges,ActiveRange.new(100,90,time[1],time_close[1],0,"untouched"))\n    f_draw_active(ranges,color.gray,time_close)\nplot(array.size(autoLines),"lineCount")\nplot(array.size(autoBoxes),"boxCount")\n`;
  const r=await new PineTS(bars([[100,90,95],[99,94,98]]),'TEST','60').run(preamble+settings+drawing+tail);
  assert.equal(values(r,'lineCount').at(-1),0);assert.equal(values(r,'boxCount').at(-1),0);
 });
 await dstCheck('spring DST Asia Expansion uses three real hours',3,8,'2026-03-08T09:00:00Z',async()=>{
  const data=bars([[100,90,95],[101,91,96],[103,92,97],[104,95,99],[105,94,100],[103,96,99],[102,95,99],[101,96,98]],'2026-03-08T06:00:00Z');
  const r=await run(data,h4);assert.equal(values(r,'count').at(-1),1);assert.equal(values(r,'starts').at(-1),data[0].openTime);
 });
 await dstCheck('fall DST Asia Expansion uses five real hours',11,1,'2026-11-01T10:00:00Z',async()=>{
  const data=bars([[100,90,95],[101,91,96],[103,92,97],[102,93,98],[104,94,99],[105,95,100],[106,94,101],[104,96,100],[103,95,100],[102,96,99]],'2026-11-01T05:00:00Z');
  const r=await run(data,h4);assert.equal(values(r,'count').at(-1),1);assert.equal(values(r,'starts').at(-1),data[0].openTime);
 });
 console.log(JSON.stringify({passed:checks.length,skipped:skipped.length,note:'PineTS fixture execution, not TradingView compilation, multi-timeframe integration, or live-market validation.'}));
} catch(e) {console.error(JSON.stringify({passed:false,completed:checks.length,error:e.message,stack:e.stack?.split('\n').slice(0,4)}));process.exitCode=1;}
