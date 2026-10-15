// Kopiert das Spiel nach www/ (Eingabe für Capacitor/APK). Aufruf: npm run build:www
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=path.join(root,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of['index.html','css','src','fonts'])fs.cpSync(path.join(root,f),path.join(out,f),{recursive:true});
console.log('www/ erstellt');
