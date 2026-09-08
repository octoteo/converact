import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import path from 'node:path';
import { acceptChange, buildContext, classifyRisk, compileContract, createChange, findProjectRoot, inspectProject, loadContract, projectStatus, recordEvidence, validateContract, verifyChange, convergeChange } from './index.js';

export function buildMcpServer(){
  const server=new McpServer({name:'converact',version:'1.0.0'},{capabilities:{tools:{}}});
  const root=(value)=>value?findProjectRoot(path.resolve(value)):findProjectRoot(process.cwd());
  const reg=(name,description,inputSchema,handler)=>server.registerTool(name,{description,inputSchema},async(input)=>{try{const data=await handler(input);return{content:[{type:'text',text:JSON.stringify(data,null,2)}],structuredContent:data};}catch(e){return{isError:true,content:[{type:'text',text:e.message||String(e)}]};}});
  reg('converact_inspect','Inspect a repository and persist a compact project model.',z.object({root:z.string().optional()}),({root:r})=>inspectProject(root(r)));
  reg('converact_classify','Classify a proposed software change into risk level L0-L3.',z.object({text:z.string().min(1)}),({text})=>classifyRisk(text));
  reg('converact_status','Return Converact project/change status.',z.object({root:z.string().optional()}),({root:r})=>projectStatus(root(r)));
  reg('converact_change_create','Create a new change contract skeleton.',z.object({root:z.string().optional(),title:z.string().min(1),intent:z.string().optional(),id:z.string().optional(),riskLevel:z.enum(['L0','L1','L2','L3']).optional()}),({root:r,...input})=>createChange(root(r),input));
  reg('converact_contract_get','Read a change contract.',z.object({root:z.string().optional(),changeId:z.string().min(1)}),({root:r,changeId})=>loadContract(root(r),changeId));
  reg('converact_contract_validate','Validate a change contract.',z.object({root:z.string().optional(),changeId:z.string().min(1)}),({root:r,changeId})=>validateContract(loadContract(root(r),changeId)));
  reg('converact_contract_compile','Compile and hash a valid contract.',z.object({root:z.string().optional(),changeId:z.string().min(1)}),({root:r,changeId})=>compileContract(root(r),changeId));
  reg('converact_context_build','Compile focused context for a change/task.',z.object({root:z.string().optional(),changeId:z.string().min(1),task:z.string().optional()}),({root:r,changeId,task})=>buildContext(root(r),changeId,{task}));
  reg('converact_verify','Execute contract evidence checks.',z.object({root:z.string().optional(),changeId:z.string().min(1),checkIds:z.array(z.string()).optional()}),({root:r,changeId,checkIds})=>verifyChange(root(r),changeId,{checkIds}));
  reg('converact_evidence_record','Record explicit pass/fail evidence for a check.',z.object({root:z.string().optional(),changeId:z.string().min(1),checkId:z.string().min(1),status:z.enum(['pass','fail']),note:z.string().optional()}),({root:r,changeId,checkId,status,note})=>recordEvidence(root(r),changeId,checkId,{status,note}));
  reg('converact_converge','Evaluate contract convergence using fresh evidence.',z.object({root:z.string().optional(),changeId:z.string().min(1)}),({root:r,changeId})=>convergeChange(root(r),changeId));
  reg('converact_change_accept','Accept a converged change.',z.object({root:z.string().optional(),changeId:z.string().min(1)}),({root:r,changeId})=>acceptChange(root(r),changeId));
  return server;
}

export async function serveMcp(){ await serveStdio(()=>buildMcpServer()); }
