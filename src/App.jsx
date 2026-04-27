import React, { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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
const IcoDots = ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const IcoStats = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoAI = ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M16 13h.01"/><path d="M12 13h.01"/><path d="M8 13h.01"/></svg>;

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
const CC_L={gemara:NAVY,mishna:"#0A5757",tanach:"#7A4818",musar:"#1A5C2E",ravKook:"#1A2B6B",machshava:"#4A1A5C",custom:"#444"};
const CL_L={gemara:"#E8EFF8",mishna:"#E3F6F6",tanach:"#FDF3E3",musar:"#E3F5EC",ravKook:"#E8EBF8",machshava:"#F5E8FC",custom:"#F0F0F0"};
const CC_D={gemara:"#93C5FD",mishna:"#5EEAD4",tanach:"#FCD34D",musar:"#6EE7B7",ravKook:"#A5B4FC",machshava:"#F9A8D4",custom:"#D1D5DB"};
const CL_D={gemara:"#1E3A5F",mishna:"#1A3A38",tanach:"#3D2800",musar:"#1A3A28",ravKook:"#1A2A5F",machshava:"#3A1A48",custom:"#374151"};

const QUOTES = [
  "לא עליך המלאכה לגמור, ולא אתה בן חורין ליבטל ממנה",
  "תלמוד תורה כנגד כולם","עשה לך רב, וקנה לך חבר",
  "הוי שקוד ללמוד תורה","כל ישראל יש להם חלק לעולם הבא",
  "הפוך בה והפוך בה, דכולא בה","חביבין ישראל שניתן להם כלי חמדה",
];

const SEFARIA_MAP = {
  "ברכות": "Berakhot", "שבת": "Shabbat", "עירובין": "Eruvin", "פסחים": "Pesachim", "שקלים": "Shekalim", "יומא": "Yoma", "סוכה": "Sukkah", "ביצה": "Beitzah", "ראש השנה": "Rosh_Hashanah", "תענית": "Taanit", "מגילה": "Megillah", "מועד קטן": "Moed_Katan", "חגיגה": "Chagigah", "יבמות": "Yevamot", "כתובות": "Ketubot", "נדרים": "Nedarim", "נזיר": "Nazir", "סוטה": "Sotah", "גיטין": "Gittin", "קידושין": "Kiddushin", "בבא קמא": "Bava_Kamma", "בבא מציעא": "Bava_Metzia", "בבא בתרא": "Bava_Batra", "סנהדרין": "Sanhedrin", "מכות": "Makkot", "שבועות": "Shevuot", "עבודה זרה": "Avodah_Zarah", "הוריות": "Horayot", "זבחים": "Zevachim", "מנחות": "Menachot", "חולין": "Chullin", "בכורות": "Bekhorot", "ערכין": "Arakhin", "תמורה": "Temurah", "כריתות": "Keritot", "מעילה": "Meilah", "נידה": "Niddah",
  "בראשית": "Genesis", "שמות": "Exodus", "ויקרא": "Leviticus", "במדבר": "Numbers", "דברים": "Deuteronomy", "יהושע": "Joshua", "שופטים": "Judges", "שמואל א": "I_Samuel", "שמואל ב": "II_Samuel", "מלכים א": "I_Kings", "מלכים ב": "II_Kings", "ישעיהו": "Isaiah", "ירמיהו": "Jeremiah", "יחזקאל": "Ezekiel", "הושע": "Hosea", "יואל": "Joel", "עמוס": "Amos", "עובדיה": "Obadiah", "יונה": "Jonah", "מיכה": "Micah", "נחום": "Nahum", "חבקוק": "Habakkuk", "צפניה": "Zephaniah", "חגי": "Haggai", "זכריה": "Zechariah", "מלאכי": "Malachi", "תהלים": "Psalms", "משלי": "Proverbs", "איוב": "Job", "שיר השירים": "Song_of_Songs", "רות": "Ruth", "איכה": "Lamentations", "קהלת": "Ecclesiastes", "אסתר": "Esther", "דניאל": "Daniel", "עזרא": "Ezra", "נחמיה": "Nehemiah", "דברי הימים א": "I_Chronicles", "דברי הימים ב": "II_Chronicles",
  "מסילת ישרים": "Mesillat_Yesharim", "חובת הלבבות": "Duties_of_the_Heart", "שערי תשובה": "Shaarei_Teshuvah", "אורחות צדיקים": "Orchot_Tzadikim", "תומר דבורה": "Tomer_Devorah", "פלא יועץ": "Pele_Yoetz", "חפץ חיים": "Chafetz_Chayim", "שמירת הלשון": "Shemirat_HaLashon", "אהבת חסד": "Ahavat_Chesed", "מכתב מאליהו": "Michtav_MeEliyahu", "עלי שור": "Alei_Shur", "נתיבות שלום": "Netivot_Shalom", 'ליקוטי מוהר"ן': "Likutei_Moharan", "ספר המידות": "Sefer_HaMiddot", "ספר הישר": "Sefer_HaYashar",
  "אורות": "Orot", "אורות התשובה": "Orot_HaTeshuvah", "אורות ארץ ישראל": "Orot,_Lights_from_Darkness,_Land_of_Israel", "אורות המלחמה": "Orot,_Lights_from_Darkness,_War", "אורות התחיה": "Orot,_Lights_from_Darkness,_National_Rebirth", "אורות ישראל": "Orot,_Orot_Yisrael", "אורות הקודש א": "Orot_HaKodesh_I", "אורות הקודש ב": "Orot_HaKodesh_II", "אורות הקודש ג": "Orot_HaKodesh_III", "אורות הקודש ד": "Orot_HaKodesh_IV", "אורות התורה": "Orot_HaTorah", "אורות האמונה": "Orot_HaEmunah", "עין איה ברכות א": "Ein_Ayah_on_Berakhot", "עין איה ברכות ב": "Ein_Ayah_on_Berakhot", "עין איה שבת א": "Ein_Ayah_on_Shabbat", "עין איה שבת ב": "Ein_Ayah_on_Shabbat", "שמונה קבצים": "Shemonah_Kevatzim", "אגרות הראיה א": "Igrot_HaReiyah", "אגרות הראיה ב": "Igrot_HaReiyah", "אגרות הראיה ג": "Igrot_HaReiyah", "אגרות הראיה ד": "Igrot_HaReiyah", "מאמרי הראיה א": "Maamarei_HaReiyah", "מאמרי הראיה ב": "Maamarei_HaReiyah", "מוסר אביך": "Musar_Avikh", "עולת ראיה א": "Olat_Reiyah", "עולת ראיה ב": "Olat_Reiyah", "ארפלי טוהר": "Arpilei_Tohar", "ריש מילין": "Resh_Milin",
  "נפש החיים": "Nefesh_HaChayim", "כוזרי": "Kuzari", "מורה נבוכים": "Guide_for_the_Perplexed", "דרך ה'": "Derekh_Hashem", "דעת תבונות": "Da'at_Tevunot", "תניא": "Tanya", "אמונות ודעות": "Emunot_ve-Deot", "ספר העיקרים": "Sefer_HaIkkarim", "נצח ישראל": "Netzach_Yisrael", "נתיבות עולם": "Netivot_Olam", "גבורות ה'": "Gevurot_Hashem", "באר הגולה": "Be'er_HaGolah"
};

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
function getAllBooks(custom) { return CATS.flatMap(c=>getBkList(c,custom)); }
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

function calcDone(prog,cat,i) {
  if(cat==="gemara"){const g=prog.gemara?.[i];if(!g)return 0;return Math.round((g.done?.size||0)/2);}
  if(cat==="mishna"){const m=prog.mishna?.[i];if(!m)return 0;return m.done?.size||0;}
  if(cat==="custom") return prog.custom?.[i]?.done?.size||0;
  if(cat==="tanach") return prog.tanach?.[i]?.size||0;
  return prog[cat]?.[i]?.size||0;
}
function pct(d,t){return t>0?Math.min(100,Math.round(d*100/t)):0;}

/* ── SEFARIA LINK GENERATOR ── */
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

/* ── STORAGE ── */
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

/* ── THEME & TRANSLATION ── */
function mkT(dark,sz,lang) {
  const sc=[0.88,1,1.14][sz]||1, f=n=>Math.round(n*sc), isEn=lang==="en";
  const CAT_L = isEn 
    ? {gemara:"Gemara",mishna:"Mishna",tanach:"Tanach",musar:"Musar",ravKook:"Rav Kook",machshava:"Machshava",custom:"Custom"}
    : {gemara:"גמרא",mishna:"משניות",tanach:'תנ"ך',musar:"מוסר",ravKook:"ספרי הראי״ה",machshava:"מחשבה",custom:"אישי"};
  const CAT_UNIT=isEn
    ?{gemara:"dapim",mishna:"mishnayot",tanach:"chapters",musar:"chapters",ravKook:"chapters",machshava:"chapters",custom:"chapters"}
    :{gemara:"דפים",mishna:"משניות",tanach:"פרקים",musar:"פרקים",ravKook:"פרקים",machshava:"פרקים",custom:"פרקים"};
  
  const UI = isEn ? {
    home: "Home", library: "Library", goals: "Goals", stats: "Stats", settings: "Settings", ai: "AI",
    welcome: "Welcome!", startTracking: "Go to library and start tracking", openLib: "Open Library",
    activeGoals: "Active Goals", recentActivity: "Recent Activity", daysLeft: "days left",
    dafYomi: "Daf Yomi", parasha: "Weekly Parasha", halacha: "Daily Halacha", zmanim: "Zmanim",
    markBy: "Mark by:", amudim: "Amudim", perakim: "Chapters", mishnayot: "Mishnayot", parshiot: "Parashiyot",
    cancel: "Cancel", markAll: "Mark All", clearAll: "Clear All", notes: "Notes", repetitions: "Repetitions", save: "Save",
    addBook: "+ Add Custom Book", search: "Search books...", completed: "Completed", del: "Delete",
    newGoal: "+ New Goal", noGoals: "No goals yet", setGoal: "Set a goal and track your pace", firstGoal: "+ First Goal",
    topic: "Category", book: "Book / Tractate", target: "Target", deadline: "Target Date", saveGoal: "Save Goal",
    dedicate: "Dedicate Learning", appearance: "Appearance", darkMode: "Dark Mode", darkSub: "Dark background for night",
    fontSize: "Font Size", small: "S", medium: "M", large: "L", language: "Language", account: "Account",
    signOut: "Sign Out", support: "Support", contactDev: "Contact Developer", sendEmail: "Send Email",
    login: "Login", register: "Create Account", email: "Email", password: "Password", name: "Full Name",
    continueWith: "Continue with", or: "or", newAccount: "Create a new account",
    onTrack: "On track ✓", behind: "Behind", perDay: "per day", currPace: "curr pace", fullTractates: "Completed Books",
    dedicateDesc: "Dedicate your learning. Dedications will be visible to all users.", submitDedication: "Submit Dedication",
    continueSefaria: "Continue reading where you left off", legal: "Legal & Privacy", terms: "Terms of Service", privacy: "Privacy Policy",
    agreeTerms: "I agree to the Terms of Service and Privacy Policy", mustAgree: "You must agree to the Terms to continue"
  } : {
    home: "בית", library: "ספרייה", goals: "יעדים", stats: "נתונים", settings: "הגדרות", ai: "AI אישי",
    welcome: "ברוך הבא!", startTracking: "לך לספרייה והתחל לסמן", openLib: "פתח ספרייה",
    activeGoals: "יעדים פעילים", recentActivity: "פעילות אחרונה", daysLeft: "ימים שנותרו",
    dafYomi: "דף יומי", parasha: "פרשת השבוע", halacha: "הלכה יומית", zmanim: "זמני היום",
    markBy: "סמן לפי:", amudim: "עמודים", perakim: "פרקים", mishnayot: "משניות", parshiot: "פרשות",
    cancel: "בטל", markAll: "סמן הכל", clearAll: "נקה הכל", notes: "אפשרויות והערות", repetitions: "חזרות", save: "שמור",
    addBook: "+ הוסף ספר אישי", search: "חיפוש בכל הספרים...", completed: "הושלם", del: "מחק",
    newGoal: "+ יעד חדש", noGoals: "אין יעדים עדיין", setGoal: "הגדר יעד ועקוב אחרי הקצב שלך", firstGoal: "+ יעד ראשון",
    topic: "תחום", book: "ספר / מסכת", target: "יעד (אופציונלי)", deadline: "תאריך יעד", saveGoal: "שמור יעד",
    dedicate: "הקדשת לימוד", appearance: "מראה", darkMode: "מצב כהה", darkSub: "רקע כהה ללמידה בלילה",
    fontSize: "גודל טקסט", small: "קטן", medium: "רגיל", large: "גדול", language: "שפה", account: "חשבון",
    signOut: "התנתקות", support: "תמיכה", contactDev: "צור קשר עם המפתח", sendEmail: "שלח מייל",
    login: "כניסה", register: "יצירת חשבון", email: "אימייל", password: "סיסמה", name: "שם מלא",
    continueWith: "המשך עם", or: "או", newAccount: "פתח חשבון חדש",
    onTrack: "במסלול ✓", behind: "מאחור", perDay: "נדרש ליום", currPace: "יעד נוכחי", fullTractates: "ספרים שלמים",
    dedicateDesc: "הקדש את לימודך להצלחת, רפואת או לעילוי נשמת יקיריך. שים לב: ההקדשות יוצגו באפליקציה באופן פומבי לכלל הלומדים.", submitDedication: "שלח בקשת הקדשה",
    continueSefaria: "המשך לימוד מהמקום שעצרת", legal: "תקנון ופרטיות", terms: "תנאי שימוש", privacy: "מדיניות פרטיות",
    agreeTerms: "אני מסכים/ה לתקנון ולמדיניות הפרטיות", mustAgree: "יש לאשר את התקנון כדי להירשם"
  };

  const base=dark
    ?{bg:"#0D1B2E",card:"#152438",navy:"#D0E4FF",gold:"#E8C060",muted:"#8A9BB0",border:"rgba(200,220,255,0.10)",input:"#1E3050",shadow:"0 2px 16px rgba(0,0,0,0.5)",primary:"#4A7FC0",red:"#FCA5A5"}
    :{bg:"#FAF7EE",card:"#FFFFFF",navy:NAVY,gold:GOLD,muted:"#6B7280",border:"rgba(26,58,107,0.10)",input:"#F3EED8",shadow:"0 2px 14px rgba(26,58,107,0.09)",primary:NAVY,red:"#B91C1C"};
  return {...base,f,dark,isEn,CAT_L,CAT_UNIT,UI,font:"'Heebo',system-ui,sans-serif"};
}

/* ── UI PRIMITIVES ── */
function Bar({p,color,h,dark}){return <div style={{background:dark?"rgba(255,255,255,0.08)":"rgba(26,58,107,0.08)",borderRadius:99,height:h||6,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:99,transition:"width .4s"}}/></div>;}
function Ring({p,color,size=60,stroke=7,label,sub,dark}){const r=(size-stroke)/2,c=2*Math.PI*r,off=c-(p/100)*c;return <div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark?"rgba(255,255,255,0.10)":"rgba(26,58,107,0.08)"} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .5s"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}><span style={{fontSize:size<50?10:13,fontWeight:800,lineHeight:1}}>{label}</span>{sub&&<span style={{fontSize:7,opacity:.6,lineHeight:1}}>{sub}</span>}</div></div>;}
function Sheet({show,onClose,title,T,children}){if(!show)return null;return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",zIndex:600}}><div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"16px 18px 52px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto",boxSizing:"border-box"}}><div style={{width:38,height:4,background:T.border,borderRadius:99,margin:"0 auto 14px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><span style={{fontSize:T.f(17),fontWeight:700,color:T.navy,fontFamily:T.font}}>{title}</span><button aria-label="Close" onClick={onClose} style={{background:T.input,border:"none",cursor:"pointer",color:T.muted,fontSize:18,padding:"3px 12px",borderRadius:9,fontFamily:T.font}}>✕</button></div>{children}</div></div>;}
function FI({T,style,...r}){return <input {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:"16px",fontFamily:T.font,direction:T.isEn?"ltr":"rtl",outline:"none",boxSizing:"border-box",...(style||{})}}/>;}
function FS({T,children,style,...r}){return <select {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:"16px",fontFamily:T.font,direction:T.isEn?"ltr":"rtl",outline:"none",boxSizing:"border-box",...(style||{})}}>{children}</select>;}
function FTA({T,style,...r}){return <textarea {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:"16px",fontFamily:T.font,direction:T.isEn?"ltr":"rtl",outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:90,...(style||{})}}/>;}
function FL({label,T,children}){return <div style={{marginBottom:14}}><label style={{fontSize:T.f(12),color:T.muted,display:"block",marginBottom:5,fontWeight:600,fontFamily:T.font}}>{label}</label>{children}</div>;}
function PB({onClick,children,T,color,style}){return <button onClick={onClick} style={{width:"100%",padding:13,background:color||T.primary,color:"#fff",border:"none",borderRadius:12,fontSize:T.f(15),fontWeight:700,cursor:"pointer",fontFamily:T.font,boxSizing:"border-box",...(style||{})}}>{children}</button>;}
function MB({active,onClick,label,color,T}){return <button onClick={onClick} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`2px solid ${active?color:T.border}`,background:active?color:"transparent",color:active?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:active?700:400,fontFamily:T.font,transition:"all .2s"}}>{label}</button>;}
function Toggle({on,onToggle,primary}){return <div onClick={onToggle} style={{width:50,height:28,borderRadius:14,background:on?primary:"#D1D5DB",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,width:22,height:22,borderRadius:"50%",background:"#fff",left:on?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div>;}

function DualDateInput({T, value, onChange}) {
  const hd = value ? hebStr(value) : "";
  return (
    <div>
      <FI T={T} type="date" value={value} onChange={onChange} style={{direction:"ltr"}}/>
      {hd && <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:T.f(13),color:T.gold||GOLD,marginTop:6,fontWeight:700,background:T.dark?"rgba(201,168,76,0.15)":"#FBF5E0",borderRadius:8,padding:"6px 10px"}}><IcoCalendar/> {hd}</div>}
    </div>
  );
}

function LegalSheet({show, onClose, type, T}) {
  const title = type === 'terms' ? T.UI.terms : T.UI.privacy;
  return (
    <Sheet show={show} onClose={onClose} title={title} T={T}>
      <div style={{fontSize:T.f(13), color:T.muted, lineHeight:1.6}}>
        {type === 'terms' ? (
          <>
            <p>ברוכים הבאים לאפליקציית Torah Track.</p>
            <p>השימוש באפליקציה זו מותנה בהסכמתך לתנאים הבאים. האפליקציה נועדה לסייע למשתמשים לעקוב אחר התקדמות הלימוד שלהם.</p>
            <p>אנו שומרים לעצמנו את הזכות לעדכן או לשנות את האפליקציה בכל עת. אין באפליקציה משום הבטחה או התחייבות לגבי זמינות רצופה של הנתונים.</p>
          </>
        ) : (
          <>
            <p>הפרטיות שלך חשובה לנו.</p>
            <p>אנו אוספים את כתובת הדוא"ל שלך ואת שם המשתמש לצורך יצירת חשבון מאובטח בלבד (דרך שרתי Firebase של Google).</p>
            <p>נתוני הלימוד שאתה מזין (התקדמות, יעדים) נשמרים בענן כדי לאפשר לך גישה מכל מכשיר.</p>
            <p><strong>הקדשות לימוד:</strong> שים לב ששמות שיוזנו בבקשות להקדשת לימוד נועדו להיות מוצגים באופן פומבי לכלל המשתמשים באפליקציה.</p>
          </>
        )}
      </div>
    </Sheet>
  );
}

/* ── BOOK CARD ── */
function BookCard({cat,idx,prog,T,cc,cl,onPress,custom}){
  const list=getBkList(cat,custom),item=list[idx];if(!item)return null;
  const dn=calcDone(prog,cat,idx),tot=bkTotal(cat,idx,custom);
  const col=cc[cat]||T.primary,p=pct(dn,tot),fin=dn>=tot&&tot>0;
  return (
    <div onClick={()=>onPress({cat,idx})} style={{background:T.card,borderRadius:14,padding:"13px 15px",marginBottom:8,cursor:"pointer",boxShadow:T.shadow,borderRight:`4px solid ${fin?col:"transparent"}`,boxSizing:"border-box"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
        <div style={{flex:1}}><div style={{fontSize:T.f(15),fontWeight:700,color:T.navy}}>{item.n}</div>{item.sub&&<div style={{fontSize:T.f(11),color:T.muted,marginTop:1}}>{item.sub}</div>}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginRight:8}}>
          {fin&&<span style={{fontSize:T.f(10),padding:"3px 8px",borderRadius:20,background:cl[cat],color:col,fontWeight:800}}>{T.UI.completed}</span>}
          <span style={{fontSize:T.f(12),color:T.muted}}>{dn}/{tot}</span>
        </div>
      </div>
      <Bar p={p} color={col} h={5} dark={T.dark}/>
    </div>
  );
}

/* ── DETAIL SCREEN ── */
function DetailScreen({detail,prog,T,cc,cl,setProg,goBack,onActivity}){
  const{cat,idx}=detail;
  const list=getBkList(cat,prog.custom),item=list[idx];
  const col=cc[cat]||T.primary,lightCol=cl[cat]||"#E8EFF8";
  const[viewMode,setViewMode]=useState(cat==="gemara"?"amudim":cat==="mishna"?"mishna":"perakim");
  const[noteSheet,setNoteSheet]=useState(null);
  const[editNote,setEditNote]=useState("");
  const[editChz,setEditChz]=useState(0);
  const tMode=prog.tmode?.[idx]||"perakim";
  const isTorah=cat==="tanach"&&idx<5;

  const items=useMemo(()=>{
    const arr=[];
    if(cat==="gemara"){
      if(viewMode==="amudim"){const D=GEMARA[idx]?.d||0;for(let d=2;d<=D;d++){arr.push({key:`${d}a`,label:`${toHeb(d)}.`});arr.push({key:`${d}b`,label:`${toHeb(d)}:`,});}}
      else if(viewMode==="perakim"){const P=GEMARA[idx]?.p||0,chs=GEMARA[idx]?.ch||[];for(let p=1;p<=P;p++)arr.push({key:`p${p}`,label:`${T.isEn?"Chap":""} ${toHeb(p)}`,sub:chs[p-1]||""});}
    } else if(cat==="mishna"){
      if(viewMode==="mishna"){const ms=MISHNA[idx]?.ms||[];ms.forEach((cnt,pi)=>{for(let m=1;m<=cnt;m++)arr.push({key:`${pi+1}:${m}`,label:`${toHeb(pi+1)},${toHeb(m)}`});});}
      else if(viewMode==="perakim"){const P=MISHNA[idx]?.p||0;for(let p=1;p<=P;p++)arr.push({key:`pp${p}`,label:`${T.isEn?"Chap":""} ${toHeb(p)}`,sub:`${MISHNA[idx]?.ms?.[p-1]||0} ${T.UI.mishnayot}`});}
    } else if(cat==="tanach"){
      const tm=isTorah?tMode:"perakim";
      if(tm==="parshiot"&&PARSHIOT[idx]) {
        PARSHIOT[idx].forEach(ps=>arr.push({key:ps,label:ps}));
      } else {
        for(let i=1;i<=(TANACH[idx]?.c||0);i++) arr.push({key:i,label:`${T.isEn?"Chap":""} ${toHeb(i)}`});
      }
    } else {
      const src={musar:MUSAR,ravKook:RAV_KOOK,machshava:MACHSHAVA}[cat];
      const p=(src||[])[idx]?.p||prog.custom[idx]?.chapters||0;
      for(let i=1;i<=p;i++) arr.push({key:i,label:toHeb(i)});
    }
    return arr;
  },[cat,idx,viewMode,tMode,prog.custom, T.isEn, T.UI.mishnayot, isTorah]);

  function isOn(key){
    if(cat==="gemara"){const g=prog.gemara?.[idx];if(!g)return false;if(String(key).startsWith("p")){const pn=parseInt(String(key).slice(1));const ak=perekAmudKeys(idx,pn);return ak.length>0&&ak.every(k=>safeHas(g.done, k));}return safeHas(g.done, key);}
    if(cat==="mishna"){const m=prog.mishna?.[idx];if(!m)return false;if(String(key).startsWith("pp")){const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);return mk.length>0&&mk.every(k=>safeHas(m.done, k));}return safeHas(m.done, key);}
    if(cat==="custom") return safeHas(prog.custom?.[idx]?.done, key);
    if(cat==="tanach"){
      if(typeof key==="string"){
        const chapters=PARASHA_CHAPTERS[key];
        if(!chapters) return false;
        return chapters.length>0&&chapters.every(c=>safeHas(prog.tanach?.[idx], c));
      }
      return safeHas(prog.tanach?.[idx], key);
    }
    return safeHas(prog[cat]?.[idx], key);
  }

  function isPartial(key){
    if(cat==="gemara"&&String(key).startsWith("p")){const g=prog.gemara?.[idx];if(!g)return false;const pn=parseInt(String(key).slice(1));const ak=perekAmudKeys(idx,pn);const cnt=ak.filter(k=>safeHas(g.done, k)).length;return cnt>0&&cnt<ak.length;}
    if(cat==="mishna"&&String(key).startsWith("pp")){const m=prog.mishna?.[idx];if(!m)return false;const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);const cnt=mk.filter(k=>safeHas(m.done, k)).length;return cnt>0&&cnt<mk.length;}
    if(cat==="tanach"&&typeof key==="string"){
      const chapters=PARASHA_CHAPTERS[key];
      if(!chapters) return false;
      const marked=chapters.filter(c=>safeHas(prog.tanach?.[idx], c)).length;
      return marked>0&&marked<chapters.length;
    }
    return false;
  }

  function toggle(key, forceLabel){
    const wasOn=isOn(key);
    setProg(prev=>{
      if(cat==="gemara"){const g={...prev.gemara},cur=g[idx]||{done:new Set()};let nd=new Set(cur.done);if(String(key).startsWith("p")){const pn=parseInt(String(key).slice(1));const ak=perekAmudKeys(idx,pn);const allOn=ak.every(k=>nd.has(k));allOn?ak.forEach(k=>nd.delete(k)):ak.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);}g[idx]={done:nd};return{...prev,gemara:g};}
      if(cat==="mishna"){const mm={...prev.mishna},cur=mm[idx]||{done:new Set()};let nd=new Set(cur.done);if(String(key).startsWith("pp")){const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);const allOn=mk.every(k=>nd.has(k));allOn?mk.forEach(k=>nd.delete(k)):mk.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);}mm[idx]={done:nd};return{...prev,mishna:mm};}
      if(cat==="custom"){const arr=[...prev.custom],nd=new Set(arr[idx].done);nd.has(key)?nd.delete(key):nd.add(key);arr[idx]={...arr[idx],done:nd};return{...prev,custom:arr};}
      if(cat==="tanach"){
        const tp={...prev.tanach},nd=new Set(tp[idx]||[]);
        if(typeof key==="string"){
          const chapters=PARASHA_CHAPTERS[key]||[];
          const allOn=chapters.every(c=>nd.has(c));
          allOn?chapters.forEach(c=>nd.delete(c)):chapters.forEach(c=>nd.add(c));
        } else {
          nd.has(key)?nd.delete(key):nd.add(key);
        }
        tp[idx]=nd; return{...prev,tanach:tp};
      }
      const cp={...prev[cat]},nd=new Set(cp[idx]||[]);nd.has(key)?nd.delete(key):nd.add(key);cp[idx]=nd;return{...prev,[cat]:cp};
    });
    if(!wasOn) {
        const itemLabel = forceLabel || items.find(i=>i.key===key)?.label || String(key);
        onActivity({cat,bk:item?.n||"",label:itemLabel});
    }
  }

  function setTMode(mode){setProg(prev=>({...prev,tmode:{...(prev.tmode||{}),[idx]:mode}}));}

  const totForMode=cat==="tanach"?TANACH[idx]?.c||0:items.length;
  const doneCnt=cat==="tanach"?(prog.tanach?.[idx]?.size||0):items.filter(it=>isOn(it.key)).length;
  const p=pct(doneCnt,totForMode);
  const isParsh=cat==="tanach"&&tMode==="parshiot"&&isTorah;

  const nextUnlearned = useMemo(() => { try { return items.find(it => !isOn(it.key)); } catch(e){ return null; } }, [items, prog, isOn]);
  const nextSefariaUrl = nextUnlearned ? getSefariaUrl(cat, item.n, nextUnlearned.key, tMode) : null;

  function openNote(key,label){const k=`${cat}:${idx}:${key}`;setEditNote(prog.notes?.[k]||"");setEditChz(prog.chazara?.[k]||0);setNoteSheet({key,label});}
  function saveNote(){const k=`${cat}:${idx}:${noteSheet.key}`;setProg(prev=>({...prev,notes:{...prev.notes,[k]:editNote},chazara:{...prev.chazara,[k]:editChz}}));setNoteSheet(null);}

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:T.bg}}>
      <div style={{background:T.card,padding:"14px 16px 16px",borderBottom:`1px solid ${T.border}`}}>
        <button aria-label="Go Back" onClick={goBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:T.f(13),marginBottom:12,padding:0,fontFamily:T.font}}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={T.isEn?"15 18 9 12 15 6":"9 18 15 12 9 6"}/></svg> {T.isEn?"Back":"חזרה"}
        </button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:T.f(22),fontWeight:900,color:T.navy}}>{item?.n}</div>{item?.sub&&<div style={{fontSize:T.f(12),color:T.muted,marginTop:2}}>{item.sub} · {T.CAT_L[cat]}</div>}</div>
          <div style={{background:lightCol,borderRadius:14,padding:"10px 16px",textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:T.f(24),fontWeight:900,color:col}}>{p}%</div>
            <div style={{fontSize:T.f(10),color:col,opacity:.8}}>{doneCnt}/{totForMode}</div>
          </div>
        </div>
        <div style={{marginTop:12}}><Bar p={p} color={col} h={8} dark={T.dark}/></div>
        
        {nextSefariaUrl && (
          <a href={nextSefariaUrl} target="_blank" rel="noreferrer" style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 14px", background:col, color:"#fff", borderRadius:12, textDecoration:"none", fontWeight:700, marginTop:14, fontSize:T.f(14)}}>
            <IcoBook /> {T.UI.continueSefaria}
          </a>
        )}
      </div>
      <div style={{flex:1,overflow:"auto",padding:"14px 16px 32px"}}>
        {cat==="gemara"&&(<div style={{marginBottom:16}}>
          <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600}}>{T.UI.markBy}</div>
          <div style={{display:"flex",gap:8}}>
            <MB active={viewMode==="amudim"} onClick={()=>setViewMode("amudim")} label={T.UI.amudim} color={col} T={T}/>
            <MB active={viewMode==="perakim"} onClick={()=>setViewMode("perakim")} label={T.UI.perakim} color={col} T={T}/>
          </div>
        </div>)}
        {cat==="mishna"&&(<div style={{marginBottom:16}}>
          <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600}}>{T.UI.markBy}</div>
          <div style={{display:"flex",gap:8}}>
            <MB active={viewMode==="mishna"} onClick={()=>setViewMode("mishna")} label={T.UI.mishnayot} color={col} T={T}/>
            <MB active={viewMode==="perakim"} onClick={()=>setViewMode("perakim")} label={T.UI.perakim} color={col} T={T}/>
          </div>
        </div>)}
        {isTorah&&(<div style={{marginBottom:16}}>
          <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600}}>{T.UI.markBy}</div>
          <div style={{display:"flex",gap:8}}>
            <MB active={tMode==="perakim"} onClick={()=>setTMode("perakim")} label={T.UI.perakim} color={col} T={T}/>
            <MB active={tMode==="parshiot"} onClick={()=>setTMode("parshiot")} label={T.UI.parshiot} color={col} T={T}/>
          </div>
        </div>)}
        
        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill, minmax(70px, 1fr))`,gap:8}}>
          {items.map(it=>{
            if(!it) return null;
            const on=isOn(it.key),part=isPartial(it.key);
            const nk=`${cat}:${idx}:${it.key}`;
            const hasN=!!(prog.notes?.[nk]||"").trim(),chzN=prog.chazara?.[nk]||0;
            const bg=on?col:part?(col+"33"):"transparent";
            const fc=on?"#fff":part?col:T.muted;
            
            return (
              <div key={String(it.key)} style={{position:"relative", height:"100%"}}>
                <button onClick={()=>toggle(it.key, it.label)} style={{width:"100%",height:"100%",padding:isParsh?"14px 4px":"11px 4px",border:`2px solid ${on?col:part?col:T.border}`,borderRadius:10,fontSize:T.f(12),cursor:"pointer",background:bg,color:fc,fontWeight:on||part?700:400,minHeight:isParsh?50:44,fontFamily:T.font,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,boxSizing:"border-box"}}>
                  <span>{it.label}</span>
                  {it.sub&&<span style={{fontSize:T.f(9),opacity:.7}}>{it.sub}</span>}
                  {chzN>0&&<span style={{fontSize:10,background:"rgba(255,255,255,0.35)",borderRadius:10,padding:"1px 6px",marginTop:2}}>×{chzN}</span>}
                </button>
                <button aria-label="Options" onClick={e=>{e.stopPropagation();openNote(it.key,it.label);}} style={{position:"absolute",top:0,right:0,padding:"6px",background:"transparent",border:"none",cursor:"pointer",color:on||part?"rgba(255,255,255,0.8)":T.muted,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
                   <IcoDots/>
                </button>
                {hasN&&<div style={{position:"absolute", top:6, left:6, width:6, height:6, borderRadius:"50%", background:GOLD}}/>}
              </div>
            );
          })}
        </div>
        {items.length>0&&(
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>items.forEach(it=>!isOn(it.key)&&toggle(it.key))} style={{flex:1,padding:11,borderRadius:10,border:`1.5px solid ${T.border}`,background:"none",cursor:"pointer",fontSize:T.f(13),color:T.navy,fontFamily:T.font}}>{T.UI.markAll}</button>
            <button onClick={()=>items.forEach(it=>(isOn(it.key)||isPartial(it.key))&&toggle(it.key))} style={{flex:1,padding:11,borderRadius:10,border:`1.5px solid ${T.border}`,background:"none",cursor:"pointer",fontSize:T.f(13),color:T.muted,fontFamily:T.font}}>{T.UI.clearAll}</button>
          </div>
        )}
      </div>

      <Sheet show={!!noteSheet} onClose={()=>setNoteSheet(null)} title={`${noteSheet?.label||""}`} T={T}>
        {noteSheet && getSefariaUrl(cat, item.n, noteSheet.key, tMode) && (
          <a href={getSefariaUrl(cat, item.n, noteSheet.key, tMode)} target="_blank" rel="noreferrer" style={{display:"flex", alignItems:"center", gap:8, padding:"12px 14px", background:T.dark?"rgba(74,127,192,0.15)":"#E8EFF8", color:T.primary, borderRadius:10, textDecoration:"none", fontWeight:700, marginBottom:16, justifyContent:"center", fontSize:T.f(14)}}>
            <IcoBook /> {T.isEn ? "Read on Sefaria" : "למד באתר ספריא"}
          </a>
        )}

        <FL label={T.UI.notes} T={T}><FTA aria-label="Notes input" T={T} value={editNote} onChange={e=>setEditNote(e.target.value)}/></FL>
        <FL label={T.UI.repetitions} T={T}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginTop:4}}>
            <button aria-label="Decrease repetitions" onClick={()=>setEditChz(Math.max(0,editChz-1))} style={{width:44,height:44,borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,cursor:"pointer",fontSize:26,color:T.navy,fontFamily:T.font,lineHeight:1}}>−</button>
            <span style={{fontSize:T.f(30),fontWeight:900,color:T.navy,minWidth:50,textAlign:"center"}}>{editChz}</span>
            <button aria-label="Increase repetitions" onClick={()=>setEditChz(editChz+1)} style={{width:44,height:44,borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,cursor:"pointer",fontSize:26,color:T.navy,fontFamily:T.font,lineHeight:1}}>+</button>
          </div>
        </FL>
        <PB T={T} onClick={saveNote} style={{marginTop:12,background:col}}>{T.UI.save}</PB>
      </Sheet>
    </div>
  );
}

/* ── AI STUDY SCREEN ── */
function AiScreen({activity, T, sett}) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const recentItems = useMemo(() => {
    const unique = [];
    const seen = new Set();
    for (const item of activity) {
      const name = `${item.bk} ${item.label ? item.label : ''}`.trim();
      if (!seen.has(name) && name) {
        seen.add(name);
        unique.push({ id: name, cat: item.cat });
      }
      if(unique.length >= 15) break;
    }
    return unique;
  }, [activity]);

  const toggleSel = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const askAI = async (type) => {
    if(selected.length === 0) return alert(T.isEn ? "Select at least one item" : "בחר לפחות פריט אחד");

    const itemsList = selected.join(", ");
    let prompt = "";
    if(type === "quiz") {
       prompt = `אני לומד תורה. למדתי לאחרונה את: ${itemsList}. תכין לי חידון אמריקאי של 5 שאלות לבחון את עצמי, עם 4 תשובות לכל שאלה. בסוף תציג את התשובות הנכונות עם הסבר קצר. כתוב בעברית בלבד.`;
    } else {
       prompt = `אני לומד תורה. למדתי לאחרונה את: ${itemsList}. תכין לי סיכום קצר, מדויק ומחולק לנקודות של העניינים המרכזיים. כתוב בעברית בלבד.`;
    }

    if(!sett.openAiKey) {
        window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank');
        return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sett.openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{role: "user", content: prompt}]
        })
      });
      const data = await res.json();
      if(data.error) setResult("שגיאה: " + data.error.message);
      else setResult(data.choices[0].message.content);
    } catch(err) {
      setResult("שגיאה בחיבור לשרת.");
    }
    setLoading(false);
  };

  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{fontSize:T.f(22),fontWeight:900,color:T.navy,marginBottom:16}}>עוזר למידה אישי (AI)</div>
      
      {!sett.openAiKey && (
        <div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:12,padding:12,marginBottom:16,color:"#991B1B",fontSize:T.f(13)}}>
          <strong>שים לב:</strong> כדי להשתמש בפיצ'ר זה בתוך האפליקציה, עליך להזין מפתח API של OpenAI במסך ההגדרות. ללא מפתח, המערכת תפתח עבורך את ChatGPT עם השאלה מוכנה.
        </div>
      )}

      <div style={{background:T.card,borderRadius:16,padding:16,boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(14),fontWeight:700,color:T.navy,marginBottom:12}}>בחר חומרים מתוך הלמידה האחרונה שלך:</div>
        {recentItems.length===0 && <div style={{fontSize:T.f(13),color:T.muted}}>אין מספיק נתונים. חזור אחרי שתסמן לימוד.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {recentItems.map(it => {
            const sel = selected.includes(it.id);
            return (
              <button key={it.id} onClick={()=>toggleSel(it.id)} style={{textAlign:T.isEn?"left":"right",padding:"10px 12px",borderRadius:10,border:`2px solid ${sel?T.primary:T.border}`,background:sel?T.primary+"11":"transparent",color:T.navy,fontFamily:T.font,fontSize:T.f(14),display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{it.id}</span>
                {sel && <span style={{color:T.primary, fontWeight:900}}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <button disabled={loading} onClick={()=>askAI("summary")} style={{flex:1,padding:14,borderRadius:12,border:"none",background:"#10a37f",color:"#fff",fontSize:T.f(14),fontWeight:700,fontFamily:T.font,cursor:"pointer",opacity:loading?0.5:1}}>✨ סכם לי</button>
        <button disabled={loading} onClick={()=>askAI("quiz")} style={{flex:1,padding:14,borderRadius:12,border:"none",background:"#ab68ff",color:"#fff",fontSize:T.f(14),fontWeight:700,fontFamily:T.font,cursor:"pointer",opacity:loading?0.5:1}}>🧠 בחן אותי</button>
      </div>

      {loading && <div style={{textAlign:"center",color:T.muted,fontSize:T.f(14)}}>הבינה המלאכותית מכינה את התשובה... ⏳</div>}

      {result && (
        <div style={{background:T.card,borderRadius:16,padding:16,boxShadow:T.shadow,whiteSpace:"pre-wrap",fontSize:T.f(14),lineHeight:1.6,color:T.navy,border:`1px solid ${T.primary}`}}>
          {result}
        </div>
      )}
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({prog,goals,T,cc,setTab,setDetail,setProg,streak,activity}){
  const today=useMemo(()=>hebDateFull(),[]);
  const[now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id);},[]);
  const quote=useMemo(()=>QUOTES[new Date().getDay()%QUOTES.length],[]);
  
  const[shabbatData,setShabbatData]=useState(null);
  const[zmanim,setZmanim]=useState(null);
  const[locName,setLocName]=useState(T.isEn?"Jerusalem":"ירושלים");

  useEffect(()=>{
    fetch("https://www.hebcal.com/shabbat?cfg=json&geonameid=293397&m=50&lg=h")
      .then(r=>r.json()).then(d=>{
        const parasha=d.items?.find(i=>i.category==="parashat"||i.category==="parasha");
        if(parasha){
           const cleanTitle = parasha.title.replace(/[\u0591-\u05C7]/g, '').trim();
           setShabbatData({parasha:cleanTitle});
        }
      }).catch(()=>{});

    const fetchZmanim = (lat, lon, name) => {
        fetch(`https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lon}&tzid=Asia/Jerusalem&date=${todayKey()}`)
          .then(r=>r.json()).then(d=>{setZmanim(d); setLocName(name);}).catch(()=>{});
    };

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchZmanim(pos.coords.latitude, pos.coords.longitude, T.isEn?"Current Location":"מיקום נוכחי"),
            () => fetchZmanim(31.769, 35.216, T.isEn?"Jerusalem":"ירושלים")
        );
    } else {
        fetchZmanim(31.769, 35.216, T.isEn?"Jerusalem":"ירושלים");
    }
  },[T.isEn]);
  
  const halacha=HALACHOT[new Date().getDate()%HALACHOT.length];
  const dafYomi=useMemo(()=>getDafYomi(),[]);

  const S=useMemo(()=>({
    dapim:GEMARA.reduce((s,_,i)=>s+calcDone(prog,"gemara",i),0),
    mishna:MISHNA.reduce((s,_,i)=>s+calcDone(prog,"mishna",i),0),
    tanach:TANACH.reduce((s,_,i)=>s+calcDone(prog,"tanach",i),0),
    musar:MUSAR.reduce((s,_,i)=>s+calcDone(prog,"musar",i),0)+RAV_KOOK.reduce((s,_,i)=>s+calcDone(prog,"ravKook",i),0)+MACHSHAVA.reduce((s,_,i)=>s+calcDone(prog,"machshava",i),0),
  }),[prog]);
  const rows=[
    {cat:"gemara",l:T.CAT_L.gemara,v:S.dapim,tot:TOTAL_DAPIM,unit:T.CAT_UNIT.gemara},
    {cat:"mishna",l:T.CAT_L.mishna,v:S.mishna,tot:MISHNA.reduce((s,_,i)=>s+totalMs(i),0),unit:T.CAT_UNIT.mishna},
    {cat:"tanach",l:T.CAT_L.tanach,v:S.tanach,tot:TANACH.reduce((s,t)=>s+t.c,0),unit:T.CAT_UNIT.tanach},
    {cat:"musar",l:T.CAT_L.musar,v:S.musar,tot:MUSAR.reduce((s,t)=>s+t.p,0)+RAV_KOOK.reduce((s,t)=>s+t.p,0)+MACHSHAVA.reduce((s,t)=>s+t.p,0),unit:T.CAT_UNIT.musar},
  ];
  const empty=S.dapim===0&&S.mishna===0&&S.tanach===0&&S.musar===0;
  const hh=String(now.getHours()).padStart(2,"0"), mm2=String(now.getMinutes()).padStart(2,"0");
  function fmtTime(iso){if(!iso)return"";try{return new Date(iso).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});}catch{return "";}}

  function goToDafYomi() {
    const idx = GEMARA.findIndex(m => m.n === dafYomi.masechet);
    if(idx !== -1) setDetail({cat: 'gemara', idx});
  }

  function goToParasha() {
    if(!shabbatData) return;
    const pName = shabbatData.parasha.replace('פרשת ', '').trim();
    const bookIdx = PARSHIOT.findIndex(book => book.includes(pName));
    if(bookIdx !== -1) {
      setProg(prev => ({...prev, tmode: {...prev.tmode, [bookIdx]: 'parshiot'}}));
      setDetail({cat: 'tanach', idx: bookIdx});
    }
  }

  return (
    <div style={{flex:1,overflow:"auto",background:T.bg}}>
      <div style={{background:`linear-gradient(160deg,#0A1E3A 0%,${NAVY} 60%,#173A5A 100%)`,padding:"22px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,left:-50,width:200,height:200,borderRadius:"50%",border:`1px solid ${GOLD}18`}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:T.f(52),fontWeight:800,color:"#fff",lineHeight:1}}>{hh}:{mm2}</div>
              {today&&<div style={{fontSize:T.f(13),color:GOLD,fontWeight:700,marginTop:3}}>{today}</div>}
              <div style={{fontSize:T.f(11),color:"rgba(255,255,255,0.45)",marginTop:1}}>{now.toLocaleDateString(T.isEn?"en-US":"he-IL",{weekday:"long"})}</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 14px",textAlign:"center",border:`1px solid ${GOLD}33`}}>
              <div style={{display:"flex", justifyContent:"center", color:GOLD, marginBottom:4}}><IcoFlame/></div>
              <div style={{fontSize:T.f(20),fontWeight:900,color:GOLD,lineHeight:1,marginTop:3}}>{streak}</div>
              <div style={{fontSize:T.f(10),color:"rgba(255,255,255,0.6)"}}>{T.isEn?"Day Streak":"ימים רצוף"}</div>
            </div>
          </div>
          <div style={{fontSize:T.f(11),color:"rgba(255,255,255,0.6)",fontStyle:"italic",borderRight:T.isEn?"none":`2px solid ${GOLD}`,borderLeft:T.isEn?`2px solid ${GOLD}`:"none",paddingRight:T.isEn?0:9,paddingLeft:T.isEn?9:0,marginBottom:14,lineHeight:1.5}}>"{quote}"</div>
          
          <div style={{display:"flex", gap:8}}>
            {dafYomi.masechet&&<div onClick={goToDafYomi} style={{flex:1, background:"rgba(255,255,255,0.10)",borderRadius:10,padding:"8px 12px",border:`1px solid rgba(201,168,76,0.3)`, cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(10),color:"rgba(255,255,255,0.6)",marginBottom:2}}><IcoBook/> {T.UI.dafYomi}</div>
              <div style={{fontSize:T.f(14),fontWeight:700,color:"#fff"}}>{dafYomi.masechet} {T.isEn?"Daf":"דף"} {dafYomi.dafHeb}</div>
            </div>}
            
            {shabbatData?.parasha&&<div onClick={goToParasha} style={{flex:1, background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"8px 12px",border:`1px solid rgba(201,168,76,0.2)`, cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(10),color:"rgba(255,255,255,0.6)",marginBottom:2}}><IcoStar/> {T.UI.parasha}</div>
              <div style={{fontSize:T.f(13),fontWeight:600,color:"#fff"}}>{shabbatData.parasha}</div>
            </div>}
          </div>
        </div>
      </div>
      <div style={{padding:"14px 16px 80px"}}>

        {/* Dedication Banner */}
        <div style={{background:T.card,borderRadius:14,padding:"16px",marginBottom:16,border:`1.5px solid ${GOLD}`,boxShadow:T.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:8,color:GOLD,marginBottom:8}}><IcoHeart/><div style={{fontWeight:800,fontSize:T.f(14)}}>{T.UI.dedicate}</div></div>
          <div style={{fontSize:T.f(12),color:T.muted,lineHeight:1.6,marginBottom:12}}>{T.UI.dedicateDesc}</div>
          <a href="mailto:eitanshachor1@gmail.com?subject=%D7%94%D7%A7%D7%93%D7%A9%D7%AA%20%D7%9C%D7%99%D7%9E%D7%95%D7%93" style={{display:"inline-block",padding:"8px 16px",background:T.dark?"rgba(201,168,76,0.15)":"#FBF5E0",color:GOLD,borderRadius:10,textDecoration:"none",fontSize:T.f(12),fontWeight:700}}>{T.UI.submitDedication}</a>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {rows.map(r=>{const p2=pct(r.v,r.tot);return (
            <div key={r.cat} onClick={()=>setTab("library")} style={{background:T.card,borderRadius:14,padding:"13px",boxShadow:T.shadow,cursor:"pointer",borderTop:`3px solid ${cc[r.cat]}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div><div style={{fontSize:T.f(11),color:T.muted,marginBottom:2}}>{r.l}</div><div style={{fontSize:T.f(26),fontWeight:900,color:cc[r.cat]}}>{r.v}</div><div style={{fontSize:T.f(10),color:T.muted}}>{r.unit}</div></div>
                <Ring p={p2} color={cc[r.cat]} size={46} stroke={5} label={`${p2}%`} dark={T.dark}/>
              </div>
              <Bar p={p2} color={cc[r.cat]} h={4} dark={T.dark}/>
            </div>
          );})}
        </div>

        <div style={{background:T.card,borderRadius:14,padding:"13px 14px",marginBottom:14,boxShadow:T.shadow,borderRight:`3px solid ${GOLD}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(11),fontWeight:700,color:GOLD,marginBottom:5}}><IcoScroll/> הלכה יומית</div>
          <div style={{fontSize:T.f(13),color:T.navy,lineHeight:1.6, marginBottom:6}}>{halacha.t}</div>
          <div style={{fontSize:T.f(10),color:T.muted}}>{halacha.s}</div>
        </div>

        {zmanim&&<div style={{background:T.card,borderRadius:14,padding:"13px 14px",marginBottom:14,boxShadow:T.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(11),fontWeight:700,color:T.muted,marginBottom:10}}><IcoClock/> {T.UI.zmanim} ({locName})</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {l:"הנץ החמה",k:"sunrise"},
              {l:"סוף זמ\"ק (מג\"א)",k:"sofZmanShmaMGA"},
              {l:"סוף זמ\"ק (גר\"א)",k:"sofZmanShma"},
              {l:"סוף תפילה (מג\"א)",k:"sofZmanTfillaMGA"},
              {l:"סוף תפילה (גר\"א)",k:"sofZmanTfilla"},
              {l:"חצות",k:"chatzot"}
            ].map(z=>{const t=fmtTime(zmanim.times?.[z.k]);return t?(
              <div key={z.k} style={{background:T.input,borderRadius:8,padding:"6px 8px"}}>
                <div style={{fontSize:T.f(10),color:T.muted}}>{z.l}</div>
                <div style={{fontSize:T.f(13),fontWeight:700,color:T.navy,marginTop:1,direction:"ltr",textAlign:T.isEn?"left":"right"}}>{t}</div>
              </div>):null;})}
          </div>
        </div>}

        {goals.length>0&&(<>
          <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:10}}>{T.UI.activeGoals}</div>
          <div style={{marginBottom:16}}>
            {goals.slice(0,2).map(g=>{
              const isO=g.cat==="other",nm=isO?g.otherName:getBkList(g.cat,prog.custom)[g.idx]?.n||"";
              const cur=isO?0:calcDone(prog,g.cat,g.idx),p2=pct(Math.min(cur,g.target),g.target);
              const rem=Math.max(0,Math.round((new Date(g.deadline)-new Date())/86400000)),col2=cc[g.cat]||T.primary;
              return (
                <div key={g.id} onClick={()=>setTab("goals")} style={{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer",boxShadow:T.shadow,borderRight:`3px solid ${col2}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div><div style={{fontSize:T.f(14),fontWeight:700,color:T.navy}}>{nm}</div><div style={{fontSize:T.f(11),color:T.muted}}>{rem} {T.UI.daysLeft}</div></div>
                    <div style={{fontSize:T.f(22),fontWeight:900,color:col2}}>{p2}%</div>
                  </div>
                  <Bar p={p2} color={col2} h={6} dark={T.dark}/>
                </div>
              );
            })}
          </div>
        </>)}
        
        {activity.length>0&&(<>
          <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:10,marginTop:goals.length>0?4:0}}>{T.UI.recentActivity}</div>
          <div style={{background:T.card,borderRadius:14,padding:"4px 14px",boxShadow:T.shadow}}>
            {activity.slice(0,5).map((a,i)=>{
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<Math.min(activity.length,5)-1?`1px solid ${T.border}`:"none"}}>
                  <div style={{color:cc[a.cat]||T.primary}}><IcoBook/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:T.f(13),fontWeight:600,color:T.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.bk} {a.label ? `- ${a.label}` : ''}</div>
                    <div style={{fontSize:T.f(11),color:T.muted}}>{a.timeStr}</div>
                  </div>
                  <div style={{width:8,height:8,borderRadius:"50%",background:cc[a.cat]||T.primary,flexShrink:0}}/>
                </div>
              );
            })}
          </div>
        </>)}
        {empty&&(<div style={{textAlign:"center",padding:"36px 16px",background:T.card,borderRadius:16,boxShadow:T.shadow,marginTop:16}}>
          <div style={{display:"flex",justifyContent:"center",color:NAVY,marginBottom:12}}><IcoBook/></div>
          <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:8}}>{T.UI.welcome}</div>
          <div style={{fontSize:T.f(14),color:T.muted,lineHeight:1.7}}>{T.UI.startTracking}</div>
          <button onClick={()=>setTab("library")} style={{marginTop:18,padding:"12px 28px",background:T.primary,color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontSize:T.f(15),fontWeight:700,fontFamily:T.font}}>{T.UI.openLib}</button>
        </div>)}
      </div>
    </div>
  );
}

/* ── LIBRARY ── */
function LibraryScreen({prog,T,cc,cl,setProg,setDetail,libCat,setLibCat}){
  const[search,setSearch]=useState("");
  const[custSheet,setCustSheet]=useState(false);
  const[cd,setCd]=useState({name:"",chapters:"",cat:"musar"});
  const allResults=useMemo(()=>{if(!search.trim())return[];return getAllBooks(prog.custom).filter(b=>b.n.includes(search.trim())||b.sub?.includes(search.trim()));},[search,prog.custom]);
  const filtered=useMemo(()=>{if(search.trim())return[];return getBkList(libCat,prog.custom);},[libCat,search,prog.custom]);
  function addCustom(){if(!cd.name||!cd.chapters)return;const lbl={musar:"מוסר",ravKook:"ספרי הראי״ה",machshava:"מחשבה",other:"אישי"}[cd.cat]||"אישי";setProg(prev=>({...prev,custom:[...prev.custom,{name:cd.name,chapters:parseInt(cd.chapters),catLabel:lbl,cat:cd.cat,done:new Set()}]}));setCustSheet(false);setCd({name:"",chapters:"",cat:"musar"});}
  function removeCustom(i){setProg(prev=>{const arr=[...prev.custom];arr.splice(i,1);return{...prev,custom:arr};});}
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`}}>
        <div style={{padding:"14px 16px 0",fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:10}}>{T.UI.library}</div>
        <div style={{padding:"0 16px 10px"}}><FI aria-label="Search" T={T} value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.UI.search}/></div>
        {!search.trim()&&(<div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:12,paddingRight:16,paddingLeft:16,scrollbarWidth:"none"}}>
          {CATS.map(c=><button key={c} onClick={()=>setLibCat(c)} style={{whiteSpace:"nowrap",padding:"7px 15px",borderRadius:20,fontSize:T.f(13),border:`2px solid ${libCat===c?cc[c]:T.border}`,background:libCat===c?cc[c]:"transparent",cursor:"pointer",color:libCat===c?"#fff":T.muted,fontWeight:libCat===c?800:400,flexShrink:0,fontFamily:T.font}}>{T.CAT_L[c]}</button>)}
        </div>)}
      </div>
      <div style={{flex:1,overflow:"auto",padding:"12px 16px 80px"}}>
        {search.trim()?(
          <div>
            {allResults.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:T.f(14)}}>לא נמצאו תוצאות</div>}
            {allResults.length>0&&<div style={{fontSize:T.f(11),color:T.muted,marginBottom:10}}>{allResults.length} תוצאות</div>}
            {allResults.map(bk=>(
              <div key={`${bk.cat}-${bk.i}`}>
                <div style={{fontSize:T.f(10),color:cc[bk.cat]||T.muted,fontWeight:700,marginBottom:3,paddingRight:4}}>{T.CAT_L[bk.cat]}</div>
                <BookCard cat={bk.cat} idx={bk.i} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog.custom}/>
              </div>
            ))}
          </div>
        ):(
          <div>
            {libCat==="custom"&&<button onClick={()=>setCustSheet(true)} style={{width:"100%",padding:13,borderRadius:14,border:`2px dashed ${T.border}`,background:"transparent",cursor:"pointer",color:T.muted,fontSize:T.f(14),marginBottom:10,fontFamily:T.font}}>{T.UI.addBook}</button>}
            {filtered.map(bk=>(
              <div key={bk.i}>
                <BookCard cat={libCat} idx={bk.i} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog.custom}/>
                {libCat==="custom"&&<button onClick={()=>removeCustom(bk.i)} style={{fontSize:T.f(12),color:T.red,background:"none",border:"none",cursor:"pointer",marginTop:-4,marginBottom:8,paddingRight:6,fontFamily:T.font}}>{T.UI.del}</button>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Sheet show={custSheet} onClose={()=>setCustSheet(false)} title={T.UI.addBook} T={T}>
        <FL label={T.UI.book} T={T}><FI aria-label="Book Name" T={T} value={cd.name} onChange={e=>setCd(f=>({...f,name:e.target.value}))}/></FL>
        <FL label={T.UI.perakim} T={T}><FI aria-label="Number of chapters" T={T} type="number" value={cd.chapters} onChange={e=>setCd(f=>({...f,chapters:e.target.value}))}/></FL>
        <FL label={T.UI.topic} T={T}>
          <FS aria-label="Category" T={T} value={cd.cat} onChange={e=>setCd(f=>({...f,cat:e.target.value}))}>
            <option value="musar">מוסר</option><option value="ravKook">ספרי הראי״ה</option>
            <option value="machshava">מחשבה</option><option value="other">אישי / אחר</option>
          </FS>
        </FL>
        <PB T={T} onClick={addCustom} style={{marginTop:6,background:NAVY}}>{T.UI.save}</PB>
      </Sheet>
    </div>
  );
}

/* ── GOALS ── */
function GoalRow({g,prog,T,cc,onDelete,custom}){
  const isO=g.cat==="other",list=isO?[]:getBkList(g.cat,custom);
  const nm=isO?g.otherName:(list[g.idx]?.n||"");if(!nm)return null;
  const cur=isO?0:calcDone(prog,g.cat,g.idx),p=pct(Math.min(cur,g.target),g.target);
  const end=new Date(g.deadline),start=new Date(g.startDate);
  const td=Math.max(1,Math.round((end-start)/86400000)), el=Math.max(0,Math.round((new Date()-start)/86400000)), rem=Math.max(0,Math.round((end-new Date())/86400000));
  const exp=Math.min(100,Math.round(el*100/td));
  const onTrack=isO||p>=exp,needed=(!isO&&rem>0)?Math.ceil((g.target-cur)/rem):0;
  const col=cc[g.cat]||T.primary,hd=hebStr(g.deadline);
  return (
    <div style={{background:T.card,borderRadius:16,padding:"15px 16px",marginBottom:12,boxShadow:T.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div><div style={{fontSize:T.f(16),fontWeight:900,color:T.navy}}>{nm}</div><div style={{fontSize:T.f(11),color:T.muted}}>{isO?"Personal":T.CAT_L[g.cat]}</div></div>
        {!isO&&<span style={{fontSize:T.f(11),padding:"4px 11px",borderRadius:20,background:onTrack?"#DCFCE7":"#FEE2E2",color:onTrack?"#166534":"#B91C1C",fontWeight:800,flexShrink:0}}>{onTrack?T.UI.onTrack:T.UI.behind}</span>}
      </div>
      <Bar p={p} color={col} h={8} dark={T.dark}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:T.f(12),color:T.muted,margin:"6px 0 12px"}}><span>{cur}/{g.target} {isO?"":T.CAT_UNIT[g.cat]}</span><span style={{color:col,fontWeight:800}}>{p}%</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(80px, 1fr))",gap:8,marginBottom:12}}>
        {[{l:T.UI.daysLeft,v:rem},{l:T.UI.perDay,v:(!isO&&needed>0)?needed:"-"},{l:T.UI.currPace,v:isO?"-":`${exp}%`}].map(s=>(
          <div key={s.l} style={{background:T.input,borderRadius:10,padding:"9px 10px"}}><div style={{fontSize:T.f(17),fontWeight:900,color:T.navy}}>{s.v}</div><div style={{fontSize:T.f(10),color:T.muted,marginTop:1}}>{s.l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:T.f(12),color:T.muted}}>
        <div><div>{new Date(g.deadline).toLocaleDateString("he-IL")}</div>{hd&&<div style={{color:col,fontWeight:700,marginTop:2}}>{hd}</div>}</div>
        <button aria-label="Delete goal" onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:T.f(13),fontFamily:T.font}}>{T.UI.del}</button>
      </div>
    </div>
  );
}

function GoalsScreen({goals,setGoals,prog,T,cc}){
  const[showSheet,setShowSheet]=useState(false);
  const[cat,setCat]=useState("gemara");
  const[bookIdx,setBookIdx]=useState("0");
  const[target,setTarget]=useState("");
  const[deadline,setDeadline]=useState("");
  const[otherName,setOtherName]=useState("");

  const bkList=cat==="other"?[]:getBkList(cat,prog.custom);
  const maxTot=cat==="other"?0:bkTotal(cat,parseInt(bookIdx)||0,prog.custom);

  function save(){
    if(!deadline)return;
    if(cat==="other"&&!otherName)return;
    setGoals(prev=>[...prev,{id:Date.now(),cat,idx:parseInt(bookIdx)||0,target:target?parseInt(target):maxTot,deadline,startDate:todayKey(),otherName}]);
    setShowSheet(false);
  }

  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy}}>{T.UI.goals}</div>
        <button onClick={()=>setShowSheet(true)} style={{fontSize:T.f(13),padding:"9px 16px",borderRadius:12,background:T.primary,color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontFamily:T.font}}>{T.UI.newGoal}</button>
      </div>
      {goals.length===0&&(
        <div style={{textAlign:"center",padding:"50px 16px",background:T.card,borderRadius:16,boxShadow:T.shadow}}>
          <div style={{display:"flex",justifyContent:"center",color:NAVY,marginBottom:14}}><IcoStar/></div>
          <div style={{fontSize:T.f(17),fontWeight:900,color:T.navy,marginBottom:8}}>{T.UI.noGoals}</div>
          <div style={{fontSize:T.f(14),color:T.muted,lineHeight:1.7}}>{T.UI.setGoal}</div>
          <button onClick={()=>setShowSheet(true)} style={{marginTop:16,padding:"11px 24px",background:T.primary,color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontSize:T.f(14),fontWeight:700,fontFamily:T.font}}>{T.UI.firstGoal}</button>
        </div>
      )}
      <div>
        {goals.map(g=><GoalRow key={g.id} g={g} prog={prog} T={T} cc={cc} onDelete={()=>setGoals(prev=>prev.filter(x=>x.id!==g.id))} custom={prog.custom}/>)}
      </div>
      <Sheet show={showSheet} onClose={()=>setShowSheet(false)} title={T.UI.newGoal} T={T}>
        <FL label={T.UI.topic} T={T}>
          <FS aria-label="Select Category" T={T} value={cat} onChange={e=>{setCat(e.target.value);setBookIdx("0");setTarget("");}}>
            {CATS.map(c=><option key={c} value={c}>{T.CAT_L[c]}</option>)}
          </FS>
        </FL>
        {cat!=="other"&&bkList.length>0&&<FL label={T.UI.book} T={T}><FS aria-label="Select Book" T={T} value={bookIdx} onChange={e=>{setBookIdx(e.target.value);setTarget("");}}>{bkList.map(b=><option key={b.i} value={b.i}>{b.n}</option>)}</FS></FL>}
        <FL label={`${T.UI.target} ${maxTot>0?`(${T.UI.max||"Max"}: ${maxTot})`:""}`} T={T}>
          <FI aria-label="Target" T={T} type="number" value={target} onChange={e=>setTarget(e.target.value)} placeholder={maxTot>0?`${maxTot} (Leave empty for full)`:""}/>
        </FL>
        <FL label={T.UI.deadline} T={T}><DualDateInput T={T} value={deadline} onChange={e=>setDeadline(e.target.value)}/></FL>
        <div style={{marginTop:16}}><PB T={T} onClick={save} style={{background:NAVY}}>{T.UI.saveGoal}</PB></div>
      </Sheet>
    </div>
  );
}

/* ── STATS ── */
function StatsScreen({prog,activity,activeDays,T,cc,streak}){
  const S=useMemo(()=>({
    dapim:GEMARA.reduce((s,_,i)=>s+calcDone(prog,"gemara",i),0),
    mishna:MISHNA.reduce((s,_,i)=>s+calcDone(prog,"mishna",i),0),
    tanach:TANACH.reduce((s,_,i)=>s+calcDone(prog,"tanach",i),0),
  }),[prog]);
  
  const A=useMemo(()=>{
    const now = new Date();
    const w = activity.filter(a => (now - new Date(a.date)) < 7*86400000).length;
    const m = activity.filter(a => (now - new Date(a.date)) < 30*86400000).length;
    const y = activity.filter(a => (now - new Date(a.date)) < 365*86400000).length;
    return {w, m, y};
  },[activity]);

  const maxStreak = useMemo(() => {
    if(!activeDays || !activeDays.length) return 0;
    let max = 0;
    let current = 1;
    const sorted = [...activeDays].sort();
    for(let i=1; i<sorted.length; i++) {
        const prevDate = new Date(sorted[i-1]);
        const currDate = new Date(sorted[i]);
        const diff = (currDate - prevDate) / 86400000;
        if(diff === 1) current++;
        else if (diff > 1) current = 1;
        if(current > max) max = current;
    }
    return Math.max(max, streak);
  }, [activeDays, streak]);

  const rows=[
    {cat:"gemara",l:T.CAT_L.gemara,dn:S.dapim,tot:TOTAL_DAPIM,unit:T.CAT_UNIT.gemara},
    {cat:"mishna",l:T.CAT_L.mishna,dn:S.mishna,tot:MISHNA.reduce((s,_,i)=>s+totalMs(i),0),unit:T.CAT_UNIT.mishna},
    {cat:"tanach",l:T.CAT_L.tanach,dn:S.tanach,tot:TANACH.reduce((s,t)=>s+t.c,0),unit:T.CAT_UNIT.tanach},
  ];

  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy}}>{T.UI.stats}</div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20}}>
         <div style={{flex:1, background:T.card,borderRadius:16,padding:"16px",boxShadow:T.shadow, border:`2px solid ${GOLD}44`, textAlign:"center"}}>
            <div style={{fontSize:T.f(32),fontWeight:900,color:GOLD}}>{streak}</div>
            <div style={{fontSize:T.f(12),color:T.muted,fontWeight:600}}>{T.isEn?"Current Streak":"רצף נוכחי"}</div>
         </div>
         <div style={{flex:1, background:T.card,borderRadius:16,padding:"16px",boxShadow:T.shadow, textAlign:"center"}}>
            <div style={{fontSize:T.f(32),fontWeight:900,color:T.primary}}>{maxStreak}</div>
            <div style={{fontSize:T.f(12),color:T.muted,fontWeight:600}}>{T.isEn?"Max Streak":"שיא כל הזמנים"}</div>
         </div>
      </div>

      <div style={{background:T.card,borderRadius:16,padding:"16px",marginBottom:20,boxShadow:T.shadow}}>
        <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:12}}>מד מהירות למידה (סעיפים)</div>
        <div style={{display:"flex",gap:10}}>
          {[{l:"השבוע",v:A.w},{l:"החודש",v:A.m},{l:"השנה",v:A.y}].map(s=>(
            <div key={s.l} style={{flex:1,background:T.input,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:T.f(22),fontWeight:900,color:T.primary}}>{s.v}</div>
              <div style={{fontSize:T.f(11),color:T.muted,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[{l:T.CAT_UNIT.gemara,v:S.dapim,c:cc.gemara},{l:T.CAT_UNIT.mishna,v:S.mishna,c:cc.mishna},{l:T.CAT_UNIT.tanach,v:S.tanach,c:cc.tanach}].map(s=>(
          <div key={s.l} style={{background:T.card,borderRadius:14,padding:"12px 10px",boxShadow:T.shadow,textAlign:"center"}}>
            <div style={{fontSize:T.f(22),fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:T.f(10),color:T.muted,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      
      <div>
        {rows.map(x=>(
          <div key={x.cat} style={{background:T.card,borderRadius:14,padding:"13px 15px",marginBottom:10,boxShadow:T.shadow}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
              <div><div style={{fontSize:T.f(15),fontWeight:700,color:T.navy}}>{x.l}</div></div>
              <div style={{textAlign:T.isEn?"right":"left"}}><div style={{fontSize:T.f(18),fontWeight:900,color:cc[x.cat]}}>{pct(x.dn,x.tot)}%</div><div style={{fontSize:T.f(11),color:T.muted}}>{x.dn}/{x.tot} {x.unit}</div></div>
            </div>
            <Bar p={pct(x.dn,x.tot)} color={cc[x.cat]} h={8} dark={T.dark}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SETTINGS ── */
function SettingsScreen({sett,setSett,T,onLogout,user}){
  const[legalType, setLegalType] = useState(null);

  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:20}}>{T.UI.settings}</div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5}}>{T.UI.appearance}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div><div style={{fontSize:T.f(14),fontWeight:600,color:T.navy}}>{T.UI.darkMode}</div><div style={{fontSize:T.f(11),color:T.muted}}>{T.UI.darkSub}</div></div>
          <Toggle on={sett.dark} onToggle={()=>setSett(s=>({...s,dark:!s.dark}))} primary={T.primary}/>
        </div>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:T.f(14),fontWeight:600,color:T.navy,marginBottom:10}}>{T.UI.fontSize}</div>
          <div style={{display:"flex",gap:8}}>{[{v:0,l:T.UI.small},{v:1,l:T.UI.medium},{v:2,l:T.UI.large}].map(o=><button aria-pressed={sett.fontSize===o.v} key={o.v} onClick={()=>setSett(s=>({...s,fontSize:o.v}))} style={{flex:1,padding:9,borderRadius:10,border:`2px solid ${sett.fontSize===o.v?T.primary:T.border}`,background:sett.fontSize===o.v?T.primary:"transparent",color:sett.fontSize===o.v?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:sett.fontSize===o.v?700:400,fontFamily:T.font}}>{o.l}</button>)}</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <div style={{fontSize:T.f(14),fontWeight:600,color:T.navy,marginBottom:10}}>{T.UI.language}</div>
          <div style={{display:"flex",gap:8}}>{[{v:"he",l:"עברית"},{v:"en",l:"English"}].map(o=><button aria-pressed={sett.lang===o.v} key={o.v} onClick={()=>setSett(s=>({...s,lang:o.v}))} style={{flex:1,padding:9,borderRadius:10,border:`2px solid ${sett.lang===o.v?T.primary:T.border}`,background:sett.lang===o.v?T.primary:"transparent",color:sett.lang===o.v?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:sett.lang===o.v?700:400,fontFamily:T.font}}>{o.l}</button>)}</div>
        </div>
      </div>

      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5}}>AI INTEGRATION (ChatGPT)</div>
        <div style={{padding:"14px 16px"}}>
           <div style={{fontSize:T.f(12), color:T.muted, marginBottom:8, lineHeight:1.5}}>
             {T.isEn ? "Enter your OpenAI API key to get summaries and quizzes directly inside the app. If left blank, we will generate the prompt and open ChatGPT for you." : "הכנס מפתח API של OpenAI כדי לקבל סיכומים וחידונים ישירות בתוך האפליקציה. אם תשאיר ריק, נייצר עבורך את השאלה המושלמת ונפתח את ChatGPT."}
           </div>
           <FI type="password" placeholder="sk-..." value={sett.openAiKey || ""} onChange={e=>setSett(s=>({...s, openAiKey:e.target.value}))} style={{direction:"ltr", fontSize:T.f(12)}} />
        </div>
      </div>
      
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5}}>{T.UI.legal}</div>
        <div style={{padding:"14px 16px", borderBottom:`1px solid ${T.border}`}}>
          <button onClick={()=>setLegalType('terms')} style={{background:"none",border:"none",cursor:"pointer",color:T.navy,fontSize:T.f(14),fontWeight:600,fontFamily:T.font,padding:0, width:"100%", textAlign:"start"}}>{T.UI.terms}</button>
        </div>
        <div style={{padding:"14px 16px"}}>
          <button onClick={()=>setLegalType('privacy')} style={{background:"none",border:"none",cursor:"pointer",color:T.navy,fontSize:T.f(14),fontWeight:600,fontFamily:T.font,padding:0, width:"100%", textAlign:"start"}}>{T.UI.privacy}</button>
        </div>
      </div>

      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5}}>{T.UI.account}</div>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:T.f(14),fontWeight:700,color:T.navy}}>{user?.name||"משתמש"}</div>
          <div style={{fontSize:T.f(12),color:T.muted,marginTop:2}}>{user?.email||""}</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:T.f(14),fontWeight:700,fontFamily:T.font,padding:0}}>{T.UI.signOut}</button>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:T.f(11),color:T.muted,lineHeight:2,marginTop:24}}>
        <div style={{fontWeight:800,color:T.gold||GOLD,fontSize:T.f(14)}}>Torah Track</div>
      </div>
      <LegalSheet show={!!legalType} onClose={()=>setLegalType(null)} type={legalType} T={T} />
    </div>
  );
}

/* ── INSTALL GUIDE COMPONENT ── */
function InstallGuide({ T, onClose }) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(navigator.userAgent);

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"flex-end", zIndex:9999}}>
      <div style={{background:T.card, width:"100%", padding:"24px 20px 40px", borderRadius:"24px 24px 0 0", boxSizing:"border-box", textAlign:"center", animation:"slideUp 0.3s ease-out"}}>
        <div style={{width:40, height:5, background:T.border, borderRadius:10, margin:"0 auto 20px"}}/>
        <div style={{display:"flex", justifyContent:"center", color:T.gold||GOLD, marginBottom:16}}><IcoStar /></div>
        <h2 style={{margin:"0 0 12px 0", fontSize:T.f(20), color:T.navy}}>התקן כאפליקציה</h2>
        <p style={{margin:"0 0 24px 0", fontSize:T.f(14), color:T.muted, lineHeight:1.5}}>
          הוסף את Torah Track למסך הבית שלך לחוויה מהירה וחלקה יותר, בדיוק כמו אפליקציה רגילה.
        </p>
        
        <div style={{background:T.input, padding:"16px", borderRadius:12, marginBottom:24, textAlign:T.isEn?"left":"right"}}>
          {isIOS ? (
            <div style={{fontSize:T.f(14), color:T.navy}}>
              <div style={{marginBottom:12}}>1. בתחתית המסך, לחץ על סמל השיתוף ⍐</div>
              <div>2. גלול למטה ובחר <strong>"הוסף למסך הבית"</strong> ➕</div>
            </div>
          ) : isAndroid ? (
            <div style={{fontSize:T.f(14), color:T.navy}}>
              <div style={{marginBottom:12}}>1. למעלה בדפדפן, לחץ על תפריט הנקודות ⋮</div>
              <div>2. בחר <strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong></div>
            </div>
          ) : (
            <div style={{fontSize:T.f(14), color:T.navy}}>
              <div style={{marginBottom:12}}>1. לחץ על תפריט הדפדפן ⋮</div>
              <div>2. בחר <strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong></div>
            </div>
          )}
        </div>
        
        <button onClick={onClose} style={{background:T.primary, color:"white", border:"none", padding:"14px", width:"100%", borderRadius:12, fontSize:T.f(15), fontWeight:700, cursor:"pointer"}}>
          הבנתי, תודה
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ── AUTH SCREEN ── */
function AuthScreen({onLogin,T}){
  const[mode,setMode]=useState("choose"); 
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[agree,setAgree]=useState(false);
  const[legalType,setLegalType]=useState(null);

  function loginEmail(){
    if(!email.trim()||!pass.trim()){setErr(T.isEn?"Please fill all fields":"נא למלא אימייל וסיסמה");return;}
    onLogin({name:email.split("@")[0],email,method:"email", pass});
  }
  function register(){
    if(!name.trim()||!email.trim()||!pass.trim()){setErr(T.isEn?"Please fill all fields":"נא למלא את כל השדות");return;}
    if(!agree){setErr(T.UI.mustAgree);return;}
    onLogin({name,email,method:"register", pass});
  }
  function googleLogin(){
    onLogin({method:"google"});
  }

  if(mode==="choose") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:20,background:T.bg}}>
      <div style={{width:100,height:100,background:`linear-gradient(145deg,${NAVY},#0A1E3A)`,borderRadius:32,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 12px 40px rgba(26,58,107,0.5)`,border:`2px solid ${GOLD}44`}}><IcoBook/></div>
      <div style={{textAlign:"center", marginBottom:20}}>
        <div style={{fontSize:T.f(32),fontWeight:900,color:T.navy,marginBottom:4}}>Torah Track</div>
      </div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={googleLogin} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",borderRadius:14,border:`1.5px solid ${T.border}`,background:T.card,cursor:"pointer",fontSize:T.f(15),fontWeight:700,color:T.navy,fontFamily:T.font}}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {T.UI.continueWith} Google
        </button>
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"4px 0"}}><div style={{flex:1,height:1,background:T.border}}/><span style={{fontSize:T.f(12),color:T.muted}}>{T.UI.or}</span><div style={{flex:1,height:1,background:T.border}}/></div>
        <button onClick={()=>setMode("email")} style={{padding:"13px 20px",borderRadius:14,border:`1.5px solid ${T.border}`,background:T.card,cursor:"pointer",fontSize:T.f(15),fontWeight:600,color:T.navy,fontFamily:T.font}}>
          📧 {T.UI.login}
        </button>
        <button onClick={()=>setMode("register")} style={{padding:"11px",borderRadius:14,border:"none",background:"transparent",cursor:"pointer",fontSize:T.f(13),color:T.muted,fontFamily:T.font}}>
          {T.UI.newAccount}
        </button>
      </div>
      {err&&<div style={{color:T.red,fontSize:T.f(13),marginTop:12,textAlign:"center"}}>{err}</div>}
      
      <div style={{marginTop:24, textAlign:"center", fontSize:T.f(11), color:T.muted, display:"flex", gap:12}}>
        <button onClick={()=>setLegalType('terms')} style={{background:"none", border:"none", textDecoration:"underline", color:T.muted, cursor:"pointer", fontFamily:T.font}}>{T.UI.terms}</button>
        <button onClick={()=>setLegalType('privacy')} style={{background:"none", border:"none", textDecoration:"underline", color:T.muted, cursor:"pointer", fontFamily:T.font}}>{T.UI.privacy}</button>
      </div>
      <LegalSheet show={!!legalType} onClose={()=>setLegalType(null)} type={legalType} T={T} />
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:28,background:T.bg}}>
      <button aria-label="Go Back" onClick={()=>{setMode("choose");setErr("");}} style={{alignSelf:"flex-start",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:T.f(13),marginBottom:20,fontFamily:T.font,display:"flex",alignItems:"center",gap:4}}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={T.isEn?"15 18 9 12 15 6":"9 18 15 12 9 6"}/></svg> {T.isEn?"Back":"חזרה"}
      </button>
      <div style={{fontSize:T.f(22),fontWeight:900,color:T.navy,marginBottom:6}}>{mode==="email"?T.UI.login:T.UI.register}</div>
      <FL label={T.UI.email} T={T}><FI aria-label="Email" T={T} type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{direction:"ltr"}}/></FL>
      <FL label={T.UI.password} T={T}><FI aria-label="Password" T={T} type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{direction:"ltr"}}/></FL>
      
      {mode==="register"&&(
        <>
          <FL label={T.UI.name} T={T}><FI aria-label="Full Name" T={T} value={name} onChange={e=>setName(e.target.value)}/></FL>
          <label style={{display:"flex", alignItems:"flex-start", gap:8, marginBottom:16, cursor:"pointer"}}>
            <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} style={{marginTop:4}} />
            <span style={{fontSize:T.f(12), color:T.muted, lineHeight:1.4}}>
              {T.UI.agreeTerms} 
              <span onClick={(e)=>{e.preventDefault(); setLegalType('terms');}} style={{color:T.primary, textDecoration:"underline", margin:"0 4px"}}>{T.UI.terms}</span>
              ו-<span onClick={(e)=>{e.preventDefault(); setLegalType('privacy');}} style={{color:T.primary, textDecoration:"underline", margin:"0 4px"}}>{T.UI.privacy}</span>.
            </span>
          </label>
        </>
      )}
      
      {err&&<div style={{color:T.red,fontSize:T.f(13),marginBottom:12,textAlign:"center", fontWeight:600}}>{err}</div>}
      <PB T={T} onClick={mode==="email"?loginEmail:register}>{mode==="email"?T.UI.login:T.UI.register}</PB>
      <LegalSheet show={!!legalType} onClose={()=>setLegalType(null)} type={legalType} T={T} />
    </div>
  );
}

/* ── ROOT ── */
export default function App(){
  useEffect(()=>{if(!document.getElementById("hf")){const l=document.createElement("link");l.id="hf";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap";document.head.appendChild(l);}},[]);

  const[user,setUser]=useState(null);
  const[tab,setTab]=useState("home");
  const[libCat,setLibCat]=useState("gemara");
  const[detail,setDetail]=useState(null);
  const[sett,setSett]=useState({dark:false,fontSize:1,lang:"he"});
  const[prog,setProg]=useState(IP);
  const[goals,setGoals]=useState([]);
  const[activity,setActivity]=useState([]);
  const[activeDays,setActiveDays]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[showInstallPrompt, setShowInstallPrompt]=useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasSeenPrompt = localStorage.getItem('hideInstallGuide');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && !isStandalone && !hasSeenPrompt) {
        const timer = setTimeout(() => setShowInstallPrompt(true), 3500);
        return () => clearTimeout(timer);
    }
  }, []);

  function handleCloseInstallPrompt() {
      localStorage.setItem('hideInstallGuide', '1');
      setShowInstallPrompt(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ 
          uid: currentUser.uid, 
          email: currentUser.email, 
          name: currentUser.displayName || currentUser.email.split('@')[0] 
        });
        try {
          const docSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.prog) setProg(desProg(data.prog));
            if (data.goals) setGoals(data.goals);
            if (data.sett) setSett(data.sett);
            if (data.activity) setActivity(data.activity);
            if (data.activeDays) setActiveDays(data.activeDays);
          }
        } catch (e) { console.error("Error fetching data:", e); }
        setLoaded(true);
      } else {
        setUser(null);
        setLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loaded || !user) return;
    const timeoutId = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), {
        prog: serProg(prog),
        goals,
        sett,
        activity: activity.slice(0, 50),
        activeDays: activeDays.slice(-60)
      }, { merge: true }).catch(e => console.error("Save error", e));
    }, 2000); 
    return () => clearTimeout(timeoutId);
  }, [prog, goals, sett, activity, activeDays, loaded, user]);

  const streak=useMemo(()=>{
    if(!activeDays.length)return 0;
    const sorted=[...activeDays].sort().reverse();
    const td=todayKey();
    const yd=new Date();yd.setDate(yd.getDate()-1);const ydStr=yd.toISOString().slice(0,10);
    if(sorted[0]!==td&&sorted[0]!==ydStr)return 0;
    let count=1,cur=new Date(sorted[0]);
    for(let i=1;i<sorted.length;i++){const prev=new Date(cur);prev.setDate(prev.getDate()-1);if(sorted[i]===prev.toISOString().slice(0,10)){count++;cur=prev;}else break;}
    return count;
  },[activeDays]);

  const T=useMemo(()=>mkT(sett.dark,sett.fontSize,sett.lang||"he"),[sett.dark,sett.fontSize,sett.lang]);
  const cc=sett.dark?CC_D:CC_L;
  const cl=sett.dark?CL_D:CL_L;
  
  // חזרנו לעיצוב הבסיסי והיציב!
  const appSt={direction:T.isEn?"ltr":"rtl",fontFamily:T.font,maxWidth:480, margin:"0 auto", minHeight:"100vh", width:"100%", display:"flex",flexDirection:"column",background:T.bg,color:T.navy,boxSizing:"border-box", position:"relative"};

  async function handleLogin(credentials) {
    try {
      if (credentials.method === "email") {
        await signInWithEmailAndPassword(auth, credentials.email, credentials.pass);
      } else if (credentials.method === "register") {
        await createUserWithEmailAndPassword(auth, credentials.email, credentials.pass);
      } else if (credentials.method === "google") {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
    } catch (e) {
      console.error(e);
      alert("שגיאה בהתחברות: " + e.message);
    }
  }

  function handleLogout(){signOut(auth);setTab("home");}

  if(!user)return <div style={appSt}><AuthScreen onLogin={handleLogin} T={T}/></div>;
  if(detail)return <div style={appSt}><DetailScreen detail={detail} prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} goBack={()=>setDetail(null)} onActivity={(item)=>{
    const now=new Date();
    const timeStr=now.toLocaleDateString("he-IL",{day:"numeric",month:"numeric"})+' '+now.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
    const date=todayKey();
    setActivity(prev=>[{...item,timeStr,date},...prev].slice(0,50));
    setActiveDays(prev=>{if(prev.includes(date))return prev;return [...prev,date].slice(-60);});
  }}/></div>;

  const NAV=[
    {k:"home",l:T.UI.home,ico:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>},
    {k:"library",l:T.UI.library,ico:<IcoBook/>},
    {k:"ai",l:T.UI.ai,ico:<IcoAI/>},
    {k:"goals",l:T.UI.goals,ico:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>},
    {k:"stats",l:T.UI.stats,ico:<IcoStats/>},
    {k:"settings",l:T.UI.settings,ico:<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>},
  ];

  return (
    <div style={appSt}>
      {tab==="home"&&<HomeScreen prog={prog} goals={goals} T={T} cc={cc} setTab={setTab} setDetail={setDetail} setProg={setProg} streak={streak} activity={activity}/>}
      {tab==="library"&&<LibraryScreen prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} setDetail={setDetail} libCat={libCat} setLibCat={setLibCat}/>}
      {tab==="ai"&&<AiScreen activity={activity} T={T} sett={sett} />}
      {tab==="goals"&&<GoalsScreen goals={goals} setGoals={setGoals} prog={prog} T={T} cc={cc}/>}
      {tab==="stats"&&<StatsScreen prog={prog} activity={activity} activeDays={activeDays} T={T} cc={cc} streak={streak}/>}
      {tab==="settings"&&<SettingsScreen sett={sett} setSett={setSett} T={T} onLogout={handleLogout} user={user}/>}
      <div style={{background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",position:"sticky",bottom:0,zIndex:10}}>
        {NAV.map(it=>(
          <button aria-label={it.l} key={it.k} onClick={()=>setTab(it.k)} style={{flex:1,padding:"9px 2px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontSize:T.f(9),color:tab===it.k?T.gold||GOLD:T.muted,border:"none",background:"none",cursor:"pointer",fontWeight:tab===it.k?800:400,fontFamily:T.font}}>
            {it.ico}{it.l}
          </button>
        ))}
      </div>
      {showInstallPrompt && <InstallGuide T={T} onClose={handleCloseInstallPrompt} />}
    </div>
  );
}