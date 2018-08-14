import Dexie from "dexie";

const db = new Dexie("ScanFile");
db.version(1).stores({
  files: `md5,name, createTime,state,list`
});

db.open().catch(function(e) {
  console.error("Open failed: " + e);
});

export default db;
