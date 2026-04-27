import React, { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

/* ── FIREBASE CONFIGURATION ── */
const firebaseConfig = {
  apiKey: "AIzaSyDMVwPx4MngQY-tUB15H3LeeYI5sdVJg14",
  authDomain: "torah-tracker-3051d.firebaseapp.com",
  projectId: "torah-tracker-3051d",
  storageBucket: "torah-tracker-3051d.firebasestorage.app",
  messagingSenderId: "1080062742776",
  appId: "1:1080062742776:web:4539305f8aae6ba93f6b0d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ── ICONS ── */
const IcoBook = ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IcoFlame = ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IcoStar = ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoClock = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoScroll = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4c0-1.1.9-2 2-2"/><path d="M20 2c1.1 0 2 .9 2 2"/><path d="M22 8v12c0 1.1-.9 2-2 2"/><path d="M16 22c-1.1 0-2-.9-2-2"/><path d="M14 22c0 1.1-.9 2-2 2"/><path d="M8 24c-1.1 0-2-.9-2-2"/><path d="M2 22V10c0-1.1.9-2 2-2"/><path d="M8 8c1.1 0 2-.9 2-2"/><path d="M10 4c0-1.1-.9-2-2-2"/><path d="M4 2c-1.1 0-2 .9-2 2"/><path d="M4 4h16"/><path d="M4 8h16"/><path d="M4 22h16"/></svg>;
const IcoHeart = ()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IcoCalendar = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoAI = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M16 13h.01"/><path d="M12 13h.01"/><path d="M8 13h.01"/></svg>;
const IcoStats = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoDots = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>;

/* ── HEBREW DATE ── */
function toHeb(n) {
  if (!n || n <= 0) return "";
  const M = [[400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],[90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],[50,"נ"],[40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],[9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],[5,"ה"],[4,"ד"],[3,"ג"],[2,"ב"],[1,"א"]];
  let rem = n, r = "";
  for (const [v,s] of M) while (rem >= v) { r += s; rem -= v; }
  return r.replace("יה","טו").replace("יו","טז");
}
function addGeresh(s) { return (!s) ? "" : s.length === 1 ? s + "׳" : s.slice(0,-1) + '״' + s.slice(-1); }
function hebDateFull(d) {
  try {
    d = d || new Date();
    const pp = new Intl.DateTimeFormat("he-u-ca-hebrew", {day:"numeric",month:"long",year:"numeric"}).formatToParts(d);
    const dayN  = parseInt(pp.find(p=>p.type==="day")?.value?.replace(/\D/g,"")||0);
    const monS  = pp.find(p=>p.type==="month")?.value||"";
    const yearN = parseInt(pp.find(p=>p.type==="year")?.value?.replace(/\D/g,"")||0)%1000;
    return `${addGeresh(toHeb(dayN))} ב${monS} ${addGeresh(toHeb(yearN))}`;
  } catch { return ""; }
}
function hebStr(s) { return s ? hebDateFull(new Date(s+"T12:00:00")) : ""; }
function todayKey() { return new Date().toISOString().slice(0,10); }

/* ── DATA & STRUCTURES ── */
const DAF_YOMI_MASECHTOS = [{n:"ברכות",d:64},{n:"שבת",d:157},{n:"עירובין",d:105},{n:"פסחים",d:121},{n:"שקלים",d:22},{n:"יומא",d:88},{n:"סוכה",d:56},{n:"ביצה",d:40},{n:"ראש השנה",d:35},{n:"תענית",d:31},{n:"מגילה",d:32},{n:"מועד קטן",d:29},{n:"חגיגה",d:27},{n:"יבמות",d:122},{n:"כתובות",d:112},{n:"נדרים",d:91},{n:"נזיר",d:66},{n:"סוטה",d:49},{n:"גיטין",d:90},{n:"קידושין",d:82},{n:"בבא קמא",d:119},{n:"בבא מציעא",d:119},{n:"בבא בתרא",d:176},{n:"סנהדרין",d:113},{n:"מכות",d:24},{n:"שבועות",d:49},{n:"עבודה זרה",d:76},{n:"הוריות",d:14},{n:"זבחים",d:120},{n:"מנחות",d:110},{n:"חולין",d:142},{n:"בכורות",d:61},{n:"ערכין",d:34},{n:"תמורה",d:34},{n:"כריתות",d:28},{n:"מעילה",d:22},{n:"נידה",d:73}];
const TOTAL_DAPIM = 2711;
const CYCLE14_START = new Date("2020-01-05");
function getDafYomi() {
  const today=new Date(); today.setHours(0,0,0,0);
  const start=new Date(CYCLE14_START); start.setHours(0,0,0,0);
  let dayN=Math.floor((today-start)/86400000)%TOTAL_DAPIM;
  if(dayN<0) dayN+=TOTAL_DAPIM;
  let rem=dayN; let mas="",daf=2;
  for(const m of DAF_YOMI_MASECHTOS){if(rem<m.d){mas=m.n;daf=rem+2;break;} rem-=m.d;}
  return {masechet:mas,daf,dafHeb:toHeb(daf)};
}

const PARASHA_CHAPTERS = {"בראשית":[1,2,3,4,5,6],"נח":[6,7,8,9,10,11],"לך לך":[12,13,14,15,16,17],"וירא":[18,19,20,21,22],"חיי שרה":[23,24,25],"תולדות":[25,26,27,28],"ויצא":[28,29,30,31,32],"וישלח":[32,33,34,35,36],"וישב":[37,38,39,40],"מקץ":[41,42,43,44],"ויגש":[44,45,46,47],"ויחי":[47,48,49,50],"שמות":[1,2,3,4,5,6],"וארא":[6,7,8,9],"בא":[10,11,12,13],"בשלח":[13,14,15,16,17],"יתרו":[18,19,20],"משפטים":[21,22,23,24],"תרומה":[25,26,27],"תצוה":[27,28,29,30],"כי תשא":[30,31,32,33,34],"ויקהל":[35,36,37,38],"פקודי":[38,39,40],"ויקרא":[1,2,3,4,5],"צו":[6,7,8],"שמיני":[9,10,11],"תזריע":[12,13],"מצורע":[14,15],"אחרי מות":[16,17,18],"קדושים":[19,20],"אמור":[21,22,23,24],"בהר":[25,26],"בחוקותי":[26,27],"במדבר":[1,2,3,4],"נשא":[4,5,6,7],"בהעלותך":[8,9,10,11,12],"שלח":[13,14,15],"קרח":[16,17,18],"חקת":[19,20,21],"בלק":[22,23,24,25],"פינחס":[25,26,27,28,29,30],"מטות":[30,31,32],"מסעי":[33,34,35,36],"דברים":[1,2,3],"ואתחנן":[3,4,5,6,7],"עקב":[7,8,9,10,11],"ראה":[11,12,13,14,15,16],"שופטים":[16,17,18,19,20,21],"כי תצא":[21,22,23,24,25],"כי תבוא":[26,27,28,29],"נצבים":[29,30],"וילך":[31],"האזינו":[32],"וזאת הברכה":[33,34]};
const PARSHIOT = [["בראשית","נח","לך לך","וירא","חיי שרה","תולדות","ויצא","וישלח","וישב","מקץ","ויגש","ויחי"],["שמות","וארא","בא","בשלח","יתרו","משפטים","תרומה","תצוה","כי תשא","ויקהל","פקודי"],["ויקרא","צו","שמיני","תזריע","מצורע","אחרי מות","קדושים","אמור","בהר","בחוקותי"],["במדבר","נשא","בהעלותך","שלח","קרח","חקת","בלק","פינחס","מטות","מסעי"],["דברים","ואתחנן","עקב","ראה","שופטים","כי תצא","כי תבוא","נצבים","וילך","האזינו","וזאת הברכה"]];
const HALACHOT = [{ t: "קריאת שמע של ערבית — מצווה לקרוא קריאת שמע בלילה, ויש לקרוא את שלוש פרשיותיה.", s: "שולחן ערוך, אורח חיים רל״ה" },{ t: "תפילת שחרית — חייב אדם להתפלל שחרית בכוונה, ולא יתפלל כשהוא עייף או ישנוני.", s: "שולחן ערוך, אורח חיים פ״ט" },{ t: "ברכת המזון — חיוב דאורייתא לברך ברכת המזון אחר כל אכילת לחם בשיעור כביצה.", s: "שולחן ערוך, אורח חיים קפ״ד" },{ t: "מזוזה — כל פתח של בית חייב במזוזה, ויש לקבוע אותה בתוך שליש העליון של הפתח.", s: "שולחן ערוך, יורה דעה רפ״ט" },{ t: "שבת — מצוות עשה לזכור את יום השבת ולקדש אותו בדברים.", s: "שולחן ערוך, אורח חיים רע״א" },{ t: "כיבוד אב ואם — מצוות עשה לכבד אב ואם, ואיסור חמור לבזותם.", s: "שולחן ערוך, יורה דעה ר״מ" },{ t: "צדקה — חייב אדם לתת צדקה לפחות עשירית מהכנסותיו.", s: "שולחן ערוך, יורה דעה רמ״ט" },{ t: "לשון הרע — אסור מדאורייתא לדבר לשון הרע, אפילו אמת.", s: "חפץ חיים, הלכות איסור לשון הרע א" }];

const GEMARA=[{n:"ברכות",s:"זרעים",d:64,p:9},{n:"שבת",s:"מועד",d:157,p:24},{n:"עירובין",s:"מועד",d:105,p:10},{n:"פסחים",s:"מועד",d:121,p:10},{n:"שקלים",s:"מועד",d:22,p:8},{n:"יומא",s:"מועד",d:88,p:8},{n:"סוכה",s:"מועד",d:56,p:5},{n:"ביצה",s:"מועד",d:40,p:5},{n:"ראש השנה",s:"מועד",d:35,p:4},{n:"תענית",s:"מועד",d:31,p:4},{n:"מגילה",s:"מועד",d:32,p:4},{n:"מועד קטן",s:"מועד",d:29,p:3},{n:"חגיגה",s:"מועד",d:27,p:3},{n:"יבמות",s:"נשים",d:122,p:16},{n:"כתובות",s:"נשים",d:112,p:13},{n:"נדרים",s:"נשים",d:91,p:11},{n:"נזיר",s:"נשים",d:66,p:9},{n:"סוטה",s:"נשים",d:49,p:9},{n:"גיטין",s:"נשים",d:90,p:9},{n:"קידושין",s:"נשים",d:82,p:4},{n:"בבא קמא",s:"נזיקין",d:119,p:10},{n:"בבא מציעא",s:"נזיקין",d:119,p:10},{n:"בבא בתרא",s:"נזיקין",d:176,p:10},{n:"סנהדרין",s:"נזיקין",d:113,p:11},{n:"מכות",s:"נזיקין",d:24,p:3},{n:"שבועות",s:"נזיקין",d:49,p:8},{n:"עבודה זרה",s:"נזיקין",d:76,p:5},{n:"הוריות",s:"נזיקין",d:14,p:3},{n:"זבחים",s:"קדשים",d:120,p:14},{n:"מנחות",s:"קדשים",d:110,p:13},{n:"חולין",s:"קדשים",d:142,p:12},{n:"בכורות",s:"קדשים",d:61,p:9},{n:"ערכין",s:"קדשים",d:34,p:9},{n:"תמורה",s:"קדשים",d:34,p:7},{n:"כריתות",s:"קדשים",d:28,p:6},{n:"מעילה",s:"קדשים",d:22,p:6},{n:"נידה",s:"טהרות",d:73,p:10}];
const MISHNA=[{m:"ברכות",s:"זרעים",p:9,ms:[5,8,6,7,5,8,5,8,5]},{m:"פאה",s:"זרעים",p:8,ms:[6,8,8,11,8,11,8,9]},{m:"דמאי",s:"זרעים",p:7,ms:[4,5,6,7,7,11,8]},{m:"כלאים",s:"זרעים",p:9,ms:[9,11,7,9,8,9,8,6,10]},{m:"שביעית",s:"זרעים",p:10,ms:[8,10,10,10,9,6,7,11,9,9]},{m:"תרומות",s:"זרעים",p:11,ms:[10,6,9,13,9,6,7,12,7,12,10]},{m:"מעשרות",s:"זרעים",p:5,ms:[8,8,10,6,8]},{m:"מעשר שני",s:"זרעים",p:5,ms:[7,10,13,12,15]},{m:"חלה",s:"זרעים",p:4,ms:[9,8,10,11]},{m:"ערלה",s:"זרעים",p:3,ms:[9,17,9]},{m:"ביכורים",s:"זרעים",p:4,ms:[11,11,12,5]},{m:"שבת",s:"מועד",p:24,ms:[11,7,6,7,4,10,4,4,7,6,6,6,7,4,3,8,8,3,6,5,3,6,6,5]},{m:"עירובין",s:"מועד",p:10,ms:[10,6,9,11,9,10,11,11,4,15]},{m:"פסחים",s:"מועד",p:10,ms:[7,8,8,9,10,2,13,8,11,9]},{m:"שקלים",s:"מועד",p:8,ms:[7,5,4,9,6,7,7,8]},{m:"יומא",s:"מועד",p:8,ms:[8,7,11,6,7,8,5,9]},{m:"סוכה",s:"מועד",p:5,ms:[11,9,15,10,8]},{m:"ביצה",s:"מועד",p:5,ms:[10,10,8,7,7]},{m:"ראש השנה",s:"מועד",p:4,ms:[9,8,8,9]},{m:"תענית",s:"מועד",p:4,ms:[7,10,9,8]},{m:"מגילה",s:"מועד",p:4,ms:[11,6,6,10]},{m:"מועד קטן",s:"מועד",p:3,ms:[10,5,9]},{m:"חגיגה",s:"מועד",p:3,ms:[8,7,8]},{m:"יבמות",s:"נשים",p:16,ms:[16,10,10,13,13,6,6,6,6,9,7,6,13,9,10,7]},{m:"כתובות",s:"נשים",p:13,ms:[10,10,9,12,9,7,10,8,9,6,6,4,11]},{m:"נדרים",s:"נשים",p:11,ms:[4,5,11,8,6,10,9,7,9,8,12]},{m:"נזיר",s:"נשים",p:9,ms:[7,10,7,7,7,11,4,2,5]},{m:"סוטה",s:"נשים",p:9,ms:[9,6,8,5,9,3,8,7,15]},{m:"גיטין",s:"נשים",p:9,ms:[6,7,8,9,9,7,9,10,10]},{m:"קידושין",s:"נשים",p:4,ms:[10,10,13,14]},{m:"בבא קמא",s:"נזיקין",p:10,ms:[4,6,11,9,7,6,7,7,12,10]},{m:"בבא מציעא",s:"נזיקין",p:10,ms:[8,11,12,12,11,8,11,10,13,6]},{m:"בבא בתרא",s:"נזיקין",p:10,ms:[6,15,10,9,11,8,10,8,8,8]},{m:"סנהדרין",s:"נזיקין",p:11,ms:[6,5,8,5,5,6,11,7,6,6,6]},{m:"מכות",s:"נזיקין",p:3,ms:[10,8,16]},{m:"שבועות",s:"נזיקין",p:8,ms:[7,5,11,13,5,7,8,6]},{m:"עדיות",s:"נזיקין",p:8,ms:[14,10,12,12,7,3,9,7]},{m:"עבודה זרה",s:"נזיקין",p:5,ms:[9,7,12,12,12]},{m:"אבות",s:"נזיקין",p:6,ms:[18,16,18,22,23,11]},{m:"הוריות",s:"נזיקין",p:3,ms:[5,7,8]},{m:"זבחים",s:"קדשים",p:14,ms:[4,5,8,6,8,7,6,12,7,9,8,6,8,3]},{m:"מנחות",s:"קדשים",p:13,ms:[4,5,7,5,9,7,6,7,9,9,9,5,11]},{m:"חולין",s:"קדשים",p:12,ms:[7,10,7,7,5,7,7,4,8,4,6,5]},{m:"בכורות",s:"קדשים",p:9,ms:[7,9,4,10,6,12,7,10,8]},{m:"ערכין",s:"קדשים",p:9,ms:[4,6,5,5,8,5,5,7,8]},{m:"תמורה",s:"קדשים",p:7,ms:[6,3,4,3,6,5,6]},{m:"כריתות",s:"קדשים",p:6,ms:[7,6,10,3,8,9]},{m:"מעילה",s:"קדשים",p:6,ms:[4,9,3,6,5,4]},{m:"תמיד",s:"קדשים",p:7,ms:[4,5,9,3,7,3,4]},{m:"מידות",s:"קדשים",p:5,ms:[9,6,8,7,4]},{m:"קינים",s:"קדשים",p:3,ms:[4,5,6]},{m:"כלים",s:"טהרות",p:30,ms:[9,8,8,4,11,4,6,11,8,8,9,8,8,8,6,8,17,9,10,7,3,10,5,17,9,9,12,10,9,16]},{m:"אהלות",s:"טהרות",p:18,ms:[8,7,7,7,7,7,6,6,15,7,9,8,9,10,10,9,5,10]},{m:"נגעים",s:"טהרות",p:14,ms:[6,5,4,11,5,8,5,10,3,10,12,7,12,13]},{m:"פרה",s:"טהרות",p:12,ms:[4,3,5,4,9,5,12,10,9,6,9,12]},{m:"טהרות",s:"טהרות",p:10,ms:[9,8,8,13,9,10,9,10,9,8]},{m:"מקוואות",s:"טהרות",p:10,ms:[8,10,4,5,6,11,7,5,7,8]},{m:"נידה",s:"טהרות",p:10,ms:[7,7,7,7,9,14,5,4,11,8]},{m:"מכשירין",s:"טהרות",p:6,ms:[6,11,8,10,11,8]},{m:"זבים",s:"טהרות",p:5,ms:[6,3,3,7,12]},{m:"טבול יום",s:"טהרות",p:4,ms:[5,8,6,7]},{m:"ידים",s:"טהרות",p:4,ms:[5,4,5,8]},{m:"עוקצין",s:"טהרות",p:3,ms:[6,10,12]}];
const TANACH=[{b:"בראשית",s:"תורה",c:50},{b:"שמות",s:"תורה",c:40},{b:"ויקרא",s:"תורה",c:27},{b:"במדבר",s:"תורה",c:36},{b:"דברים",s:"תורה",c:34},{b:"יהושע",s:"נביאים",c:24},{b:"שופטים",s:"נביאים",c:21},{b:"שמואל א",s:"נביאים",c:31},{b:"שמואל ב",s:"נביאים",c:24},{b:"מלכים א",s:"נביאים",c:22},{b:"מלכים ב",s:"נביאים",c:25},{b:"ישעיהו",s:"נביאים",c:66},{b:"ירמיהו",s:"נביאים",c:52},{b:"יחזקאל",s:"נביאים",c:48},{b:"הושע",s:"נביאים",c:14},{b:"יואל",s:"נביאים",c:4},{b:"עמוס",s:"נביאים",c:9},{b:"עובדיה",s:"נביאים",c:1},{b:"יונה",s:"נביאים",c:4},{b:"מיכה",s:"נביאים",c:7},{b:"נחום",s:"נביאים",c:3},{b:"חבקוק",s:"נביאים",c:3},{b:"צפניה",s:"נביאים",c:3},{b:"חגי",s:"נביאים",c:2},{b:"זכריה",s:"נביאים",c:14},{b:"מלאכי",s:"נביאים",c:3},{b:"תהלים",s:"כתובים",c:150},{b:"משלי",s:"כתובים",c:31},{b:"איוב",s:"כתובים",c:42},{b:"שיר השירים",s:"כתובים",c:8},{b:"רות",s:"כתובים",c:4},{b:"איכה",s:"כתובים",c:5},{b:"קהלת",s:"כתובים",c:12},{b:"אסתר",s:"כתובים",c:10},{b:"דניאל",s:"כתובים",c:12},{b:"עזרא",s:"כתובים",c:10},{b:"נחמיה",s:"כתובים",c:13},{b:"דברי הימים א",s:"כתובים",c:29},{b:"דברי הימים ב",s:"כתובים",c:36}];
const MUSAR=[{n:"מסילת ישרים",a:'רמח"ל',p:26},{n:"חובת הלבבות",a:"רבינו בחיי",p:10},{n:"שערי תשובה",a:"רבינו יונה",p:4},{n:"אורחות צדיקים",a:"אנונימי",p:30},{n:"תומר דבורה",a:'רמ"ק',p:10},{n:"פלא יועץ",a:"ר' אליעזר פאפו",p:90},{n:"חפץ חיים",a:"החפץ חיים",p:17},{n:"שמירת הלשון",a:"החפץ חיים",p:30},{n:"אהבת חסד",a:"החפץ חיים",p:24},{n:"מכתב מאליהו",a:"ר' אליהו דסלר",p:5},{n:"עלי שור",a:"ר' שלמה וולבה",p:2},{n:"נתיבות שלום",a:'אדמו"ר מסלונים',p:5},{n:'ליקוטי מוהר"ן',a:"ר' נחמן מברסלב",p:286},{n:"ספר המידות",a:"ר' נחמן מברסלב",p:30},{n:"ספר הישר",a:'ר"ת',p:13}];
const RAV_KOOK=[{n:"אורות",g:"אורות",p:9},{n:"אורות התשובה",g:"אורות",p:17},{n:"אורות ארץ ישראל",g:"אורות",p:5},{n:"אורות המלחמה",g:"אורות",p:9},{n:"אורות התחיה",g:"אורות",p:9},{n:"אורות ישראל",g:"אורות",p:9},{n:"אורות הקודש א",g:"אורות הקודש",p:9},{n:"אורות הקודש ב",g:"אורות הקודש",p:9},{n:"אורות הקודש ג",g:"אורות הקודש",p:9},{n:"אורות הקודש ד",g:"אורות הקודש",p:7},{n:"אורות התורה",g:"אורות",p:13},{n:"אורות האמונה",g:"אורות",p:8},{n:"עין איה ברכות א",g:"עין איה",p:9},{n:"עין איה ברכות ב",g:"עין איה",p:9},{n:"עין איה שבת א",g:"עין איה",p:11},{n:"עין איה שבת ב",g:"עין איה",p:11},{n:"שמונה קבצים",g:"שמונה קבצים",p:9},{n:"אגרות הראיה א",g:"אגרות הראיה",p:9},{n:"אגרות הראיה ב",g:"אגרות הראיה",p:9},{n:"אגרות הראיה ג",g:"אגרות הראיה",p:9},{n:"אגרות הראיה ד",g:"אגרות הראיה",p:9},{n:"מאמרי הראיה א",g:"מאמרים",p:9},{n:"מאמרי הראיה ב",g:"מאמרים",p:9},{n:"מוסר אביך",g:"שונות",p:6},{n:"עולת ראיה א",g:"שונות",p:9},{n:"עולת ראיה ב",g:"שונות",p:9},{n:"ארפלי טוהר",g:"שונות",p:9},{n:"ריש מילין",g:"שונות",p:9}];
const MACHSHAVA=[{n:"נפש החיים",a:"ר' חיים מוולוז'ין",p:4},{n:"כוזרי",a:'ריה"ל',p:5},{n:"מורה נבוכים",a:'רמב"ם',p:3},{n:"דרך ה'",a:'רמח"ל',p:4},{n:"דעת תבונות",a:'רמח"ל',p:1},{n:"תניא",a:'אדמו"ר הזקן',p:4},{n:"אמונות ודעות",a:'רס"ג',p:10},{n:"ספר העיקרים",a:"ר' יוסף אלבו",p:4},{n:"נצח ישראל",a:'מהר"ל',p:58},{n:"נתיבות עולם",a:'מהר"ל',p:2},{n:"גבורות ה'",a:'מהר"ל',p:73},{n:"באר הגולה",a:'מהר"ל',p:7}];

const CATS = ["gemara","mishna","tanach","musar","ravKook","machshava","custom"];
const NAVY="#1A3A6B", GOLD="#C9A84C";

const SEFARIA_MAP = {"ברכות": "Berakhot", "שבת": "Shabbat", "עירובין": "Eruvin", "פסחים": "Pesachim", "שקלים": "Shekalim", "יומא": "Yoma", "סוכה": "Sukkah", "ביצה": "Beitzah", "ראש השנה": "Rosh_Hashanah", "תענית": "Taanit", "מגילה": "Megillah", "מועד קטן": "Moed_Katan", "חגיגה": "Chagigah", "יבמות": "Yevamot", "כתובות": "Ketubot", "נדרים": "Nedarim", "נזיר": "Nazir", "סוטה": "Sotah", "גיטין": "Gittin", "קידושין": "Kiddushin", "בבא קמא": "Bava_Kamma", "בבא מציעא": "Bava_Metzia", "בבא בתרא": "Bava_Batra", "סנהדרין": "Sanhedrin", "מכות": "Makkot", "שבועות": "Shevuot", "עבודה זרה": "Avodah_Zarah", "הוריות": "Horayot", "זבחים": "Zevachim", "מנחות": "Menachot", "חולין": "Chullin", "בכורות": "Bekhorot", "ערכין": "Arakhin", "תמורה": "Temurah", "כריתות": "Keritot", "מעילה": "Meilah", "נידה": "Niddah","בראשית": "Genesis", "שמות": "Exodus", "ויקרא": "Leviticus", "במדבר": "Numbers", "דברים": "Deuteronomy", "יהושע": "Joshua", "שופטים": "Judges", "שמואל א": "I_Samuel", "שמואל ב": "II_Samuel", "מלכים א": "I_Kings", "מלכים ב": "II_Kings", "ישעיהו": "Isaiah", "ירמיהו": "Jeremiah", "יחזקאל": "Ezekiel", "הושע": "Hosea", "יואל": "Joel", "עמוס": "Amos", "עובדיה": "Obadiah", "יונה": "Jonah", "מיכה": "Micah", "נחום": "Nahum", "חבקוק": "Habakkuk", "צפניה": "Zephaniah", "חגי": "Haggai", "זכריה": "Zechariah", "מלאכי": "Malachi", "תהלים": "Psalms", "משלי": "Proverbs", "איוב": "Job", "שיר השירים": "Song_of_Songs", "רות": "Ruth", "איכה": "Lamentations", "קהלת": "Ecclesiastes", "אסתר": "Esther", "דניאל": "Daniel", "עזרא": "Ezra", "נחמיה": "Nehemiah", "דברי הימים א": "I_Chronicles", "דברי הימים ב": "II_Chronicles","מסילת ישרים": "Mesillat_Yesharim", "חובת הלבבות": "Duties_of_the_Heart", "שערי תשובה": "Shaarei_Teshuvah", "אורחות צדיקים": "Orchot_Tzadikim", "תומר דבורה": "Tomer_Devorah", "פלא יועץ": "Pele_Yoetz", "חפץ חיים": "Chafetz_Chayim", "שמירת הלשון": "Shemirat_HaLashon", "אהבת חסד": "Ahavat_Chesed", "מכתב מאליהו": "Michtav_MeEliyahu", "עלי שור": "Alei_Shur", "נתיבות שלום": "Netivot_Shalom", 'ליקוטי מוהר"ן': "Likutei_Moharan", "ספר המידות": "Sefer_HaMiddot", "ספר הישר": "Sefer_HaYashar","אורות": "Orot", "אורות התשובה": "Orot_HaTeshuvah", "אורות ארץ ישראל": "Orot,_Lights_from_Darkness,_Land_of_Israel", "אורות המלחמה": "Orot,_Lights_from_Darkness,_War", "אורות התחיה": "Orot,_Lights_from_Darkness,_National_Rebirth", "אורות ישראל": "Orot,_Orot_Yisrael", "אורות הקודש א": "Orot_HaKodesh_I", "אורות הקודש ב": "Orot_HaKodesh_II", "אורות הקודש ג": "Orot_HaKodesh_III", "אורות הקודש ד": "Orot_HaKodesh_IV", "אורות התורה": "Orot_HaTorah", "אורות האמונה": "Orot_HaEmunah", "עין איה ברכות א": "Ein_Ayah_on_Berakhot", "עין איה ברכות ב": "Ein_Ayah_on_Berakhot", "עין איה שבת א": "Ein_Ayah_on_Shabbat", "עין איה שבת ב": "Ein_Ayah_on_Shabbat", "שמונה קבצים": "Shemonah_Kevatzim", "אגרות הראיה א": "Igrot_HaReiyah", "אגרות הראיה ב": "Igrot_HaReiyah", "אגרות הראיה ג": "Igrot_HaReiyah", "אגרות הראיה ד": "Igrot_HaReiyah", "מאמרי הראיה א": "Maamarei_HaReiyah", "מאמרי הראיה ב": "Maamarei_HaReiyah", "מוסר אביך": "Musar_Avikh", "עולת ראיה א": "Olat_Reiyah", "עולת ראיה ב": "Olat_Reiyah", "ארפלי טוהר": "Arpilei_Tohar", "ריש מילין": "Resh_Milin","נפש החיים": "Nefesh_HaChayim", "כוזרי": "Kuzari", "מורה נבוכים": "Guide_for_the_Perplexed", "דרך ה'": "Derekh_Hashem", "דעת תבונות": "Da'at_Tevunot", "תניא": "Tanya", "אמונות ודעות": "Emunot_ve-Deot", "ספר העיקרים": "Sefer_HaIkkarim", "נצח ישראל": "Netzach_Yisrael", "נתיבות עולם": "Netivot_Olam", "גבורות ה'": "Gevurot_Hashem", "באר הגולה": "Be'er_HaGolah"};
const PORTAL_IDS = { "ברכות":1,"שבת":2,"עירובין":3,"פסחים":4,"שקלים":5,"יומא":6,"סוכה":7,"ביצה":8,"ראש השנה":9,"תענית":10,"מגילה":11,"מועד קטן":12,"חגיגה":13,"יבמות":14,"כתובות":15,"נדרים":16,"נזיר":17,"סוטה":18,"גיטין":19,"קידושין":20,"בבא קמא":21,"בבא מציעא":22,"בבא בתרא":23,"סנהדרין":24,"מכות":25,"שבועות":26,"עבודה זרה":27,"הוריות":28,"זבחים":29,"מנחות":30,"חולין":31,"בכורות":32,"ערכין":33,"תמורה":34,"כריתות":35,"מעילה":36,"נידה":37 };

const CC_L={gemara:NAVY,mishna:"#0A5757",tanach:"#7A4818",musar:"#1A5C2E",ravKook:"#1A2B6B",machshava:"#4A1A5C",custom:"#444"};
const CL_L={gemara:"#E8EFF8",mishna:"#E3F6F6",tanach:"#FDF3E3",musar:"#E3F5EC",ravKook:"#E8EBF8",machshava:"#F5E8FC",custom:"#F0F0F0"};
const CC_D={gemara:"#93C5FD",mishna:"#5EEAD4",tanach:"#FCD34D",musar:"#6EE7B7",ravKook:"#A5B4FC",machshava:"#F9A8D4",custom:"#D1D5DB"};
const CL_D={gemara:"#1E3A5F",mishna:"#1A3A38",tanach:"#3D2800",musar:"#1A3A28",ravKook:"#1A2A5F",machshava:"#3A1A48",custom:"#374151"};

const QUOTES = ["לא עליך המלאכה לגמור, ולא אתה בן חורין ליבטל ממנה","תלמוד תורה כנגד כולם","עשה לך רב, וקנה לך חבר","הוי שקוד ללמוד תורה","כל ישראל יש להם חלק לעולם הבא","הפוך בה והפוך בה, דכולא בה","חביבין ישראל שניתן להם כלי חמדה"];

function getPortalUrl(bookName, key, type) {
  const id = PORTAL_IDS[bookName];
  if(!id) return "";
  const dafNum = parseInt(String(key).replace(/\D/g, ''));
  if (isNaN(dafNum)) return "";
  const vt = type === "summary" ? 3 : 7; 
  return `https://daf-yomi.com/Dafyomi_Page.aspx?vt=${vt}&masechet=${id}&daf=${dafNum}`;
}

function safeHas(setOrObj, val) {
  if(!setOrObj) return false;
  if(setOrObj instanceof Set) return setOrObj.has(val);
  if(Array.isArray(setOrObj)) return setOrObj.includes(val);
  return false;
}

function getBkList(cat, custom) {
  custom = custom||[];
  if(cat==="gemara") return GEMARA.map((t,i)=>({i,n:t.n,sub:t.s,cat}));
  if(cat==="mishna") return MISHNA.map((t,i)=>({i,n:t.m,sub:t.s,cat}));
  if(cat==="tanach") return TANACH.map((t,i)=>({i,n:t.b,sub:t.s,cat}));
  if(cat==="musar") return MUSAR.map((t,i)=>({i,n:t.n,sub:t.a,cat}));
  if(cat==="ravKook") return RAV_KOOK.map((t,i)=>({i,n:t.n,sub:t.g,cat}));
  if(cat==="machshava") return MACHSHAVA.map((t,i)=>({i,n:t.n,sub:t.a,cat}));
  if(cat==="custom") return custom.map((t,i)=>({i,n:t.name,sub:t.catLabel||"",cat}));
  return [];
}
function totalMs(i) { const m=MISHNA[i]; return m?.ms?m.ms.reduce((a,b)=>a+b,0):m?.p||0; }
function perekAmudKeys(masIdx,p) {
  const g=GEMARA[masIdx]; if(!g) return [];
  const D=g.d,P=g.p, s=Math.round(2+(p-1)/P*D), e=Math.round(2+p/P*D);
  const r=[]; for(let d=s;d<e&&d<=D;d++) r.push(`${d}a`,`${d}b`); return r;
}
function perekMsKeys(masIdx,p) {
  const cnt=MISHNA[masIdx]?.ms?.[p-1]||0;
  return Array.from({length:cnt},(_,i)=>`${p}:${i+1}`);
}
function bkTotal(cat,i,custom) {
  if(cat==="gemara") return GEMARA[i]?.d||0;
  if(cat==="mishna") return totalMs(i);
  if(cat==="tanach") return TANACH[i]?.c||0;
  if(cat==="musar") return MUSAR[i]?.p||0;
  if(cat==="ravKook") return RAV_KOOK[i]?.p||0;
  if(cat==="machshava") return MACHSHAVA[i]?.p||0;
  if(cat==="custom") return (custom||[])[i]?.chapters||0;
  return 0;
}
function calcDoneCorrect(prog, cat, i) {
  if (cat === "gemara") { const g = prog.gemara?.[i]; if (!g) return 0; return Math.round((g.done?.size || 0) / 2); }
  if (cat === "mishna") { const m = prog.mishna?.[i]; if (!m) return 0; return m.done?.size || 0; }
  if (cat === "custom") return prog.custom?.[i]?.done?.size || 0;
  if (cat === "tanach") return prog.tanach?.[i]?.size || 0;
  return prog[cat]?.[i]?.size || 0;
}
function pct(d,t){return t>0?Math.min(100,Math.round(d*100/t)):0;}

function getSefariaUrl(cat, bookName, key, tMode) {
  if(!bookName || !key) return "";
  try {
    const engBook = SEFARIA_MAP[bookName] || encodeURIComponent(bookName.replace(/ /g, "_"));
    let k = String(key);
    if(cat === "gemara") return `https://www.sefaria.org.il/${engBook}.${k}?lang=he`;
    if(cat === "mishna") return `https://www.sefaria.org.il/Mishnah_${engBook}.${k.replace(':', '.')}?lang=he`;
    if(cat === "tanach") {
      let ch = k;
      if(tMode === "parshiot") ch = PARASHA_CHAPTERS[key]?.[0] || 1;
      return `https://www.sefaria.org.il/${engBook}.${ch}?lang=he`;
    }
    if(["musar", "ravKook", "machshava"].includes(cat)) {
      if (bookName === "נפש החיים") return `https://www.sefaria.org.il/${engBook}%2C_Gate_I.${k}?lang=he`;
      return `https://www.sefaria.org.il/${engBook}.${k}?lang=he`;
    }
    return "";
  } catch(e) { return ""; }
}

function serProg(prog) {
  const o={gemara:{},mishna:{},tanach:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};
  for(const[k,v] of Object.entries(prog.gemara||{})) o.gemara[k]={done:[...(v.done||new Set())]};
  for(const[k,v] of Object.entries(prog.mishna||{})) o.mishna[k]={done:[...(v.done||new Set())]};
  for(const[k,v] of Object.entries(prog.tanach||{})) o.tanach[k]=[...v];
  o.tmode={...prog.tmode};
  for(const c of["musar","ravKook","machshava"]) for(const[k,v] of Object.entries(prog[c]||{})) o[c][k]=[...v];
  o.custom=(prog.custom||[]).map(b=>({...b,done:[...(b.done||new Set())]}));
  o.notes={...prog.notes}; o.chazara={...prog.chazara};
  return o;
}
function desProg(data) {
  if(!data) return null;
  const o={gemara:{},mishna:{},tanach:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};
  for(const[k,v] of Object.entries(data.gemara||{})) o.gemara[k]={done:new Set(v.done)};
  for(const[k,v] of Object.entries(data.mishna||{})) o.mishna[k]={done:new Set(v.done)};
  for(const[k,v] of Object.entries(data.tanach||{})) o.tanach[k]=new Set(v);
  o.tmode={...data.tmode};
  for(const c of["musar","ravKook","machshava"]) for(const[k,v] of Object.entries(data[c]||{})) o[c][k]=new Set(v);
  o.custom=(data.custom||[]).map(b=>({...b,done:new Set(b.done)}));
  o.notes={...data.notes}; o.chazara={...data.chazara};
  return o;
}
const IP={gemara:{},mishna:{},tanach:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};

function mkT(dark,sz,lang) {
  const sc=[0.88,1,1.14][sz]||1, f=n=>Math.round(n*sc), isEn=lang==="en";
  const CAT_L = isEn ? {gemara:"Gemara",mishna:"Mishna",tanach:"Tanach",musar:"Musar",ravKook:"Rav Kook",machshava:"Machshava",custom:"Custom"} : {gemara:"גמרא",mishna:"משניות",tanach:'תנ"ך',musar:"מוסר",ravKook:"ספרי הראי״ה",machshava:"מחשבה",custom:"אישי"};
  const CAT_UNIT=isEn ? {gemara:"dapim",mishna:"mishnayot",tanach:"chapters",musar:"chapters",ravKook:"chapters",machshava:"chapters",custom:"chapters"} : {gemara:"דפים",mishna:"משניות",tanach:"פרקים",musar:"פרקים",ravKook:"פרקים",machshava:"פרקים",custom:"פרקים"};
  const UI = isEn ? { home: "Home", library: "Library", goals: "Goals", stats: "Stats", settings: "Settings" } : { home: "בית", library: "ספרייה", goals: "יעדים", stats: "נתונים", settings: "הגדרות" };
  const base=dark ?{bg:"#0D1B2E",card:"#152438",navy:"#D0E4FF",primary:"#4A7FC0",muted:"#8A9BB0",border:"rgba(200,220,255,0.1)",input:"#1E3050",shadow:"0 2px 16px rgba(0,0,0,0.5)"} : {bg:"#FAF7EE",card:"#FFFFFF",navy:NAVY,primary:NAVY,muted:"#6B7280",border:"rgba(26,58,107,0.1)",input:"#F3EED8",shadow:"0 2px 14px rgba(26,58,107,0.09)"};
  return {...base,f,dark,isEn,CAT_L,CAT_UNIT,UI,font:"'Heebo',system-ui,sans-serif"};
}

/* ── UI COMPONENTS ── */
function Bar({p,color,dark}){return <div style={{background:dark?"rgba(255,255,255,0.08)":"rgba(26,58,107,0.08)",borderRadius:99,height:6,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:99}}/></div>;}
function Ring({p,color,size=60,stroke=7,label,sub,dark}){const r=(size-stroke)/2,c=2*Math.PI*r,off=c-(p/100)*c;return <div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark?"rgba(255,255,255,0.1)":"rgba(26,58,107,0.08)"} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}><span style={{fontSize:13,fontWeight:800}}>{label}</span>{sub&&<span style={{fontSize:7}}>{sub}</span>}</div></div>;}
function Sheet({show,onClose,title,T,children}){if(!show)return null;return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",zIndex:600}}><div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"16px 18px 52px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto",boxSizing:"border-box"}}><div style={{width:38,height:4,background:T.border,borderRadius:99,margin:"0 auto 14px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><span style={{fontSize:T.f(17),fontWeight:700,color:T.navy}}>{title}</span><button onClick={onClose} style={{background:T.input,border:"none",cursor:"pointer",color:T.muted,fontSize:18,padding:"3px 12px",borderRadius:9}}>✕</button></div>{children}</div></div>;}
function IframeModal({ url, title, onClose, T }) {
  if(!url) return null;
  return (
    <div style={{position:"fixed", inset:0, background:T.bg, zIndex:9999, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", width:"100%"}}>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:T.card, borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <button onClick={onClose} style={{background:T.input, border:"none", borderRadius:10, width:32, height:32, cursor:"pointer", color:T.navy, fontWeight:900}}>✕</button>
          <div style={{fontSize:T.f(15), fontWeight:800, color:T.navy}}>{title}</div>
        </div>
        <a href={url} target="_blank" rel="noreferrer" style={{fontSize:T.f(11), color:T.primary, textDecoration:"none", fontWeight:700, background:T.input, padding:"6px 10px", borderRadius:8}}>פתח בדפדפן</a>
      </div>
      <div style={{flex:1, background:"#fff", position:"relative"}}>
         <iframe src={url} style={{position:"absolute", inset:0, width:"100%", height:"100%", border:"none"}} title={title} sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
      </div>
    </div>
  );
}

function AIBox({ type, cat, itemLabel, T, user, aiCredits, setAiCredits, sett }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  const isAdmin = user?.email === 'eitanshachor1@gmail.com';
  const limit = 5;
  const usedToday = aiCredits[todayKey()] || 0;
  const remaining = isAdmin ? "∞" : Math.max(0, limit - usedToday);

  const askAI = async () => {
    if(!isAdmin && remaining <= 0) return alert(T.isEn?"You've reached your daily limit.":"סיימת את מכסת ה-AI להיום. נחזור מחר!");
    setLoading(true);
    setResult("");
    const prompt = type === "quiz" 
      ? `אני לומד עכשיו ${T.CAT_L[cat]} - ${itemLabel}. תכין לי חידון אמריקאי של 3 שאלות קשות לבחון את עצמי, עם 4 תשובות אפשריות לכל שאלה. בסוף הצג את התשובות הנכונות. ענה בעברית בלבד.`
      : `אני לומד עכשיו ${T.CAT_L[cat]} - ${itemLabel}. תכין לי סיכום קצר, ברור ומחולק לנקודות של העניינים המרכזיים שלמדתי כרגע. ענה בעברית בלבד.`;
    
    try {
      const res = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      if(data.text) {
          setResult(data.text);
          if(!isAdmin) {
              const newCredits = { ...aiCredits, [todayKey()]: usedToday + 1 };
              setAiCredits(newCredits);
              updateDoc(doc(db, "users", user.uid), { aiCredits: newCredits }).catch(()=>{});
          }
      } else { setResult("שגיאה: " + (data.error || "לא ניתן היה לייצר תוכן.")); }
    } catch(e) { setResult("שגיאה בחיבור לשרת ה-AI. ודא שהפרויקט מחובר ל-Vercel עם המפתח."); }
    setLoading(false);
  };

  return (
    <div style={{marginTop:16}}>
       <button disabled={loading} onClick={askAI} style={{width:"100%", padding:14, borderRadius:12, border:"none", background:type==="quiz"?"#ab68ff":"#10a37f", color:"#fff", fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.5:1, display:"flex", justifyContent:"center", alignItems:"center", gap:8, fontSize:T.f(14)}}>
           {type==="quiz" ? <><IcoStar/> בחן אותי (AI)</> : <><IcoAI/> סיכום קצר (AI)</>}
       </button>
       {loading && <div style={{textAlign:"center", color:T.muted, fontSize:T.f(12), marginTop:10}}>מעבד נתונים... ⏳</div>}
       {result && <div style={{background:T.input, padding:16, borderRadius:12, marginTop:12, fontSize:T.f(13), lineHeight:1.6, whiteSpace:"pre-wrap", border:`1px solid ${T.primary}`}}>{result}</div>}
    </div>
  );
}

function DetailScreen({detail, prog, T, cc, cl, setProg, goBack, onActivity, user, aiCredits, setAiCredits, sett}) {
  const {cat,idx} = detail;
  const list = getBkList(cat, prog.custom), item = list[idx];
  const col = cc[cat] || T.primary, lightCol = cl[cat] || "#E8EFF8";
  const [viewMode, setViewMode] = useState(cat==="gemara"?"amudim":cat==="mishna"?"mishna":"perakim");
  const [noteSheet, setNoteSheet] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [editChz, setEditChz] = useState(0);
  const [embed, setEmbed] = useState(null);
  const tMode = prog.tmode?.[idx] || "perakim";
  const isTorah = cat==="tanach" && idx<5;

  const items = useMemo(()=>{
    const arr=[];
    if(cat==="gemara"){
      if(viewMode==="amudim"){const D=GEMARA[idx]?.d||0;for(let d=2;d<=D;d++){arr.push({key:`${d}a`,label:`${toHeb(d)}.`});arr.push({key:`${d}b`,label:`${toHeb(d)}:`,});}}
      else if(viewMode==="perakim"){const P=GEMARA[idx]?.p||0;for(let p=1;p<=P;p++)arr.push({key:`p${p}`,label:`פרק ${toHeb(p)}`});}
    } else if(cat==="mishna"){
      if(viewMode==="mishna"){const ms=MISHNA[idx]?.ms||[];ms.forEach((cnt,pi)=>{for(let m=1;m<=cnt;m++)arr.push({key:`${pi+1}:${m}`,label:`${toHeb(pi+1)},${toHeb(m)}`});});}
      else if(viewMode==="perakim"){const P=MISHNA[idx]?.p||0;for(let p=1;p<=P;p++)arr.push({key:`pp${p}`,label:`פרק ${toHeb(p)}`});}
    } else if(cat==="tanach"){
      if(isTorah && tMode==="parshiot") PARSHIOT[idx].forEach(ps=>arr.push({key:ps,label:ps}));
      else for(let i=1;i<=(TANACH[idx]?.c||0);i++) arr.push({key:i,label:`פרק ${toHeb(i)}`});
    } else {
      const p=(cat==="custom"?prog.custom[idx]?.chapters:(cat==="musar"?MUSAR:cat==="ravKook"?RAV_KOOK:MACHSHAVA)[idx]?.p)||0;
      for(let i=1;i<=p;i++) arr.push({key:i,label:`פרק ${toHeb(i)}`});
    }
    return arr;
  },[cat,idx,viewMode,tMode,prog.custom, isTorah]);

  function isOn(key) {
    if(cat==="gemara") { const g=prog.gemara?.[idx]; if(!g)return false; if(String(key).startsWith("p")){const ak=perekAmudKeys(idx,parseInt(String(key).slice(1))); return ak.length>0&&ak.every(k=>safeHas(g.done,k));} return safeHas(g.done,key); }
    if(cat==="mishna") { const m=prog.mishna?.[idx]; if(!m)return false; if(String(key).startsWith("pp")){const mk=perekMsKeys(idx,parseInt(String(key).slice(2))); return mk.length>0&&mk.every(k=>safeHas(m.done,k));} return safeHas(m.done,key); }
    if(cat==="custom") return safeHas(prog.custom?.[idx]?.done, key);
    if(cat==="tanach") { if(typeof key==="string"){const ch=PARASHA_CHAPTERS[key]; return ch&&ch.length>0&&ch.every(c=>safeHas(prog.tanach?.[idx],c));} return safeHas(prog.tanach?.[idx],key); }
    return safeHas(prog[cat]?.[idx], key);
  }

  function toggle(key, forceLabel) {
    const wasOn = isOn(key);
    setProg(prev => {
      let next = {...prev};
      if(cat==="gemara"){ const nd=new Set(prev.gemara?.[idx]?.done||[]); if(String(key).startsWith("p")){const ak=perekAmudKeys(idx,parseInt(String(key).slice(1))); const allOn=ak.every(k=>nd.has(k)); allOn?ak.forEach(k=>nd.delete(k)):ak.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);} next.gemara[idx]={done:nd}; }
      else if(cat==="mishna"){ const nd=new Set(prev.mishna?.[idx]?.done||[]); if(String(key).startsWith("pp")){const mk=perekMsKeys(idx,parseInt(String(key).slice(2))); const allOn=mk.every(k=>nd.has(k)); allOn?mk.forEach(k=>nd.delete(k)):mk.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);} next.mishna[idx]={done:nd}; }
      else if(cat==="custom"){ const arr=[...prev.custom]; const nd=new Set(arr[idx].done||[]); nd.has(key)?nd.delete(key):nd.add(key); arr[idx]={...arr[idx],done:nd}; next.custom=arr; }
      else if(cat==="tanach"){ const nd=new Set(prev.tanach?.[idx]||[]); if(typeof key==="string"){const ch=PARASHA_CHAPTERS[key]||[]; const allOn=ch.every(c=>nd.has(c)); allOn?ch.forEach(c=>nd.delete(c)):ch.forEach(c=>nd.add(c));}else{nd.has(key)?nd.delete(key):nd.add(key);} next.tanach={...next.tanach,[idx]:nd}; }
      else { const nd=new Set(prev[cat]?.[idx]||[]); nd.has(key)?nd.delete(key):nd.add(key); next[cat]={...next[cat],[idx]:nd}; }
      return next;
    });
    if(!wasOn) onActivity({cat, bk:item?.n||"", label: forceLabel || items.find(i=>i.key===key)?.label || String(key)});
  }

  const totForMode=cat==="tanach"?TANACH[idx]?.c||0:items.length;
  const doneCnt=cat==="tanach"?(prog.tanach?.[idx]?.size||0):items.filter(it=>isOn(it.key)).length;
  const p=pct(doneCnt,totForMode);
  
  function openNote(key, label) {
    const k = `${cat}:${idx}:${key}`;
    setEditNote(prog.notes?.[k]||""); setEditChz(prog.chazara?.[k]||0); setNoteSheet({key, label});
  }
  
  function saveNote() {
    const k = `${cat}:${idx}:${noteSheet.key}`;
    setProg(prev=>({...prev, notes:{...prev.notes,[k]:editNote}, chazara:{...prev.chazara,[k]:editChz}}));
    setNoteSheet(null);
  }

  const isAmud = noteSheet && cat === "gemara" && (String(noteSheet.key).includes("a") || String(noteSheet.key).includes("b"));

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", background:T.bg}}>
      <div style={{background:T.card, padding:"14px 16px 16px", borderBottom:`1px solid ${T.border}`}}>
        <button onClick={goBack} style={{display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:T.f(13), marginBottom:12, padding:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg> חזרה
        </button>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div><div style={{fontSize:T.f(22), fontWeight:900, color:T.navy}}>{item?.n}</div><div style={{fontSize:T.f(12), color:T.muted, marginTop:2}}>{T.CAT_L[cat]}</div></div>
          <div style={{background:lightCol, borderRadius:14, padding:"10px 16px", textAlign:"center"}}>
            <div style={{fontSize:T.f(24), fontWeight:900, color:col}}>{p}%</div>
            <div style={{fontSize:T.f(10), color:col, opacity:.8}}>{doneCnt}/{totForMode}</div>
          </div>
        </div>
        <div style={{marginTop:12}}><Bar p={p} color={col} /></div>
      </div>
      
      <div style={{flex:1, overflow:"auto", padding:"14px 16px 32px"}}>
        {cat==="gemara" && <div style={{display:"flex", gap:8, marginBottom:16}}><button onClick={()=>setViewMode("amudim")} style={{flex:1, padding:8, borderRadius:8, background:viewMode==="amudim"?col:"transparent", color:viewMode==="amudim"?"#fff":T.muted, border:`2px solid ${viewMode==="amudim"?col:T.border}`}}>עמודים</button><button onClick={()=>setViewMode("perakim")} style={{flex:1, padding:8, borderRadius:8, background:viewMode==="perakim"?col:"transparent", color:viewMode==="perakim"?"#fff":T.muted, border:`2px solid ${viewMode==="perakim"?col:T.border}`}}>פרקים</button></div>}
        {cat==="mishna" && <div style={{display:"flex", gap:8, marginBottom:16}}><button onClick={()=>setViewMode("mishna")} style={{flex:1, padding:8, borderRadius:8, background:viewMode==="mishna"?col:"transparent", color:viewMode==="mishna"?"#fff":T.muted, border:`2px solid ${viewMode==="mishna"?col:T.border}`}}>משניות</button><button onClick={()=>setViewMode("perakim")} style={{flex:1, padding:8, borderRadius:8, background:viewMode==="perakim"?col:"transparent", color:viewMode==="perakim"?"#fff":T.muted, border:`2px solid ${viewMode==="perakim"?col:T.border}`}}>פרקים</button></div>}
        {isTorah && <div style={{display:"flex", gap:8, marginBottom:16}}><button onClick={()=>setProg(prev=>({...prev,tmode:{...(prev.tmode||{}),[idx]:"perakim"}}))} style={{flex:1, padding:8, borderRadius:8, background:tMode==="perakim"?col:"transparent", color:tMode==="perakim"?"#fff":T.muted, border:`2px solid ${tMode==="perakim"?col:T.border}`}}>פרקים</button><button onClick={()=>setProg(prev=>({...prev,tmode:{...(prev.tmode||{}),[idx]:"parshiot"}}))} style={{flex:1, padding:8, borderRadius:8, background:tMode==="parshiot"?col:"transparent", color:tMode==="parshiot"?"#fff":T.muted, border:`2px solid ${tMode==="parshiot"?col:T.border}`}}>פרשות</button></div>}
        
        <div style={{display:"grid", gridTemplateColumns:`repeat(auto-fill, minmax(70px, 1fr))`, gap:8}}>
          {items.map(it => {
            const on = isOn(it.key);
            const k = `${cat}:${idx}:${it.key}`, hasN = !!prog.notes?.[k], chzN = prog.chazara?.[k]||0;
            return (
              <div key={it.key} style={{position:"relative", height:"100%"}}>
                <button onClick={()=>toggle(it.key, it.label)} style={{width:"100%", height:"100%", minHeight:44, padding:"11px 4px", borderRadius:10, border:`2px solid ${on?col:T.border}`, background:on?col:"transparent", color:on?"#fff":T.muted, fontWeight:on?700:400, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                  <span>{it.label}</span>
                  {chzN>0 && <span style={{fontSize:10, background:"rgba(255,255,255,0.3)", borderRadius:10, padding:"2px 6px", marginTop:2}}>×{chzN}</span>}
                </button>
                <button onClick={(e)=>{e.stopPropagation(); openNote(it.key, it.label);}} style={{position:"absolute", top:0, right:0, padding:6, background:"none", border:"none", color:on?"rgba(255,255,255,0.8)":T.muted}}>⋮</button>
                {hasN && <div style={{position:"absolute", top:6, left:6, width:6, height:6, borderRadius:99, background:GOLD}}/>}
              </div>
            );
          })}
        </div>
      </div>

      <Sheet show={!!noteSheet} onClose={()=>setNoteSheet(null)} title={`${item.n} ${noteSheet?.label||""}`} T={T}>
        {isAmud ? (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20}}>
            <button onClick={() => setEmbed({url: getPortalUrl(item.n, noteSheet.key, "summary"), title: `סיכום ${item.n} ${noteSheet.label}`})} style={{background:"#10a37f", color:"#fff", padding:"12px", borderRadius:10, border:"none", fontWeight:700, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
              <IcoBook /> סיכום הדף (פורטל)
            </button>
            <button onClick={() => setEmbed({url: getPortalUrl(item.n, noteSheet.key, "quiz"), title: `מבחן ${item.n} ${noteSheet.label}`})} style={{background:"#ab68ff", color:"#fff", padding:"12px", borderRadius:10, border:"none", fontWeight:700, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
              <IcoStar /> שאלות חזרה (פורטל)
            </button>
          </div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20}}>
            <AIBox type="summary" cat={cat} itemLabel={`${item.n} ${noteSheet?.label||""}`} T={T} user={user} aiCredits={aiCredits} setAiCredits={setAiCredits} sett={sett} />
            <AIBox type="quiz" cat={cat} itemLabel={`${item.n} ${noteSheet?.label||""}`} T={T} user={user} aiCredits={aiCredits} setAiCredits={setAiCredits} sett={sett} />
          </div>
        )}

        <div style={{marginBottom:14}}><label style={{fontSize:12, color:T.muted}}>הערות אישיות</label>
          <textarea value={editNote} onChange={e=>setEditNote(e.target.value)} style={{width:"100%", padding:12, borderRadius:10, border:`1px solid ${T.border}`, background:T.input, minHeight:80, outline:"none"}} />
        </div>
        <div style={{marginBottom:14}}><label style={{fontSize:12, color:T.muted}}>מונה חזרות</label>
          <div style={{display:"flex", alignItems:"center", gap:16, marginTop:4}}>
            <button onClick={()=>setEditChz(Math.max(0,editChz-1))} style={{width:44, height:44, borderRadius:10, border:`1px solid ${T.border}`, background:T.input, fontSize:26}}>-</button>
            <span style={{fontSize:30, fontWeight:900, minWidth:40, textAlign:"center"}}>{editChz}</span>
            <button onClick={()=>setEditChz(editChz+1)} style={{width:44, height:44, borderRadius:10, border:`1px solid ${T.border}`, background:T.input, fontSize:26}}>+</button>
          </div>
        </div>
        <button onClick={saveNote} style={{width:"100%", padding:14, borderRadius:12, border:"none", background:col, color:"#fff", fontWeight:700, fontSize:15, marginTop:10}}>שמור נתונים</button>
      </Sheet>

      {embed && <IframeModal url={embed.url} title={embed.title} onClose={()=>setEmbed(null)} T={T} />}
    </div>
  );
}

function HomeScreen({prog, goals, T, cc, setTab, setDetail, streak, activity}){
  const today = useMemo(()=>hebDateFull(),[]);
  const halacha = HALACHOT[new Date().getDate()%HALACHOT.length];
  const dafYomi = useMemo(()=>getDafYomi(),[]);

  const S = useMemo(()=>({
    dapim: GEMARA.reduce((s,_,i)=>s+calcDoneCorrect(prog,"gemara",i),0),
    mishna: MISHNA.reduce((s,_,i)=>s+calcDoneCorrect(prog,"mishna",i),0),
    tanach: TANACH.reduce((s,_,i)=>s+calcDoneCorrect(prog,"tanach",i),0),
    musar: MUSAR.reduce((s,_,i)=>s+calcDoneCorrect(prog,"musar",i),0)+RAV_KOOK.reduce((s,_,i)=>s+calcDoneCorrect(prog,"ravKook",i),0)+MACHSHAVA.reduce((s,_,i)=>s+calcDoneCorrect(prog,"machshava",i),0),
  }),[prog]);

  return (
    <div style={{flex:1, overflow:"auto"}}>
      <div style={{background:`linear-gradient(160deg,#0A1E3A 0%,${NAVY} 60%,#173A5A 100%)`, padding:"30px 20px 20px", color:"#fff", position:"relative"}}>
         <div style={{fontSize:T.f(28), fontWeight:900, marginBottom:4}}>שלום! 👋</div>
         <div style={{color:GOLD, fontSize:T.f(14), fontWeight:700, marginBottom:16}}>{today}</div>
         <div style={{display:"flex", gap:10}}>
            <div onClick={()=>{ const idx = GEMARA.findIndex(m => m.n === dafYomi.masechet); if(idx !== -1) setDetail({cat: 'gemara', idx}); }} style={{flex:1, background:"rgba(255,255,255,0.1)", padding:12, borderRadius:12, border:`1px solid ${GOLD}44`}}>
              <div style={{fontSize:11, color:"rgba(255,255,255,0.7)", marginBottom:4}}>דף יומי</div>
              <div style={{fontWeight:700}}>{dafYomi.masechet} דף {dafYomi.dafHeb}</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.1)", padding:12, borderRadius:12, textAlign:"center", border:`1px solid ${GOLD}44`, minWidth:70}}>
              <div style={{fontSize:20, fontWeight:900, color:GOLD}}>{streak}</div>
              <div style={{fontSize:10, color:"rgba(255,255,255,0.7)"}}>רצף ימים</div>
            </div>
         </div>
      </div>
      <div style={{padding:16}}>
         <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20}}>
            {[
              {cat:"gemara", l:"גמרא", v:S.dapim, tot:TOTAL_DAPIM},
              {cat:"mishna", l:"משניות", v:S.mishna, tot:MISHNA.reduce((s,_,i)=>s+totalMs(i),0)},
              {cat:"tanach", l:'תנ"ך', v:S.tanach, tot:TANACH.reduce((s,t)=>s+t.c,0)},
              {cat:"musar", l:"מוסר", v:S.musar, tot:MUSAR.reduce((s,t)=>s+t.p,0)+RAV_KOOK.reduce((s,t)=>s+t.p,0)+MACHSHAVA.reduce((s,t)=>s+t.p,0)}
            ].map(r => (
              <div key={r.cat} onClick={()=>setTab("library")} style={{background:T.card, padding:14, borderRadius:14, borderTop:`3px solid ${cc[r.cat]}`, boxShadow:T.shadow}}>
                <div style={{fontSize:12, color:T.muted}}>{r.l}</div>
                <div style={{fontSize:24, fontWeight:900, color:cc[r.cat], margin:"4px 0"}}>{r.v}</div>
                <Bar p={pct(r.v,r.tot)} color={cc[r.cat]} />
              </div>
            ))}
         </div>
         <div style={{background:T.card, padding:16, borderRadius:14, boxShadow:T.shadow, borderRight:`4px solid ${GOLD}`}}>
           <div style={{fontSize:12, fontWeight:800, color:GOLD, marginBottom:6}}>הלכה יומית</div>
           <div style={{fontSize:14, lineHeight:1.5, marginBottom:6}}>{halacha.t}</div>
           <div style={{fontSize:11, color:T.muted}}>{halacha.s}</div>
         </div>
      </div>
    </div>
  );
}

function LibraryScreen({prog, T, cc, cl, setProg, setDetail, libCat, setLibCat}) {
  const list = getBkList(libCat, prog.custom);
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column"}}>
      <div style={{padding:"16px 16px 10px", background:T.card, borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:T.f(18), fontWeight:900, marginBottom:12}}>הספרייה התורנית</div>
        <div style={{display:"flex", gap:8, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none"}}>
          {CATS.map(c => <button key={c} onClick={()=>setLibCat(c)} style={{whiteSpace:"nowrap", padding:"6px 14px", borderRadius:20, border:`2.2px solid ${libCat===c?cc[c]:T.border}`, background:libCat===c?cc[c]:"transparent", color:libCat===c?"#fff":T.muted, fontWeight:700, cursor:"pointer"}}>{T.CAT_L[c]}</button>)}
        </div>
      </div>
      <div style={{flex:1, overflow:"auto", padding:16}}>
        {list.map(bk => <BookCard key={bk.i} cat={libCat} idx={bk.i} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog.custom}/>)}
      </div>
    </div>
  );
}

function StatsScreen({prog, activity, activeDays, T, cc, streak}) {
  const stats = useMemo(() => {
    const now = new Date();
    const getCount = (days) => activity.filter(a => (now - new Date(a.date)) < days * 86400000).length;
    return { w: getCount(7), m: getCount(30), y: getCount(365) };
  }, [activity]);

  return (
    <div style={{flex:1, overflow:"auto", padding:16}}>
      <h2 style={{fontSize:T.f(20), fontWeight:900, marginBottom:20}}>נתוני למידה</h2>
      <div style={{display:"flex", gap:10, marginBottom:16}}>
        <div style={{flex:1, background:T.card, padding:16, borderRadius:16, textAlign:"center", border:`2px solid ${GOLD}44`}}>
          <div style={{fontSize:28, fontWeight:900, color:GOLD}}>{streak}</div>
          <div style={{fontSize:11, color:T.muted}}>רצף ימים</div>
        </div>
        <div style={{flex:1, background:T.card, padding:16, borderRadius:16, textAlign:"center"}}>
          <div style={{fontSize:28, fontWeight:900, color:T.primary}}>{activity.length}</div>
          <div style={{fontSize:11, color:T.muted}}>סך סיומים</div>
        </div>
      </div>
      <div style={{background:T.card, padding:16, borderRadius:16, marginBottom:16}}>
        <div style={{fontSize:14, fontWeight:800, marginBottom:12}}>קצב למידה (סעיפים)</div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
          {[{l:"שבוע",v:stats.w},{l:"חודש",v:stats.m},{l:"שנה",v:stats.y}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:20, fontWeight:900, color:T.primary}}>{s.v}</div><div style={{fontSize:10, color:T.muted}}>{s.l}</div></div>
          ))}
        </div>
      </div>
      {["gemara","mishna","tanach"].map(c => {
        const dn = CATS.reduce((acc, cat)=>acc+(cat===c?getBkList(c,prog.custom).reduce((s,_,i)=>s+calcDoneCorrect(prog,c,i),0):0),0);
        const tot = c==="gemara"?TOTAL_DAPIM:c==="mishna"?MISHNA.reduce((s,_,i)=>s+totalMs(i),0):TANACH.reduce((s,t)=>s+t.c,0);
        return (
          <div key={c} style={{background:T.card, padding:14, borderRadius:14, marginBottom:10}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
              <span style={{fontWeight:700}}>{T.CAT_L[c]}</span>
              <span style={{fontSize:12, color:T.muted}}>{pct(dn,tot)}%</span>
            </div>
            <Bar p={pct(dn,tot)} color={cc[c]} />
          </div>
        );
      })}
    </div>
  );
}

function SettingsScreen({sett, setSett, T, onLogout, user}) {
  return (
    <div style={{flex:1, padding:16}}>
      <h2 style={{fontSize:T.f(20), fontWeight:900, marginBottom:20}}>הגדרות</h2>
      <div style={{background:T.card, borderRadius:16, overflow:"hidden", marginBottom:16}}>
        <div style={{padding:16, borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <span>מצב כהה</span>
          <Toggle on={sett.dark} onToggle={()=>setSett(s=>({...s, dark:!s.dark}))} primary={T.primary} />
        </div>
      </div>
      
      {/* OpenAI Settings Box */}
      <div style={{background:T.card, borderRadius:16, padding:16, marginBottom:16, border:`1px solid ${T.primary}`}}>
        <div style={{fontSize:14, fontWeight:800, marginBottom:8, color:T.primary, display:"flex", alignItems:"center", gap:6}}><IcoAI/> מפתח AI (אופציונלי)</div>
        <div style={{fontSize:11, color:T.muted, marginBottom:12, lineHeight:1.5}}>הזן מפתח API של OpenAI כדי לייצר סיכומים אישיים בתוך האפליקציה (עבור משניות ותנ"ך).</div>
        <input type="password" value={sett.openAiKey||""} onChange={e=>setSett(s=>({...s, openAiKey:e.target.value}))} style={{width:"100%", padding:10, borderRadius:8, border:`1px solid ${T.border}`, background:T.input, direction:"ltr"}} placeholder="sk-..." />
      </div>

      <PB T={T} onClick={onLogout} color="#ef4444">התנתק מהחשבון</PB>
      <div style={{textAlign:"center", marginTop:40, fontSize:11, color:T.muted}}>Torah Track v1.4</div>
    </div>
  );
}

function AuthScreen({onLogin, T}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login");
  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:30}}>
      <div style={{width:80, height:80, background:NAVY, borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", marginBottom:20}}><IcoBook/></div>
      <h1 style={{fontSize:T.f(28), fontWeight:900, marginBottom:30, color:T.navy}}>Torah Track</h1>
      <button onClick={()=>onLogin({method:"google"})} style={{width:"100%", padding:14, borderRadius:12, border:`1.5px solid ${T.border}`, background:T.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontWeight:700, color:T.navy}}>המשך עם Google</button>
      <div style={{margin:"20px 0", color:T.muted, fontSize:12}}>או</div>
      <input placeholder="אימייל" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%", padding:14, borderRadius:12, border:`1.5px solid ${T.border}`, background:T.input, marginBottom:10, boxSizing:"border-box", outline:"none"}} />
      <input type="password" placeholder="סיסמה" value={pass} onChange={e=>setPass(e.target.value)} style={{width:"100%", padding:14, borderRadius:12, border:`1.5px solid ${T.border}`, background:T.input, marginBottom:16, boxSizing:"border-box", outline:"none"}} />
      <button onClick={()=>onLogin({method:mode, email, pass})} style={{width:"100%", padding:14, borderRadius:12, border:"none", background:NAVY, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer"}}>{mode === "login" ? "כניסה" : "הרשמה"}</button>
      <button onClick={()=>setMode(mode==="login"?"reg":"login")} style={{marginTop:16, background:"none", border:"none", color:T.muted, cursor:"pointer", fontWeight:600}}>{mode==="login"?"צור חשבון חדש":"כבר יש לי חשבון"}</button>
    </div>
  );
}

/* ── ROOT APP ── */
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [libCat, setLibCat] = useState("gemara");
  const [detail, setDetail] = useState(null);
  const [sett, setSett] = useState({dark:false, fontSize:1, lang:"he"});
  const [prog, setProg] = useState(IP);
  const [goals, setGoals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeDays, setActiveDays] = useState([]);
  const [aiCredits, setAiCredits] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Clear out bad cache from previous errors
    ["u11", "u10", "u9", "u8", "u7", "p11", "p12", "p13", "p14", "p15", "p16", "p17"].forEach(k => localStorage.removeItem(k));
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;900&display=swap"; document.head.appendChild(l);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email, name: currentUser.displayName || currentUser.email.split('@')[0] });
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.prog) setProg(desProg(data.prog));
          if (data.goals) setGoals(data.goals);
          if (data.sett) setSett(data.sett);
          if (data.activity) setActivity(data.activity);
          if (data.activeDays) setActiveDays(data.activeDays);
          if (data.aiCredits) setAiCredits(data.aiCredits);
        }
        setLoaded(true);
      } else { setUser(null); setLoaded(true); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loaded || !user) return;
    const timeoutId = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), { prog: serProg(prog), goals, sett, activity: activity.slice(0, 50), activeDays: activeDays.slice(-60), aiCredits }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [prog, goals, sett, activity, activeDays, aiCredits, loaded, user]);

  const streak=useMemo(()=>{
    if(!activeDays.length)return 0;
    const sorted=[...new Set(activeDays)].sort().reverse();
    const td=todayKey();
    const yd=new Date(); yd.setDate(yd.getDate()-1); const ydStr=yd.toISOString().slice(0,10);
    if(sorted[0]!==td && sorted[0]!==ydStr) return 0;
    let count=1, cur=new Date(sorted[0]);
    for(let i=1; i<sorted.length; i++){ const prev=new Date(cur); prev.setDate(prev.getDate()-1); if(sorted[i]===prev.toISOString().slice(0,10)){ count++; cur=prev; } else break; }
    return count;
  },[activeDays]);

  const T=useMemo(()=>mkT(sett.dark,sett.fontSize,sett.lang||"he"),[sett.dark,sett.fontSize,sett.lang]);
  const cc=sett.dark?CC_D:CC_L;
  const cl=sett.dark?CL_D:CL_L;
  const appSt={direction:"rtl", fontFamily:T.font, maxWidth:480, margin:"0 auto", minHeight:"100vh", width:"100%", display:"flex", flexDirection:"column", background:T.bg, color:T.navy, position:"relative", overflow:"hidden"};

  async function handleLogin(cred) {
    try {
      if (cred.method === "google") await signInWithPopup(auth, new GoogleAuthProvider());
      else if (cred.method === "email") await signInWithEmailAndPassword(auth, cred.email, cred.pass);
      else await createUserWithEmailAndPassword(auth, cred.email, cred.pass);
    } catch (e) { alert("שגיאה: " + e.message); }
  }

  if(!user) return <div style={appSt}><AuthScreen onLogin={handleLogin} T={T}/></div>;
  if(detail) return <div style={appSt}><DetailScreen detail={detail} prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} goBack={()=>setDetail(null)} onActivity={(item)=>{
    const timeStr=new Date().toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
    setActivity(prev=>[{...item, timeStr, date:todayKey()}, ...prev].slice(0,50));
    setActiveDays(prev=>[...new Set([...prev, todayKey()])].slice(-60));
  }} user={user} aiCredits={aiCredits} setAiCredits={setAiCredits} sett={sett}/></div>;

  return (
    <div style={appSt}>
      {tab==="home" && <HomeScreen prog={prog} goals={goals} T={T} cc={cc} setTab={setTab} setDetail={setDetail} setProg={setProg} streak={streak} activity={activity}/>}
      {tab==="library" && <LibraryScreen prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} setDetail={setDetail} libCat={libCat} setLibCat={setLibCat}/>}
      {tab==="stats" && <StatsScreen prog={prog} activity={activity} activeDays={activeDays} T={T} cc={cc} streak={streak}/>}
      {tab==="settings" && <SettingsScreen sett={sett} setSett={setSett} T={T} onLogout={()=>signOut(auth)} user={user}/>}
      
      <div style={{background:T.card, borderTop:`1px solid ${T.border}`, display:"flex", paddingBottom: "env(safe-area-inset-bottom)"}}>
        {[
          {k:"home",l:T.UI.home,i:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9M9 21V12h6v9"/></svg>},
          {k:"library",l:T.UI.library,i:<IcoBook/>},
          {k:"stats",l:T.UI.stats,i:<IcoStats/>},
          {k:"settings",l:T.UI.settings,i:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
        ].map(n=>(
          <button key={n.k} onClick={()=>setTab(n.k)} style={{flex:1, padding:"12px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:4, background:"none", border:"none", color:tab===n.k?GOLD:T.muted, cursor:"pointer", fontSize:10, fontWeight:tab===n.k?900:500}}>
            {n.i}{n.l}
          </button>
        ))}
      </div>
    </div>
  );
}