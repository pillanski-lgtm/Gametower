const lib=require('./lib');
for(const f of['store','determinism','economy','chain','bot'])require('./'+f+'.test.js');
process.exit(lib.done()?1:0);
