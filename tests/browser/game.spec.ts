import {test,expect,type Page} from '@playwright/test';
const card=(page:Page,name:string)=>page.getByRole('button',{name:new RegExp(`${name},`)});
const playerHP=(page:Page)=>page.getByRole('progressbar',{name:'HRISHI Mental Capacity'});
const enemyHP=(page:Page)=>page.getByRole('progressbar',{name:'THE SCRUM LORD Mental Capacity'});
const tutorialKey='9to5-battle-tutorial-seen';
const statusTutorialKey='9to5-status-tutorial-seen';
async function createFighter(page:Page,name='HRISHI'){
 await page.getByRole('button',{name:/^CLOCK IN/}).click();
 await expect(page.getByRole('heading',{name:'WHO ARE YOU CLOCKING IN AS?'})).toBeVisible();
 await page.getByLabel('Display name').fill(name);
 await page.getByRole('button',{name:'CONTINUE'}).click();
 await page.getByRole('button',{name:/Developer/}).click();
 await page.getByRole('button',{name:'CONTINUE'}).click();
 for(const strength of ['Technical','Fast','Curious'])await page.getByRole('button',{name:new RegExp(strength)}).click();
 await page.getByRole('button',{name:'CONTINUE'}).click();
 await page.getByRole('button',{name:/Meetings/}).click();
 await page.getByRole('button',{name:'CONTINUE'}).click();
 await page.getByRole('button',{name:/BUILDER/}).click();
 await page.getByRole('button',{name:'REVEAL FIGHTER'}).click();
 await expect(page.getByText('FIGHTER CREATED')).toBeVisible();
}
async function enterBattle(page:Page){await page.getByRole('button',{name:/^CLOCK IN/}).click();await expect(page.getByRole('heading',{name:'YOUR WORKDAY'})).toBeVisible();await page.getByRole('button',{name:/^ENTER MEETING/}).last().click();await expect(page.locator('.calendar-transition')).toBeVisible();await expect(page.locator('.battle-screen')).toHaveCSS('opacity','1',{timeout:5000});}
async function start(page:Page,{fresh=false}:{fresh?:boolean}={}){if(!fresh)await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');},{tutorialKey,statusTutorialKey});await page.goto('/');await expect(page.locator('.title-screen')).toHaveCSS('opacity','1');await createFighter(page);await enterBattle(page);if(!fresh)await expect(card(page,'SHIP IT')).toBeEnabled();}
async function freeze(page:Page){const time=new Date('2030-01-01T12:00:00Z');await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));}
async function rolls(page:Page,values:number[]){await page.evaluate(values=>{let index=0;Math.random=()=>values[index++]??.5;},values);}
async function finishRound(page:Page){await page.clock.runFor(9000);}
test('first battle teaches the core loop, guides one action and persists completion',async({page})=>{
 await start(page,{fresh:true});
 const dialog=page.getByRole('dialog');await expect(dialog).toContainText('MENTAL CAPACITY');await expect(dialog).toContainText('This is your health.');
 await page.screenshot({path:'artifacts/phase4a-first-tutorial.png',fullPage:true,animations:'disabled'});
 await page.keyboard.press('Enter');await expect(dialog).toContainText('CAFFEINE');await expect(dialog).toContainText('recover 1 after every completed round');
 await page.keyboard.press('Enter');await expect(dialog).toContainText('YOUR MOVE');await expect(dialog).toContainText('Pick a card.');
 await page.keyboard.press('Enter');await expect(dialog).toHaveCount(0);await expect(card(page,'SHIP IT')).toContainText('GOOD PLACE TO START');
 await card(page,'SHIP IT').click();await expect.poll(()=>page.evaluate(key=>localStorage.getItem(key),tutorialKey)).toBe('true');await expect(card(page,'SHIP IT')).not.toContainText('GOOD PLACE TO START');
 await page.reload();await expect(page.getByRole('heading',{name:'YOUR WORKDAY'})).toBeVisible();await page.getByRole('button',{name:/^ENTER MEETING/}).last().click();await expect(page.locator('.battle-screen')).toBeVisible({timeout:5000});await expect(page.getByRole('dialog')).toHaveCount(0);await expect(card(page,'SHIP IT')).not.toContainText('GOOD PLACE TO START');await page.getByRole('button',{name:'Open battle help'}).click();await expect(page.getByRole('dialog')).toContainText('ACTIVE BULLSHIT');await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'BACK TO WORK'})).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('all cards, readable beats and five-round victory',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await freeze(page);
 await expect(card(page,'STACK OVERFLOW SUMMON')).toBeDisabled();
 await page.screenshot({path:'artifacts/phase4a-your-move.png',fullPage:true,animations:'disabled'});
 // aria-disabled cards can explain their prerequisite without executing an action.
 await card(page,'STACK OVERFLOW SUMMON').click({force:true});await expect(page.getByRole('status')).toContainText('PLAY AN ATTACK');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','100');
 await rolls(page,[0,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(600);await expect(page.getByText('CANNOT REPRODUCE',{exact:true})).toBeVisible();await page.clock.runFor(700);await expect(page.locator('.defence-ticket')).toContainText('NEXT ATTACK: 70% BLOCKED');await page.screenshot({path:'artifacts/phase4a-active-bullshit.png',fullPage:true,animations:'disabled'});await page.clock.runFor(750);await expect(page.locator('.arena-center')).toContainText("SCRUM LORD'S TURN");await page.screenshot({path:'artifacts/phase4a-enemy-turn.png',fullPage:true,animations:'disabled'});await page.clock.runFor(1350);await expect(page.locator('.arena-center')).toContainText('BLOCKED');await expect(page.locator('.defence-ticket')).toContainText('CONSUMED');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','95');await page.screenshot({path:'artifacts/phase4a-block.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[.5,0,0,.9]);await card(page,'SHIP IT').click();await page.clock.runFor(600);await expect(page.getByText('DEPLOYED TO PROD')).toBeVisible();await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','100');await page.clock.runFor(700);await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','72');await page.clock.runFor(2850);await expect(page.locator('.arena-center')).toContainText('CAFFEINE +1');await expect(page.locator('.caffeine-count')).toContainText('2 / 3');await expect(page.locator('.caffeine-count')).toContainText('3 / 3');await page.screenshot({path:'artifacts/phase4a-caffeine-refill.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[0,0,.9]);await card(page,'STACK OVERFLOW SUMMON').click();await page.clock.runFor(600);await expect(page.locator('.ghost-card')).toContainText('SHIP IT');await expect(page.getByText('✓ ANSWER ACCEPTED')).toBeVisible();await finishRound(page);
 await rolls(page,[.5,.9,0,0,.9]);await card(page,'FORCE PUSH').click();await page.clock.runFor(1300);await expect(page.locator('.arena')).toHaveAttribute('data-heavy','true');await finishRound(page);
 await expect(card(page,'FORCE PUSH')).toBeDisabled();await card(page,'FORCE PUSH').click({force:true});await expect(page.getByRole('status')).toContainText('NEEDS 2 CAFFEINE');await expect(page.getByRole('status')).toContainText('YOU HAVE 1');
 await rolls(page,[.5]);await card(page,'SHIP IT').click();await page.clock.runFor(1300);await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','0');await expect(page.getByRole('dialog')).toHaveCount(0);await page.clock.runFor(750);await expect(page.locator('.boss-figure')).toHaveClass(/knocked-out/);await expect(page.getByRole('dialog')).toHaveCount(0);await page.clock.runFor(1100);await expect(page.getByRole('dialog')).toHaveCount(0);await page.clock.runFor(100);
 await expect(page.getByRole('heading',{name:'PROMOTED'})).toBeVisible();await page.screenshot({path:'artifacts/phase2-result.png',fullPage:true,animations:'disabled'});await expect(page.locator('.result-stats')).toContainText('5');const remaining=await page.locator('.result-stats strong').nth(1).textContent();
 await page.getByRole('button',{name:'CLAIM YOUR COMPENSATION'}).click();await page.clock.runFor(500);await expect(page.getByRole('heading',{name:'EMPLOYEE BENEFITS'})).toBeVisible();await expect(page.locator('.loot-card')).toHaveCount(3);await expect(page.locator('.loot-card h2')).toHaveCount(3);await page.screenshot({path:'artifacts/phase4c-office-loot.png',fullPage:true,animations:'disabled'});const firstReward=page.locator('.loot-card button').first();await firstReward.focus();await page.keyboard.press('Enter');await expect(page.getByRole('status')).toContainText('BENEFIT APPROVED');await expect(page.locator('.budget-denied')).toHaveCount(2);await page.screenshot({path:'artifacts/phase4c-benefit-approved.png',fullPage:true,animations:'disabled'});await page.clock.runFor(1400);await expect(page.getByRole('heading',{name:'YOUR WORKDAY'})).toBeVisible();await expect(page.locator('.workday-screen')).toHaveCSS('opacity','1');await expect(page.locator('.run-clock')).toContainText('09:47');await expect(page.locator('.schedule-done').filter({hasText:'THE SCRUM LORD'})).toBeVisible();await expect(page.locator('.employee-condition')).toContainText('MENTAL CAPACITY');await expect(page.locator('.employee-condition')).toContainText(`${remaining} / 100`);await expect(page.locator('.desk-slot')).toBeVisible();await expect(page.getByText('WORKDAY PROTOTYPE ENDS HERE')).toBeVisible();await page.screenshot({path:'artifacts/phase4c-post-loot-workday.png',fullPage:true,animations:'disabled'});
 expect(errors).toEqual([]);
});

test('fighter creation is short, deterministic and feeds the approved battle',async({page})=>{
 await page.goto('/');await expect(page.locator('.title-screen')).toHaveCSS('opacity','1');await createFighter(page,'JAMIE OPS');
 await expect(page.locator('.reveal-card')).toContainText('JAMIE OPS');
 const statTotal=await page.locator('.reveal-card .stat-grid strong').evaluateAll(nodes=>nodes.reduce((sum,node)=>sum+Number(node.textContent),0));
 expect(statTotal).toBe(300);
 await page.getByRole('button',{name:/^CLOCK IN/}).click();await expect(page.getByRole('heading',{name:'YOUR WORKDAY'})).toBeVisible();await expect(page.locator('.employee-condition')).toContainText('JAMIE OPS');await expect(page.locator('.run-clock')).toContainText('09:00');await expect(page.locator('.employee-condition')).toContainText('100 / 100');
});

test('Workday establishes the 17:00 goal, one actionable meeting and locked future problems',async({page})=>{
 await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');},{tutorialKey,statusTutorialKey});await page.goto('/');await expect(page.getByRole('button',{name:/^CLOCK IN/})).toBeVisible();await createFighter(page,'JAMIE OPS');await page.getByRole('button',{name:/^CLOCK IN/}).click();
 await expect(page.getByRole('heading',{name:'YOUR WORKDAY'})).toBeVisible();await expect(page.locator('.run-clock')).toContainText('09:00');await expect(page.locator('.workday-screen')).toContainText('SURVIVE UNTIL 17:00');await expect(page.locator('.schedule-current')).toContainText('THE SCRUM LORD');await expect(page.locator('.schedule-locked')).toHaveCount(4);await expect(page.locator('.schedule-locked button')).toHaveCount(0);await page.screenshot({path:'artifacts/phase4b-initial-workday.png',fullPage:true,animations:'disabled'});await page.locator('.encounter-brief').screenshot({path:'artifacts/phase4b-scrum-briefing.png',animations:'disabled'});
 const enter=page.getByRole('button',{name:/^ENTER MEETING/}).last();await enter.focus();await page.keyboard.press('Enter');await expect(page.locator('.calendar-transition')).toHaveCSS('opacity','1');await page.screenshot({path:'artifacts/phase4b-calendar-event.png',fullPage:true,animations:'disabled'});await expect(page.locator('.battle-screen')).toBeVisible({timeout:5000});await expect(page.locator('.office-clock')).toHaveText('09:30');
});

test('saved Workday condition survives refresh and becomes battle starting health',async({page})=>{
 await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');},{tutorialKey,statusTutorialKey});await page.goto('/');await createFighter(page);await page.getByRole('button',{name:/^CLOCK IN/}).click();await page.evaluate(()=>{const key='9to5-workday-run';const run=JSON.parse(localStorage.getItem(key)!);run.mentalCapacity=38;localStorage.setItem(key,JSON.stringify(run));});await page.reload();await expect(page.locator('.employee-condition')).toContainText('38 / 100');await page.getByRole('button',{name:/^ENTER MEETING/}).last().click();await expect(page.locator('.battle-screen')).toBeVisible({timeout:5000});await expect(playerHP(page)).toHaveAttribute('aria-valuenow','38');
});

test('reward choice persists through refresh, stores one item, appears on the desk and resets',async({page})=>{
 await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');},{tutorialKey,statusTutorialKey});await page.goto('/');await createFighter(page);await page.getByRole('button',{name:/^CLOCK IN/}).click();
 await page.evaluate(()=>{const key='9to5-workday-run';const run=JSON.parse(localStorage.getItem(key)!);Object.assign(run,{currentTime:'09:47',mentalCapacity:63,completedEncounters:['scrum-lord'],status:'reward-pending',rewardChoices:['company-macbook','linkedin-premium','headphones']});localStorage.setItem(key,JSON.stringify(run));});await page.reload();
 await expect(page.getByRole('heading',{name:'EMPLOYEE BENEFITS'})).toBeVisible();await expect(page.locator('.loot-card')).toHaveCount(3);await expect(page.locator('.loot-card').nth(1)).toContainText('NO OBSERVABLE EFFECT');await page.getByRole('button',{name:'Take COMPANY MACBOOK'}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('status')).toContainText('COMPANY MACBOOK');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('9to5-workday-run')!).items)).toEqual(['company-macbook']);await page.waitForTimeout(1400);await expect(page.locator('.desk-slot')).toContainText('COMPANY MACBOOK');await expect(page.locator('.desk-slot')).toContainText('First damaging card: +8 damage');
 await page.reload();await expect(page.locator('.desk-slot')).toContainText('COMPANY MACBOOK');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('9to5-workday-run')!).items)).toEqual(['company-macbook']);await page.getByRole('button',{name:'CLOCK IN AGAIN'}).click();await expect(page.locator('.desk-slot')).toHaveCount(0);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('9to5-workday-run')!).items)).toEqual([]);
});

test('equipped item modifiers are explained during combat',async({page})=>{
 await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');},{tutorialKey,statusTutorialKey});await page.goto('/');await createFighter(page);await page.getByRole('button',{name:/^CLOCK IN/}).click();await page.evaluate(()=>{const key='9to5-workday-run';const run=JSON.parse(localStorage.getItem(key)!);run.items=['second-monitor'];localStorage.setItem(key,JSON.stringify(run));});await page.reload();await page.getByRole('button',{name:/^ENTER MEETING/}).last().click();await expect(page.locator('.battle-screen')).toBeVisible({timeout:5000});await freeze(page);await rolls(page,[0,0,0,.9]);await card(page,'SHIP IT').click();await page.clock.runFor(1300);await expect(page.locator('.arena-center')).toContainText('BASE DAMAGE');await expect(page.locator('.arena-center')).toContainText('SECOND MONITOR');await expect(page.locator('.arena-center')).toContainText('+3');await expect(page.locator('.arena-center')).toContainText('TOTAL');
});

test('mobile reduced-motion reward screen keeps all three offers readable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>localStorage.setItem('9to5-workday-run',JSON.stringify({version:2,fighter:{name:'HRISHI',profession:'Developer',strengths:['Technical','Fast','Curious'],weakness:'Meetings',style:'BUILDER',stats:{focus:100,resilience:100,chaos:100}},currentTime:'09:47',currentEncounter:'scrum-lord',mentalCapacity:57,completedEncounters:['scrum-lord'],items:[],rewardChoices:['double-espresso','ergonomic-chair','linkedin-premium'],status:'reward-pending'})));await page.goto('/');await expect(page.getByRole('heading',{name:'EMPLOYEE BENEFITS'})).toBeVisible();await expect(page.locator('.loot-card')).toHaveCount(3);await expect(page.locator('.loot-card h2')).toHaveText(['DOUBLE ESPRESSO','ERGONOMIC CHAIR','LINKEDIN PREMIUM']);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.loot-card').first()).toHaveCSS('transform','none');await page.screenshot({path:'artifacts/phase4c-mobile-loot.png',fullPage:true,animations:'disabled'});
});

test('first Scope Creep pauses once for keyboard-accessible status teaching',async({page})=>{
 await page.addInitScript(key=>localStorage.setItem(key,'true'),tutorialKey);await start(page,{fresh:true});await freeze(page);await rolls(page,[.5,.75,0,.9]);await card(page,'SHIP IT').click();await page.clock.runFor(4850);
 const dialog=page.getByRole('dialog');await expect(dialog).toContainText('UH OH: STATUS EFFECT');await expect(dialog).toContainText('NEXT ATTACK deal +8 damage');await expect(page.locator('.scope-ticket')).toContainText('NEXT SCRUM LORD ATTACK');await page.keyboard.press('Enter');await expect(dialog).toHaveCount(0);await expect.poll(()=>page.evaluate(key=>localStorage.getItem(key),statusTutorialKey)).toBe('true');await finishRound(page);
});

test('boss buff, reduced incoming damage, heal and ceremony have distinct beats',async({page})=>{
 await start(page);await freeze(page);await rolls(page,[.5,.75,0,.9]);await card(page,'SHIP IT').click();await page.clock.runFor(4150);await expect(page.locator('.status-ticket')).toContainText('JUST ONE SMALL CHANGE');await expect(page.locator('.status-ticket')).toContainText('+8 DAMAGE');await page.screenshot({path:'artifacts/phase4a-scope-status.png',fullPage:true,animations:'disabled'});await finishRound(page);await expect(page.locator('.scope-ticket')).toContainText('NEXT SCRUM LORD ATTACK');
 await rolls(page,[0,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(3400);await expect(page.locator('.arena-center')).toContainText('BASE DAMAGE');await expect(page.locator('.arena-center')).toContainText('SCOPE CREEP');await expect(page.locator('.arena-center')).toContainText('TOTAL');await expect(page.locator('.scope-ticket')).toContainText('CONSUMED');await page.screenshot({path:'artifacts/phase4a-scope-hit.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[.5,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(2700);await expect(page.locator('.standup-effect')).toContainText('YESTERDAY');await expect(page.locator('.standup-effect')).toContainText('BLOCKERS');await page.clock.runFor(1450);await expect(page.locator('.heal-number')).toContainText('+4');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','76');await page.screenshot({path:'artifacts/phase2-heal.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[.99,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(2700);await expect(page.locator('.ceremony-effect')).toContainText('ATTENDEES: EVERYONE');await page.clock.runFor(700);await expect(page.locator('.arena')).toHaveAttribute('data-heavy','true');await finishRound(page);
});

test('recoil is separate and the modular 4:59 event stays out of the morning encounter',async({page})=>{
 await start(page);await freeze(page);await rolls(page,[0,0,0,0,.9]);await card(page,'FORCE PUSH').click();await page.clock.runFor(1300);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','100');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','65');await page.clock.runFor(750);await expect(page.locator('.arena-center')).toContainText('RISK TRIGGERED');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','90');await page.screenshot({path:'artifacts/phase2-recoil.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[0,0,0]);await card(page,'WORKS ON MY MACHINE').click();await finishRound(page);await expect(page.getByRole('heading',{name:'4:59 PM MESSAGE'})).toHaveCount(0);await expect(page.locator('.office-clock')).toHaveText('09:30');
});

for(const seed of [12,29,71])test(`complete mixed battle with seed ${seed}`,async({page})=>{
 await start(page);await freeze(page);
 await page.evaluate(seed=>{let n=seed;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};},seed);
 let rounds=0;while(!(await page.getByRole('dialog').isVisible())&&rounds<12){await card(page,rounds===1?'WORKS ON MY MACHINE':'SHIP IT').click();await finishRound(page);rounds++;}
 await expect(page.getByRole('dialog')).toBeVisible();console.log(`Observed browser battle seed ${seed}: ${rounds} rounds`);
});
test('defensive loss includes burnout warning',async({page})=>{
 await start(page);await freeze(page);let low=false;
 for(let n=0;n<25;n++){if(await page.getByRole('dialog').isVisible())break;await rolls(page,[.99,.99,.9]);await card(page,'WORKS ON MY MACHINE').click();await finishRound(page);if(await page.locator('.burnout-label').count())low=true;}
 expect(low).toBe(true);await expect(page.getByRole('heading',{name:'PUT ON A PIP'})).toBeVisible();await page.getByRole('button',{name:'END SHIFT'}).click();await page.clock.runFor(500);await expect(page.locator('.failed-workday')).toHaveCSS('opacity','1');await expect(page.locator('.termination-stamp')).toContainText('SHIFT');await expect(page.locator('.termination-stamp')).toContainText('TERMINATED');await expect(page.locator('.termination-form')).toContainText('09:42');await page.screenshot({path:'artifacts/phase4b-failed.png',fullPage:true,animations:'disabled'});await page.getByRole('button',{name:'CLOCK IN AGAIN'}).click();await expect(page.locator('.run-clock')).toContainText('09:00');await expect(page.locator('.employee-condition')).toContainText('100 / 100');
});
test('real-time full battles, rematch reset and back to title',async({page})=>{
 await start(page);
 for(let match=0;match<2;match++){
  await page.evaluate(()=>{Math.random=()=>.5});
  for(const name of ['FORCE PUSH','FORCE PUSH','SHIP IT']){await expect(card(page,name)).toBeEnabled({timeout:8000});await card(page,name).click();}
  await expect(page.getByRole('heading',{name:'PROMOTED'})).toBeVisible();
  if(match===0){await page.getByRole('button',{name:'REMATCH'}).click();await expect(card(page,'SHIP IT')).toBeEnabled();await expect(playerHP(page)).toHaveAttribute('aria-valuenow','100');await expect(card(page,'STACK OVERFLOW SUMMON')).toBeDisabled();}
 }
 await page.getByRole('button',{name:'CLAIM YOUR COMPENSATION'}).click();await expect(page.getByRole('heading',{name:'EMPLOYEE BENEFITS'})).toBeVisible();await page.locator('.loot-card button').first().click();await expect(page.getByRole('status')).toContainText('BENEFIT APPROVED');await expect(page.getByText('WORKDAY PROTOTYPE ENDS HERE')).toBeVisible({timeout:4000});await page.getByRole('button',{name:'NEW EMPLOYEE'}).click();await expect(page.getByRole('heading',{name:'WHO ARE YOU CLOCKING IN AS?'})).toBeVisible();
});

test('sound is gesture-gated, mute persists, and unavailable cards respond to keyboard',async({page})=>{
 await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');const Native=window.AudioContext;const stats={contexts:0,notes:0};Object.assign(window,{audioStats:stats});window.AudioContext=class extends Native{constructor(){super();stats.contexts++;}createOscillator(){stats.notes++;return super.createOscillator();}};},{tutorialKey,statusTutorialKey});
 await page.goto('/');await expect(page.locator('.title-screen')).toHaveCSS('opacity','1');expect(await page.evaluate(()=>(window as unknown as {audioStats:{contexts:number}}).audioStats.contexts)).toBe(0);
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Unmute sound',exact:true})).toHaveAttribute('aria-pressed','true');await createFighter(page);await enterBattle(page);await expect(card(page,'SHIP IT')).toBeEnabled();expect(await page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes)).toBe(0);
 await page.getByRole('button',{name:'Unmute sound',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {audioStats:{contexts:number}}).audioStats.contexts)).toBe(1);
 await card(page,'STACK OVERFLOW SUMMON').focus();await page.keyboard.press('Enter');await expect(page.getByRole('status')).toContainText('PLAY AN ATTACK');await expect.poll(()=>page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();const before=await page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes);await card(page,'SHIP IT').click();await expect(card(page,'SHIP IT')).toBeDisabled();await page.waitForTimeout(150);expect(await page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes)).toBe(before);
});

test('mobile layout and reduced motion keep effects readable without camera movement',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(({tutorialKey,statusTutorialKey})=>{localStorage.setItem(tutorialKey,'true');localStorage.setItem(statusTutorialKey,'true');},{tutorialKey,statusTutorialKey});await page.goto('/');await createFighter(page);await page.getByRole('button',{name:/^CLOCK IN/}).click();await expect(page.locator('.workday-screen')).toHaveCSS('opacity','1');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/phase4b-mobile-workday.png',fullPage:true,animations:'disabled'});await page.getByRole('button',{name:/^ENTER MEETING/}).last().click();await expect(page.locator('.battle-screen')).toBeVisible({timeout:5000});await freeze(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await rolls(page,[.5,.9,0,0,.9]);await card(page,'FORCE PUSH').click();await page.clock.runFor(1300);await expect(page.locator('.arena')).toHaveCSS('animation-name','none');await expect(page.locator('.damage-number')).toBeVisible();await expect(page.locator('.arena-center')).toContainText('−40');await page.screenshot({path:'artifacts/phase2-mobile-impact.png',fullPage:true,animations:'disabled'});await finishRound(page);
});

test('a full four-round battle ends in simultaneous recoil knockout',async({page})=>{
 await start(page);await freeze(page);
 for(let i=0;i<2;i++){await rolls(page,[0,0,.99,.999,.9]);await card(page,'FORCE PUSH').click();await finishRound(page);}
 await expect(playerHP(page)).toHaveAttribute('aria-valuenow','16');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','30');
 await rolls(page,[0,.7,.9]);await card(page,'WORKS ON MY MACHINE').click();await finishRound(page);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','10');
 await rolls(page,[0,0]);await card(page,'FORCE PUSH').click();await page.clock.runFor(1300);await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','0');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','10');await page.clock.runFor(750);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','0');await expect(page.getByRole('dialog')).toHaveCount(0);await page.clock.runFor(1950);await expect(page.getByRole('heading',{name:'EVERYONE CLOCKED OUT'})).toBeVisible();
});
