import {test,expect,type Page} from '@playwright/test';
const card=(page:Page,name:string)=>page.getByRole('button',{name:new RegExp(`${name},`)});
const playerHP=(page:Page)=>page.getByRole('progressbar',{name:'HRISHI Mental Capacity'});
const enemyHP=(page:Page)=>page.getByRole('progressbar',{name:'THE SCRUM LORD Mental Capacity'});
async function start(page:Page){await page.goto('/');await expect(page.locator('.title-screen')).toHaveCSS('opacity','1');await page.getByRole('button',{name:'START FIGHT'}).click();await expect(page.getByText('PREPARING YOUR PERFORMANCE REVIEW')).toBeVisible();await expect(card(page,'SHIP IT')).toBeEnabled();await expect(page.locator('.battle-screen')).toHaveCSS('opacity','1');}
async function freeze(page:Page){const time=new Date('2030-01-01T12:00:00Z');await page.clock.install({time});await page.clock.pauseAt(time);}
async function rolls(page:Page,values:number[]){await page.evaluate(values=>{let index=0;Math.random=()=>values[index++]??.5;},values);}
async function finishRound(page:Page){await page.clock.runFor(6000);}
test('all cards, readable beats and five-round victory',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await start(page);await freeze(page);
 await expect(card(page,'STACK OVERFLOW SUMMON')).toBeDisabled();
 // aria-disabled cards can explain their prerequisite without executing an action.
 await card(page,'STACK OVERFLOW SUMMON').click({force:true});await expect(page.getByRole('status')).toContainText('PLAY AN ATTACK');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','100');
 await rolls(page,[0,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(150);await expect(page.getByText('CANNOT REPRODUCE',{exact:true})).toBeVisible();await page.clock.runFor(740);await expect(page.getByText('Quick call?',{exact:true})).toBeVisible();await page.clock.runFor(410);await expect(page.locator('.block-receipt')).toContainText('DECLINED.');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','95');await finishRound(page);
 await rolls(page,[.5,.5,.5,.9]);await card(page,'SHIP IT').click();await page.clock.runFor(180);await expect(page.getByText('DEPLOYED TO PROD')).toBeVisible();await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','100');await page.clock.runFor(350);await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','72');await finishRound(page);
 await rolls(page,[0,0,.9]);await card(page,'STACK OVERFLOW SUMMON').click();await page.clock.runFor(180);await expect(page.locator('.ghost-card')).toContainText('SHIP IT');await expect(page.getByText('✓ ANSWER ACCEPTED')).toBeVisible();await finishRound(page);
 await rolls(page,[.5,.9,0,0,.9]);await card(page,'FORCE PUSH').click();await page.clock.runFor(520);await expect(page.locator('.arena')).toHaveAttribute('data-heavy','true');await finishRound(page);
 await expect(card(page,'FORCE PUSH')).toBeDisabled();await card(page,'FORCE PUSH').click({force:true});await expect(page.getByRole('status')).toContainText('COFFEE FIRST');
 await rolls(page,[.5]);await card(page,'SHIP IT').click();await page.clock.runFor(550);await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','0');await expect(page.getByRole('dialog')).toHaveCount(0);await page.clock.runFor(650);await expect(page.locator('.boss-figure')).toHaveClass(/knocked-out/);await expect(page.getByRole('dialog')).toHaveCount(0);await finishRound(page);
 await expect(page.getByRole('heading',{name:'PROMOTED'})).toBeVisible();await page.screenshot({path:'artifacts/phase2-result.png',fullPage:true,animations:'disabled'});await expect(page.locator('.result-stats')).toContainText('5');
 expect(errors).toEqual([]);
});

test('boss buff, reduced incoming damage, heal and ceremony have distinct beats',async({page})=>{
 await start(page);await freeze(page);await rolls(page,[.5,.75,0,.9]);await card(page,'SHIP IT').click();await page.clock.runFor(920);await expect(page.locator('.scope-effect')).toContainText('+1 SMALL CHANGE');await finishRound(page);await expect(page.locator('.pending-requirement')).toContainText('NEXT ATTACK +8');
 await rolls(page,[0,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(1000);await expect(page.locator('.buff')).toContainText('+8');await page.clock.runFor(320);await expect(page.locator('.block-receipt')).toContainText('23 → 7');await expect(page.locator('.buff')).toHaveCount(0);await finishRound(page);
 await rolls(page,[.5,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(950);await expect(page.locator('.standup-effect')).toContainText('YESTERDAY');await expect(page.locator('.standup-effect')).toContainText('BLOCKERS');await page.clock.runFor(760);await expect(page.locator('.heal-number')).toContainText('+4');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','76');await page.screenshot({path:'artifacts/phase2-heal.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[.99,0,.9]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(950);await expect(page.locator('.ceremony-effect')).toContainText('ATTENDEES: EVERYONE');await page.clock.runFor(500);await expect(page.locator('.arena')).toHaveAttribute('data-heavy','true');await finishRound(page);
});

test('recoil is separate; chaos announces before damage and clock stays late',async({page})=>{
 await start(page);await freeze(page);await rolls(page,[0,0,0,0,.9]);await card(page,'FORCE PUSH').click();await page.clock.runFor(550);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','100');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','65');await page.clock.runFor(350);await expect(page.getByText('! PRODUCTION INCIDENT')).toBeVisible();await expect(playerHP(page)).toHaveAttribute('aria-valuenow','90');await page.screenshot({path:'artifacts/phase2-recoil.png',fullPage:true,animations:'disabled'});await finishRound(page);
 await rolls(page,[0,0,0]);await card(page,'WORKS ON MY MACHINE').click();await page.clock.runFor(1750);await expect(page.getByRole('heading',{name:'4:59 PM MESSAGE'})).toBeVisible();await expect(playerHP(page)).toHaveAttribute('aria-valuenow','70');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','65');await page.screenshot({path:'artifacts/phase2-chaos.png',fullPage:true,animations:'disabled'});await page.clock.runFor(800);await expect(page.getByRole('heading',{name:'4:59 PM MESSAGE'})).toHaveCount(0);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','65');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','60');await expect(page.locator('.office-clock')).toHaveText('4:59');await finishRound(page);
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
 expect(low).toBe(true);await expect(page.getByRole('heading',{name:'PUT ON A PIP'})).toBeVisible();
});
test('real-time full battles, rematch reset and back to title',async({page})=>{
 await start(page);
 for(let match=0;match<2;match++){
  await page.evaluate(()=>{Math.random=()=>.5});
  for(const name of ['FORCE PUSH','FORCE PUSH','SHIP IT']){await expect(card(page,name)).toBeEnabled();await card(page,name).click();}
  await expect(page.getByRole('heading',{name:'PROMOTED'})).toBeVisible();
  if(match===0){await page.getByRole('button',{name:'REMATCH'}).click();await expect(card(page,'SHIP IT')).toBeEnabled();await expect(playerHP(page)).toHaveAttribute('aria-valuenow','100');await expect(card(page,'STACK OVERFLOW SUMMON')).toBeDisabled();}
 }
 await page.getByRole('button',{name:'BACK TO TITLE'}).click();await expect(page.getByRole('button',{name:'START FIGHT'})).toBeVisible();
});

test('sound is gesture-gated, mute persists, and unavailable cards respond to keyboard',async({page})=>{
 await page.addInitScript(()=>{const Native=window.AudioContext;const stats={contexts:0,notes:0};Object.assign(window,{audioStats:stats});window.AudioContext=class extends Native{constructor(){super();stats.contexts++;}createOscillator(){stats.notes++;return super.createOscillator();}};});
 await page.goto('/');await expect(page.locator('.title-screen')).toHaveCSS('opacity','1');expect(await page.evaluate(()=>(window as unknown as {audioStats:{contexts:number}}).audioStats.contexts)).toBe(0);
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Unmute sound',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'START FIGHT'}).click();await expect(card(page,'SHIP IT')).toBeEnabled();expect(await page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes)).toBe(0);
 await page.getByRole('button',{name:'Unmute sound',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as unknown as {audioStats:{contexts:number}}).audioStats.contexts)).toBe(1);
 await card(page,'STACK OVERFLOW SUMMON').focus();await page.keyboard.press('Enter');await expect(page.getByRole('status')).toContainText('PLAY AN ATTACK');await expect.poll(()=>page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();const before=await page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes);await card(page,'SHIP IT').click();await expect(card(page,'SHIP IT')).toBeEnabled();expect(await page.evaluate(()=>(window as unknown as {audioStats:{notes:number}}).audioStats.notes)).toBe(before);
});

test('mobile layout and reduced motion keep effects readable without camera movement',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await start(page);await freeze(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'artifacts/phase2-mobile.png',fullPage:true,animations:'disabled'});
 await rolls(page,[.5,.9,0,0,.9]);await card(page,'FORCE PUSH').click();await page.clock.runFor(550);await expect(page.locator('.arena')).toHaveCSS('animation-name','none');await expect(page.locator('.damage-number')).toBeVisible();await expect(page.locator('.impact-burst')).toBeVisible();await page.screenshot({path:'artifacts/phase2-mobile-impact.png',fullPage:true,animations:'disabled'});await finishRound(page);
});

test('a full four-round battle ends in simultaneous recoil knockout',async({page})=>{
 await start(page);await freeze(page);
 for(let i=0;i<2;i++){await rolls(page,[0,0,.99,.999,.9]);await card(page,'FORCE PUSH').click();await finishRound(page);}
 await expect(playerHP(page)).toHaveAttribute('aria-valuenow','16');await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','30');
 await rolls(page,[0,.7,.9]);await card(page,'WORKS ON MY MACHINE').click();await finishRound(page);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','10');
 await rolls(page,[0,0]);await card(page,'FORCE PUSH').click();await page.clock.runFor(550);await expect(enemyHP(page)).toHaveAttribute('aria-valuenow','0');await expect(playerHP(page)).toHaveAttribute('aria-valuenow','10');await page.clock.runFor(350);await expect(playerHP(page)).toHaveAttribute('aria-valuenow','0');await expect(page.getByRole('dialog')).toHaveCount(0);await finishRound(page);await expect(page.getByRole('heading',{name:'EVERYONE CLOCKED OUT'})).toBeVisible();
});
