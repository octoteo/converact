#!/usr/bin/env node
import path from 'node:path';
import {
  VERSION, acceptChange, buildContext, classifyRisk, compileContract, createChange,
  findProjectRoot, initProject, inspectProject, listChanges, loadContract,
  projectStatus, recordEvidence, saveContract, validateContract, verifyChange, convergeChange
} from './index.js';

async function main(){
  const args=process.argv.slice(2); const json=flag(args,'--json'); const cmd=args.shift()||'help'; let result; let ok=true;
  switch(cmd){
    case 'help': case '--help': case '-h': console.log(help()); return;
    case 'version': case '--version': case '-v': console.log(VERSION); return;
    case 'init': result=initProject(process.cwd(),{force:flag(args,'--force')}); break;
    case 'inspect': result=inspectProject(findProjectRoot()); break;
    case 'classify': { const text=args.join(' ').trim(); if(!text) usage('converact classify <description>'); result=classifyRisk(text); break; }
    case 'status': result=projectStatus(findProjectRoot()); break;
    case 'change': {
      const action=args.shift(), root=findProjectRoot();
      if(action==='create'){ const intent=opt(args,'--intent'), id=opt(args,'--id'), riskLevel=opt(args,'--risk'), title=args.join(' ').trim(); if(!title)usage('converact change create <title> [--intent text] [--risk L0-L3]'); result=createChange(root,{title,intent,id,riskLevel}); }
      else if(action==='show'){ const id=args.shift(); if(!id)usage('converact change show <id>'); result=loadContract(root,id); }
      else if(action==='list') result={changes:listChanges(root)};
      else if(action==='activate'){ const id=args.shift(); if(!id)usage('converact change activate <id>'); const c=loadContract(root,id),v=validateContract(c); if(!v.valid){result={ok:false,validation:v};ok=false;}else{c.status='active';saveContract(root,id,c);result={ok:true,id,status:'active'};} }
      else if(action==='accept'){ const id=args.shift(); if(!id)usage('converact change accept <id>'); result=acceptChange(root,id); ok=result.ok; }
      else usage('converact change <create|show|list|activate|accept> ...');
      break;
    }
    case 'contract': { const action=args.shift(),id=args.shift(); if(!id||!['validate','compile'].includes(action))usage('converact contract <validate|compile> <id>'); const root=findProjectRoot(); result=action==='validate'?validateContract(loadContract(root,id)):compileContract(root,id); ok=action==='validate'?result.valid:result.ok; break; }
    case 'context': { if(args.shift()!=='build')usage('converact context build <id> [--task text]'); const task=opt(args,'--task'),id=args.shift(); if(!id)usage('converact context build <id> [--task text]'); result=buildContext(findProjectRoot(),id,{task}); break; }
    case 'evidence': { if(args.shift()!=='record')usage('converact evidence record <id> <check> --status pass|fail [--note text]'); const status=opt(args,'--status'),note=opt(args,'--note')||'',id=args.shift(),checkId=args.shift(); if(!id||!checkId||!status)usage('converact evidence record <id> <check> --status pass|fail [--note text]'); result=recordEvidence(findProjectRoot(),id,checkId,{status,note}); break; }
    case 'verify': { const all=flag(args,'--all-active'),checks=(opt(args,'--check')||'').split(',').filter(Boolean),root=findProjectRoot(); if(all){ const ids=listChanges(root).filter(id=>!['accepted','aborted'].includes(loadContract(root,id).status)); const changes=ids.map(id=>verifyChange(root,id,{checkIds:checks.length?checks:undefined})); result={ok:changes.every(x=>x.ok),changes}; ok=result.ok; } else { const id=args.shift(); if(!id)usage('converact verify <id> [--check CHK-1,CHK-2]'); result=verifyChange(root,id,{checkIds:checks.length?checks:undefined});ok=result.ok;} break; }
    case 'converge': { const id=args.shift(); if(!id)usage('converact converge <id>'); result=convergeChange(findProjectRoot(),id); ok=result.converged; break; }
    case 'run': { const id=args.shift(); if(!id)usage('converact run <id>'); const root=findProjectRoot(),verification=verifyChange(root,id),convergence=convergeChange(root,id); result={ok:verification.ok&&convergence.converged,verification,convergence};ok=result.ok;break; }
    case 'mcp': { const { serveMcp }=await import('./mcp.js'); await serveMcp(); return; }
    default: usage(`Unknown command: ${cmd}\n\n${help()}`);
  }
  if(args.length) usage(`Unexpected arguments: ${args.join(' ')}`);
  console.log(json?JSON.stringify(result,null,2):format(result)); if(!ok)process.exitCode=1;
}
function flag(a,n){const i=a.indexOf(n);if(i<0)return false;a.splice(i,1);return true;}
function opt(a,n){const i=a.indexOf(n);if(i<0)return undefined;if(i===a.length-1)usage(`Missing value for ${n}`);const v=a[i+1];a.splice(i,2);return v;}
function usage(m){const e=new Error(m);e.usage=true;throw e;}
function format(r){if(r?.converged!==undefined)return `Converged: ${r.converged?'yes':'no'}\n${(r.blockers||[]).map(x=>'BLOCKER: '+x.message).join('\n')}`.trim();if(r?.valid!==undefined)return `Valid: ${r.valid?'yes':'no'}\n${(r.errors||[]).map(x=>'ERROR: '+x).join('\n')}`.trim();if(r?.level&&r?.factors)return `${r.level} (${r.total}/20)\n${r.rationale}`;if(r?.ok!==undefined&&r?.results)return `Verification: ${r.ok?'pass':'fail'}\n${r.results.map(x=>`${x.checkId}: ${x.status}`).join('\n')}`;return JSON.stringify(r,null,2);}
function help(){return `Converact ${VERSION}\nContract-driven convergence for autonomous software engineering agents.\n\nCommands:\n  init [--force]\n  inspect\n  classify <description>\n  status\n  change create|show|list|activate|accept\n  contract validate|compile\n  context build\n  evidence record\n  verify [--all-active]\n  converge\n  run\n  mcp\n\nAdd --json for structured output.`;}
main().catch(e=>{console.error(e.message);process.exitCode=e.usage?2:1;});
