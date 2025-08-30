
const DB_NAME = "badmintonDB";
const DB_VERSION = 1;
let db;

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e=>{
      db = e.target.result;
      if(!db.objectStoreNames.contains("players")){
        db.createObjectStore("players",{keyPath:"id"});
      }
      if(!db.objectStoreNames.contains("matches")){
        db.createObjectStore("matches",{keyPath:"mid", autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("attendance")){
        db.createObjectStore("attendance",{keyPath:"date"});
      }
    };
    req.onsuccess = ()=>{ db = req.result; resolve(db); };
    req.onerror = ()=>reject(req.error);
  });
}

function tx(store,mode="readonly"){ return db.transaction(store,mode).objectStore(store); }

async function getAll(store){
  return new Promise((res,rej)=>{
    const out=[]; const req = tx(store).openCursor();
    req.onsuccess = e=>{
      const c = e.target.result;
      if(c){ out.push(c.value); c.continue(); } else res(out);
    };
    req.onerror = ()=>rej(req.error);
  });
}

async function put(store,val){
  return new Promise((res,rej)=>{
    const req = tx(store,"readwrite").put(val);
    req.onsuccess=()=>res(); req.onerror=()=>rej(req.error);
  });
}

async function del(store,key){
  return new Promise((res,rej)=>{
    const req = tx(store,"readwrite").delete(key);
    req.onsuccess=()=>res(); req.onerror=()=>rej(req.error);
  });
}

// ========= Cross-page sync =========
const channel = new BroadcastChannel("badminton_sync");
function broadcast(type, payload){
  channel.postMessage({type,payload});
}

import { put, broadcast } from "./db.js";

async function addPlayer(player){
  await openDB();
  await put("players", player);
  broadcast("playerAdded", player);
}
import { put, broadcast } from "./db.js";

async function addPlayer(player){
  await openDB();
  await put("players", player);
  broadcast("playerAdded", player);
}
async function updateMatchResult(m, na, nb){
          m.s1 = na; m.s2 = nb; m.status = "completed";
          renderMatch(m);   
            saveMatches(); // persist scores immediately    
            if(na>nb){ m.winner = m.a; m.loser = m.b; } else { m.winner = m.b; m.loser = m.a; }     
              if(m.nextMatch){  
                if(!m.nextMatch.a) m.nextMatch.a = m.winner;
                else if(!m.nextMatch.b) m.nextMatch.b = m.winner;   
                renderMatch(m.nextMatch);
                saveMatches(); // persist scores immediately
                }   }

