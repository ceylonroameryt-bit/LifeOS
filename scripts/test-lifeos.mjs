import { spawnSync } from 'node:child_process';
// The compatibility entry point runs the actual application test suite.
const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['test'],{stdio:'inherit',shell:process.platform==='win32'});
process.exit(result.status??1);
