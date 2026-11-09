const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const html=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','index.html'),'utf8');
const data=JSON.parse(html.match(/<script id="sourceData" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const source=html.match(/<script>\s*('use strict';[\s\S]*?)<\/script>/)[1];
new vm.Script(source);
const context={crypto:crypto.webcrypto,document:{getElementById:id=>({textContent:id==='sourceData'?JSON.stringify(data):'null'})},localStorage:{getItem:()=>null},location:{pathname:'/test'},setTimeout(){},console};
vm.createContext(context);vm.runInContext(source.split('function persist()')[0]+';globalThis.M={defaults,unit,evaluate,project,installment,validState,migrate,comparisonState,freezePrices,costCategories};',context);
const M=context.M,copy=x=>JSON.parse(JSON.stringify(x));let count=0;
function near(actual,expected,label){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-6,`${label}: ${actual} != ${expected}`);count++;}
function check(value,label){assert.ok(value,label);count++;}
let s=M.defaults(),r=M.evaluate(s),c=M.costCategories(s,r);
near(r.cloud.rds,.129*730,'one shared large RDS');
near(r.cloud.gateway,.1108*730+50*.08,'one shared gateway and EBS');
near(r.cloud.nat,(.045+.005)*730,'one NAT and its public IP');
near(r.cloud.storageGb,5*2.1+3*2.5+2*3,'aggregate data determines shared disk');
near(r.cloud.ecr,.1,'one common ETL image');
near(r.cloud.executions,10*240,'one task per customer per cycle');
near(r.cloud.etl,5*(240*2/60*(.25*.04048+.5*.004445))+3*(240*(20/3)/60*(.5*.04048+.004445))+2*(240*(40/3)/60*(.04048+2*.004445)),'Fargate aggregates runtime and resources');
near(r.cloud.traffic,5*(4*.045+.09)+3*(13*.045+3*.09)+2*(40*.045+10*.09),'NAT processes API and BI traffic');
near(r.cloud.total,254.046615,'cloud monthly baseline');
near(r.floor,9885.713281666667,'monthly cost includes shared cloud once');
near(r.revenue,12852.079781666667,'fixed prices preserved');
near(c.support,4987.5,'source support still matches');near(c.maintenance,3037.5,'common plus individual maintenance');
near(r.setup,18480,'source setup remains intact');
const fixed=r.cloud.fixed,revenue=r.revenue;
s.clients[1].count++;r=M.evaluate(s);near(r.cloud.fixed,fixed,'11 clients do not create another NAT');
check(r.average<988.5713281666667,'one medium lowers average without artificial step');
s=M.defaults();s.clients.forEach(x=>x.count*=2);r=M.evaluate(s);near(r.cloud.fixed,fixed,'doubling clients retains shared resources');check(r.average<988.5713281666667,'same-mix scale economy');
s=M.defaults();s.clients=[{...s.clients[2],count:1}];r=M.evaluate(s);near(r.cloud.storageGb,20,'20GB minimum once');near(r.cloud.rds,.129*730,'client size does not choose server');
s.clients[0].count=11;r=M.evaluate(s);near(r.cloud.storageGb,33,'minimum not repeated per client');near(r.cloud.rds,.129*730,'no RDS multiplication');
s.cloudRdsCount=2;s.cloudGatewayCount=2;s.cloudNatCount=2;r=M.evaluate(s);near(r.cloud.rds,2*.129*730,'explicit shared RDS count');near(r.cloud.storageGb,40,'minimum across configured instances');near(r.cloud.ecr,.1,'one image with two servers');
s.cloudRdsProfile=0;near(M.evaluate(s).cloud.rds,2*.032*730,'explicit shared profile');
s=M.defaults();s.cloudReferenceClients=1000;near(M.evaluate(s).floor,9885.713281666667,'budget reference not capacity');
s=M.defaults();s.cloudStress=20;r=M.evaluate(s);near(r.cloud.total,254.046615*1.2,'cloud stress total');near(r.revenue,revenue,'fixed prices stable');
s=M.defaults();s.values['Operacional!B25']=1.5;near(M.evaluate(s).cloud.etl,M.evaluate(M.defaults()).cloud.etl*2,'frequency doubles compute');
s=M.defaults();s.clients.forEach(x=>x.count=0);r=M.evaluate(s);near(r.cloud.total,218.074,'cloud persists without clients');near(r.common,368.074,'common labor and cloud persist');near(r.cloud.executions,0,'no customer tasks');check(r.average===null,'zero-client average');
s.platformStart=5;near(M.evaluate(s,4).operating,0,'before launch zero');near(M.evaluate(s,5).operating,368.074,'cloud starts with platform');
s=M.defaults();s.staffMode='blocks';s.staffHours=107;s.staffCost=5000;r=M.evaluate(s);c=M.costCategories(s,r);near(r.staffBlocks,1,'exact staff threshold');near(r.capacity,5000,'capacity only staff');near(r.perClient,1190,'no duplicate labor/cloud');near(c.support+c.maintenance,5000,'categories distribute block cost');
s.staffHours=106.9;near(M.evaluate(s).staffBlocks,2,'above personnel threshold');
s.clients.forEach(x=>x.count=0);s.commonRules={};s.staffMinimum=2;r=M.evaluate(s);c=M.costCategories(s,r);near(c.other,10000,'idle staff in other');near(c.maintenance,0,'no demand allocation');
s=M.defaults();s.laborHourCost=25;r=M.evaluate(s);near(r.setup,6160,'real labor setup');near(M.costCategories(s,r).maintenance,1012.5,'real labor maintenance');
s=M.defaults();s.licenseMode='client';near(M.evaluate(s).licenses,0,'customer reader licenses');
s=M.defaults();s.pricingMode='auto';s.margin=25;r=M.evaluate(s);near(r.revenue,r.floor/.75,'auto quote margin');M.freezePrices(s);const frozen=M.evaluate(s).revenue;s.cloudAux=1000;near(M.evaluate(s).revenue,frozen,'frozen quote');near(M.evaluate(s,37).revenue,frozen,'after payback');
s=M.defaults();s.fixedPrices=[0,0,0];s.fixedSetup=[0,0,0];near(M.evaluate(s).revenue,0,'zero prices');
s=M.defaults();s.clients[0].start=5;near(M.evaluate(s,4).count,5,'future group inactive');near(M.evaluate(s,5).setup,6600,'setup at arrival');near(M.evaluate(s,6).setup,0,'setup not recurring');
s=M.defaults();s.values['Inversión!B6']=1200;s.values['Inversión!B7']=12;s.values['Inversión!B9']=.12;near(M.installment(s,1),1200*.01/(1-Math.pow(1.01,-12)),'interest annuity');
for(const mode of ['hourly','blocks'])for(const scenario of [0,1,2])for(const month of [1,2,12,36,37]){
 s=M.defaults();s.staffMode=mode;s.staffCost=6000;s.scenario=scenario;s.commonOther=200;s.cloudAux=15;r=M.evaluate(s,month);c=M.costCategories(s,r);
 near(r.operating,r.common+r.perClient+r.capacity,'scope reconciliation');
 near(r.operating,c.support+c.maintenance+c.operational+c.licenses+c.other,'category reconciliation');
 near(r.rows.reduce((a,x)=>a+x.operating*x.count,0),r.operating,'client allocation');
 near(r.cloud.total,r.cloud.fixed+r.cloud.variable,'cloud chart');
 near(r.profit,r.revenue-r.operating-r.recovery,'profit');
 near(r.revenue,revenue,'fixed scenario prices');
}
s=M.defaults();const projection=M.project(s);near(projection.at(-1).cumulative,-15000+projection.reduce((a,x)=>a+x.revenue+x.setupRevenue-x.operating-x.setup,0),'investment deducted once');
for(const version of [undefined,2]){s=M.defaults();s.schemaVersion=version;s.infra='dedicated';s.gatewayCapacity=10;s.natCapacity=10;for(const k of Object.keys(s).filter(k=>k.startsWith('cloud')))delete s[k];s.cloudStress=0;const originalClients=copy(s.clients),originalPrices=copy(s.fixedPrices);M.validState(s);check(s.schemaVersion===3&&s.infra==='shared'&&s.migratedCloud,'legacy cloud shared');near(M.evaluate(s).cloud.total,254.046615,'migration baseline');check(JSON.stringify(s.clients)===JSON.stringify(originalClients),'legacy customers');check(JSON.stringify(s.fixedPrices)===JSON.stringify(originalPrices),'legacy tariffs');check(!('gatewayCapacity'in s),'legacy capacity removed');}
s=M.defaults();M.validState(s);const imported=copy(s);M.validState(imported);near(M.evaluate(imported).floor,M.evaluate(s).floor,'JSON roundtrip');
const saved=M.defaults();saved.fixedPrices=[1,2,3];const before=JSON.stringify(saved);near(M.evaluate(M.comparisonState(saved,s)).revenue,revenue,'compare same prices');check(JSON.stringify(saved)===before,'saved scenario unchanged');
for(const patch of [{cloudRdsProfile:3},{cloudRdsCount:0},{cloudNatCount:1.5},{cloudAux:-1},{cloudAux:null},{staffHours:0},{infra:'dedicated'},{fixedPrices:[1,null,3]}]){assert.throws(()=>M.validState({...M.defaults(),...patch}));count++;}
near(data.groups.flatMap(g=>g.fields).length,141,'original inputs preserved');
console.log(`PASS: ${count} checks: shared cloud, categories, pricing, capacity, investment and migration.`);
