from pathlib import Path
import csv,json,html
root=Path(__file__).resolve().parent.parent;out=root/'design/economy-review'
rows=list(csv.DictReader((out/'property-stage-comparison.csv').open()));summary=json.loads((out/'simulation-summary.json').read_text());data=json.loads((root/'game-data.json').read_text());deeds=data['deeds'];current=[r for r in rows if r['profile']=='current'];candidate=[r for r in rows if r['profile']=='balanced']
def stage(profile,id,level):return next(r for r in rows if r['profile']==profile and r['id']==id and int(r['level'])==level)
def cash(x):return '$'+str(x)
text='''# Miniopoly economy reevaluation — v0.3.121 review

**Decision:** ship autonomous, owner-approved bot travel and multiple service bookings. Keep the live financial rules unchanged while the proposed financial package is reviewed. Candidate B is a coherent pricing experiment, not a validated finished balance patch.

## Scope and evidence

All **28 deeds**, all **178 deed/development combinations per profile**, four financial profiles (**712 comparison rows**), both shift modes, 2/3/4 players, and two trading policies. The seeded economy model ran **24,000 matches**, capped at 80 rounds. A separate movement sample ran **300,000 player turns per shift mode** with four non-eliminating players.

The model uses production deed data, current rent and maintenance functions, actual card definitions, 6/12 and forced tenth-roll shifts, bonus rolls, Setback and the 90/10 rent/Festival split. It approximates player decisions. It is **not the live game server**, a human playtest, or a disaster survival simulation. The full limitations are below.

[Interactive comparison](interactive.html) · [Every property and stage (CSV)](property-stage-comparison.csv) · [Landing frequencies](landing-frequency.csv) · [Simulation results](simulation-summary.csv) · [Machine-readable methods/results](simulation-summary.json)

## Findings

1. **Residential purchase prices already have a consistent foundation:** base rent equals 10% of printed deed price. The movement sample gives broadly similar long-run traffic to the deeds; it does not support dramatic location-based repricing. Retain the current $60–$400 residential prices for the pilot.
2. **Development return varies sharply.** Every step on a deed currently costs the same amount, while the residential rent curve is 1/2/3/4/**20/30/40** times base rent. The first Estate multiplies the previous rent by five. Expensive homes and full railroad networks have particularly large top-stage returns.
3. **Set size matters.** Brown and Navy contain two homes; other colors contain three. If ownership were distributed independently among players, a two-deed set would be between twice and four times as likely to be held by one player as a three-deed set. Trading and acquisition order change those odds. A modest development premium on the two-deed sets is worth testing.
4. **Current maintenance minimums punish inexpensive deeds.** Copper Lane costs $60, ordinary cleaning $30, and a house call $50 before buildings. A $5 rounding increment still distorts a percentage fee on cheap deeds. Use whole-dollar rounding in the pilot.
5. **Number of opponents matters.** Two-player owners have approximately one-third as many rent-paying opponents as four-player owners. Service prices should account for that if upkeep is to provide similar value across room sizes.
6. **Net worth currently credits half the normal listed upgrade cost.** Spending $100 on a Standard improvement immediately reduces net worth by $50. In Tsunami, paying $200 for that same step adds only $50, reducing net worth by $150. This discourages construction near a fixed-round finish. Building Permit grants are funded improvements and currently add value; they are not excluded as unpaid work.
7. **Cash grows during long games.** GO pays $200 repeatedly, cards issue additional cash, and taxes/fees paid to the Festival return to players. Rent mostly transfers between players. Deed purchases, construction and bot fees remove cash; bank liquidation puts some back. Reducing rent and maintenance alone makes the unlimited-game problem worse.
8. **Rails/utilities need their actual formulas displayed.** A railroad's stored base field ($20) is not its current one-rail rent ($25). A utility's stored $15 is not a fixed rent; the landing die and ownership/upgrades determine the bill.

## Candidate B: property and development pricing

Keep deed purchase prices and residential base rents. Test this rent curve:

| Stage | Current | Candidate B |
|---|---:|---:|
| No buildings | 1× | 1× |
| 1 House/Chalet | 2× | 2× |
| 2 Houses/Chalets | 3× | 3× |
| 3 Houses/Chalets | 4× | 4× |
| 1 Estate | 20× | 7× |
| 2 Estates | 30× | 11× |
| 3 Estates | 40× | 16× |

Each House/Chalet costs **40% of printed deed price**. First/second/third Estate upgrades cost **65% / 85% / 100%** of printed deed price, respectively. Round each development cost up to $5. Apply a **15% construction premium to Brown and Navy** before rounding, to compensate partly for their smaller sets. Three Houses/Chalets still convert into the first Estate; the three house payments remain part of investment. Building Permits retain their current set-bypass and free-upgrade behavior.

These costs aim for comparable developed cash yields across price tiers, with progressively larger investment and income. They do not imply that cheap and expensive properties should have the same dollar rent.

### Every residential deed

| Property | Price | Base rent | Current per-step cost | Candidate House cost, each | Candidate Estate steps 1 / 2 / 3 | Current 3-Estate rent | Candidate 3-Estate rent |
|---|---:|---:|---:|---:|---|---:|---:|
'''
for d in deeds:
 if d['type']!='p':continue
 r=[stage('balanced',d['id'],n) for n in range(7)];costs=[int(r[n]['nextUpgrade']) for n in range(6)]
 text+=f"| {d['name']} | ${d['price']} | ${d['base']} | ${d['upgradeCost']} | ${costs[0]} | "+' / '.join('$'+str(x) for x in costs[3:])+f" | ${stage('current',d['id'],6)['grossRent']} | ${r[-1]['grossRent']} |\n"
text+='''
## Railroads

Keep each deed at **$200**. Current rent for owning 1/2/3/4 rails is **$25/$50/$100/$200**, multiplied by **1/1.5/2/3** at improvement stages 0–3.

Candidate B tests network rents of **$20/$35/$50/$70**, with stage multipliers **1/1.4/1.8/2.4**. Improvement costs become **$80/$100/$120**. A complete, fully improved network charges $168 per railroad landing, versus $600 currently. All four railroads use the same schedule: Coastal Express, Ogeechee Line, Belfast Connector and Marshland Rail.

This reduction is substantial and requires playtesting. Its reason is the combination of four income locations, network synergy and development without a color-set requirement. At full improvement the candidate's rent-to-investment ratio is about 33.6% per paid visit, near the residential candidates. Owning fewer rails produces a lower return, preserving the reason to trade for a network.

Mortgaged rails currently do not count toward network rent. Temporarily closed rails still count toward the ownership multiplier, although they collect no rent themselves; a future financial patch should make the policy explicit.

## Utilities

Keep Ogeechee Water and Coastal Power at **$150 each**. Candidate improvement costs: **$60/$75/$90**, replacing three $100 steps.

| Utilities owned | Current die multipliers, stages 0–3 | Candidate die multipliers, stages 0–3 |
|---|---|---|
| One | 4 / 6 / 8 / 12 | 4 / 5 / 6 / 8 |
| Both | 10 / 15 / 20 / 30 | 8 / 12 / 16 / 20 |

At an illustrative 6.5 average roll, a fully improved utility with both owned would earn $130 gross per landing, versus $195 currently. Actual bills continue to use the **recorded landing die**, not an extra roll. The movement sample's utility landing averages are near 6.4–6.5; the detailed CSV includes those conditional means.

## Maintenance candidate — revised after the traffic review

The earlier **5% scheduled / 8% priority** idea remains too costly for many low-rent properties, especially with two players. Candidate B instead tests:

- **Developed value:** printed deed value plus the full recorded, funded construction value.
- **Scheduled cleaning:** 1% of developed value × `(remaining players − 1) / 3`.
- **Requested visit:** 1.5% total × the same player-count factor, including call-out.
- Round up to a **whole dollar**; minimum $1 scheduled / $2 requested.
- No extra hidden surcharge. Show the value, percentage, player-count adjustment and total before approval.
- Cleaning remains optional. It restores condition; it does not retroactively reduce an already-issued rent bill.
- Keep the existing 100/90/75/50 rent-condition stages during the first pilot so the effect of the other changes can be measured.

This pricing is for review. It is **not installed in v0.3.121**. Current service quotes remain unchanged in that release.

| Example, four players | Candidate developed value | Scheduled cleaning | Requested visit |
|---|---:|---:|---:|
'''
for name in ['Copper Lane','Turtle Landing','Waterways','Coastal Express','Ogeechee Water']:
 d=next(d for d in deeds if d['name']==name)
 for n in [0,6 if d['type']=='p' else 3]:
  r=stage('balanced',d['id'],n)
  text+=f"| {name} · {r['stage']} | ${r['assessed']} | ${r['cleaning4Players']} | ${r['houseCall4Players']} |\n"
text+='''
## Valuation and liquidation

For the pilot, count **100% of funded construction value in net worth**, with **50% liquidation proceeds** when selling improvements to the Bank. This distinguishes a productive asset from its emergency cash-sale value and avoids penalizing a player simply for building near the round limit.

Record each stage's actual funded value. A single `level × upgradeCost` formula cannot correctly handle different stage prices, doubled Tsunami spending, grants and previous sales/damage. A future implementation needs a cost ledger, consistent quotes and a migration policy. Free Building Permit work should record its bank-funded stage value; do not remove that reward.

Existing matches should retain their financial rules until reset. New financial profiles need an explicit version, separate records where appropriate, and existing rent invoices must retain their original amount.

## Other modes

| Mode | Current economic difference | Recommendation |
|---|---|---|
| Standard | Color sets unlock homes; maintenance affects rent | Main financial pilot. Match the costs, rent, valuation and upkeep together. |
| World Collapse | Free starter homes/GO property awards and survival effects alter acquisition value | Retain its survival rules and use a separate playtest. A free deed still has its printed value for upkeep/valuation. Bot service remains Standard-only. |
| Disaster Season / Tsunami | Improvements cost 2×, built-in protection works once per property and consumes a development, and flooding removes value/rent | Do not copy Standard profitability claims. Prototype 1.25× construction instead of 2× only after defense/auction tests; credit actual funded construction consistently. |

A Tsunami building's additional levels do **not** currently grant one shield each: built-in protection is once per property. That distinction must be visible before a player invests. Blind-auction wins also need to show the bid plus rebuilding cost (currently at least $50, otherwise half printed price), not only the bid.

### Tsunami exposure stress test

A separate **5,400-trial stress test uses the actual production wave and pass-only auction engine**. It holds 6, 9 or all exposed deeds, tests 0%/50%/100% initial protection and improvement levels 1/4/6, across north and west approaches. It excludes movement, rebuilding, temporary shields, trading and winning auction bids. [Results](tsunami-exposure.csv) · [Methods](tsunami-exposure.json).

- With six exposed deeds and no rebuilding/cards, five waves consumed every exposed deed even when all started with built-in protection.
- With nine north-exposed deeds, all initially protected, an average **2.65 deeds** survived; with fifteen, **10.6** survived in these 100-seed scenarios.
- Starting at level 6 rather than level 1 did **not** improve the surviving-deed count. The production rule spends only one built-in shield per property; additional buildings retain more value if the property survives but supply no further built-in wave protection.

These are exposure trials, not complete matches or predictions of player elimination: unexposed assets, temporary cards and successful redevelopment can change outcomes. They reinforce the need to quote protection separately from rental development. No complete Tsunami or World Collapse matches were modeled.

## Simulation results and interpretation

The following example is **three-player Individual shifts with mechanical near-value exchanges**, 500 matches per row, ending on elimination or round 80:

| Profile | Finished by round 80 | Average maintenance paid, whole table | Average cash + Festival at finish/cap | Median first Estate, when built |
|---|---:|---:|---:|---:|
'''
for key in ['current','earlier','balanced','pressure']:
 r=next(r for r in summary['results'] if r['profile']==key and r['players']==3 and r['shift']=='individual' and r['tradePolicy']=='scripted exchanges')
 text+=f"| {summary['profiles'][key]['name']} | {r['endedPercent']}% | ${r['averageMaintenance']:,.0f} | ${r['averageCashIncludingFestival']:,.0f} | {r['medianFirstEstate']} |\n"
text+='''
The optional salary-taper scenario pays $200 through round 20, $100 in rounds 21–30, $50 in rounds 31–40, then $0. It is a sensitivity test, **not an implemented or validated recommendation**. Even that taper did not reliably resolve unlimited games in this model.

**Interpretation:** Candidate B is more consistent in investment ratios, but none of the tested property-only packages reliably produces a last-player-standing ending. The earlier broad rent cuts should not be applied as a complete balance fix. A fairer pricing schedule and a dependable unlimited-game ending are separate requirements.

A Standard basic deed earns only 10% of price per gross paid landing. At approximately 2.4–2.5 property visits per 100 opponent turns, a given deed receives few rent payments in a 10–20 round match. The deed retains value; nevertheless construction cash recovery is slow. This is why the valuation policy matters and why short-match AI should not blindly buy every upgrade.

## Recommended rollout

1. **v0.3.121:** autonomous travel; owner approval; multiple approved bookings; no shared cooldown; pooled reservations, cancellation and bill priority. Preserve live financial numbers.
2. Review the full Candidate B package rather than adopting only cheaper cleaning or lower Estate caps. Its costs and valuation are deliberately paired.
3. Run human 2/3/4-player tests at 10/20/30 rounds, both shift modes. Record trade completion, upgrade purchases, useful cleaning decisions, cash shortages, rent concentration and whether the late game remains engaging.
4. Choose an explicit unlimited-game pressure/endgame design before declaring the financial patch finished. Avoid promising that a rent multiplier alone will end the match.
5. Pilot the financial profile on new matches with old saves retaining their original ledger and rules. Recheck every quote, sale, permit, damage event, tooltip and record category.

## Reproduction and limitations

Run `ECONOMY_SEEDS=500 node scripts/economy-review.js` to regenerate CSV/JSON evidence, `node scripts/economy-wave-review.js` for the production-engine exposure trials, then `python3 scripts/build-economy-report.py` to rebuild this report and the interactive comparison. The seed IDs are 1–500 per scenario. Profiles share seeds, but their different game outcomes can consume random draws differently; this is not a perfectly paired causal experiment.

- Match policies: start with $1,500; buy if $200 remains; retain $350 for construction; at most two purchased improvements per modeled turn; request cleaning once six rounds old if $250 remains. These are modeling decisions, not server rules.
- Current-rate runs also allow on-demand cleaning without the old shared cooldown, to compare rates under the requested future service availability. They do not reproduce every v0.3.120 booking restriction.
- Trading scenarios either prohibit trades or allow mechanical, near-price, one-for-one undeveloped-deed exchanges. They do not model negotiation, strategic refusal, collusion or human valuation.
- Mortgages, rent negotiations, sealed auctions, connection delays, actual bot travel time and most perk choices are omitted or simplified. Normal card definitions are loaded from the server source; escape/building cards are approximated. Setback, bonus-roll caps and both shift patterns are modeled.
- The movement sample approximates escape-card inventory and measures long-run traffic. Short-match opening bias from everyone starting in Richmond Hill is not removed by those long-run averages.
- Cash conservation and all current rent/fee formulas are checked by automated tests. This validates accounting, not player fun or strategic equilibrium.
- Per-row rent assumes the indicated network is owned; utilities use 6.5 as an illustrative mean. The comparison does not include temporary renovation, condition discounts or Setback pauses in its headline full-condition rent column; the CSV includes condition examples.
- Candidate fees depend on remaining opponents; the CSV includes each room size explicitly.
- Real playtesting and separate disaster-mode tests remain necessary.
'''
(out/'README.md').write_text(text)
# Standalone, offline comparison: no game state or external services.
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Miniopoly economy review</title><style>
*{box-sizing:border-box}body{margin:0;background:#f7f2e4;color:#193f3a;font:16px/1.5 system-ui,sans-serif}main{max-width:1250px;margin:auto;padding:25px}h1{font-size:clamp(25px,4vw,42px);margin:0}header{background:#194c46;color:#fff6d9;padding:25px;border-radius:16px}header p{margin-bottom:0}.notice{padding:15px;background:#ffeab4;border-left:5px solid #aa7327;border-radius:8px;margin:20px 0}.controls{display:flex;flex-wrap:wrap;gap:15px;margin:20px 0}label{display:grid;gap:5px;font-weight:700;flex:1;min-width:180px}select{padding:10px;border:1px solid #768e80;border-radius:8px;background:white;color:#193f3a;font:inherit}.tablewrap{overflow:auto;background:white;border-radius:12px;border:1px solid #d2d8c8}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:right;padding:12px;border-bottom:1px solid #e0e4d8;white-space:nowrap}th:first-child,td:first-child{text-align:left}thead{background:#dce8db}h2{margin-top:30px}.bars{display:grid;gap:10px}.barrow{display:grid;grid-template-columns:130px 1fr 70px;gap:10px;align-items:center}.bar{height:22px;background:#226b60;border-radius:5px}.comparison{background:white;padding:20px;border-radius:12px}small{color:#4b645b}a{color:#16645b}footer{margin:30px 0;padding:20px;background:#e4e9db;border-radius:12px}@media(max-width:600px){main{padding:12px}.barrow{grid-template-columns:100px 1fr 55px;font-size:13px}}</style><main><header><h1>Miniopoly economy review</h1><p>28 deeds · every development stage · 24,000 modeled matches</p></header><div class="notice"><strong>Financial proposals for review.</strong> v0.3.121 changes bot travel and booking behavior. These proposed financial rates are not installed. Simulations are a sensitivity model, not human playtesting.</div><div class="controls"><label>Property<select id="property"></select></label><label>Compare against current rules<select id="profile"><option value="balanced">Candidate B: proportional costs</option><option value="earlier">Earlier rent-cut proposal</option></select></label><label>Remaining players<select id="players"><option>2</option><option>3</option><option selected>4</option></select></label></div><p id="summary"></p><div class="tablewrap"><table><thead><tr><th>Development</th><th>Current rent</th><th>Proposed rent</th><th>Current total investment</th><th>Proposed investment</th><th>Proposed value</th><th>Current cleaning</th><th>Proposed cleaning</th><th>Proposed requested visit</th></tr></thead><tbody id="rows"></tbody></table></div><small>Rail rent assumes all four owned. Utility rent uses an illustrative 6.5 mean die with both owned; actual bills use the recorded die. Full-condition rents exclude temporary renovation and Setback.</small><section class="comparison"><h2>Current versus proposed rent</h2><div class="bars" id="bars"></div></section><h2>Why this is still a proposal</h2><p>Base residential prices and rent are consistent. Estate jumps, set size, railroad network returns, upgrade valuation and minimum cleaning fees create larger differences. Candidate B matches developed returns more closely, but the modeled unlimited games still rarely end.</p><p>Candidate B uses a 1/2/3/4/7/11/16 residential rent curve, proportional construction, full funded construction value, and service prices scaled to opponents. The earlier proposal uses 1/2/3/4/8/12/18 with unchanged upgrade costs and 5%/8% service fees.</p><footer><strong>Review the full report and assumptions:</strong> <a href="README.md">Report</a> · <a href="property-stage-comparison.csv">All comparisons</a> · <a href="simulation-summary.csv">Simulation results</a><p>For reliable comparisons, open this file from the complete game folder so the other files remain beside it. The comparison itself works offline.</p></footer></main><script>
const DATA=__DATA__,DEEDS=__DEEDS__;
const property=document.getElementById('property'),profile=document.getElementById('profile'),players=document.getElementById('players');for(const d of DEEDS){const o=document.createElement('option');o.value=d.id;o.textContent=d.name;property.append(o);}const money=n=>'$'+Number(n).toLocaleString('en-US');
function update(){const id=property.value,proposed=DATA.filter(r=>r.profile===profile.value&&r.id===id),current=DATA.filter(r=>r.profile==='current'&&r.id===id),d=DEEDS.find(d=>d.id===id),p=players.value,body=document.getElementById('rows');body.replaceChildren();document.getElementById('summary').textContent=d.name+' · Deed '+money(d.price)+' · '+p+' players · '+(d.type==='p'?'Base rent '+money(d.base):d.type==='rail'?'Railroad network':'Die-based utility');for(let i=0;i<current.length;i++){const a=current[i],b=proposed[i],tr=document.createElement('tr');for(const value of [b.stage,money(a.grossRent),money(b.grossRent),money(a.invested),money(b.invested),money(b.assessed),money(a['cleaning'+p+'Players']),money(b['cleaning'+p+'Players']),money(b['houseCall'+p+'Players'])]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}const bars=document.getElementById('bars');bars.replaceChildren();const max=Math.max(...current.map(r=>Number(r.grossRent)),...proposed.map(r=>Number(r.grossRent)));for(const [label,values,color]of [['Current',current,'#9f6737'],['Proposed',proposed,'#226b60']]){const r=values.at(-1),row=document.createElement('div');row.className='barrow';const name=document.createElement('strong');name.textContent=label+' maximum';const track=document.createElement('div'),bar=document.createElement('div');bar.className='bar';bar.style.width=Number(r.grossRent)/max*100+'%';bar.style.background=color;track.append(bar);const value=document.createElement('span');value.textContent=money(r.grossRent);row.append(name,track,value);bars.append(row);}}
for(const n of [property,profile,players])n.addEventListener('change',update);update();</script></html>'''
page=page.replace('__DATA__',json.dumps(rows).replace('<','\\u003c')).replace('__DEEDS__',json.dumps(deeds).replace('<','\\u003c'))
(out/'interactive.html').write_text(page)
print('Report:',len(text.split()),'words; comparison:',len(page),'bytes')
