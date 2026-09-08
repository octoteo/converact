import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initProject, classifyRisk, createChange, loadContract, saveContract, validateContract, verifyChange, convergeChange, acceptChange, buildContext } from '../src/index.js';

function root(){const r=fs.mkdtempSync(path.join(os.tmpdir(),'converact-'));fs.mkdirSync(path.join(r,'src'),{recursive:true});fs.writeFileSync(path.join(r,'src','feature.js'),'export const value = 1;\n');initProject(r);return r;}
function configured(){const r=root(),id='CHG-test';createChange(r,{id,title:'Test change',intent:'Keep feature valid',riskLevel:'L1'});const c=loadContract(r,id);c.status='active';c.requirements=[{id:'REQ-1',type:'invariant',statement:'Feature exists',priority:'must',scope:['src/**'],checks:['CHK-1','CHK-2']}];c.checks=[{id:'CHK-1',kind:'file',description:'Feature file exists',path:'src/feature.js'},{id:'CHK-2',kind:'command',description:'Node can access feature',command:'node -e "require(\'fs\').accessSync(\'src/feature.js\')"'}];saveContract(r,id,c);return{r,id};}

test('risk model keeps cosmetic changes L0 and auth >= L2',()=>{assert.equal(classifyRisk('Fix CSS spacing typo in one local file').level,'L0');assert.ok(['L2','L3'].includes(classifyRisk('Change authentication token refresh behavior').level));assert.equal(classifyRisk('Modify PLC safety interlock for robot cell').level,'L3');});

test('contract semantic validation catches unknown checks',()=>{const c={schemaVersion:1,id:'x',title:'x',intent:'x',riskLevel:'L1',status:'active',constraints:[],nonGoals:[],standards:[],requirements:[{id:'R',type:'behavior',statement:'x',priority:'must',checks:['missing']}],checks:[]};assert.equal(validateContract(c).valid,false);});

test('verify -> converge -> accept works end to end',()=>{const{r,id}=configured();assert.equal(verifyChange(r,id).ok,true);assert.equal(convergeChange(r,id).converged,true);const a=acceptChange(r,id);assert.equal(a.ok,true);assert.ok(fs.existsSync(path.join(r,'.converact','contracts',`${id}.json`)));});

test('implementation changes invalidate old evidence',()=>{const{r,id}=configured();assert.equal(verifyChange(r,id).ok,true);assert.equal(convergeChange(r,id).converged,true);fs.appendFileSync(path.join(r,'src','feature.js'),'// changed\n');assert.equal(convergeChange(r,id).converged,false);});

test('contract changes invalidate old evidence',()=>{const{r,id}=configured();assert.equal(verifyChange(r,id).ok,true);const c=loadContract(r,id);c.constraints.push('new boundary');saveContract(r,id,c);assert.equal(convergeChange(r,id).converged,false);});

test('context compiler selects scoped source and constitution',()=>{const{r,id}=configured();const p=buildContext(r,id,{task:'Implement feature'});assert.ok(p.files.some(x=>x.path==='src/feature.js'));assert.ok(p.files.some(x=>x.path.includes('.converact/constitution/engineering.md')));});
