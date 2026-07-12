import React, { useState, useMemo, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  OAuthProvider, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics blocked in this environment");
  analytics = null;
}
const auth = getAuth(app);
const db = getFirestore(app);
const IP = { gemara: {}, mishna: {}, tanach: {}, tanach_parshiot: {}, tmode: {}, musar: {}, ravKook: {}, machshava: {}, custom: [], notes: {}, chazara: {} };

/* ── ICONS & LOGO ── */
const IcoBook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IcoFlame = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IcoStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoScroll = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4c0-1.1.9-2 2-2"/><path d="M20 2c1.1 0 2 .9 2 2"/><path d="M22 8v12c0 1.1-.9 2-2 2"/><path d="M16 22c-1.1 0-2-.9-2-2"/><path d="M14 22c0 1.1-.9 2-2 2"/><path d="M8 24c-1.1 0-2-.9-2-2"/><path d="M2 22V10c0-1.1.9-2 2-2"/><path d="M8 8c1.1 0 2-.9 2-2"/><path d="M10 4c0-1.1-.9-2-2-2"/><path d="M4 2c-1.1 0-2 .9-2 2"/><path d="M4 4h16"/><path d="M4 8h16"/><path d="M4 22h16"/></svg>;
const IcoHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IcoCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoDots = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const IcoEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;

const LogoAliba = ({T, size=48}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={T.gold||"#C9A84C"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={T.dark?"rgba(201,168,76,0.15)":"rgba(201,168,76,0.2)"}/>
    <path d="M12 6v14" strokeDasharray="2 2" opacity="0.5"/>
  </svg>
);

/* ── DATE HELPERS ── */
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
    const pp = new Intl.DateTimeFormat("he-u-ca-hebrew", {day:"numeric",month:"long",year:"numeric"}).formatToParts(d||new Date());
    const dayN = parseInt(pp.find(p=>p.type==="day")?.value?.replace(/\D/g,"")||0);
    const monS = pp.find(p=>p.type==="month")?.value||"";
    const yearN = parseInt(pp.find(p=>p.type==="year")?.value?.replace(/\D/g,"")||0)%1000;
    return `${addGeresh(toHeb(dayN))} ב${monS} ${addGeresh(toHeb(yearN))}`;
  } catch { return ""; }
}
function hebStr(s) { return s ? hebDateFull(new Date(s+"T12:00:00")) : ""; }
function todayKey() { return new Date().toISOString().slice(0,10); }

/* ── DATA ARRAYS ── */
const DAF_YOMI_MASECHTOS = [{n:"ברכות",d:63},{n:"שבת",d:156},{n:"עירובין",d:104},{n:"פסחים",d:120},{n:"שקלים",d:21},{n:"יומא",d:87},{n:"סוכה",d:55},{n:"ביצה",d:39},{n:"ראש השנה",d:34},{n:"תענית",d:30},{n:"מגילה",d:31},{n:"מועד קטן",d:28},{n:"חגיגה",d:26},{n:"יבמות",d:121},{n:"כתובות",d:111},{n:"נדרים",d:90},{n:"נזיר",d:65},{n:"סוטה",d:48},{n:"גיטין",d:89},{n:"קידושין",d:81},{n:"בבא קמא",d:118},{n:"בבא מציעא",d:118},{n:"בבא בתרא",d:175},{n:"סנהדרין",d:112},{n:"מכות",d:23},{n:"שבועות",d:48},{n:"עבודה זרה",d:75},{n:"הוריות",d:13},{n:"זבחים",d:119},{n:"מנחות",d:109},{n:"חולין",d:141},{n:"בכורות",d:60},{n:"ערכין",d:33},{n:"תמורה",d:33},{n:"כריתות",d:27},{n:"מעילה",d:37},{n:"נידה",d:72}];
const TOTAL_DAPIM = 2711;

function getDafYomi() {
  const now = new Date();
  const nowIL = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const today = Date.UTC(nowIL.getFullYear(), nowIL.getMonth(), nowIL.getDate());
  const start = Date.UTC(2020, 0, 5); 
  let dayN = Math.floor((today - start) / 86400000) % TOTAL_DAPIM;
  if(dayN < 0) dayN += TOTAL_DAPIM;
  let rem = dayN; let mas = "", daf = 2;
  for(const m of DAF_YOMI_MASECHTOS) {
    if(rem < m.d) { mas = m.n; daf = rem + 2; break; }
    rem -= m.d;
  }
  return { masechet: mas, daf, dafHeb: toHeb(daf) };
}

const TANACH = [{b:"בראשית",s:"תורה",c:50},{b:"שמות",s:"תורה",c:40},{b:"ויקרא",s:"תורה",c:27},{b:"במדבר",s:"תורה",c:36},{b:"דברים",s:"תורה",c:34},{b:"יהושע",s:"נביאים",c:24},{b:"שופטים",s:"נביאים",c:21},{b:"שמואל א",s:"נביאים",c:31},{b:"שמואל ב",s:"נביאים",c:24},{b:"מלכים א",s:"נביאים",c:22},{b:"מלכים ב",s:"נביאים",c:25},{b:"ישעיהו",s:"נביאים",c:66},{b:"ירמיהו",s:"נביאים",c:52},{b:"יחזקאל",s:"נביאים",c:48},{b:"הושע",s:"נביאים",c:14},{b:"יואל",s:"נביאים",c:4},{b:"עמוס",s:"נביאים",c:9},{b:"עובדיה",s:"נביאים",c:1},{b:"יונה",s:"נביאים",c:4},{b:"מיכה",s:"נביאים",c:7},{b:"נחום",s:"נביאים",c:3},{b:"חבקוק",s:"נביאים",c:3},{b:"צפניה",s:"נביאים",c:3},{b:"חגי",s:"נביאים",c:2},{b:"זכריה",s:"נביאים",c:14},{b:"מלאכי",s:"נביאים",c:3},{b:"תהלים",s:"כתובים",c:150},{b:"משלי",s:"כתובים",c:31},{b:"איוב",s:"כתובים",c:42},{b:"שיר השירים",s:"כתובים",c:8},{b:"רות",s:"כתובים",c:4},{b:"איכה",s:"כתובים",c:5},{b:"קהלת",s:"כתובים",c:12},{b:"אסתר",s:"כתובים",c:10},{b:"דניאל",s:"כתובים",c:12},{b:"עזרא",s:"כתובים",c:10},{b:"נחמיה",s:"כתובים",c:13},{b:"דברי הימים א",s:"כתובים",c:29},{b:"דברי הימים ב",s:"כתובים",c:36}];
const PARASHA_CHAPTERS = {"בראשית":[1,2,3,4,5,6],"נח":[6,7,8,9,10,11],"לך לך":[12,13,14,15,16,17],"וירא":[18,19,20,21,22],"חיי שרה":[23,24,25],"תולדות":[25,26,27,28],"ויצא":[28,29,30,31,32],"וישלח":[32,33,34,35,36],"וישב":[37,38,39,40],"מקץ":[41,42,43,44],"ויגש":[44,45,46,47],"ויחי":[47,48,49,50],"שמות":[1,2,3,4,5,6],"וארא":[6,7,8,9],"בא":[10,11,12,13],"בשלח":[13,14,15,16,17],"יתרו":[18,19,20],"משפטים":[21,22,23,24],"תרומה":[25,26,27],"תצוה":[27,28,29,30],"כי תשא":[30,31,32,33,34],"ויקהל":[35,36,37,38],"פקודי":[38,39,40],"ויקרא":[1,2,3,4,5],"צו":[6,7,8],"שמיני":[9,10,11],"תזריע":[12,13],"מצורע":[14,15],"אחרי מות":[16,17,18],"קדושים":[19,20],"אמור":[21,22,23,24],"בהר":[25,26],"בחוקותי":[26,27],"במדבר":[1,2,3,4],"נשא":[4,5,6,7],"בהעלותך":[8,9,10,11,12],"שלח":[13,14,15],"קרח":[16,17,18],"חקת":[19,20,21],"בלק":[22,23,24,25],"פינחס":[25,26,27,28,29,30],"מטות":[30,31,32],"מסעי":[33,34,35,36],"דברים":[1,2,3],"ואתחנן":[3,4,5,6,7],"עקב":[7,8,9,10,11],"ראה":[11,12,13,14,15,16],"שופטים":[16,17,18,19,20,21],"כי תצא":[21,22,23,24,25],"כי תבוא":[26,27,28,29],"נצבים":[29,30],"וילך":[31],"האזינו":[32],"וזאת הברכה":[33,34]};
const PARSHIOT = [["בראשית","נח","לך לך","וירא","חיי שרה","תולדות","ויצא","וישלח","וישב","מקץ","ויגש","ויחי"],["שמות","וארא","בא","בשלח","יתרו","משפטים","תרומה","תצוה","כי תשא","ויקהל","פקודי"],["ויקרא","צו","שמיני","תזריע","מצורע","אחרי מות","קדושים","אמור","בהר","בחוקותי"],["במדבר","נשא","בהעלותך","שלח","קרח","חקת","בלק","פינחס","מטות","מסעי"],["דברים","ואתחנן","עקב","ראה","שופטים","כי תצא","כי תבוא","נצבים","וילך","האזינו","וזאת הברכה"]];
const PARASHA_VERSES = {"בראשית":146,"נח":153,"לך לך":126,"וירא":147,"חיי שרה":105,"תולדות":106,"ויצא":148,"וישלח":154,"וישב":112,"מקץ":146,"ויגש":106,"ויחי":85,"שמות":124,"וארא":121,"בא":105,"בשלח":116,"יתרו":72,"משפטים":118,"תרומה":96,"תצוה":101,"כי תשא":139,"ויקהל":122,"פקודי":92,"ויקרא":111,"צו":97,"שמיני":91,"תזריע":67,"מצורע":90,"אחרי מות":80,"קדושים":64,"אמור":106,"בהר":57,"בחוקותי":78,"במדבר":159,"נשא":176,"בהעלותך":136,"שלח":119,"קרח":95,"חקת":87,"בלק":104,"פינחס":168,"מטות":112,"מסעי":132,"דברים":105,"ואתחנן":122,"עקב":111,"ראה":126,"שופטים":97,"כי תצא":110,"כי תבוא":122,"נצבים":40,"וילך":30,"האזינו":52,"וזאת הברכה":41};

const PARASHA_MAP = {
  "בראשית": "Parashat_Bereshit", "נח": "Parashat_Noach", "לך לך": "Parashat_Lekh_Lekha", "וירא": "Parashat_Vayera", "חיי שרה": "Parashat_Chayei_Sara", "תולדות": "Parashat_Toldot", "ויצא": "Parashat_Vayetzei", "וישלח": "Parashat_Vayishlach", "וישב": "Parashat_Vayeshev", "מקץ": "Parashat_Miketz", "ויגש": "Parashat_Vayigash", "ויחי": "Parashat_Vayechi",
  "שמות": "Parashat_Shemot", "וארא": "Parashat_Vaera", "בא": "Parashat_Bo", "בשלח": "Parashat_Beshalach", "יתרו": "Parashat_Yitro", "משפטים": "Parashat_Mishpatim", "תרומה": "Parashat_Terumah", "תצוה": "Parashat_Tetzaveh", "כי תשא": "Parashat_Ki_Tisa", "ויקהל": "Parashat_Vayakhel", "פקודי": "Parashat_Pekudei",
  "ויקרא": "Parashat_Vayikra", "צו": "Parashat_Tzav", "שמיני": "Parashat_Shemini", "תזריע": "Parashat_Tazria", "מצורע": "Parashat_Metzora", "אחרי מות": "Parashat_Achrei_Mot", "קדושים": "Parashat_Kedoshim", "אמור": "Parashat_Emor", "בהר": "Parashat_Behar", "בחוקותי": "Parashat_Bechukotai",
  "במדבר": "Parashat_Bamidbar", "נשא": "Parashat_Naso", "בהעלותך": "Parashat_Behaalotekha", "שלח": "Parashat_Shelach", "קרח": "Parashat_Korach", "חקת": "Parashat_Chukat", "בלק": "Parashat_Balak", "פינחס": "Parashat_Pinchas", "מטות": "Parashat_Matot", "מסעי": "Parashat_Masei",
  "דברים": "Parashat_Devarim", "ואתחנן": "Parashat_Vaetchanan", "עקב": "Parashat_Eikev", "ראה": "Parashat_Re'eh", "שופטים": "Parashat_Shoftim", "כי תצא": "Parashat_Ki_Teitzei", "כי תבוא": "Parashat_Ki_Tavo", "נצבים": "Parashat_Nitzavim", "וילך": "Parashat_Vayeilekh", "האזינו": "Parashat_Ha'Azinu", "וזאת הברכה": "Parashat_V'Zot_HaBerakhah"
};

const MUSAR = [
  { n: "מסילת ישרים", a: 'רמח"ל', struct: [{ t: "הקדמה", items: [{k:"intro", l:"הקדמה", ref:"Mesilat_Yesharim,_Introduction"}] }, { t: "פרקים", p: 26, refBase: "Mesilat_Yesharim" }] },
  { n: "חובת הלבבות", a: "רבינו בחיי", struct: [{ t: "הקדמות", items: [{k:"intro", l:"הקדמה", ref:"Duties_of_the_Heart,_Introduction"}]}, { t: "שער היחוד", p: 10, refBase: "Duties_of_the_Heart,_First_Treatise_on_Unity" }, { t: "שער הבחינה", p: 6, refBase: "Duties_of_the_Heart,_Second_Treatise_on_Examination" }, { t: "שער עבודת האלקים", p: 10, refBase: "Duties_of_the_Heart,_Third_Treatise_on_Service_of_God" }, { t: "שער הבטחון", p: 7, refBase: "Duties_of_the_Heart,_Fourth_Treatise_on_Trust_in_God" }, { t: "שער יחוד המעשה", p: 5, refBase: "Duties_of_the_Heart,_Fifth_Treatise_on_Devotion" }, { t: "שער הכניעה", p: 10, refBase: "Duties_of_the_Heart,_Sixth_Treatise_on_Humility" }, { t: "שער התשובה", p: 10, refBase: "Duties_of_the_Heart,_Seventh_Treatise_on_Repentance" }, { t: "שער חשבון הנפש", p: 6, refBase: "Duties_of_the_Heart,_Eighth_Treatise_on_Self-Accounting" }, { t: "שער הפרישות", p: 7, refBase: "Duties_of_the_Heart,_Ninth_Treatise_on_Abstinence" }, { t: "שער אהבת ה'", p: 7, refBase: "Duties_of_the_Heart,_Tenth_Treatise_on_Love_of_God" }] },
  { n: "שערי תשובה", a: "רבינו יונה", struct: [{ t: "שערים", p: 4, refBase: "Shaarei_Teshuvah"}] },
  { n: "אורחות צדיקים", a: "אנונימי", struct: [{ t: "הקדמה", items: [{k:"intro", l:"הקדמה", ref:"Orchot_Tzadikim,_Introduction"}] }, { t: "שערים", p: 28, refBase: "Orchot_Tzadikim"}] },
  { n: "תומר דבורה", a: 'רמ"ק', struct: [{ t: "פרקים", p: 10, refBase: "Tomer_Devorah"}] },
  { n: "פלא יועץ", a: "ר' אליעזר פאפו", struct: [{ t: "מערכות", p: 22, refBase: "Pele_Yoetz"}] },
  { n: "חפץ חיים", a: "החפץ חיים", struct: [{ t: "הקדמות", items: [{k:"intro", l:"הקדמה", ref:"Chafetz_Chaim,_Introduction"}] }, { t: "איסור לשון הרע", p: 10, refBase: "Chafetz_Chaim,_Part_One,_The_Prohibition_Against_Lashon_Hara,_Principle" }, { t: "איסור רכילות", p: 9, refBase: "Chafetz_Chaim,_Part_Two,_The_Prohibition_Against_Rechilut,_Principle" }] },
  { n: "שמירת הלשון", a: "החפץ חיים", struct: [
    { t: "הקדמה", items: [{k:"intro", l:"הקדמה", ref:"Shemirat_HaLashon,_Book_I,_Introduction"}] },
    { t: "שער הזכירה", p: 18, refBase: "Shemirat_HaLashon,_Book_I,_Shaar_HaZechirah" },
    { t: "שער התבונה", p: 17, refBase: "Shemirat_HaLashon,_Book_I,_Shaar_HaTevunah" },
    { t: "שער התורה", p: 12, refBase: "Shemirat_HaLashon,_Book_I,_Shaar_HaTorah" },
    { t: "חלק שני - חתימה", p: 7, refBase: "Shemirat_HaLashon,_Book_II" }
  ]},
  { n: "אהבת חסד", a: "החפץ חיים", struct: [
    { t: "חלק א'", p: 20, refBase: "Ahavat_Chesed,_Part_I" },
    { t: "חלק ב'", p: 24, refBase: "Ahavat_Chesed,_Part_II" },
    { t: "חלק ג'", p: 8, refBase: "Ahavat_Chesed,_Part_III" }
  ]},
  { n: 'ליקוטי מוהר"ן', a: "ר' נחמן מברסלב", struct: [{ t: "חלק א'", p: 286, refBase: "Likutei_Moharan" }, { t: "חלק ב'", p: 125, refBase: "Likutei_Moharan,_Part_II" }] },
  { n: "ספר המידות", a: "ר' נחמן מברסלב", p: 30 },
  { n: "ספר הישר", a: 'ר"ת', struct: [{ t: "שערים", p: 18, refBase: "Sefer_HaYashar"}] }
];

const MACHSHAVA = [
  { n: "נפש החיים", a: "ר' חיים מוולוז'ין", struct: [{ t: "שער א'", p: 22, refBase: "Nefesh_HaChaim,_Gate_I" }, { t: "שער ב'", p: 18, refBase: "Nefesh_HaChaim,_Gate_II" }, { t: "שער ג'", p: 14, refBase: "Nefesh_HaChaim,_Gate_III" }, { t: "שער ד'", p: 34, refBase: "Nefesh_HaChaim,_Gate_IV" }] },
  { n: "כוזרי", a: 'ריה"ל', struct: [{ t: "מאמר ראשון", p: 115, refBase: "Kuzari,_Essay_I" }, { t: "מאמר שני", p: 81, refBase: "Kuzari,_Essay_II" }, { t: "מאמר שלישי", p: 73, refBase: "Kuzari,_Essay_III" }, { t: "מאמר רביעי", p: 31, refBase: "Kuzari,_Essay_IV" }, { t: "מאמר חמישי", p: 28, refBase: "Kuzari,_Essay_V" }] },
  { n: "תניא", a: 'אדמו"ר הזקן', struct: [{ t: "הסכמות והקדמה", items: [{k:"intro", l:"הקדמה", ref:"Tanya,_Compiler's_Foreword"}] }, { t: "לקוטי אמרים", p: 53, refBase: "Tanya,_Part_I;_Likkutei_Amarim" }, { t: "שער היחוד והאמונה", p: 12, refBase: "Tanya,_Part_II;_Shaar_HaYichud_VehaEmunah" }, { t: "אגרת התשובה", p: 12, refBase: "Tanya,_Part_III;_Iggeret_HaTeshuvah" }, { t: "אגרת הקודש", p: 32, refBase: "Tanya,_Part_IV;_Iggeret_HaKodesh" }, { t: "קונטרס אחרון", p: 9, refBase: "Tanya,_Part_V;_Kuntras_Acharon" }] },
  { n: "מורה נבוכים", a: 'רמב"ם', struct: [{ t: "חלק א'", p: 76, refBase: "Guide_for_the_Perplexed,_Part_1" }, { t: "חלק ב'", p: 48, refBase: "Guide_for_the_Perplexed,_Part_2" }, { t: "חלק ג'", p: 54, refBase: "Guide_for_the_Perplexed,_Part_3" }] },
  { n: "אמונות ודעות", a: 'רס"ג', struct: [{ t: "הקדמה", items: [{k:"intro", l:"הקדמה", ref:"HaEmunot_veHaDeot,_Introduction"}] }, { t: "מאמר ראשון", p: 4, refBase: "HaEmunot_veHaDeot,_[Treatise_I]_The_Creation_of_the_World" }, { t: "מאמר שני", p: 13, refBase: "HaEmunot_veHaDeot,_[Treatise_II]_The_Unity_of_the_Creator" }, { t: "מאמר שלישי", p: 10, refBase: "HaEmunot_veHaDeot,_[Treatise_III]_Commandment_and_Prohibition" }, { t: "מאמר רביעי", p: 7, refBase: "HaEmunot_veHaDeot,_[Treatise_IV]_Obedience_and_Rebellion" }, { t: "מאמר חמישי", p: 8, refBase: "HaEmunot_veHaDeot,_[Treatise_V]_Merits_and_Demerits" }, { t: "מאמר שישי", p: 8, refBase: "HaEmunot_veHaDeot,_[Treatise_VI]_The_Essence_of_the_Soul" }] },
  { n: "ספר העיקרים", a: "ר' יוסף אלבו", struct: [{ t: "מאמר ראשון", p: 26, refBase: "Sefer_HaIkkarim,_Maamar_1" }, { t: "מאמר שני", p: 31, refBase: "Sefer_HaIkkarim,_Maamar_2" }, { t: "מאמר שלישי", p: 40, refBase: "Sefer_HaIkkarim,_Maamar_3" }, { t: "מאמר רביעי", p: 51, refBase: "Sefer_HaIkkarim,_Maamar_4" }] },
  { n: "נצח ישראל", a: 'מהר"ל', struct: [{ t: "הקדמה", items: [{k:"intro", l:"הקדמה", ref:"Netzach_Yisrael,_Introduction"}] }, { t: "פרקים", p: 60, refBase: "Netzach_Yisrael" }] },
  { n: "נתיבות עולם", a: 'מהר"ל', struct: [{ t: "נתיב התורה", p: 19, refBase: "Netivot_Olam,_Netiv_Hatorah" }, { t: "נתיב העבודה", p: 19, refBase: "Netivot_Olam,_Netiv_HaAvodah" }] },
  { n: "גבורות ה׳", a: 'מהר"ל', struct: [{ t: "הקדמות", items: [{k:"intro1", l:"הקדמה", ref:"Gevurot_Hashem,_First_Introduction"}] }, { t: "פרקים", p: 72, refBase: "Gevurot_Hashem" }] },
  { n: "באר הגולה", a: 'מהר"ל', struct: [{ t: "בארות", items: [{k:"1", l:"באר א'", ref:"Be'er_HaGolah,_Well_1"}, {k:"2", l:"באר ב'", ref:"Be'er_HaGolah,_Well_2"}, {k:"3", l:"באר ג'", ref:"Be'er_HaGolah,_Well_3"}, {k:"4", l:"באר ד'", ref:"Be'er_HaGolah,_Well_4"}, {k:"5", l:"באר ה'", ref:"Be'er_HaGolah,_Well_5"}, {k:"6", l:"באר ו'", ref:"Be'er_HaGolah,_Well_6"}, {k:"7", l:"באר ז'", ref:"Be'er_HaGolah,_Well_7"}] }] }
];

const RAV_KOOK = [
  { n: "אורות", a: 'הראי"ה קוק', struct: [
      { t: "אורות מאופל - ארץ ישראל", p: 8, refBase: "Orot,_Lights_from_Darkness,_Land_of_Israel" },
      { t: "אורות מאופל - המלחמה", p: 10, refBase: "Orot,_Lights_from_Darkness,_War" },
      { t: "אורות מאופל - ישראל ותחיתו", p: 32, refBase: "Orot,_Lights_from_Darkness,_Israel_and_its_Rebirth" },
      { t: "אורות מאופל - אורות התחיה", p: 72, refBase: "Orot,_Lights_from_Darkness,_Lights_of_Rebirth" },
      { t: "למהלך האידיאות בישראל", p: 6, refBase: "Orot,_The_Course_of_Ideals_in_Israel" },
      { t: "זרעונים", p: 8, refBase: "Orot,_Seeds" },
      { t: "אורות ישראל", p: 9, refBase: "Orot,_Orot_Yisrael" }
  ] },
  { n: "אורות הקודש", g: "אורות הקודש", struct: [{ t: "חלק א'", p: 137, refBase: "Orot_HaKodesh_I" }, { t: "חלק ב'", p: 602, refBase: "Orot_HaKodesh_II" }, { t: "חלק ג'", p: 358, refBase: "Orot_HaKodesh_III" }] }, 
  { n: "מוסר אביך", g: "שונות", struct: [{ t: "הקדמה", items: [{k:"intro", l:"הקדמה", ref:"Musar_Avikha,_Introduction"}]}, { t: "פרקים", p: 6, refBase: "Musar_Avikha" }] },
  { n: "שמונה קבצים", g: "שמונה קבצים", struct: [
    { t: "קובץ א'", p: 874, refBase: "Shemonah_Kevatzim.1" }, { t: "קובץ ב'", p: 337, refBase: "Shemonah_Kevatzim.2" }, { t: "קובץ ג'", p: 385, refBase: "Shemonah_Kevatzim.3" }, { t: "קובץ ד'", p: 121, refBase: "Shemonah_Kevatzim.4" }, { t: "קובץ ה'", p: 288, refBase: "Shemonah_Kevatzim.5" }, { t: "קובץ ו'", p: 289, refBase: "Shemonah_Kevatzim.6" }, { t: "קובץ ז'", p: 228, refBase: "Shemonah_Kevatzim.7" }, { t: "קובץ ח'", p: 275, refBase: "Shemonah_Kevatzim.8" }
  ]}
];

const GEMARA = [{n:"ברכות",s:"זרעים",d:64,p:9},{n:"שבת",s:"מועד",d:157,p:24},{n:"עירובין",s:"מועד",d:105,p:10},{n:"פסחים",s:"מועד",d:121,p:10},{n:"שקלים",s:"מועד",d:22,p:8},{n:"יומא",s:"מועד",d:88,p:8},{n:"סוכה",s:"מועד",d:56,p:5},{n:"ביצה",s:"מועד",d:40,p:5},{n:"ראש השנה",s:"מועד",d:35,p:4},{n:"תענית",s:"מועד",d:31,p:4},{n:"מגילה",s:"מועד",d:32,p:4},{n:"מועד קטן",s:"מועד",d:29,p:3},{n:"חגיגה",s:"מועד",d:27,p:3},{n:"יבמות",s:"נשים",d:122,p:16},{n:"כתובות",s:"נשים",d:112,p:13},{n:"נדרים",s:"נשים",d:91,p:11},{n:"נזיר",s:"נשים",d:66,p:9},{n:"סוטה",s:"נשים",d:49,p:9},{n:"גיטין",s:"נשים",d:90,p:9},{n:"קידושין",s:"נשים",d:82,p:4},{n:"בבא קמא",s:"נזיקין",d:119,p:10},{n:"בבא מציעא",s:"נזיקין",d:119,p:10},{n:"בבא בתרא",s:"נזיקין",d:176,p:10},{n:"סנהדרין",s:"נזיקין",d:113,p:11},{n:"מכות",s:"נזיקין",d:24,p:3},{n:"שבועות",s:"נזיקין",d:49,p:8},{n:"עבודה זרה",s:"נזיקין",d:76,p:5},{n:"הוריות",s:"נזיקין",d:14,p:3},{n:"זבחים",s:"קדשים",d:120,p:14},{n:"מנחות",s:"קדשים",d:110,p:13},{n:"חולין",s:"קדשים",d:142,p:12},{n:"בכורות",s:"קדשים",d:61,p:9},{n:"ערכין",s:"קדשים",d:34,p:9},{n:"תמורה",s:"קדשים",d:34,p:7},{n:"כריתות",s:"קדשים",d:28,p:6},{n:"מעילה",s:"קדשים",d:22,p:6},{n:"נידה",s:"טהרות",d:73,p:10}];

const GEMARA_CHAP_NAMES = {
  "ברכות": ["מאימתי", "היה קורא", "מי שמתו", "תפילת השחר", "אין עומדין", "כיצד מברכין", "שלושה שאכלו", "אלו דברים", "הרואה"],
  "שבת": ["יציאות השבת", "במה מדליקין", "במה טומנין", "במה אשה", "במה בהמה", "במה אשה יוצאה", "כלל גדול", "המוציא יין", "אמר רבי עקיבא", "המצניע", "הזורק", "הבונה", "האורג", "שמונה שרצים", "אלו קשרים", "כל כתבי", "כל הכלים", "מפנין", "רבי אליעזר דמילה", "תולין", "נוטל", "חבית", "שואל", "מי שהחשיך"],
  "עירובין": ["מבוי", "עושין פסין", "בכל מערבין", "מי שהוציאוהו", "כיצד מעברין", "הדר", "כיצד משתתפין", "כיצד צולין", "כל גגות", "המוצא תפילין"],
  "פסחים": ["אור לארבעה עשר", "כל שעה", "אלו עוברין", "מקום שנהגו", "תמיד נשחט", "אלו דברים", "כיצד צולין", "האשה", "מה אלו", "ערבי פסחים"],
  "יומא": ["שבעת ימים", "בראשונה", "אמר להם הממונה", "טרף בקלפי", "הוציאו לו", "שני שעירים", "בא לו כהן גדול", "יום הכפורים"],
  "סוכה": ["סוכה", "הישן תחת המטה", "לולב הגזול", "לולב וערבה", "החליל"],
  "ביצה": ["ביצה", "יום טוב", "אין צדין", "המביא", "משילין"],
  "ראש השנה": ["ארבעה ראשי שנים", "אם אינן מכירין", "ראוהו בית דין", "יום טוב של ראש השנה"],
  "תענית": ["מאימתי מזכירין", "סדר תעניות", "סדר תעניות אלו", "בשלושה פרקים"],
  "מגילה": ["מגילה נקראת", "הקורא למפרע", "הקורא עומד", "בני העיר"],
  "מועד קטן": ["משקין", "מי שהפך", "ואלו מגלחין"],
  "חגיגה": ["הכל חייבין", "אין דורשין", "חומר בקדש"],
  "יבמות": ["חמש עשרה נשים", "כיצד", "ארבעה אחין", "החולץ", "רבן גמליאל", "הבא על יבמתו", "אלמנה", "הערל", "יש מותרות", "האשה רבה", "נושאין על האנוסה", "מצות חליצה", "שומרת יבם", "חרש", "האשה שלום", "האשה בתרא"],
  "כתובות": ["בתולה", "האשה שנתארמלה", "אלו נערות", "נערה", "אף על פי", "מציאת האשה", "המדיר", "האשה שנפלו", "הכותב", "מי שהיה נשוי", "אלמנה ניזונת", "הנושא", "שני דייני גזירות"],
  "נדרים": ["כל כנויי", "ואלו מותרין", "ארבעה נדרים", "אין בין המודר", "השותפין", "הנודר מן המבושל", "הנודר מן הירק", "קונם יין", "רבי אליעזר", "נערה המאורסה", "ואלו נדרים"],
  "גיטין": ["המביא גט", "המביא גט", "כל הגט", "השולח", "הניזקין", "האומר", "מי שאחזו", "הזורק", "המגרש"],
  "קידושין": ["האשה נקנית", "האיש מקדש", "האומר", "עשרה יוחסין"],
  "בבא קמא": ["ארבעה אבות", "כיצד הרגל", "המניח", "שור שנגח ארבעה", "שור שנגח את הפרה", "הכונס", "מרובה", "החובל", "הגוזל עצים", "הגוזל ומאכיל"],
  "בבא מציעא": ["שנים אוחזין", "אלו מציאות", "המפקיד", "הזהב", "איזהו נשך", "השוכר את האומנין", "השוכר את הפועלים", "השואל", "המקבל", "הבית והעליה"],
  "בבא בתרא": ["השותפין", "לא יחפור", "חזקת הבתים", "המוכר את הבית", "המוכר את הספינה", "המוכר פירות", "יש נוחלין", "גט פשוט", "מי שמת"],
  "סנהדרין": ["דיני ממונות בשלשה", "כהן גדול", "זה בורר", "אחד דיני ממונות", "היו בודקין", "נגמר הדין", "ארבע מיתות", "בן סורר", "אלו הנשרפין", "אלו הן הנחנקין", "חלק"],
  "מכות": ["כיצד העדים", "אלו הן הגולין", "אלו הן הלוקין"],
  "שבועות": ["שבועות שתים", "ידיעות הטומאה", "שבועות שתים", "שבועת העדות", "שבועת הפקדון", "שבועת הדיינין", "כל הנשבעין", "ארבעה שומרים"],
  "עבודה זרה": ["לפני אידיהן", "אין מעמידין", "כל הצלמים", "רבי ישמעאל", "השוכר את הפועל"],
  "הוריות": ["הורו בית דין", "הורה כהן משיח", "כהן משיח"],
  "זבחים": ["כל הזבחים", "כל הזבחים שנזבחו", "כל הפסולין", "איזהו מקומן", "קדשי קדשים", "קודש קדשים", "חטאת העוף", "כל הזבחים שקבלו", "המזבח מקדש", "דם חטאת", "התערובות", "טבול יום", "השוחט והמעלה", "פרת חטאת"],
  "מנחות": ["כל המנחות", "הקומץ רבה", "הקומץ את המנחה", "התכלת", "כל המנחות באות מצה", "העומר", "שתי הלחם", "רבי ישמעאל אומר", "כל קרבנות צבור", "שתי מדות", "המנחות והנסכים", "כל המנחות באות עשר", "התנדב מנחה"],
  "חולין": ["הכל שוחטין", "השוחט אחד בעוף", "אלו טריפות", "בהמה המקשה", "אותו ואת בנו", "כסוי הדם", "גיד הנשה", "כל הבשר", "העור והרוטב", "זרוע ולחיים", "ראשית הגז", "שלוח הקן"],
  "בכורות": ["הלוקח עובר", "הלוקח בהמה", "יש בכור", "עד כמה", "כל פסולי", "כל הפסולין", "מומין אלו", "על אלו מומין", "יש בכור לנחלה", "מעשר בהמה"],
  "ערכין": ["הכל מעריכין", "אין בערכין", "יש בערכין", "המקדיש שדהו", "שום היתומים", "הקדיש שדהו", "אין מקדישין", "המוכר שדהו", "מוכר אדם"],
  "תמורה": ["הכל ממירין", "יש בקרבנות", "אלו קדשים", "ולד חטאת", "כיצד מערימין", "כל האסורין", "יש בקרבנות צבור"],
  "כריתות": ["שלשים ושש", "ארבעה מביאין", "אמרו לו", "ספק אכל", "דם שחיטה", "המביא אשם"],
  "מעילה": ["קדשי קדשים", "חטאת העוף", "ולד חטאת", "הנהנה מן ההקדש", "כל שקלים", "שליח שעשה"],
  "נידה": ["שמאי אומר", "כל היד", "המפלת חתיכה", "בנות כותים", "יוצא דופן", "בא סימן", "דם הנדה", "רואה כתם", "האשה שהיא", "תינוקת"]
};

// מיפוי עמודים מדויק למניעת חירטוטים בגמרא
const EXACT_GEMARA_STARTS = {
  "ברכות": ["2a", "11a", "18a", "26a", "30b", "35b", "45a", "51b", "54a"],
  "שבת": ["2a", "20b", "36b", "47a", "51b", "57a", "68a", "76a", "83a", "90a", "96a", "102b", "105b", "107a", "111a", "115a", "122b", "126b", "130a", "137a", "148a", "150a", "153a", "155a"],
  "עירובין": ["2a", "17b", "26a", "41a", "53b", "61b", "76b", "89a", "94a", "95a"],
  "פסחים": ["2a", "21a", "42a", "50a", "58a", "66b", "74a", "87a", "92a", "99b"],
  "ראש השנה": ["2a", "18a", "24b", "29b"],
  "יומא": ["2a", "15a", "25a", "39a", "53b", "62a", "68b", "73b"],
  "סוכה": ["2a", "20a", "29b", "42b", "50a"],
  "ביצה": ["2a", "15b", "23b", "29b", "35b"],
  "תענית": ["2a", "11a", "15a", "26a"],
  "מגילה": ["2a", "17a", "25a", "25b"],
  "מועד קטן": ["2a", "11a", "13b"], 
  "חגיגה": ["2a", "11b", "18b"], 
  "יבמות": ["2a", "17a", "26b", "41a", "50a", "54a", "61a", "70a", "84a", "87b", "97a", "101a", "109a", "112b", "114b", "118b"],
  "כתובות": ["2a", "16a", "29a", "39b", "54b", "64b", "70a", "79a", "83a", "90b", "103a", "108a", "104a"],
  "קידושין": ["2a", "41a", "58b", "69a"], 
  "בבא קמא": ["2a", "16a", "27b", "36a", "46a", "55b", "62b", "83b", "96b", "111b"],
  "בבא מציעא": ["2a", "21a", "33b", "44a", "60b", "73a", "83a", "94a", "103b", "116a"],
  "בבא בתרא": ["2a", "17a", "28a", "61a", "73a", "83b", "108b", "160b", "164b", "175a"],
  "סנהדרין": ["2a", "18a", "23a", "32a", "40a", "42b", "52b", "68b", "73a", "84a", "90a"],
  "מכות": ["2a", "7a", "13b"]
};

function generateAmudimRange(startStr, endStr, masechetDafLimit) {
    if (!startStr) return [];
    let r = [];
    let startDaf = parseInt(startStr);
    let startAmud = startStr.slice(-1);
    let endDaf = endStr ? parseInt(endStr) : masechetDafLimit;
    let endAmud = endStr ? endStr.slice(-1) : 'b';

    for (let d = startDaf; d <= endDaf; d++) {
        if (d === startDaf && startAmud === 'b') {
            r.push(`${d}b`);
        } else if (d === endDaf) {
            if (endAmud === 'a') r.push(`${d}a`);
            else r.push(`${d}a`, `${d}b`);
        } else {
            r.push(`${d}a`, `${d}b`);
        }
    }
    if (endStr && r.length > 0 && r[r.length-1] === endStr) {
        r.pop();
    }
    return r;
}

const MISHNA = [{m:"ברכות",s:"זרעים",p:9,ms:[5,8,6,7,5,8,5,8,5]},{m:"פאה",s:"זרעים",p:8,ms:[6,8,8,11,8,11,8,9]},{m:"דמאי",s:"זרעים",p:7,ms:[4,5,6,7,7,11,8]},{m:"כלאים",s:"זרעים",p:9,ms:[9,11,7,9,8,9,8,6,10]},{m:"שביעית",s:"זרעים",p:10,ms:[8,10,10,10,9,6,7,11,9,9]},{m:"תרומות",s:"זרעים",p:11,ms:[10,6,9,13,9,6,7,12,7,12,10]},{m:"מעשרות",s:"זרעים",p:5,ms:[8,8,10,6,8]},{m:"מעשר שני",s:"זרעים",p:5,ms:[7,10,13,12,15]},{m:"חלה",s:"זרעים",p:4,ms:[9,8,10,11]},{m:"ערלה",s:"זרעים",p:3,ms:[9,17,9]},{m:"ביכורים",s:"זרעים",p:4,ms:[11,11,12,5]},{m:"שבת",s:"מועד",p:24,ms:[11,7,6,7,4,10,4,4,7,6,6,6,7,4,3,8,8,3,6,5,3,6,6,5]},{m:"עירובין",s:"מועד",p:10,ms:[10,6,9,11,9,10,11,11,4,15]},{m:"פסחים",s:"מועד",p:10,ms:[7,8,8,9,10,2,13,8,11,9]},{m:"שקלים",s:"מועד",p:8,ms:[7,5,4,9,6,7,7,8]},{m:"יומא",s:"מועד",p:8,ms:[8,7,11,6,7,8,5,9]},{m:"סוכה",s:"מועד",p:5,ms:[11,9,15,10,8]},{m:"ביצה",s:"מועד",p:5,ms:[10,10,8,7,7]},{m:"ראש השנה",s:"מועד",p:4,ms:[9,8,8,9]},{m:"תענית",s:"מועד",p:4,ms:[7,10,9,8]},{m:"מגילה",s:"מועד",p:4,ms:[11,6,6,10]},{m:"מועד קטן",s:"מועד",p:3,ms:[10,5,9]},{m:"חגיגה",s:"מועד",p:3,ms:[8,7,8]},{m:"יבמות",s:"נשים",p:16,ms:[16,10,10,13,13,6,6,6,6,9,7,6,13,9,10,7]},{m:"כתובות",s:"נשים",p:13,ms:[10,10,9,12,9,7,10,8,9,6,6,4,11]},{m:"נדרים",s:"נשים",p:11,ms:[4,5,11,8,6,10,9,7,9,8,12]},{m:"נזיר",s:"נשים",p:9,ms:[7,10,7,7,7,11,4,2,5]},{m:"סוטה",s:"נשים",p:9,ms:[9,6,8,5,9,3,8,7,15]},{m:"גיטין",s:"נשים",p:9,ms:[6,7,8,9,9,7,9,10,10]},{m:"קידושין",s:"נשים",p:4,ms:[10,10,13,14]},{m:"בבא קמא",s:"נזיקין",p:10,ms:[4,6,11,9,7,6,7,7,12,10]},{m:"בבא מציעא",s:"נזיקין",p:10,ms:[8,11,12,12,11,8,11,10,13,6]},{m:"בבא בתרא",s:"נזיקין",p:10,ms:[6,15,10,9,11,8,10,8,8,8]},{m:"סנהדרין",s:"נזיקין",p:11,ms:[6,5,8,5,5,6,11,7,6,6,6]},{m:"מכות",s:"נזיקין",p:3,ms:[10,8,16]},{m:"שבועות",s:"נזיקין",p:8,ms:[7,5,11,13,5,7,8,6]},{m:"עדיות",s:"נזיקין",p:8,ms:[14,10,12,12,7,3,9,7]},{m:"עבודה זרה",s:"נזיקין",p:5,ms:[9,7,12,12,12]},{m:"אבות",s:"נזיקין",p:6,ms:[18,16,18,22,23,11]},{m:"הוריות",s:"נזיקין",p:3,ms:[5,7,8]},{m:"זבחים",s:"קדשים",p:14,ms:[4,5,8,6,8,7,6,12,7,9,8,6,8,3]},{m:"מנחות",s:"קדשים",p:13,ms:[4,5,7,5,9,7,6,7,9,9,9,5,11]},{m:"חולין",s:"קדשים",p:12,ms:[7,10,7,7,5,7,7,4,8,4,6,5]},{m:"בכורות",s:"קדשים",p:9,ms:[7,9,4,10,6,12,7,10,8]},{m:"ערכין",s:"קדשים",p:9,ms:[4,6,5,5,8,5,5,7,8]},{m:"תמורה",s:"קדשים",p:7,ms:[6,3,4,3,6,5,6]},{m:"כריתות",s:"קדשים",p:6,ms:[7,6,10,3,8,9]},{m:"מעילה",s:"קדשים",p:6,ms:[4,9,3,6,5,4]},{m:"תמיד",s:"קדשים",p:7,ms:[4,5,9,3,7,3,4]},{m:"מידות",s:"קדשים",p:5,ms:[9,6,8,7,4]},{m:"קינים",s:"קדשים",p:3,ms:[4,5,6]},{m:"כלים",s:"טהרות",p:30,ms:[9,8,8,4,11,4,6,11,8,8,9,8,8,8,6,8,17,9,10,7,3,10,5,17,9,9,12,10,9,16]},{m:"אהלות",s:"טהרות",p:18,ms:[8,7,7,7,7,7,6,6,15,7,9,8,9,10,10,9,5,10]},{m:"נגעים",s:"טהרות",p:14,ms:[6,5,4,11,5,8,5,10,3,10,12,7,12,13]},{m:"פרה",s:"טהרות",p:12,ms:[4,3,5,4,9,5,12,10,9,6,9,12]},{m:"טהרות",s:"טהרות",p:10,ms:[9,8,8,13,9,10,9,10,9,8]},{m:"מקוואות",s:"טהרות",p:10,ms:[8,10,4,5,6,11,7,5,7,8]},{m:"נידה",s:"טהרות",p:10,ms:[7,7,7,7,9,14,5,4,11,8]},{m:"מכשירין",s:"טהרות",p:6,ms:[6,11,8,10,11,8]},{m:"זבים",s:"טהרות",p:5,ms:[6,3,3,7,12]},{m:"טבול יום",s:"טהרות",p:4,ms:[5,8,6,7]},{m:"ידים",s:"טהרות",p:4,ms:[5,4,5,8]},{m:"עוקצין",s:"טהרות",p:3,ms:[6,10,12]}];

const HALACHOT = [
  { t: "השכמת הבוקר: 'יתגבר כארי לעמוד בבוקר לעבודת בוראו'. ההלכה הפותחת את השולחן ערוך מלמדת שמיד עם היקיצה, עוד לפני שהגוף מתרגל לשגרה, עלינו להתמלא בגבורה רוחנית ולהכיר בכך שהיום החדש הוא מתנה לעשיית רצון ה'.", s: "שולחן ערוך, אורח חיים א, א" },
  { t: "מודה אני: מצווה לומר מיד שניעור 'מודה אני לפניך מלך חי וקיים'. היתרון העצום בתפילה זו הוא שאין בה שם השם, ולכן ניתן לאומרה עוד לפני נטילת ידיים (גם כשהגוף אינו טהור), כביטוי טהור, טבעי ומיידי של הכרת הטוב על החזרת הנשמה.", s: "שולחן ערוך, אורח חיים א, א" },
  { t: "נטילת ידיים שחרית: בבוקר יש ליטול כל יד שלוש פעמים לסירוגין מכלי עם מים, כדי להעביר את טומאת הלילה. נטילה זו משמשת גם כהכנה רוחנית לתפילה, בדומה לכהן שמקדש את ידיו לפני העבודה בבית המקדש.", s: "שולחן ערוך, אורח חיים ד, ב" },
  { t: "ברכות השחר: ברכות אלו נתקנו כדי להודות על התפקודים הבסיסיים ביותר של האדם והעולם – פקיחת העיניים, היכולת ללכת, המלבוש ועוד. ראוי לברך אותן בשמחה ובכוונה, שכן הן 'מקרקעות' אותנו רוחנית ונותנות פרופורציה לפני שאנו צוללים לשגרת היום.", s: "שולחן ערוך, אורח חיים מו, א" },
  { t: "קביעות עיתים לתורה: חובה על כל אדם מישראל, בין עני ובין עשיר, בין בריא ובין בעל ייסורים, לקבוע זמן מוגדר ללימוד תורה בכל יום ובכל לילה. הקביעות צריכה להיות כה יציבה וחזקה, עד שאפילו טרדות הפרנסה לא יבטלו אותה.", s: "שולחן ערוך, יורה דעה רמו, א" },
  { t: "אהבת ישראל: 'ואהבת לרעך כמוך' – המשמעות המעשית היא לדאוג לכספו, לכבודו ולרווחתו של חברו בדיוק כפי שאדם דואג לעצמו. הרמב״ם מוסיף ומציין שמי שמתכבד בקלון חברו, פוגע בעצם מהותו הרוחנית ואין לו חלק לעולם הבא.", s: "רמב״ם, הלכות דעות ו, ג" },
  { t: "איסור לשון הרע: מן האיסורים החמורים ביותר בתורה - הדיבור בגנותו של אדם אחר, ואפילו אם הדברים נכונים לחלוטין (שאם הם שקר - הרי זה 'מוציא שם רע'). דיבור רע מפרק משפחות, הורס קהילות והוא הבסיס לחברה לא בריאה.", s: "חפץ חיים, פתיחה" },
  { t: "כיבוד אב ואם: מצוות עשה מן התורה שכוללת סיוע פיזי וכן מורא (שלא לסתור את דבריהם, לא לעמוד במקומם ולא לקרוא להם בשמם). חז״ל השוו את כבוד ההורים לכבודו של הקב״ה, שכן שלושתם שותפים ביצירת האדם.", s: "שולחן ערוך, יורה דעה רמ, א" },
  { t: "ביקור חולים: מצווה גדולה להגיע לבקר חולה, לראות מה צרכיו הרפואיים או הנפשיים, ויותר מכל – להתפלל עליו. חז״ל אומרים שמי שמבקר חולה נוטל חלק מסבלו ו'מחיֶּה' אותו. ובלבד שהביקור לא יכביד על החולה.", s: "שולחן ערוך, יורה דעה שלג, א" },
  { t: "הכנסת אורחים: 'גדולה הכנסת אורחים מהקבלת פני השכינה' – יסוד שלמדנו מאברהם אבינו. המצווה אינה מסתכמת רק בהגשת אוכל, אלא במאור פנים, דאגה למנוחתו של האורח, וליוויו בעת צאתו מן הבית.", s: "רמב״ם, הלכות אבל יד, ב" },
  { t: "שמירת שבת (עונג וכבוד): 'עונג שבת' מתבטא באכילת מאכלים מיוחדים ומנוחה אמיתית מטכנולוגיה ומטרדות החול. השבת מוגדרת כ'מעין עולם הבא', וככל שמתכוננים אליה מראש - כך זוכים לטעום מקדושתה במהלך השבת כולה.", s: "שולחן ערוך, אורח חיים רנ, א" },
  { t: "תפילה בכוונה: תפילה שנאמרת ללא כוונה נחשבת ל'גוף ללא נשמה'. כשאדם מתפלל עליו לחוש כאילו השכינה מולו. אם קשה לו לכוון בכל התפילה, עליו להתאמץ לכוון לכל הפחות בברכת 'אבות' הפותחת את שמונה עשרה.", s: "שולחן ערוך, אורח חיים צה, א" },
  { t: "מתן צדקה: חובה על כל אדם, ואפילו עני המתפרנס מן הצדקה, לתת צדקה לאחרים. הדרך המהודרת ביותר היא לתת עשירית מכל רווחיו ('מעשר כספים'). הרמב״ם פוסק שמעולם לא העני אדם מן הצדקה, והיא מקרבת את הגאולה.", s: "שולחן ערוך, יורה דעה רמז, א" },
  { t: "השבת אבידה: הרואה אבידה חייב להיטפל בה ולהשיבה לבעליה, ובלבד שיש בה סימן מזהה. התעלמות מאבידה עוברת על הלאו 'לא תוכל להתעלם'. המשיב אבידה עושה חסד עצום ומקיים את האמון בחברה הישראלית.", s: "שולחן ערוך, חושן משפט רנט, א" },
  { t: "אונאת דברים: אסור להונות ולצער את חברו בדיבור. איסור זה חמור מאונאת ממון (רמאות כספית) משום שהוא פוגע בנפש. למשל, אסור להזכיר לבעל תשובה את עברו, או להציע מחיר על חפץ כשאין שום כוונה לקנותו.", s: "שולחן ערוך, חושן משפט רכח, א" }
];

const CATS = ["gemara","mishna","tanach","musar","ravKook","machshava","custom"];
const NAVY = "#1A3A6B", GOLD = "#C9A84C";
const CC_L = {gemara:NAVY,mishna:"#0A5757",tanach:"#7A4818",musar:"#1A5C2E",ravKook:"#1A2B6B",machshava:"#4A1A5C",custom:"#444"};
const CL_L = {gemara:"#E8EFF8",mishna:"#E3F6F6",tanach:"#FDF3E3",musar:"#E3F5EC",ravKook:"#E8EBF8",machshava:"#F5E8FC",custom:"#F0F0F0"};
const CC_D = {gemara:"#93C5FD",mishna:"#5EEAD4",tanach:"#FCD34D",musar:"#6EE7B7",ravKook:"#A5B4FC",machshava:"#F9A8D4",custom:"#D1D5DB"};
const CL_D = {gemara:"#1E3A5F",mishna:"#1A3A38",tanach:"#3D2800",musar:"#1A3A28",ravKook:"#1A2A5F",machshava:"#3A1A48",custom:"#374151"};
const QUOTES = ["״לא עליך המלאכה לגמור, ולא אתה בן חורין ליבטל ממנה״ (אבות ב, טז)"];

const SEFARIA_MAP = {
  "ברכות": "Berakhot", "שבת": "Shabbat", "עירובין": "Eruvin", "פסחים": "Pesachim", "שקלים": "Shekalim", "יומא": "Yoma", "סוכה": "Sukkah", "ביצה": "Beitzah", "ראש השנה": "Rosh_Hashanah", "תענית": "Taanit", "מגילה": "Megillah", "מועד קטן": "Moed_Katan", "חגיגה": "Chagigah", "יבמות": "Yevamot", "כתובות": "Ketubot", "נדרים": "Nedarim", "נזיר": "Nazir", "סוטה": "Sotah", "גיטין": "Gittin", "קידושין": "Kiddushin", "בבא קמא": "Bava_Kamma", "בבא מציעא": "Bava_Metzia", "בבא בתרא": "Bava_Batra", "סנהדרין": "Sanhedrin", "מכות": "Makkot", "שבועות": "Shevuot", "עבודה זרה": "Avodah_Zarah", "הוריות": "Horayot", "זבחים": "Zevachim", "מנחות": "Menachot", "חולין": "Chullin", "בכורות": "Bekhorot", "ערכין": "Arakhin", "תמורה": "Temurah", "כריתות": "Keritot", "מעילה": "Meilah", "נידה": "Niddah",
  "פאה": "Peah", "דמאי": "Demai", "כלאים": "Kilayim", "שביעית": "Sheviit", "תרומות": "Terumot", "מעשרות": "Maasrot", "מעשר שני": "Maaser_Sheni", "חלה": "Challah", "ערלה": "Orlah", "ביכורים": "Bikkurim", "עדיות": "Eduyot", "אבות": "Pirkei_Avot", "תמיד": "Tamid", "מידות": "Middot", "קינים": "Kinnim", "כלים": "Kelim", "אהלות": "Oholot", "נגעים": "Negaim", "פרה": "Parah", "טהרות": "Tohorot", "מקוואות": "Mikvaot", "מכשירין": "Makhshirin", "זבים": "Zavim", "טבול יום": "Tevul_Yom", "ידים": "Yadayim", "עוקצין": "Oktzin",
  "בראשית": "Genesis", "שמות": "Exodus", "ויקרא": "Leviticus", "במדבר": "Numbers", "דברים": "Deuteronomy", "יהושע": "Joshua", "שופטים": "Judges", "שמואל א": "I_Samuel", "שמואל ב": "II_Samuel", "מלכים א": "I_Kings", "מלכים ב": "II_Kings", "ישעיהו": "Isaiah", "ירמיהו": "Jeremiah", "יחזקאל": "Ezekiel", "הושע": "Hosea", "יואל": "Joel", "עמוס": "Amos", "עובדיה": "Obadiah", "יונה": "Jonah", "מיכה": "Micah", "נחום": "Nahum", "חבקוק": "Habakkuk", "צפניה": "Zephaniah", "חגי": "Haggai", "זכריה": "Zechariah", "מלאכי": "Malachi", "תהלים": "Psalms", "משלי": "Proverbs", "איוב": "Job", "שיר השירים": "Song_of_Songs", "רות": "Ruth", "איכה": "Lamentations", "קהלת": "Ecclesiastes", "אסתר": "Esther", "דניאל": "Daniel", "עזרא": "Ezra", "נחמיה": "Nehemiah", "דברי הימים א": "I_Chronicles", "דברי הימים ב": "II_Chronicles"
};

const COMPLEX_REFS = {
  "ספר הישר": "Sefer_HaYashar"
};

/* ── HELPER FUNCTIONS ── */
function safeHas(setOrObj, val) {
  if(!setOrObj) return false;
  if(setOrObj instanceof Set) return setOrObj.has(val);
  return Array.isArray(setOrObj) && setOrObj.includes(val);
}

function getBkList(cat, custom) {
  const custArr = Array.isArray(custom) ? custom : [];
  let base = [];
  if(cat==="gemara") base = GEMARA.map((t,i)=>({i, n:t.n, sub:t.s, cat}));
  else if(cat==="mishna") base = MISHNA.map((t,i)=>({i, n:t.m, sub:t.s, cat}));
  else if(cat==="tanach") base = TANACH.map((t,i)=>({i, n:t.b, sub:t.s, cat}));
  else if(cat==="musar") base = MUSAR.map((t,i)=>({i, n:t.n, sub:t.a, cat}));
  else if(cat==="ravKook") base = RAV_KOOK.map((t,i)=>({i, n:t.n, sub:t.g, cat}));
  else if(cat==="machshava") base = MACHSHAVA.map((t,i)=>({i, n:t.n, sub:t.a, cat}));

  base = base.map(b => ({...b, isC: false, idKey: cat+'_s'+b.i}));
  const customsInCat = custArr.map((c, i) => ({ i, n: c.name, sub: c.catLabel||"", cat: c.cat, isC: true, origIdx: i, idKey: 'custom_c'+i }));
  if(cat === "custom") return customsInCat;
  return [...customsInCat.filter(c => c.cat === cat), ...base];
}

function getAllBooks(custom) { 
  return CATS.flatMap(c => getBkList(c, custom)); 
}

function totalMs(i) {
  const m = MISHNA[i];
  return m?.ms ? m.ms.reduce((a,b)=>a+b, 0) : (m?.p || 0);
}

function perekAmudKeys(masIdx, p) {
  const g = GEMARA[masIdx]; 
  if(!g) return [];

  const exactStarts = EXACT_GEMARA_STARTS[g.n];
  if (exactStarts && exactStarts.length > 0) {
    const startStr = exactStarts[p-1];
    const endStr = (p < exactStarts.length) ? exactStarts[p] : null;
    return generateAmudimRange(startStr, endStr, g.d);
  }

  const startsNum = [
      [2, 13, 17, 26, 30, 35, 45, 51, 54], 
      [2, 20, 36, 47, 52, 65, 69, 73, 80, 90, 95, 101, 105, 113, 115, 119, 123, 130, 137, 148, 150, 153, 155, 156]
  ][masIdx];

  if (startsNum && startsNum.length > 0) {
    const startDaf = startsNum[p-1];
    const endDaf = (p < startsNum.length) ? startsNum[p] - 1 : g.d;
    const r = [];
    for(let d = startDaf; d <= endDaf; d++) r.push(`${d}a`,`${d}b`);
    return r;
  }

  const D = g.d, P = g.p, s = Math.round(2 + (p - 1) / P * D), e = Math.round(2 + p / P * D);
  const r = []; 
  for(let d = s; d < e && d <= D; d++) r.push(`${d}a`,`${d}b`);
  return r;
}

function perekMsKeys(masIdx, p) {
  const cnt = MISHNA[masIdx]?.ms?.[p-1] || 0;
  return Array.from({length:cnt}, (_,i) => `${p}:${i+1}`);
}

function bkTotal(prog, cat, i, custom) {
  if(cat==="gemara") return GEMARA[i]?.d||0;
  if(cat==="mishna") return totalMs(i);
  if (cat === "tanach") {
      const tMode = prog?.tmode?.[i] || "perakim";
      return tMode === "parshiot" && i < 5 ? PARSHIOT[i].length : TANACH[i]?.c || 0;
  }
  
  const src = {musar:MUSAR, ravKook:RAV_KOOK, machshava:MACHSHAVA}[cat];
  const bk = (src||[])[i];
  if(!bk) return 0;
  if(bk.struct) return bk.struct.reduce((sum, section) => sum + (section.items ? section.items.length : (section.p || 0)), 0);
  return bk.p||0;
}

function calcDone(prog, cat, i) {
  if (!prog) return 0;
  if (cat === "gemara") {
      const s = prog.gemara?.[i]?.done;
      if(!s) return 0;
      let dCnt = 0;
      s.forEach(k => { if(!String(k).startsWith('p')) dCnt++; });
      return Math.round(dCnt/2);
  }
  if (cat === "mishna") return prog.mishna?.[i]?.done?.size || 0;
  if (cat === "custom") return prog.custom?.[i]?.done?.size || 0;
  if (cat === "tanach") {
     const tMode = prog?.tmode?.[i] || "perakim";
     if (tMode === "parshiot" && i < 5) return prog.tanach_parshiot?.[i]?.size || 0;
     return prog.tanach?.[i]?.size || 0;
  }
  return prog[cat]?.[i]?.size || 0;
}

function pct(d, t) {
  return t > 0 ? Math.min(100, Math.round((d * 100) / t)) : 0;
}

/* ── SEFARIA API LINK GENERATOR (SMART RESOLVER) ── */
function getSefariaRefString(cat, bookName, key, tMode, isC, masIdx) {
  if(!bookName || !key || isC) return ""; 
  try {
    let k = String(key);
    
    if(cat === "gemara") {
        const eng = SEFARIA_MAP[bookName.trim()] || encodeURIComponent(bookName.trim().replace(/ /g, "_"));
        if(k.startsWith("p")) {
            const pNum = parseInt(k.slice(1));
            const amudim = perekAmudKeys(masIdx, pNum);
            if (amudim.length > 0) return `${eng}.${amudim[0]}`;
            return `${eng}.2a`;
        }
        return `${eng}.${k}`;
    }

    if (cat === "musar" || cat === "ravKook" || cat === "machshava") {
       if (k.includes('|')) {
           const [group, actualKey] = k.split('|');
           const src = {musar:MUSAR, ravKook:RAV_KOOK, machshava:MACHSHAVA}[cat];
           const bk = (src||[])[masIdx];
           const section = bk?.struct?.find(s => s.t === group);
           if (section) {
               if (section.items) {
                   const it = section.items.find(x => String(x.k) === actualKey || String(x.l) === actualKey);
                   if (it && it.ref) return it.ref;
               }
               if (section.refBase) return `${section.refBase}.${actualKey}`;
           }
       }
       
       const clean = bookName.trim();
       if (clean === "אורות הקודש") return `Orot_HaKodesh_I.1.${k}`;
       if (clean === "שמונה קבצים") return `Shemonah_Kevatzim.1.${k}`;
       if (clean === "ליקוטי מוהר\"ן") return `Likutei_Moharan.${k}`;
       if (clean === "שמירת הלשון") return `Shemirat_HaLashon,_Book_I,_Introduction.${k}`;
       
       const bRef = COMPLEX_REFS[clean];
       if (bRef) return `${bRef}.${k}`;
    }

    const eng = SEFARIA_MAP[bookName.trim()] || encodeURIComponent(bookName.trim().replace(/ /g, "_"));
    
    if(cat === "mishna") {
        const prefix = eng === "Pirkei_Avot" ? "" : "Mishnah_";
        if(k.startsWith("pp")) return `${prefix}${eng}.${k.slice(2)}.1`;
        return `${prefix}${eng}.${k.replace(':', '.')}`;
    }
    
    if(cat === "tanach") {
      if(tMode === "parshiot") return PARASHA_MAP[k] || `${eng}.${k}`;
      return `${eng}.${k}`;
    }
    
    return `${eng}.${k}`;
  } catch { return ""; }
}

/* ── STORAGE (SAFE METHODS) ── */
function serProg(prog) {
  const p = prog || IP;
  const o={gemara:{},mishna:{},tanach:{},tanach_parshiot:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};
  const sArr = (s) => Array.isArray(s) ? s : (s instanceof Set ? [...s] : []);
  for(const[k,v] of Object.entries(p.gemara||{})) o.gemara[k]={done:sArr(v?.done)};
  for(const[k,v] of Object.entries(p.mishna||{})) o.mishna[k]={done:sArr(v?.done)};
  for(const[k,v] of Object.entries(p.tanach||{})) o.tanach[k]=sArr(v);
  for(const[k,v] of Object.entries(p.tanach_parshiot||{})) o.tanach_parshiot[k]=sArr(v);
  o.tmode={...(p.tmode||{})};
  for(const c of["musar","ravKook","machshava"]) for(const[k,v] of Object.entries(p[c]||{})) o[c][k]=sArr(v);
  o.custom=(Array.isArray(p.custom)?p.custom:[]).map(b=>({...b,done:sArr(b?.done)}));
  o.notes={...(p.notes||{})}; o.chazara={...(p.chazara||{})};
  return o;
}

function desProg(data) {
  if(!data) return IP;
  const o={gemara:{},mishna:{},tanach:{},tanach_parshiot:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};
  const toSet = (arr) => new Set(Array.isArray(arr) ? arr : []);
  for(const[k,v] of Object.entries(data.gemara||{})) o.gemara[k]={done:toSet(v?.done)};
  for(const[k,v] of Object.entries(data.mishna||{})) o.mishna[k]={done:toSet(v?.done)};
  for(const[k,v] of Object.entries(data.tanach||{})) o.tanach[k]=toSet(v);
  for(const[k,v] of Object.entries(data.tanach_parshiot||{})) o.tanach_parshiot[k]=toSet(v);
  o.tmode={...(data.tmode||{})};
  for(const c of["musar","ravKook","machshava"]) for(const[k,v] of Object.entries(data[c]||{})) o[c][k]=toSet(v);
  o.custom=Array.isArray(data.custom) ? data.custom.map(b=>({...b,done:toSet(b?.done)})) : [];
  o.notes=data.notes||{}; o.chazara=data.chazara||{};
  return o;
}

function mkT(dark,sz,lang) {
  const sc=[0.88,1,1.14][sz]||1, f=n=>Math.round(n*sc), isEn=lang==="en";
  const CAT_L = isEn ? {gemara:"Gemara",mishna:"Mishna",tanach:"Tanach",musar:"Musar",ravKook:"Rav Kook",machshava:"Machshava",custom:"Custom"} : {gemara:"גמרא",mishna:"משניות",tanach:'תנ"ך',musar:"מוסר",ravKook:"ספרי הראי״ה",machshava:"מחשבה",custom:"אישי"};
  const CAT_UNIT = isEn ? {gemara:"dapim",mishna:"mishnayot",tanach:"chapters",musar:"chapters",ravKook:"chapters",machshava:"chapters",custom:"chapters"} : {gemara:"דפים",mishna:"משניות",tanach:"פרקים",musar:"פרקים",ravKook:"פרקים",machshava:"פרקים",custom:"פרקים"};
  const CAT_UNIT_SING = isEn ? {gemara:"daf",mishna:"mishna",tanach:"chapter",musar:"chapter",ravKook:"chapter",machshava:"chapter",custom:"chapter"} : {gemara:"דף",mishna:"משנה",tanach:"פרק",musar:"פרק",ravKook:"פרק",machshava:"פרק",custom:"פרק"};
  
  const UI = isEn ? {
    home: "Home", library: "Library", goals: "Goals", stats: "Stats", settings: "Settings", welcome: "Welcome!", startTracking: "Go to library and start tracking", openLib: "Open Library", activeGoals: "Active Goals", recentActivity: "Recent Activity", daysLeft: "days left", dafYomi: "Daf Yomi", parasha: "Weekly Parasha", dailyHalacha: "Daily Halacha", zmanim: "Zmanim", markBy: "Mark by:", amudim: "Amudim", perakim: "Chapters", mishnayot: "Mishnayot", parshiot: "Parashiyot", cancel: "Cancel", markAll: "Mark All", clearAll: "Clear All", notes: "Notes", repetitions: "Repetitions", save: "Save", addBook: "+ Add Custom Book", searchPlaceholder: "Search books...", completed: "Completed", del: "Delete", newGoal: "+ New Goal", noGoals: "No goals yet", setGoal: "Set a goal and track your pace", firstGoal: "+ First Goal", topic: "Category", book: "Book / Tractate", target: "Target", deadline: "Target Date", saveGoal: "Save Goal", dedicate: "Dedicate Learning", appearance: "Appearance", darkMode: "Dark Mode", darkSub: "Dark background for night", fontSize: "Font Size", small: "S", medium: "M", large: "L", language: "Language", account: "Account", signOut: "Sign Out", support: "Support", contactDev: "Contact Developer", sendEmail: "Send Email", login: "Login", register: "Create Account", email: "Email", password: "Password", name: "Full Name", continueWith: "Continue with", or: "or", newAccount: "Create a new account", onTrack: "On track ✓", behind: "Behind", perDay: "per day", currPace: "curr pace", fullTractates: "Completed Books", dedicateDesc: "Dedicate your learning. Dedications will be visible to all users.", submitDedication: "Submit Dedication", readOnSefaria: "Read Content", openSection: "Read Content", loadingSefaria: "Loading Sefaria text...", baseText: "Base Text", rashi: "Rashi", steinsaltz: "Steinsaltz", bartenura: "Bartenura", noResults: "No results found", results: "Results", selectBook: "Select Book...", developedBy: "Developed by Eitan Shachor. All rights reserved.", zmanMGA: "Latest Shma (MGA)", zmanGRA: "Latest Shma (GRA)", tfillaMGA: "Latest Tefila (MGA)", tfillaGRA: "Latest Tefila (GRA)", chatzot: "Chatzot", sunrise: "Sunrise", sunset: "Sunset", tzeit: "Nightfall", legal: "Legal & Privacy", terms: "Terms of Service", privacy: "Privacy Policy", agreeTerms: "I agree to the Terms of Service and Privacy Policy", mustAgree: "You must agree to the Terms to continue", installApp: "Install App", slogan: "Your Learning Center"
  } : {
    home: "בית", library: "ספרייה", goals: "יעדים", stats: "נתונים", settings: "הגדרות", welcome: "ברוך הבא!", startTracking: "לך לספרייה והתחל לסמן", openLib: "פתח ספרייה", activeGoals: "יעדים פעילים", recentActivity: "פעילות אחרונה", daysLeft: "ימים שנותרו", dafYomi: "דף יומי", parasha: "פרשת השבוע", dailyHalacha: "הלכה יומית", zmanim: "זמני היום", markBy: "סמן לפי:", amudim: "עמודים", perakim: "פרקים", mishnayot: "משניות", parshiot: "פרשות", cancel: "בטל", markAll: "סמן הכל", clearAll: "נקה הכל", notes: "אפשרויות והערות", repetitions: "חזרות", save: "שמור", addBook: "+ הוסף ספר אישי", searchPlaceholder: "חיפוש בכל הספרים...", completed: "הושלם", del: "מחק", newGoal: "+ יעד חדש", noGoals: "אין יעדים עדיין", setGoal: "הגדר יעד ועקוב אחרי הקצב שלך", firstGoal: "+ יעד ראשון", topic: "תחום", book: "ספר / מסכת", target: "יעד (אופציונלי)", deadline: "תאריך יעד", saveGoal: "שמור יעד", dedicate: "הקדשת לימוד", appearance: "מראה", darkMode: "מצב כהה", darkSub: "רקע כהה ללמידה בלילה", fontSize: "גודל טקסט", small: "קטן", medium: "רגיל", large: "גדול", language: "שפה", account: "חשבון", signOut: "התנתקות", support: "תמיכה", contactDev: "צור קשר עם המפתח", sendEmail: "שלח מייל", login: "כניסה", register: "יצירת חשבון", email: "אימייל", password: "סיסמה", name: "שם מלא", continueWith: "המשך עם", or: "או", newAccount: "פתח חשבון חדש", onTrack: "במסלול ✓", behind: "מאחור", perDay: "לכל יום", currPace: "יעד נוכחי", fullTractates: "ספרים שלמים", dedicateDesc: "הקדש את לימודך להצלחת, רפואת או לעילוי נשמת יקיריך. שים לב: ההקדשות יוצגו באפליקציה באופן פומבי לכלל הלומדים.", submitDedication: "שלח בקשת הקדשה", readOnSefaria: "המשך מאותו מקום", openSection: "המשך מאותו מקום", loadingSefaria: "טוען טקסט מספריא...", baseText: "טקסט מקור", rashi: "רש״י", steinsaltz: "ביאור שטיינזלץ", bartenura: "ברטנורא", noResults: "לא נמצאו תוצאות", results: "תוצאות", selectBook: "בחר ספר...", developedBy: "פותח ע״י איתן שחור. כל הזכויות שמורות.", zmanMGA: "סוף זק״ש (מג״א)", zmanGRA: "סוף זק״ש (גר״א)", tfillaMGA: "סוף תפילה (מג״א)", tfillaGRA: "סוף תפילה (גר״א)", chatzot: "חצות", sunrise: "הנץ החמה", sunset: "שקיעה", tzeit: "צאת הכוכבים", legal: "תקנון ופרטיות", terms: "תנאי שימוש", privacy: "מדיניות פרטיות", agreeTerms: "אני מסכים/ה לתקנון ולמדיניות הפרטיות", mustAgree: "יש לאשר את התקנון כדי להירשם", installApp: "התקן כאפליקציה", slogan: "מרכז הלימוד שלך"
  };

  const base = dark ? {bg:"#0D1B2E",card:"#152438",navy:"#D0E4FF",gold:"#E8C060",muted:"#8A9BB0",border:"rgba(200,220,255,0.10)",input:"#1E3050",shadow:"0 2px 16px rgba(0,0,0,0.5)",primary:"#4A7FC0",red:"#FCA5A5"} : {bg:"#FAF7EE",card:"#FFFFFF",navy:NAVY,gold:GOLD,muted:"#6B7280",border:"rgba(26,58,107,0.10)",input:"#F3EED8",shadow:"0 2px 14px rgba(26,58,107,0.09)",primary:NAVY,red:"#B91C1C"};
  return {...base,f,dark,isEn,CAT_L,CAT_UNIT,CAT_UNIT_SING,UI,font:"'Heebo',system-ui,sans-serif"};
}
/* ── UI PRIMITIVES ── */
function Bar({p,color,h,dark}){return <div style={{background:dark?"rgba(255,255,255,0.08)":"rgba(26,58,107,0.08)",borderRadius:99,height:h||6,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:99,transition:"width .4s"}}/></div>;}
function Ring({p,color,size=60,stroke=7,label,sub,dark}){const r=(size-stroke)/2,c=2*Math.PI*r,off=c-(p/100)*c;return <div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark?"rgba(255,255,255,0.10)":"rgba(26,58,107,0.08)"} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .5s"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}><span style={{fontSize:size<50?10:13,fontWeight:800,lineHeight:1}}>{label}</span>{sub&&<span style={{fontSize:7,opacity:.6,lineHeight:1}}>{sub}</span>}</div></div>;}
function Sheet({show,onClose,title,T,children}){if(!show)return null;return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",zIndex:600}}><div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"16px 18px 52px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"90vh",overflowY:"auto",boxSizing:"border-box"}}><div style={{width:38,height:4,background:T.border,borderRadius:99,margin:"0 auto 14px"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><span style={{fontSize:T.f(17),fontWeight:700,color:T.navy,fontFamily:T.font}}>{title}</span><button aria-label="Close" onClick={onClose} style={{background:T.input,border:"none",cursor:"pointer",color:T.muted,fontSize:18,padding:"3px 12px",borderRadius:9,fontFamily:T.font}}>✕</button></div>{children}</div></div>;}
function FI({T,style,...r}){return <input {...r} style={{width:"100%",height:"48px",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:"16px",fontFamily:T.font,direction:T.isEn?"ltr":"rtl",textAlign:"start",outline:"none",boxSizing:"border-box",margin:0,...(style||{})}}/>;}
function FS({T,children,style,...r}){return <select {...r} style={{width:"100%",height:"48px",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:"16px",fontFamily:T.font,direction:T.isEn?"ltr":"rtl",textAlign:"start",outline:"none",boxSizing:"border-box",margin:0,...(style||{})}}>{children}</select>;}
function FTA({T,style,...r}){return <textarea {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:"16px",fontFamily:T.font,direction:T.isEn?"ltr":"rtl",textAlign:"start",outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:90,...(style||{})}}/>;}
function FL({label,T,children}){return <div style={{marginBottom:14}}><label style={{fontSize:T.f(12),color:T.muted,display:"block",marginBottom:5,fontWeight:600,fontFamily:T.font,textAlign:"start"}}>{label}</label>{children}</div>;}
function PB({onClick,children,T,color,style,disabled}){return <button disabled={disabled} onClick={onClick} style={{width:"100%",height:"48px",padding:13,background:disabled?"#ccc":color||T.primary,color:"#fff",border:"none",borderRadius:12,fontSize:T.f(15),fontWeight:700,cursor:"pointer",fontFamily:T.font,boxSizing:"border-box",margin:0,...(style||{})}}>{children}</button>;}
function MB({active,onClick,label,color,T}){return <button onClick={onClick} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`2px solid ${active?color:T.border}`,background:active?color:"transparent",color:active?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:active?700:400,fontFamily:T.font,transition:"all .2s"}}>{label}</button>;}
function Toggle({on,onToggle,primary}){return <div onClick={onToggle} style={{width:50,height:28,borderRadius:14,background:on?primary:"#D1D5DB",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,width:22,height:22,borderRadius:"50%",background:"#fff",left:on?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div>;}

function DualDateInput({T, value, onChange}) {
  const hd = value ? hebStr(value) : "";
  return (
    <div>
      <FI T={T} type="date" value={value} onChange={onChange} style={{direction:"ltr", colorScheme: T.dark ? "dark" : "light"}}/>
      {hd && <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:T.f(13),color:T.gold||GOLD,marginTop:6,fontWeight:700,background:T.dark?"rgba(201,168,76,0.15)":"#FBF5E0",borderRadius:8,padding:"6px 10px"}}><IcoCalendar/> {hd}</div>}
    </div>
  );
}

function LegalSheet({show, onClose, type, T}) {
  return (
    <Sheet show={show} onClose={onClose} title={type === 'terms' ? T.UI.terms : T.UI.privacy} T={T}>
      <div style={{fontSize:T.f(13), color:T.muted, lineHeight:1.6, textAlign:"start"}}>
        {type === 'terms' ? (
          T.isEn ? (
            <>
              <p><strong>1. Introduction</strong><br/>Welcome to the Aliba app. By accessing or using our application, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.</p>
              <p><strong>2. User Accounts</strong><br/>To use certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
              <p><strong>3. Use of the App</strong><br/>Aliba is a tool designed to help users track their Torah study. You agree to use the app only for lawful purposes and in a way that does not infringe the rights of others.</p>
              <p><strong>4. Intellectual Property</strong><br/>All content, features, and functionality of the app, including text, graphics, logos, and icons, are the exclusive property of Aliba and are protected by copyright laws. The Torah texts provided are courtesy of Sefaria.org.</p>
              <p><strong>5. Limitation of Liability</strong><br/>The app is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the app will be uninterrupted or error-free. In no event shall we be liable for any indirect, incidental, or consequential damages.</p>
              <p><strong>6. Changes to Terms</strong><br/>We reserve the right to modify these terms at any time. Your continued use of the app following any changes constitutes your acceptance of the new terms.</p>
            </>
          ) : (
            <>
              <p><strong>1. מבוא</strong><br/>ברוכים הבאים לאפליקציית אליבא. השימוש באפליקציה, לרבות בתכנים ובשירותים המוצעים בה, מהווה את הסכמתך לתנאי שימוש אלה. אם אינך מסכים לתנאים, הנך מתבקש שלא לעשות שימוש באפליקציה.</p>
              <p><strong>2. רישום וחשבון משתמש</strong><br/>השימוש בחלק משירותי האפליקציה דורש הרשמה ויצירת חשבון. הנך אחראי לשמור על סודיות פרטי החשבון שלך ועל כל פעולה שתתבצע תחתיו. אין למסור את פרטי הגישה לצד שלישי.</p>
              <p><strong>3. שימוש באפליקציה</strong><br/>אליבא נועדה להוות כלי עזר אישי למעקב אחר התקדמות הלימוד התורני. הנך מתחייב להשתמש באפליקציה למטרות חוקיות בלבד, ולא לבצע כל פעולה שעלולה לפגוע בפעילותה התקינה או במשתמשים אחרים.</p>
              <p><strong>4. קניין רוחני</strong><br/>כל זכויות הקניין הרוחני באפליקציה, לרבות עיצוב, קוד, לוגו וממשק המשתמש, שייכות למפתח האפליקציה. הטקסטים התורניים מוצגים באדיבות פרויקט Sefaria.org וכפופים לרישיונות שלהם.</p>
              <p><strong>5. הגבלת אחריות</strong><br/>האפליקציה מסופקת כמות שהיא (AS IS). אנו לא נישא באחריות לכל נזק, ישיר או עקיף, שייגרם כתוצאה משימוש באפליקציה, אובדן נתונים, או אי-דיוקים בתוכן המוצג (לרבות זמני היום וטקסטים).</p>
              <p><strong>6. עדכונים ושינויים</strong><br/>אנו שומרים את הזכות לשנות את תנאי השימוש מעת לעת, ללא הודעה מוקדמת. המשך השימוש באפליקציה לאחר ביצוע שינויים מהווה הסכמה לתנאים המעודכנים.</p>
            </>
          )
        ) : (
          T.isEn ? (
            <>
              <p><strong>1. Information Collection</strong><br/>We collect information you provide directly to us, such as when you create an account (name, email address) and the study data you input into the app to track your progress.</p>
              <p><strong>2. Use of Information</strong><br/>The information collected is used solely to provide, maintain, and improve the app's functionality, personalize your experience, and sync your data across your devices.</p>
              <p><strong>3. Data Storage & Security</strong><br/>Your data is stored securely using cloud infrastructure (Firebase by Google). We implement reasonable security measures to protect your personal information from unauthorized access.</p>
              <p><strong>4. Sharing of Information</strong><br/>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your public dedications (if submitted) will be visible to other users.</p>
              <p><strong>5. User Rights</strong><br/>You have the right to access, update, or delete your personal information at any time. If you wish to completely remove your account and data, please contact support.</p>
            </>
          ) : (
            <>
              <p><strong>1. איסוף מידע</strong><br/>אנו אוספים מידע שאתה מוסר לנו באופן ישיר, כגון בעת יצירת החשבון (שם, כתובת דוא"ל) ואת נתוני הלימוד, היעדים וההערות שאתה מזין באפליקציה.</p>
              <p><strong>2. שימוש במידע</strong><br/>המידע שנאסף משמש בלבד לצורך תפעול תקין של האפליקציה, סנכרון הנתונים שלך בין מכשירים שונים (גיבוי בענן), ושיפור חווית המשתמש האישית שלך.</p>
              <p><strong>3. אחסון ואבטחת נתונים</strong><br/>הנתונים שלך מאוחסנים בצורה מאובטחת על גבי שרתי הענן של Firebase (מבית Google). אנו נוקטים באמצעי אבטחה סבירים ומקובלים כדי להגן על המידע שלך מפני גישה בלתי מורשית.</p>
              <p><strong>4. שיתוף מידע עם צדדים שלישיים</strong><br/>אנו מתחייבים שלא למכור, לסחור או להעביר את המידע האישי שלך לצדדים שלישיים. עם זאת, שים לב כי "הקדשות לימוד" שתבחר לפרסם יופיעו באופן פומבי לכלל המשתמשים.</p>
              <p><strong>5. זכויות המשתמש (מחיקת מידע)</strong><br/>הנך זכאי לעיין במידע השמור עליך, לעדכן אותו או לבקש את מחיקתו. אם ברצונך למחוק את חשבונך לחלוטין משרתינו, תוכל לעשות זאת על ידי פנייה למפתח דרך כפתור התמיכה.</p>
            </>
          )
        )}
      </div>
    </Sheet>
  );
}

/* ── WELCOME / ONBOARDING PROMPT ── */
function WelcomePrompt({ T }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenWelcomeAliba');
    if (!hasSeen) {
        const timer = setTimeout(() => setShow(true), 500);
        return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
      setShow(false);
      localStorage.setItem('hasSeenWelcomeAliba', '1');
  };

  if (!show) return null;

  return (
    <Sheet show={show} onClose={handleClose} title={T.isEn ? "Welcome to Aliba!" : "ברוכים הבאים לאליבא! 🎉"} T={T}>
        <div style={{fontSize: T.f(14), color: T.navy, lineHeight: 1.6, textAlign: 'start'}}>
            <p style={{marginBottom: 18, fontSize: T.f(15), fontWeight: 600}}>
                {T.isEn ? "Your personal Torah study tracker." : "האפליקציה האישית שלך למעקב וניהול הלימוד התורני."}
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24}}>
                <div style={{display: 'flex', gap: 12, alignItems: 'flex-start', background: T.input, padding: '10px 12px', borderRadius: 10}}>
                    <div style={{color: T.gold||"#C9A84C", marginTop: 2}}><IcoBook/></div>
                    <div><strong style={{display: 'block', marginBottom: 2}}>{T.isEn ? "Track Progress" : "מעקב חכם ופשוט"}</strong> {T.isEn ? "Mark learned pages and chapters." : "סמנו דפים, פרקים ומשניות שלמדתם, ואפילו הוסיפו ספרים אישיים משלכם."}</div>
                </div>
                <div style={{display: 'flex', gap: 12, alignItems: 'flex-start', background: T.input, padding: '10px 12px', borderRadius: 10}}>
                    <div style={{color: T.gold||"#C9A84C", marginTop: 2}}><IcoClock/></div>
                    <div><strong style={{display: 'block', marginBottom: 2}}>{T.isEn ? "Set Goals" : "הצבת יעדים"}</strong> {T.isEn ? "Set personal targets and stay on pace." : "קבעו תאריכי יעד לסיים מסכתות וספרים, והאפליקציה תחשב עבורכם את הקצב היומי."}</div>
                </div>
                <div style={{display: 'flex', gap: 12, alignItems: 'flex-start', background: T.input, padding: '10px 12px', borderRadius: 10}}>
                    <div style={{color: T.gold||"#C9A84C", marginTop: 2}}><IcoScroll/></div>
                    <div><strong style={{display: 'block', marginBottom: 2}}>{T.isEn ? "Learn Anywhere" : "לימוד מכל מקום"}</strong> {T.isEn ? "קראו את הטקסט מלא כולל כל המפרשים ישירות מתוך האפליקציה." : "קראו את הטקסט מלא כולל כל המפרשים ישירות מתוך האפליקציה."}</div>
                </div>
            </div>
            <PB T={T} onClick={handleClose} style={{background: T.primary}}>{T.isEn ? "Let's Start!" : "קדימה, נתחיל!"}</PB>
        </div>
    </Sheet>
  );
}

/* ── INSTALL PROMPT COMPONENT ── */
function InstallPrompt({ T, sett, setSett }) {
  const [show, setShow] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const localHide = localStorage.getItem('hideInstallAliba');
    const sessionHide = sessionStorage.getItem('sessionHideInstallAliba');
    
    if (!isStandalone && !sett.hideInstallPrompt && !localHide && !sessionHide) {
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
    }
  }, [sett.hideInstallPrompt]);

  const handleClose = () => {
      setShow(false);
      sessionStorage.setItem('sessionHideInstallAliba', '1');
      if (dontShow) {
          setSett(s => ({ ...s, hideInstallPrompt: true }));
          localStorage.setItem('hideInstallAliba', '1');
      }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!show) return null;

  return (
    <Sheet show={show} onClose={handleClose} title={T.isEn ? "Install App" : "התקן את האפליקציה"} T={T}>
        <div style={{fontSize: T.f(14), color: T.muted, lineHeight: 1.6, textAlign: 'start'}}>
            <p style={{marginBottom: 12}}>{T.isEn ? "To install the app on your home screen:" : "הוסף את אליבא למסך הבית שלך לחוויה מלאה (כמו אפליקציה רגילה):"}</p>
            {isIOS ? (
                <ul style={{paddingInlineStart: 20, marginBottom: 20}}>
                    <li style={{marginBottom: 8}}>{T.isEn ? "Tap the Share icon at the bottom." : "1. לחץ על כפתור השיתוף (מרובע עם חץ למעלה) בתחתית המסך."}</li>
                    <li>{T.isEn ? "Scroll down and tap 'Add to Home Screen'." : "2. גלול למטה ובחר ב-'הוסף למסך הבית' (Add to Home Screen)."}</li>
                </ul>
            ) : (
                <ul style={{paddingInlineStart: 20, marginBottom: 20}}>
                    <li style={{marginBottom: 8}}>{T.isEn ? "Tap the menu icon (3 dots) in your browser." : "1. לחץ על תפריט הדפדפן (3 נקודות למעלה)."}</li>
                    <li>{T.isEn ? "Tap 'Add to Home Screen' or 'Install app'." : "2. בחר ב-'הוסף למסך הבית' או 'התקן אפליקציה'."}</li>
                </ul>
            )}
            <label style={{display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: T.input, padding: '12px 14px', borderRadius: 10}}>
                <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} style={{transform: 'scale(1.2)'}} />
                <span style={{fontSize: T.f(13), fontWeight: 600, color: T.navy}}>{T.isEn ? "Don't show this again" : "אל תציג הודעה זו שוב"}</span>
            </label>
            <PB T={T} onClick={handleClose} style={{marginTop: 20, background: T.primary}}>{T.isEn ? "Got it, Close" : "הבנתי, סגור"}</PB>
        </div>
    </Sheet>
  );
}

/* ── SEFARIA READER SHEET ── */
function SefariaReaderSheet({ show, onClose, title, sefariaRef, cat, isTorah, T }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([]);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(22);
  const [showEn, setShowEn] = useState(false);
  const [shnayimMode, setShnayimMode] = useState(false);
  const [targumContent, setTargumContent] = useState([]);
  const [rashiContent, setRashiContent] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [baseRef, setBaseRef] = useState("");
  const [activeSegment, setActiveSegment] = useState(null);
  const [commData, setCommData] = useState([]);
  const [commLoading, setCommLoading] = useState(false);
  
  const [fetchingNext, setFetchingNext] = useState(false);
  const fetchingNextRef = useRef(false);
  const nextRefObj = useRef(null);

  const observerRef = useRef(null);
  const autoOpenRef = useRef(false);

  useEffect(() => {
      autoOpenRef.current = activeSegment !== null;
  }, [activeSegment]);

  const flattenText = (node) => {
      let res = [];
      if (Array.isArray(node)) {
          node.forEach(child => {
              res = res.concat(flattenText(child));
          });
      } else if (typeof node === 'string') {
          res.push(node);
      } else if (node == null) {
          res.push("");
      }
      return res;
  };

  const parseStructure = (heNode, enNode, prefix = "") => {
     let result = [];
     if (Array.isArray(heNode) || Array.isArray(enNode)) {
        const len = Math.max((heNode || []).length, (enNode || []).length);
        for (let i = 0; i < len; i++) {
           const h = heNode ? heNode[i] : null;
           const e = enNode ? enNode[i] : null;
           const num = i + 1;
           const newPrefix = prefix ? `${prefix}:${num}` : `${num}`;
           
           if (Array.isArray(h) || Array.isArray(e)) {
               result = result.concat(parseStructure(h, e, newPrefix));
           } else {
               if (h || e) result.push({ num: num, he: h, en: e, idx: num, fullIdx: newPrefix });
           }
        }
     } else if (typeof heNode === 'string' || typeof enNode === 'string') {
        result.push({ num: 1, he: heNode, en: enNode, idx: 1, fullIdx: prefix || "1" });
     }
     return result;
  };

  useEffect(() => {
    if (!show || !sefariaRef) {
       setRetryCount(0);
       setActiveSegment(null);
       setShnayimMode(false);
       setTargumContent([]);
       setRashiContent([]);
       nextRefObj.current = null;
       fetchingNextRef.current = false;
       return;
    }
    setLoading(true); setError(null); setContent([]); setActiveSegment(null);

    const url = `https://www.sefaria.org/api/texts/${sefariaRef}?context=1&pad=1`;

    fetch(url)
      .then(r => {
         if (!r.ok) throw new Error(`HTTP ${r.status}`);
         return r.json();
      })
      .then(data => {
        setBaseRef(data.ref);
        nextRefObj.current = data.next;
        
        const parsed = parseStructure(data.he || data.text, data.text);
        setContent(parsed.map(item => ({ ...item, pageRef: data.ref })));
        
        setLoading(false);
        setRetryCount(0);
      }).catch(e => {
        if (retryCount < 3) {
          setTimeout(() => setRetryCount(prev => prev + 1), 1000);
        } else {
          setError(`שגיאה בטעינת הקטע (${sefariaRef}). ייתכן שהשם חסר באינדקס של ספריא.`);
          setLoading(false);
        }
      });
  }, [show, sefariaRef, retryCount]);

  useEffect(() => {
    if (shnayimMode && isTorah && baseRef) {
        const safeRef = baseRef.replace(/ /g, '_');
        fetch(`https://www.sefaria.org/api/texts/Onkelos_${safeRef}?context=0`)
            .then(r => r.json())
            .then(d => setTargumContent(flattenText(d.he || d.text || [])))
            .catch(e => console.error(e));
        
        fetch(`https://www.sefaria.org/api/texts/Rashi_on_${safeRef}?context=0`)
            .then(r => r.json())
            .then(d => setRashiContent(flattenText(d.he || d.text || [])))
            .catch(e => console.error(e));
    } else {
        setTargumContent([]);
        setRashiContent([]);
    }
  }, [shnayimMode, baseRef, isTorah]);

  const loadNextPage = async () => {
      if (!nextRefObj.current || fetchingNextRef.current) return;
      fetchingNextRef.current = true;
      setFetchingNext(true);
      try {
          const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(nextRefObj.current.replace(/ /g, '_'))}?context=1&pad=1`;
          const r = await fetch(url);
          if (!r.ok) throw new Error("Failed to fetch");
          const data = await r.json();
          
          const parsed = parseStructure(data.he || data.text, data.text);
          const newItems = parsed.map(item => ({ ...item, pageRef: data.ref }));
          
          setContent(prev => [
              ...prev, 
              { isSeparator: true, label: data.ref }, 
              ...newItems
          ]);
          nextRefObj.current = data.next;
      } catch (e) {
          console.error("Next page error", e);
      } finally {
          fetchingNextRef.current = false;
          setFetchingNext(false);
      }
  };

  const handleScroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 250) {
          if (cat === "gemara" && nextRefObj.current && !fetchingNextRef.current) {
              loadNextPage();
          }
      }
  };

  const loadCommentary = async (item) => {
      setCommLoading(true);
      try {
          let specificRef;
          if (cat === "gemara") {
              specificRef = `${item.pageRef}.${item.fullIdx}`.replace(/ /g, '_');
          } else {
              specificRef = `${baseRef.replace(/ /g, '_')}.${item.fullIdx}`;
          }
          const r = await fetch(`https://www.sefaria.org/api/texts/${encodeURIComponent(specificRef)}?commentary=1&context=0`);
          const d = await r.json();
          
          let filteredComm = (d.commentary || []).filter(c => {
              if (!c.he || c.he.length === 0) return false;
              
              const tEn = (c.collectiveTitle?.en || c.index_title || "").toLowerCase();
              const tHe = c.collectiveTitle?.he || "";
              
              if (cat === "gemara") {
                  return tEn.startsWith("rashi") || tEn.startsWith("tosafot") || tEn.startsWith("steinsaltz") || 
                         tHe.startsWith("רש\"י") || tHe.startsWith("תוספות") || tHe.startsWith("ביאור שטיינזלץ") || tHe.startsWith("שטיינזלץ");
              }
              if (cat === "mishna") {
                  const isBartenura = tEn.startsWith("bartenura") || tHe.startsWith("ברטנורא");
                  if (isBartenura && c.anchorRef && !c.anchorRef.includes(item.fullIdx)) return false;
                  return isBartenura;
              }
              if (cat === "tanach") {
                  return tEn.startsWith("rashi") || tEn.startsWith("onkelos") || tEn.startsWith("targum onkelos") || 
                         tHe.startsWith("רש\"י") || tHe.startsWith("אונקלוס") || tHe.startsWith("תרגום אונקלוס");
              }
              
              return false; 
          });

          filteredComm.sort((a, b) => {
              const score = (name) => {
                  if (name.startsWith("steinsaltz")) return 3;
                  if (name.startsWith("rashi") || name.startsWith("bartenura")) return 2;
                  if (name.startsWith("tosafot")) return 1;
                  return 0;
              };
              return score((b.collectiveTitle?.en || "").toLowerCase()) - score((a.collectiveTitle?.en || "").toLowerCase());
          });

          setCommData(filteredComm);
      } catch (e) {
          console.error("Failed to load commentaries", e);
      } finally {
          setCommLoading(false);
      }
  };

  const toggleCommentary = (item) => {
      if (item.isSeparator) return;
      const uniqueKey = `${item.pageRef}|${item.fullIdx}`;
      if (activeSegment === uniqueKey) {
          setActiveSegment(null);
          return;
      }
      setActiveSegment(uniqueKey);
      loadCommentary(item);
  };

  useEffect(() => {
      if (content.length === 0) return;
      observerRef.current = new IntersectionObserver((entries) => {
          let intersectingKey = null;
          entries.forEach((entry) => {
              if (entry.isIntersecting && autoOpenRef.current) {
                  intersectingKey = entry.target.getAttribute('data-unique-key');
              }
          });
          if (intersectingKey) {
              const foundItem = content.find(it => !it.isSeparator && `${it.pageRef}|${it.fullIdx}` === intersectingKey);
              if (foundItem) {
                  setActiveSegment(prev => {
                      if (prev !== intersectingKey) {
                          loadCommentary(foundItem);
                          return intersectingKey;
                      }
                      return prev;
                  });
              }
          }
      }, { root: document.getElementById('sefaria-scroll-container'), rootMargin: '-30% 0px -50% 0px', threshold: 0 });

      setTimeout(() => {
          const elements = document.querySelectorAll('.sefaria-segment');
          elements.forEach(el => observerRef.current.observe(el));
      }, 500);
      
      return () => { if(observerRef.current) observerRef.current.disconnect(); };
  }, [content, baseRef]);

  return (
    <Sheet show={show} onClose={()=>{onClose(); setRetryCount(0); setActiveSegment(null); setShnayimMode(false);}} title={title} T={T}>
      <div id="sefaria-scroll-container" onScroll={handleScroll} style={{minHeight: 200, maxHeight: '75vh', overflowY: 'auto', paddingRight: 8, direction: 'rtl'}}>
         <div style={{display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start'}}>
            <div style={{display: 'flex', background: T.input, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}`}}>
               <button onClick={()=>setZoom(z => Math.max(14, z - 2))} style={{padding: '8px 14px', background: 'transparent', border: 'none', color: T.navy, cursor: 'pointer', fontSize: 18, fontWeight: 700}}>-</button>
               <div style={{width: 1, background: T.border}}></div>
               <button onClick={()=>setZoom(z => Math.min(36, z + 2))} style={{padding: '8px 14px', background: 'transparent', border: 'none', color: T.navy, cursor: 'pointer', fontSize: 18, fontWeight: 700}}>+</button>
            </div>
            <button onClick={()=>setShowEn(!showEn)} style={{padding: '0 16px', height: '40px', borderRadius: 8, background: showEn ? T.primary : T.input, color: showEn ? '#fff' : T.navy, border: `1px solid ${T.border}`, fontWeight: 700, fontFamily: T.font, cursor: 'pointer'}}>
               {showEn ? "עברית בלבד" : "Hebrew / English"}
            </button>
            
            {isTorah && (
                <button onClick={()=>setShnayimMode(!shnayimMode)} style={{padding: '0 16px', height: '40px', borderRadius: 8, background: shnayimMode ? (T.gold||GOLD) : T.input, color: shnayimMode ? '#fff' : T.navy, border: `1px solid ${shnayimMode ? (T.gold||GOLD) : T.border}`, fontWeight: 800, fontFamily: T.font, cursor: 'pointer', transition: 'all 0.2s'}}>
                    {shnayimMode ? "הסתר מפרשים" : "שניים מקרא ואחד תרגום"}
                </button>
            )}
         </div>

         {loading && <div style={{textAlign:'center', color: T.muted, padding:40, fontSize: T.f(15)}}>{T.UI.loadingSefaria} ⏳</div>}
         {error && <div style={{textAlign:'center', color: T.red, padding:20, fontWeight:600}}>{error}</div>}
         {!loading && !error && content.length === 0 && <div style={{textAlign:'center', color: T.muted, padding:20}}>לא נמצא טקסט עברי זמין לקטע זה.</div>}
         
         {!loading && !error && content.length > 0 && (
             <div style={{fontSize: T.f(12), color: T.muted, marginBottom: 16, textAlign: 'center', background: T.input, padding: '6px', borderRadius: 8}}>
                 💡 לחץ על שורה כדי לראות מפרשים לאותו קטע
             </div>
         )}

         {!loading && !error && content.map((item, i) => {
            if (item.isSeparator) {
                return (
                    <div key={`sep-${i}`} style={{textAlign: 'center', padding: '12px', background: T.dark ? '#1A2436' : '#F0F4F8', color: T.navy, fontWeight: 800, margin: '32px 0 16px', borderRadius: 8, fontSize: T.f(14)}}>
                        --- {item.label} ---
                    </div>
                );
            }

            const uniqueKey = `${item.pageRef}|${item.fullIdx}`;
            const isActive = activeSegment === uniqueKey;
            const targum = targumContent[i]; 
            const rashi = rashiContent[i];
            
            return (
            <div key={uniqueKey} className="sefaria-segment" data-unique-key={uniqueKey} style={{marginBottom: 24, cursor: 'pointer', padding: '0 8px', borderRight: isActive ? `4px solid ${T.gold||GOLD}` : '4px solid transparent', transition: 'all 0.2s'}} onClick={() => toggleCommentary(item)}>
               
               {item.he && shnayimMode ? (
                   <div style={{marginBottom: 16, paddingBottom: 16, borderBottom: `1px dashed ${T.border}`}}>
                       <p style={{fontSize: zoom, lineHeight: 1.6, color: T.navy, fontFamily: "'Frank Ruhl Libre', serif", fontWeight: isActive ? 700 : 500, textAlign: 'justify', margin: "0 0 6px 0"}}>
                          <span style={{color:T.gold||GOLD, fontWeight:800, marginRight:6, fontSize: zoom * 0.7}}>{toHeb(item.idx)}.</span>
                          <span dangerouslySetInnerHTML={{__html: item.he || ""}} />
                       </p>
                       <p style={{fontSize: zoom, lineHeight: 1.6, color: T.navy, fontFamily: "'Frank Ruhl Libre', serif", fontWeight: isActive ? 700 : 500, textAlign: 'justify', margin: "0 0 12px 0"}}>
                          <span dangerouslySetInnerHTML={{__html: item.he || ""}} />
                       </p>
                       {targum && (
                           <p style={{fontSize: Math.max(14, zoom * 0.8), lineHeight: 1.5, color: T.muted, fontFamily: "'Frank Ruhl Libre', serif", textAlign: 'justify', margin: "0 0 12px 0", paddingRight: 10, borderRight: `3px solid ${T.border}`}}>
                              <span style={{fontWeight: 700, color: T.navy}}>אונקלוס: </span>
                              <span dangerouslySetInnerHTML={{__html: Array.isArray(targum) ? targum.join('<br/>') : (targum || "")}} />
                           </p>
                       )}
                       {rashi && (
                           <div style={{fontSize: Math.max(14, zoom * 0.8), lineHeight: 1.5, color: T.navy, fontFamily: "'Frank Ruhl Libre', serif", textAlign: 'justify', margin: "0 0 6px 0", background: T.dark ? '#1A2436' : '#F8F9FA', padding: 12, borderRadius: 8}}>
                              <span style={{fontWeight: 800, color: T.primary}}>רש"י: </span>
                              <span dangerouslySetInnerHTML={{__html: Array.isArray(rashi) ? rashi.join('<br/>') : (rashi || "")}} />
                           </div>
                       )}
                   </div>
               ) : (
                   item.he && (
                       <p style={{fontSize: zoom, lineHeight: 1.6, color: T.navy, fontFamily: "'Frank Ruhl Libre', serif", fontWeight: isActive ? 700 : 500, textAlign: 'justify', margin: 0}}>
                          <span style={{color:T.gold||GOLD, fontWeight:800, marginRight:6, fontSize: zoom * 0.7}}>{toHeb(item.idx)}.</span>
                          <span dangerouslySetInnerHTML={{__html: item.he || ""}} />
                       </p>
                   )
               )}

               {showEn && item.en && (
                   <p style={{fontSize: zoom * 0.8, lineHeight: 1.5, color: T.muted, fontFamily: "system-ui, sans-serif", textAlign: 'left', direction: 'ltr', marginTop: 8}}>
                      <span dangerouslySetInnerHTML={{__html: item.en || ""}} />
                   </p>
               )}
               
               {isActive && (
                   <div style={{background: T.dark ? '#1A2436' : '#F8F9FA', borderRadius: 12, padding: 16, marginTop: 16, cursor: 'default'}} onClick={e => e.stopPropagation()}>
                       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                           <div style={{fontSize: T.f(14), fontWeight: 800, color: T.navy}}>מפרשים מקומיים</div>
                           <button onClick={() => setActiveSegment(null)} style={{background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: T.f(12)}}>סגור ✕</button>
                       </div>
                       
                       {commLoading ? <div style={{color: T.muted, fontSize: T.f(12)}}>טוען מפרשים מהרשת...</div> : (
                           commData.length === 0 ? <div style={{color: T.muted, fontSize: T.f(12)}}>אין מפרשים זמינים לקטע זה.</div> : (
                               <div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4}}>
                                   {commData.filter(c => c.he && c.he.length > 0).map((c, ci) => (
                                       <div key={ci}>
                                           <div style={{fontSize: T.f(12), fontWeight: 800, color: T.primary, marginBottom: 4}}>{c.collectiveTitle?.he || c.index_title}</div>
                                           <div style={{fontSize: zoom * 0.75, color: T.navy, lineHeight: 1.5, fontFamily: "'Frank Ruhl Libre', serif"}} dangerouslySetInnerHTML={{__html: Array.isArray(c.he) ? c.he.join('<br/>') : (c.he || "")}} />
                                       </div>
                                   ))}
                               </div>
                           )
                       )}
                   </div>
               )}
            </div>
         )})}
         {fetchingNext && <div style={{textAlign:'center', color: T.muted, padding:20, fontSize: T.f(14)}}>טוען את העמוד הבא... ⏳</div>}
      </div>
    </Sheet>
  );
}

/* ── BOOK CARD ── */
function BookCard({cat, item, prog, T, cc, cl, onPress, custom}){
  if(!item) return null;
  const { isC, origIdx, i: idx } = item;
  const dn = isC ? (prog?.custom?.[origIdx]?.done?.size || 0) : calcDone(prog, cat, idx);
  const tot = isC ? (prog?.custom?.[origIdx]?.chapters || 0) : bkTotal(prog, cat, idx, custom);
  const col = cc[cat] || T.primary, p = pct(dn, tot), fin = dn >= tot && tot > 0;
  return (
    <div onClick={()=>onPress(item)} style={{background:T.card,borderRadius:14,padding:"13px 15px",marginBottom:8,cursor:"pointer",boxShadow:T.shadow,borderRight:`4px solid ${fin?col:"transparent"}`,boxSizing:"border-box"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
        <div style={{flex:1}}><div style={{fontSize:T.f(15),fontWeight:700,color:T.navy,textAlign:"start"}}>{item.n}</div>{item.sub&&<div style={{fontSize:T.f(11),color:T.muted,marginTop:1,textAlign:"start"}}>{item.sub}</div>}</div>
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
  const { cat, i: idx, isC, origIdx, autoOpenKey } = detail;
  const list = getBkList(cat, prog?.custom);
  const item = list.find(l => String(l.idKey) === String(isC ? 'custom_c'+origIdx : cat+'_s'+idx));
  const col=cc[cat]||T.primary,lightCol=cl[cat]||"#E8EFF8";
  const[viewMode,setViewMode]=useState(cat==="gemara"?"amudim":cat==="mishna"?"mishna":"perakim");
  const[noteSheet,setNoteSheet]=useState(null), [editNote,setEditNote]=useState(""), [editChz,setEditChz]=useState(0), [readerRef, setReaderRef]=useState(null), [readerTitle, setReaderTitle]=useState(""), [hasAutoOpened, setHasAutoOpened]=useState(false);
  const tMode=prog?.tmode?.[idx]||"perakim";
  const isTorah=cat==="tanach"&&idx<5&&!isC;
  const isParsh=cat==="tanach"&&tMode==="parshiot"&&isTorah;

  const items=useMemo(()=>{
    const arr=[];
    if (isC) {
      const p = prog?.custom?.[origIdx]?.chapters || 0;
      for(let i=1;i<=p;i++) arr.push({key:i,label:toHeb(i)});
    } else if(cat==="gemara"){
      if(viewMode==="amudim"){const D=GEMARA[idx]?.d||0;for(let d=2;d<=D;d++){arr.push({key:`${d}a`,label:`${toHeb(d)}.`});arr.push({key:`${d}b`,label:`${toHeb(d)}:`,});}}
      else if(viewMode==="perakim"){
          const P=GEMARA[idx]?.p||0;
          const names = GEMARA_CHAP_NAMES[GEMARA[idx]?.n];
          for(let p=1;p<=P;p++) {
              const nameLabel = names && names[p-1] ? ` - ${names[p-1]}` : "";
              const amudCount = perekAmudKeys(idx, p).length;
              arr.push({key:`p${p}`,label:`${T.isEn?"Chap":""} ${toHeb(p)}${nameLabel}`, sub: `${Math.ceil(amudCount/2)} ${T.isEn?"Dapim":"דפים"}`});
          }
      }
    } else if(cat==="mishna"){
      if(viewMode==="mishna"){const ms=MISHNA[idx]?.ms||[];ms.forEach((cnt,pi)=>{for(let m=1;m<=cnt;m++)arr.push({key:`${pi+1}:${m}`,label:`${toHeb(pi+1)},${toHeb(m)}`});});}
      else if(viewMode==="perakim"){
          const P=MISHNA[idx]?.p||0;
          for(let p=1;p<=P;p++){
              const msCount = MISHNA[idx]?.ms?.[p-1] || 0;
              arr.push({key:`pp${p}`,label:`${T.isEn?"Chap":""} ${toHeb(p)}`, sub: `${msCount} ${T.isEn?"Mishnayot":"משניות"}`});
          }
      }
    } else if(cat==="tanach"){
      if(isParsh) { 
          (PARSHIOT[idx]||[]).forEach(ps=>arr.push({key:ps,label:ps, sub: `${PARASHA_VERSES[ps]||0} ${T.isEn?"Verses":"פסוקים"}`})); 
      } 
      else { for(let i=1;i<=(TANACH[idx]?.c||0);i++) arr.push({key:i,label:`${T.isEn?"Chap":""} ${toHeb(i)}`}); }
    } else {
      const src={musar:MUSAR,ravKook:RAV_KOOK,machshava:MACHSHAVA}[cat];
      const bk = (src||[])[idx];
      if(!bk) return arr;
      
      if (bk.struct) {
          bk.struct.forEach(section => {
              arr.push({ isHeader: true, group: section.t, key: `hdr-${section.t}` });
              if (section.items) {
                  section.items.forEach(i => arr.push({ key: `${section.t}|${i.k}`, label: i.l, group: section.t, exactRef: i.ref }));
              } else if (section.p) {
                  for(let i=1; i<=section.p; i++) {
                      arr.push({ key: `${section.t}|${i}`, label: toHeb(i), group: section.t, refBase: section.refBase });
                  }
              }
          });
      } else {
         const p = bk.p || 0;
         if (bk.n === "אמונות ודעות") arr.push({key:"הקדמה",label:"הקדמה"});
         for(let i=1;i<=p;i++) arr.push({key:i,label:toHeb(i)});
      }
    }
    return arr;
  },[cat,idx,viewMode,tMode,isC,origIdx,prog, T.isEn, isTorah, isParsh]);

  useEffect(() => {
    if (autoOpenKey && !hasAutoOpened && items.length > 0) {
       const it = items.find(x => String(x.key) === String(autoOpenKey));
       if (it) {
          const ref = getSefariaRefString(cat, item?.n, it.key, tMode, isC, idx);
          if(ref) { setReaderRef(ref); setReaderTitle(`${item?.n||""} ${it.label}`); setHasAutoOpened(true); }
       }
    }
  }, [autoOpenKey, items, hasAutoOpened, cat, item, tMode, isC, idx]);

  function isOn(key){
    if(isC) return safeHas(prog?.custom?.[origIdx]?.done, key);
    if(cat==="gemara"){
      const g=prog?.gemara?.[idx];
      if(!g)return false;
      if(String(key).startsWith("p")){
        const pn=parseInt(String(key).slice(1));
        const ak=perekAmudKeys(idx,pn);
        return ak.length>0&&ak.every(k=>safeHas(g?.done, k));
      }
      return safeHas(g?.done, key); 
    }
    if(cat==="mishna"){const m=prog?.mishna?.[idx];if(!m)return false;if(String(key).startsWith("pp")){const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);return mk.length>0&&mk.every(k=>safeHas(m?.done, k));}return safeHas(m?.done, key);}
    if(cat==="tanach"){
      if(isParsh) return safeHas(prog?.tanach_parshiot?.[idx], key);
      return safeHas(prog?.tanach?.[idx], key);
    }
    return safeHas(prog?.[cat]?.[idx], key);
  }

  function isPartial(key){
    if(isC) return false;
    if(cat==="gemara"&&String(key).startsWith("p")){
      const g=prog?.gemara?.[idx];
      if(!g)return false;
      const pn=parseInt(String(key).slice(1));
      const ak=perekAmudKeys(idx,pn);
      const cnt=ak.filter(k=>safeHas(g?.done, k)).length;
      return cnt>0&&cnt<ak.length;
    }
    if(cat==="mishna"&&String(key).startsWith("pp")){const m=prog?.mishna?.[idx];if(!m)return false;const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);const cnt=mk.filter(k=>safeHas(m?.done, k)).length;return cnt>0&&cnt<mk.length;}
    if (cat === "tanach" && typeof key === "string") return false;
    return false;
  }

  function toggle(key, forceLabel){
    const wasOn=isOn(key);
    setProg(prev=>{
      const p = prev || IP;
      if(isC){const arr=[...(p.custom||[])],nd=new Set(arr[origIdx]?.done||[]);nd.has(key)?nd.delete(key):nd.add(key);if(arr[origIdx]) arr[origIdx]={...arr[origIdx],done:nd};return{...p,custom:arr};}
      
      if(cat==="gemara"){
        const g={...p.gemara},cur=g[idx]||{done:new Set()};
        let nd=new Set(cur.done);
        if(String(key).startsWith("p")){
          const pn=parseInt(String(key).slice(1));
          const ak=perekAmudKeys(idx,pn);
          const allOn=ak.every(k=>nd.has(k));
          if (allOn) {
            ak.forEach(k=>nd.delete(k));
            nd.delete(key);
          } else {
            ak.forEach(k=>nd.add(k));
            nd.add(key);
          }
        }else{
          nd.has(key)?nd.delete(key):nd.add(key);
        }
        g[idx]={done:nd};return{...p,gemara:g};
      }
      
      if(cat==="mishna"){const mm={...p.mishna},cur=mm[idx]||{done:new Set()};let nd=new Set(cur.done);if(String(key).startsWith("pp")){const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);const allOn=mk.every(k=>nd.has(k));allOn?mk.forEach(k=>nd.delete(k)):mk.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);}mm[idx]={done:nd};return{...p,mishna:mm};}
      if(cat==="tanach"){
        const tp = { ...p.tanach }, tpp = { ...p.tanach_parshiot };
        const ndPerek = new Set(tp[idx] || []);
        const ndParsha = new Set(tpp[idx] || []);

        if (isParsh) {
            const isAdding = !ndParsha.has(key);
            if (isAdding) ndParsha.add(key); else ndParsha.delete(key);

            const chapters = PARASHA_CHAPTERS[key] || [];
            chapters.forEach(c => isAdding ? ndPerek.add(c) : ndPerek.delete(c));

            (PARSHIOT[idx]||[]).forEach(parashaName => {
               const chaps = PARASHA_CHAPTERS[parashaName] || [];
               const allDone = chaps.length > 0 && chaps.every(c => ndPerek.has(c));
               if (allDone) ndParsha.add(parashaName); else ndParsha.delete(parashaName);
            });
        } else {
            const isAdding = !ndPerek.has(key);
            if (isAdding) ndPerek.add(key); else ndPerek.delete(key);

            if (isTorah) {
                (PARSHIOT[idx]||[]).forEach(parashaName => {
                    const chaps = PARASHA_CHAPTERS[parashaName] || [];
                    const allDone = chaps.length > 0 && chaps.every(c => ndPerek.has(c));
                    if (allDone) ndParsha.add(parashaName);
                    else ndParsha.delete(parashaName);
                });
            }
        }

        tp[idx] = ndPerek; tpp[idx] = ndParsha;
        return { ...p, tanach: tp, tanach_parshiot: tpp };
      }
      const cp={...p[cat]},nd=new Set(cp[idx]||[]);nd.has(key)?nd.delete(key):nd.add(key);cp[idx]=nd;return{...p,[cat]:cp};
    });
    if(!wasOn) {
        const itemLabel = forceLabel || items.find(i=>i.key===key)?.label || String(key);
        onActivity({cat, bk: item?.n || "", label: itemLabel || ""});
    }
  }

  function markAll() {
    setProg(prev => {
      const p = prev || IP;
      if (isC) { const arr = [...(p.custom || [])]; const nd = new Set(arr[origIdx]?.done || []); items.forEach(it => { if(!it.isHeader) nd.add(it.key); }); if (arr[origIdx]) arr[origIdx] = { ...arr[origIdx], done: nd }; return { ...p, custom: arr }; }
      if (cat === "gemara") { 
          const g = { ...p.gemara }, cur = g[idx] || { done: new Set() }; 
          const nd = new Set(cur.done); 
          items.forEach(it => { 
             if(!it.isHeader) {
                 if (String(it.key).startsWith("p")) {
                     perekAmudKeys(idx, parseInt(String(it.key).slice(1))).forEach(k => nd.add(k));
                     nd.add(it.key);
                 } else {
                     nd.add(it.key); 
                 }
             }
          }); 
          g[idx] = { done: nd }; return { ...p, gemara: g }; 
      }
      if (cat === "mishna") { const m = { ...p.mishna }, cur = m[idx] || { done: new Set() }; const nd = new Set(cur.done); items.forEach(it => { if(it.isHeader) return; if (String(it.key).startsWith("pp")) perekMsKeys(idx, parseInt(String(it.key).slice(2))).forEach(k => nd.add(k)); else nd.add(it.key); }); m[idx] = { done: nd }; return { ...p, mishna: m }; }
      if (cat === "tanach") { 
          const tp = { ...p.tanach }, tpp = { ...p.tanach_parshiot };
          const ndPerek = new Set(tp[idx] || []);
          const ndParsha = new Set(tpp[idx] || []);
          
          if (isTorah) {
             for(let i=1; i<=(TANACH[idx]?.c||0); i++) ndPerek.add(i);
             (PARSHIOT[idx]||[]).forEach(ps => ndParsha.add(ps));
          } else {
             items.forEach(it => { if(!it.isHeader) ndPerek.add(it.key); });
          }
          
          tp[idx] = ndPerek; tpp[idx] = ndParsha;
          return { ...p, tanach: tp, tanach_parshiot: tpp };
      }
      const cp = { ...p[cat] }, nd = new Set(cp[idx] || []); items.forEach(it => { if(!it.isHeader) nd.add(it.key); }); cp[idx] = nd; return { ...p, [cat]: cp };
    });
  }

  function clearAll() {
    if(!window.confirm(T.isEn ? "Are you sure you want to clear all progress for this book?" : "האם אתה בטוח שברצונך לאפס את כל ההתקדמות בספר זה?")) return;
    setProg(prev => {
       const p = prev || IP;
       if (isC) { const arr = [...(p.custom || [])]; if (arr[origIdx]) arr[origIdx] = { ...arr[origIdx], done: new Set() }; return { ...p, custom: arr }; }
       if (cat === "gemara") { const g = { ...p.gemara }; g[idx] = { done: new Set() }; return { ...p, gemara: g }; }
       if (cat === "mishna") { const m = { ...p.mishna }; m[idx] = { done: new Set() }; return { ...p, mishna: m }; }
       if (cat === "tanach") { 
           const tp = { ...p.tanach }, tpp = { ...p.tanach_parshiot };
           tp[idx] = new Set();
           tpp[idx] = new Set();
           return { ...p, tanach: tp, tanach_parshiot: tpp };
       }
       const cp = { ...p[cat] }; cp[idx] = new Set(); return { ...p, [cat]: cp };
    });
  }

  const totForMode = isC ? items.length : items.filter(it=>!it.isHeader).length;
  const doneCnt = isC ? (prog?.custom?.[origIdx]?.done?.size||0) : items.filter(it=>!it.isHeader && isOn(it.key)).length;
  const pVal=pct(doneCnt,totForMode);

  const nextUnlearned = useMemo(() => { try { return items.find(it => !it.isHeader && !isOn(it.key)); } catch(e){ return null; } }, [items, prog, isOn]);
  const nextSefariaRef = nextUnlearned ? getSefariaRefString(cat, item?.n, nextUnlearned.key, tMode, isC, idx) : null;
  const sefariaRefForNote = noteSheet ? getSefariaRefString(cat, item?.n, noteSheet.key, tMode, isC, idx) : null;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:T.bg}}>
      <div style={{background:T.card,padding:"14px 16px 16px",borderBottom:`1px solid ${T.border}`}}>
        <button aria-label="Go Back" onClick={goBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:T.f(13),marginBottom:12,padding:0,fontFamily:T.font}}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={T.isEn?"15 18 9 12 15 6":"9 18 15 12 9 6"}/></svg> {T.isEn?"Back":"חזרה"}</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:T.f(22),fontWeight:900,color:T.navy,textAlign:"start"}}>{item?.n}</div>{item?.sub&&<div style={{fontSize:T.f(12),color:T.muted,marginTop:2,textAlign:"start"}}>{item.sub} · {T.CAT_L[cat]}</div>}</div>
          <div style={{background:lightCol,borderRadius:14,padding:"10px 16px",textAlign:"center",flexShrink:0}}><div style={{fontSize:T.f(24),fontWeight:900,color:col}}>{pVal}%</div><div style={{fontSize:T.f(10),color:col,opacity:.8}}>{doneCnt}/{totForMode}</div></div>
        </div>
        <div style={{marginTop:12}}><Bar p={pVal} color={col} h={8} dark={T.dark}/></div>
        {nextSefariaRef && !isC && (
          <button onClick={() => { setReaderRef(nextSefariaRef); setReaderTitle(`${item?.n||""} ${nextUnlearned.label}`); }} style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 14px", background:col, color:"#fff", border:"none", borderRadius:12, textDecoration:"none", fontWeight:700, marginTop:14, fontSize:T.f(14), width:"100%", cursor:"pointer", fontFamily:T.font}}><IcoBook /> {T.UI.readOnSefaria}</button>
        )}
      </div>
      <div style={{flex:1,overflow:"auto",padding:"14px 16px 32px"}}>
        <div style={{marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
          {(!isC && (cat==="gemara"||cat==="mishna"||isTorah)) ? (
            <div>
               <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600,textAlign:"start"}}>{T.UI.markBy}</div>
               <div style={{display:"flex",gap:8}}>
                  {cat==="gemara" && <><MB active={viewMode==="amudim"} onClick={()=>setViewMode("amudim")} label={T.UI.amudim} color={col} T={T}/><MB active={viewMode==="perakim"} onClick={()=>setViewMode("perakim")} label={T.UI.perakim} color={col} T={T}/></>}
                  {cat==="mishna" && <><MB active={viewMode==="mishna"} onClick={()=>setViewMode("mishna")} label={T.UI.mishnayot} color={col} T={T}/><MB active={viewMode==="perakim"} onClick={()=>setViewMode("perakim")} label={T.UI.perakim} color={col} T={T}/></>}
                  {isTorah && <><MB active={tMode==="perakim"} onClick={()=>{setProg(prev=>({...prev,tmode:{...(prev?.tmode||{}),[idx]:"perakim"}}));}} label={T.UI.perakim} color={col} T={T}/><MB active={tMode==="parshiot"} onClick={()=>{setProg(prev=>({...prev,tmode:{...(prev?.tmode||{}),[idx]:"parshiot"}}));}} label={T.UI.parshiot} color={col} T={T}/></>}
               </div>
            </div>
          ) : <div/>}
          <div style={{display:"flex", gap:8}}>
            <button onClick={markAll} style={{padding:"8px 12px",borderRadius:10,background:`${col}15`,color:col,border:`1px solid ${col}40`,fontSize:T.f(11),fontWeight:800,cursor:"pointer",fontFamily:T.font}}>{T.UI.markAll}</button>
            <button onClick={clearAll} style={{padding:"8px 12px",borderRadius:10,background:"transparent",color:T.muted,border:`1px solid ${T.border}`,fontSize:T.f(11),fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{T.UI.clearAll}</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill, minmax(70px, 1fr))`,gap:8}}>
          {items.map(it=>{
            if(!it) return null;
            if(it.isHeader) {
               return <div key={it.key} style={{gridColumn: "1 / -1", fontSize: T.f(14), fontWeight: 800, color: T.navy, marginTop: 12, marginBottom: 4, textAlign: 'start', borderBottom: `1px solid ${T.border}`, paddingBottom: 4}}>{it.group}</div>;
            }
            const on=isOn(it.key),part=isPartial(it.key), nk=`${isC?'custom_c'+origIdx:cat+'_s'+idx}:${it.key}`, hasN=!!(prog?.notes?.[nk]||"").trim(), chzN=prog?.chazara?.[nk]||0, bg=on?col:part?(col+"33"):"transparent", fc=on?"#fff":part?col:T.muted;
            return (
              <div key={String(it.key)} style={{position:"relative", height:"100%"}}>
                <button onClick={()=>toggle(it.key, it.label)} style={{width:"100%",height:"100%",padding:isParsh?"14px 4px":"11px 4px",border:`2px solid ${on?col:part?col:T.border}`,borderRadius:10,fontSize:T.f(12),cursor:"pointer",background:bg,color:fc,fontWeight:on||part?700:400,minHeight:isParsh?50:44,fontFamily:T.font,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,boxSizing:"border-box"}}><span>{it.label}</span>{it.sub&&<span style={{fontSize:T.f(9),opacity:.7}}>{it.sub}</span>}{chzN>0&&<span style={{fontSize:10,background:"rgba(255,255,255,0.35)",borderRadius:10,padding:"1px 6px",marginTop:2}}>×{chzN}</span>}</button>
                <button aria-label="Options" onClick={e=>{e.stopPropagation();setEditNote(prog?.notes?.[nk]||"");setEditChz(prog?.chazara?.[nk]||0);setNoteSheet({key:it.key,label:it.label});}} style={{position:"absolute",top:0,right:0,padding:"6px",background:"transparent",border:"none",cursor:"pointer",color:on||part?"rgba(255,255,255,0.8)":T.muted,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}><IcoDots/></button>
                {hasN&&<div style={{position:"absolute", top:6, left:6, width:6, height:6, borderRadius:"50%", background:GOLD}}/>}
              </div>
            );
          })}
        </div>
      </div>
      <Sheet show={!!noteSheet} onClose={()=>setNoteSheet(null)} title={`${noteSheet?.label||""}`} T={T}>
        {sefariaRefForNote && !isC && (<button onClick={() => { setReaderRef(sefariaRefForNote); setReaderTitle(`${item?.n||""} ${noteSheet.label}`); setNoteSheet(null); }} style={{display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", background:col, color:"#fff", border:"none", borderRadius:10, textDecoration:"none", fontWeight:700, marginBottom:16, fontFamily:T.font, width:"100%", cursor:"pointer"}}><IcoBook /> {T.UI.openSection}</button>)}
        <FL label={T.UI.notes} T={T}><FTA aria-label="Notes input" T={T} value={editNote} onChange={e=>setEditNote(e.target.value)}/></FL>
        <FL label={T.UI.repetitions} T={T}><div style={{display:"flex",alignItems:"center",gap:16,marginTop:4}}><button onClick={()=>setEditChz(Math.max(0,editChz-1))} style={{width:44,height:44,borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,cursor:"pointer",fontSize:26,color:T.navy,fontFamily:T.font,lineHeight:1}}>−</button><span style={{fontSize:T.f(30),fontWeight:900,color:T.navy,minWidth:50,textAlign:"center"}}>{editChz}</span><button onClick={()=>setEditChz(editChz+1)} style={{width:44,height:44,borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,cursor:"pointer",fontSize:26,color:T.navy,fontFamily:T.font,lineHeight:1}}>+</button></div></FL>
        <PB T={T} onClick={()=>{const k=`${isC?'custom_c'+origIdx:cat+'_s'+idx}:${noteSheet.key}`;setProg(prev=>({...prev,notes:{...(prev?.notes||{}),[k]:editNote},chazara:{...(prev?.chazara||{}),[k]:editChz}}));setNoteSheet(null);}} style={{marginTop:12,background:col}}>{T.UI.save}</PB>
      </Sheet>
      <SefariaReaderSheet show={!!readerRef} onClose={() => setReaderRef(null)} sefariaRef={readerRef} cat={cat} isTorah={isTorah} title={readerTitle} T={T} />
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({prog,goals,T,cc,setTab,setDetail,activity,setLibCat}){
  const today=useMemo(()=>hebDateFull(),[]);
  const[now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id);},[]);
  const[shabbatData,setShabbatData]=useState(null), [zmanim,setZmanim]=useState(null), [locName,setLocName]=useState(T.isEn?"Jerusalem":"ירושלים");

  useEffect(()=>{
    fetch("https://www.hebcal.com/shabbat?cfg=json&geonameid=293397&m=50&lg=h").then(r=>r.json()).then(d=>{
      const parasha=d.items?.find(i=>i.category==="parashat"||i.category==="parasha"); 
      if(parasha) {
        let pName = parasha.title.replace(/[\u0591-\u05C7]/g, '').replace('פרשת ', '').trim();
        const doubles = { "ויקהל פקודי": "ויקהל-פקודי", "ויקהלפקודי": "ויקהל-פקודי", "תזריע מצורע": "תזריע-מצורע", "תזריעמצורע": "תזריע-מצורע", "אחרי מות קדושים": "אחרי מות-קדושים", "אחרי מותקדושים": "אחרי מות-קדושים", "בהר בחקתי": "בהר-בחוקותי", "בהר בחוקותי": "בהר-בחוקותי", "בהרבחקתי": "בהר-בחוקותי", "בהרבחוקותי": "בהר-בחוקותי", "חוקת בלק": "חוקת-בלק", "חקת בלק": "חוקת-בלק", "מטות מסעי": "מטות-מסעי", "מטותמסעי": "מטות-מסעי", "נצבים וילך": "נצבים-וילך", "ניצבים וילך": "נצבים-וילך", "נצביםוילך": "נצבים-וילך" };
        Object.keys(doubles).forEach(k => { if(pName === k || pName.includes(k)) pName = pName.replace(k, doubles[k]); });
        if(!pName.includes('-') && pName.length > 8) pName = pName.replace(/(בהר)(בחוקותי)/, '$1-$2'); // Fallback
        setShabbatData({parasha: pName});
      }
    }).catch(()=>{});
    
    const fetchZmanim = (lat, lon, name) => { fetch(`https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lon}&tzid=Asia/Jerusalem&date=${todayKey()}`).then(r=>r.json()).then(d=>{setZmanim(d); setLocName(name);}).catch(()=>{}); };
    if ("geolocation" in navigator) {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchZmanim(pos.coords.latitude, pos.coords.longitude, T.isEn?"Current Location":"מיקום נוכחי"), 
          () => fetchZmanim(31.769, 35.216, T.isEn?"Jerusalem":"ירושלים"),
          { timeout: 5000 } 
        );
      } catch(e) {
        fetchZmanim(31.769, 35.216, T.isEn?"Jerusalem":"ירושלים");
      }
    } else fetchZmanim(31.769, 35.216, T.isEn?"Jerusalem":"ירושלים");
  },[T.isEn]);
  
  const getDayOfYear = () => { const n = new Date(); const s = new Date(n.getFullYear(), 0, 0); return Math.floor((n - s) / 86400000); };
  const halacha = useMemo(() => HALACHOT[getDayOfYear() % HALACHOT.length], []);
  const dafYomi = useMemo(()=>getDafYomi(),[]);
  
  const S=useMemo(()=>({dapim:GEMARA.reduce((s,_,i)=>s+calcDone(prog,"gemara",i),0),mishna:MISHNA.reduce((s,_,i)=>s+calcDone(prog,"mishna",i),0),tanach:TANACH.reduce((s,_,i)=>s+calcDone(prog,"tanach",i),0),musar:MUSAR.reduce((s,t,i)=>s+calcDone(prog,"musar",i),0)+RAV_KOOK.reduce((s,t,i)=>s+calcDone(prog,"ravKook",i),0)+MACHSHAVA.reduce((s,t,i)=>s+calcDone(prog,"machshava",i),0)}),[prog]);
  const rows=[{cat:"gemara",l:T.CAT_L.gemara,v:S.dapim,tot:TOTAL_DAPIM,unit:T.CAT_UNIT.gemara},{cat:"mishna",l:T.CAT_L.mishna,v:S.mishna,tot:MISHNA.reduce((s,_,i)=>s+totalMs(i),0),unit:T.CAT_UNIT.mishna},{cat:"tanach",l:T.CAT_L.tanach,v:S.tanach,tot:TANACH.reduce((s,t,i)=>{const tMode=prog?.tmode?.[i]||"perakim";return s+(tMode==="parshiot"&&i<5?PARSHIOT[i].length:t.c);},0),unit:T.CAT_UNIT.tanach},{cat:"musar",l:T.CAT_L.musar,v:S.musar,tot:MUSAR.reduce((s,t,i)=>s+bkTotal(prog,"musar",i,prog?.custom),0)+RAV_KOOK.reduce((s,t,i)=>s+bkTotal(prog,"ravKook",i,prog?.custom),0)+MACHSHAVA.reduce((s,t,i)=>s+bkTotal(prog,"machshava",i,prog?.custom),0),unit:T.CAT_UNIT.musar}];

  return (
    <div style={{flex:1,overflow:"auto",background:T.bg}}>
      <div style={{background:`linear-gradient(160deg,#0A1E3A 0%,${NAVY} 60%,#173A5A 100%)`,padding:"24px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,left:-50,width:200,height:200,borderRadius:"50%",border:`1px solid ${GOLD}18`}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 18}}><div style={{display:"flex", alignItems:"center", gap: 12}}><LogoAliba T={T} size={42} /><div><div style={{fontSize:T.f(24), fontWeight:900, color:"#fff", letterSpacing:1}}>א<span style={{color:GOLD}}>ל</span>י<span style={{color:GOLD}}>ב</span>א</div><div style={{fontSize:T.f(12), color:"rgba(255,255,255,0.7)", textAlign:"start"}}>{T.UI.slogan}</div></div></div><div style={{textAlign:"left"}}><div style={{fontSize:T.f(30),fontWeight:800,color:"#fff"}}>{String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}</div></div></div>
          <div style={{fontSize:T.f(15),color:"rgba(255,255,255,0.9)",fontWeight:600,borderRight:T.isEn?"none":`3px solid ${GOLD}`,borderLeft:T.isEn?`3px solid ${GOLD}`:"none",paddingRight:T.isEn?0:12,paddingLeft:T.isEn?12:0,marginBottom:20,lineHeight:1.6,textAlign:"start"}}>{QUOTES[0]}</div>
          <div style={{display:"flex", gap:8}}>
            {/* 1. תיקון לחיצה על דף יומי - פתיחה בדיפולט של פרקים */}
            {dafYomi.masechet&&<div onClick={()=>{const list=getBkList("gemara",prog?.custom); const it=list.find(m=>m.n===dafYomi.masechet); if(it) { setTab("library"); setLibCat("gemara"); setDetail({...it, autoOpenKey:`${dafYomi.daf}a`}); }}} style={{flex:1, background:"rgba(255,255,255,0.10)",borderRadius:10,padding:"10px 12px",border:`1px solid rgba(201,168,76,0.3)`, cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(10),color:"rgba(255,255,255,0.6)",marginBottom:4}}><IcoBook/> {T.UI.dafYomi}</div><div style={{fontSize:T.f(14),fontWeight:700,color:"#fff"}}>{dafYomi.masechet} {T.isEn?"Daf":"דף"} {dafYomi.dafHeb}</div></div>}
            
            {/* 1. תיקון לחיצה על פרשת שבוע - מעבר לספרייה (לתורה) */}
            {shabbatData?.parasha&&<div onClick={()=>{
                const list=getBkList("tanach",prog?.custom); 
                let foundIdx = -1; let firstParasha = "";
                for (let i = 0; i < 5; i++) {
                    const match = PARSHIOT[i].find(p => shabbatData.parasha.includes(p) || shabbatData.parasha.includes(p.replace('ו', '')));
                    if (match) { foundIdx = i; firstParasha = match; break; }
                }
                if(foundIdx !== -1) { setTab("library"); setLibCat("tanach"); setDetail({...list[foundIdx], autoOpenKey: firstParasha}); }
            }} style={{flex:1, background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",border:`1px solid rgba(201,168,76,0.2)`, cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(10),color:"rgba(255,255,255,0.6)",marginBottom:4}}><IcoStar/> {T.UI.parasha}</div><div style={{fontSize:T.f(13),fontWeight:600,color:"#fff"}}>{shabbatData.parasha}</div></div>}
          </div>
        </div>
      </div>
      <div style={{padding:"14px 16px 80px"}}>
        <div style={{background:T.card,borderRadius:14,padding:"16px",marginBottom:16,border:`1.5px solid ${GOLD}`,boxShadow:T.shadow}}><div style={{display:"flex",alignItems:"center",gap:8,color:GOLD,marginBottom:8}}><IcoHeart/><div style={{fontWeight:800,fontSize:T.f(14),textAlign:"start"}}>{T.UI.dedicate}</div></div><div style={{fontSize:T.f(12),color:T.muted,lineHeight:1.6,marginBottom:12,textAlign:"start"}}>{T.UI.dedicateDesc}</div><a href="mailto:eitanshachor1@gmail.com?subject=%D7%94%D7%A7%D7%93%D7%A9%D7%AA%20%D7%9C%D7%99%D7%9E%D7%95%D7%93" style={{display:"inline-block",padding:"8px 16px",background:T.dark?"rgba(201,168,76,0.15)":"#FBF5E0",color:GOLD,borderRadius:10,textDecoration:"none",fontSize:T.f(12),fontWeight:700}}>{T.UI.submitDedication}</a></div>
        
        {/* 1. תיקון הלחיצה על הסטטיסטיקות במסך הבית - כולן עוברות לגמרא */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>{rows.map(r=>{const p2=pct(r.v,r.tot);return (<div key={r.cat} onClick={()=>{ setTab("library"); setLibCat("gemara"); }} style={{background:T.card,borderRadius:14,padding:"13px",boxShadow:T.shadow,cursor:"pointer",borderTop:`3px solid ${cc[r.cat]}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><div><div style={{fontSize:T.f(11),color:T.muted,marginBottom:2,textAlign:"start"}}>{r.l}</div><div style={{fontSize:T.f(26),fontWeight:900,color:cc[r.cat],textAlign:"start"}}>{r.v}</div><div style={{fontSize:T.f(10),color:T.muted,textAlign:"start"}}>{r.unit}</div></div><Ring p={p2} color={cc[r.cat]} size={46} stroke={5} label={`${p2}%`} dark={T.dark}/></div><Bar p={p2} color={cc[r.cat]} h={4} dark={T.dark}/></div>);})}</div>
        
        {/* 2. הלכה יומית עם "בשר" (מתוך המערך החדש) */}
        <div style={{background:T.card,borderRadius:14,padding:"13px 14px",marginBottom:14,boxShadow:T.shadow,borderRight:`3px solid ${GOLD}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(11),fontWeight:700,color:GOLD,marginBottom:8,textAlign:"start"}}><IcoScroll/> {T.UI.dailyHalacha}</div>
            <div style={{fontSize:T.f(14),color:T.navy,lineHeight:1.7,textAlign:"justify", marginBottom: 6}} dangerouslySetInnerHTML={{__html: halacha.t}} />
            <div style={{fontSize:T.f(11),color:T.muted,textAlign:"start", fontWeight: 600}}>{halacha.s}</div>
        </div>

        {zmanim?.times&&<div style={{background:T.card,borderRadius:14,padding:"13px 14px",marginBottom:14,boxShadow:T.shadow}}><div style={{display:"flex",alignItems:"center",gap:6,fontSize:T.f(11),fontWeight:700,color:T.muted,marginBottom:10}}><IcoClock/> {T.UI.zmanim} ({locName})</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[{l:T.UI.sunrise,k:"sunrise"},{l:T.UI.zmanMGA,k:"sofZmanShmaMGA"},{l:T.UI.zmanGRA,k:"sofZmanShma"},{l:T.UI.tfillaMGA,k:"sofZmanTfillaMGA"},{l:T.UI.tfillaGRA,k:"sofZmanTfilla"},{l:T.UI.chatzot,k:"chatzot"},{l:T.UI.sunset,k:Object.keys(zmanim.times).find(k=>k.toLowerCase().includes('sunset'))},{l:T.UI.tzeit,k:Object.keys(zmanim.times).find(k=>k.toLowerCase().includes('tzeit'))}].map(z=>{const t=z.k&&zmanim.times[z.k]?new Date(zmanim.times[z.k]).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}):""; return t?(<div key={z.l} style={{background:T.input,borderRadius:8,padding:"6px 8px"}}><div style={{fontSize:T.f(10),color:T.muted,textAlign:"start"}}>{z.l}</div><div style={{fontSize:T.f(13),fontWeight:700,color:T.navy,marginTop:1,direction:"ltr",textAlign:T.isEn?"left":"right"}}>{t}</div></div>):null;})}</div></div>}
        {(goals||[]).length>0&&(<>
          <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:10,textAlign:"start"}}>{T.UI.activeGoals}</div>
          <div style={{marginBottom:16}}>
            {(goals||[]).slice(0,2).map(g=>{
              if(!g) return null;
              const isO=g.cat==="other", list=isO?[]:getBkList(g.cat,prog?.custom);
              const item = list.find(l => l.idKey === (g.isC ? 'custom_c'+g.origIdx : g.cat+'_s'+g.idx));
              const nm=isO?g.otherName:(item?.n||"");
              const cur=isO?0:(g.isC?(prog?.custom?.[g.origIdx]?.done?.size||0):calcDone(prog,g.cat,g.idx));
              const p2=pct(Math.min(cur,g.target),g.target);
              const rem=Math.max(0,Math.round((new Date(g.deadline)-new Date())/86400000)),col2=cc[g.cat]||T.primary;
              return (
                <div key={g.id} onClick={()=>setTab("goals")} style={{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer",boxShadow:T.shadow,borderRight:`3px solid ${col2}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div><div style={{fontSize:T.f(14),fontWeight:700,color:T.navy,textAlign:"start"}}>{nm}</div><div style={{fontSize:T.f(11),color:T.muted,textAlign:"start"}}>{rem} {T.UI.daysLeft}</div></div>
                    <div style={{fontSize:T.f(22),fontWeight:900,color:col2}}>{p2}%</div>
                  </div>
                  <Bar p={p2} color={col2} h={6} dark={T.dark}/>
                </div>
              );
            })}
          </div>
        </>)}
        {(activity||[]).length>0&&(<>
          <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:10,marginTop:(goals||[]).length>0?4:0,textAlign:"start"}}>{T.UI.recentActivity}</div>
          <div style={{background:T.card,borderRadius:14,padding:"4px 14px",boxShadow:T.shadow}}>
            {(activity||[]).slice(0,3).map((a,i)=>{
              if(!a) return null;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<Math.min((activity||[]).length,3)-1?`1px solid ${T.border}`:"none"}}>
                  <div style={{color:cc[a.cat]||T.primary}}><IcoBook/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:T.f(13),fontWeight:600,color:T.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"start"}}>{a.bk} {a.label ? `- ${a.label}` : ''}</div>
                    <div style={{fontSize:T.f(11),color:T.muted,textAlign:"start"}}>{a.timeStr}</div>
                  </div>
                  <div style={{width:8,height:8,borderRadius:"50%",background:cc[a.cat]||T.primary,flexShrink:0}}/>
                </div>
              );
            })}
          </div>
        </>)}
      </div>
    </div>
  );
}

/* ── LIBRARY ── */
function LibraryScreen({prog,T,cc,cl,setProg,setDetail,libCat,setLibCat}){
  const[search,setSearch]=useState(""), [custSheet,setCustSheet]=useState(false), [cd,setCd]=useState({name:"",chapters:"",cat:"musar"});
  const allResults=useMemo(()=>{if(!search.trim())return[]; return getAllBooks(prog?.custom).filter(b=>b.n.includes(search.trim())||b.sub?.includes(search.trim())).map(b=>({...b, displayCat: b.cat}));},[search,prog]);
  const filtered=useMemo(()=>{if(search.trim())return[]; return getBkList(libCat,prog?.custom).map(b=>({...b, displayCat: libCat}));},[libCat,search,prog]);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`}}><div style={{padding:"14px 16px 0",fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:10,textAlign:"start"}}>{T.UI.library}</div><div style={{padding:"0 16px 10px"}}><FI aria-label="Search" T={T} value={search} onChange={e=>setSearch(e.target.value)} placeholder={`🔎 ${T.UI.searchPlaceholder || "חיפוש בכל הספרים..."}`}/></div>
        {!search.trim()&&(<div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:12,paddingRight:16,paddingLeft:16,scrollbarWidth:"none",justifyContent:"flex-start"}}>{CATS.map(c=><button key={c} onClick={()=>setLibCat(c)} style={{whiteSpace:"nowrap",padding:"7px 15px",borderRadius:20,fontSize:T.f(13),border:`2px solid ${libCat===c?cc[c]:T.border}`,background:libCat===c?cc[c]:"transparent",cursor:"pointer",color:libCat===c?"#fff":T.muted,fontWeight:libCat===c?800:400,flexShrink:0,fontFamily:T.font}}>{T.CAT_L[c]}</button>)}</div>)}</div>
      <div style={{flex:1,overflow:"auto",padding:"12px 16px 80px"}}>{search.trim()?(<div>{allResults.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:T.f(14)}}>{T.UI.noResults}</div>}{allResults.length>0&&<div style={{fontSize:T.f(11),color:T.muted,marginBottom:10,textAlign:"start"}}>{allResults.length} {T.UI.results}</div>}{allResults.map(bk=>(<div key={bk.idKey}><div style={{fontSize:T.f(10),color:cc[bk.displayCat]||T.muted,fontWeight:700,marginBottom:3,textAlign:"start"}}>{T.CAT_L[bk.displayCat]}</div><BookCard cat={bk.displayCat} item={bk} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog?.custom}/></div>))}</div>):(<div>{libCat==="custom"&&<button onClick={()=>setCustSheet(true)} style={{width:"100%",height:"48px",borderRadius:14,border:`2px dashed ${T.border}`,background:"transparent",cursor:"pointer",color:T.muted,fontSize:T.f(14),marginBottom:10,fontFamily:T.font}}>{T.UI.addBook}</button>}{filtered.map(bk=>(<div key={bk.idKey}><BookCard cat={bk.displayCat} item={bk} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog?.custom}/>{bk.isC && <button onClick={()=>{setProg(prev=>{const p=prev||IP; const arr=[...(p.custom||[])]; arr.splice(bk.origIdx,1); return {...p,custom:arr};});}} style={{fontSize:T.f(12),color:T.red,background:"none",border:"none",cursor:"pointer",marginTop:-4,marginBottom:8,paddingRight:6,fontFamily:T.font,textAlign:"start"}}>{T.UI.del}</button>}</div>))}</div>)}</div>
      <Sheet show={custSheet} onClose={()=>setCustSheet(false)} title={T.UI.addBook} T={T}><FL label={T.UI.book} T={T}><FI T={T} value={cd.name} onChange={e=>setCd(f=>({...f,name:e.target.value}))}/></FL><FL label={T.UI.perakim} T={T}><FI T={T} type="number" value={cd.chapters} onChange={e=>setCd(f=>({...f,chapters:e.target.value}))}/></FL><FL label={T.UI.topic} T={T}><FS T={T} value={cd.cat} onChange={e=>setCd(f=>({...f,cat:e.target.value}))}><option value="musar">מוסר</option><option value="ravKook">ספרי הראי״ה</option><option value="machshava">מחשבה</option><option value="other">אישי / אחר</option></FS></FL><PB T={T} onClick={()=>{if(!cd.name||!cd.chapters)return; setProg(prev=>{const p=prev||IP; return {...p,custom:[...(p.custom||[]),{name:cd.name,chapters:parseInt(cd.chapters),catLabel:"אישי",cat:cd.cat,done:new Set()}]}}); setCustSheet(false); setCd({name:"",chapters:"",cat:"musar"});}} style={{marginTop:6,background:NAVY}}>{T.UI.save}</PB></Sheet></div>
  );
}

/* ── GOALS ── */
function GoalRow({g, prog, T, cc, onEdit, onDelete, custom}) {
  if (!g) return null;
  const isO = g.cat === "other";
  const list = isO ? [] : getBkList(g.cat, custom);
  const item = list.find(l => String(l.idKey) === String(g.isC ? 'custom_c'+g.origIdx : g.cat+'_s'+g.idx));
  const nm = isO ? g.otherName : (item?.n || "");
  if (!nm) return null;

  const cur = isO ? 0 : (g.isC ? (prog?.custom?.[g.origIdx]?.done?.size || 0) : calcDone(prog, g.cat, g.idx));
  const p = pct(Math.min(cur, g.target), g.target);
  const rem = Math.max(0, Math.round((new Date(g.deadline) - new Date()) / 86400000));
  const exp = Math.min(100, Math.round((Math.max(0, Math.round((new Date() - new Date(g.startDate)) / 86400000))) * 100 / Math.max(1, Math.round((new Date(g.deadline) - new Date(g.startDate)) / 86400000))));
  const remainingItems = g.target - cur;
  
  let paceStr = "-";
  let paceLabel = T.UI.perDay;
  const u = isO ? "" : (T.isEn ? "items" : T.CAT_UNIT_SING[g.cat]);
  
  if (!isO && rem > 0 && remainingItems > 0) { 
      if (remainingItems >= rem) {
          paceStr = Math.ceil(remainingItems / rem) + " " + u; 
      } else { 
          paceStr = "1 " + u; 
          paceLabel = `בכל ${Math.floor(rem / remainingItems)} ימים`; 
      } 
  }
  
  const onTrack = isO || p >= exp;
  const col = cc[g.cat] || T.primary;
  const hd = hebStr(g.deadline);
  
  return (
    <div style={{background:T.card,borderRadius:16,padding:"15px 16px",marginBottom:12,boxShadow:T.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div>
            <div style={{fontSize:T.f(16),fontWeight:900,color:T.navy,textAlign:"start"}}>{nm}</div>
            <div style={{fontSize:T.f(11),color:T.muted,textAlign:"start"}}>{isO ? "Personal" : T.CAT_L[g.cat]}</div>
        </div>
        {!isO && <span style={{fontSize:T.f(11),padding:"4px 11px",borderRadius:20,background:onTrack?"#DCFCE7":"#FEE2E2",color:onTrack?"#166534":"#B91C1C",fontWeight:800,flexShrink:0}}>{onTrack?T.UI.onTrack:T.UI.behind}</span>}
      </div>
      <Bar p={p} color={col} h={8} dark={T.dark}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:T.f(12),color:T.muted,margin:"6px 0 12px"}}>
        <span>{cur}/{g.target} {isO?"":T.CAT_UNIT[g.cat]}</span>
        <span style={{color:col,fontWeight:800}}>{p}%</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(80px, 1fr))",gap:8,marginBottom:12}}>
        {[{l:T.UI.daysLeft,v:rem}, {l:paceLabel,v:paceStr}, {l:T.UI.currPace,v:isO?"-":`${exp}%`}].map(s => (
            <div key={s.l} style={{background:T.input,borderRadius:10,padding:"9px 10px"}}>
                <div style={{fontSize:T.f(17),fontWeight:900,color:T.navy}}>{s.v}</div>
                <div style={{fontSize:T.f(10),color:T.muted,marginTop:1}}>{s.l}</div>
            </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:T.f(12),color:T.muted}}>
        <div style={{textAlign:"start"}}>
            <div>{new Date(g.deadline).toLocaleDateString("he-IL")}</div>
            {hd && <div style={{color:col,fontWeight:700,marginTop:2}}>{hd}</div>}
        </div>
        <div style={{display:"flex", gap:14}}>
            <button aria-label="Edit goal" onClick={onEdit} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,display:"flex", alignItems:"center"}}><IcoEdit/></button>
            <button aria-label="Delete goal" onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",color:T.red}}>{T.UI.del}</button>
        </div>
      </div>
    </div>
  );
}

function GoalsScreen({goals, setGoals, prog, T, cc}){
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cat, setCat] = useState("gemara");
  const [bookIdKey, setBookIdKey] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [otherName, setOtherName] = useState("");

  const isOther = cat === "other";
  const bkList = isOther ? [] : getBkList(cat, prog?.custom);
  const selectedItem = bkList.find(b => String(b.idKey) === String(bookIdKey));

  let maxTot = 0;
  if (!isOther && selectedItem) {
      if (selectedItem.isC) {
          const customArr = prog?.custom || [];
          const customBook = customArr[selectedItem.origIdx];
          maxTot = customBook ? customBook.chapters : 0;
      } else {
          maxTot = bkTotal(prog, cat, selectedItem.i, prog?.custom);
      }
  }

  function openNew() { 
      setEditingId(null); 
      setCat("gemara"); 
      setBookIdKey(""); 
      setTarget(""); 
      setDeadline(""); 
      setOtherName(""); 
      setShowSheet(true); 
  }

  function save() { 
      if(!deadline || (cat === "other" && !otherName)) return; 
      const finalTarget = target ? parseInt(target) : maxTot;
      
      if(editingId) {
          setGoals(prev => (prev || []).map(x => x.id === editingId ? {
              ...x, 
              cat, 
              idx: selectedItem ? selectedItem.i : 0, 
              isC: !!selectedItem?.isC, 
              origIdx: selectedItem ? selectedItem.origIdx : 0, 
              target: finalTarget, 
              deadline, 
              otherName: otherName || ""
          } : x));
      } else {
          setGoals(prev => [...(prev || []), {
              id: Date.now(), 
              cat, 
              idx: selectedItem ? selectedItem.i : 0, 
              isC: !!selectedItem?.isC, 
              origIdx: selectedItem ? selectedItem.origIdx : 0, 
              target: finalTarget, 
              deadline, 
              startDate: todayKey(), 
              otherName: otherName || ""
          }]);
      }
      setShowSheet(false); 
  }

  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy}}>{T.UI.goals}</div>
        <button onClick={openNew} style={{fontSize:T.f(13),padding:"9px 16px",borderRadius:12,background:T.primary,color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontFamily:T.font}}>{T.UI.newGoal}</button>
      </div>
      
      {(!goals || goals.length === 0) && (
        <div style={{textAlign:"center",padding:"50px 16px",background:T.card,borderRadius:16,boxShadow:T.shadow}}>
          <div style={{display:"flex",justifyContent:"center",color:NAVY,marginBottom:14}}><IcoStar/></div>
          <div style={{fontSize:T.f(17),fontWeight:900,color:T.navy,marginBottom:8}}>{T.UI.noGoals}</div>
          <div style={{fontSize:T.f(14),color:T.muted,lineHeight:1.7}}>{T.UI.setGoal}</div>
          <button onClick={openNew} style={{marginTop:16,padding:"11px 24px",background:T.primary,color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontSize:T.f(14),fontWeight:700,fontFamily:T.font}}>{T.UI.firstGoal}</button>
        </div>
      )}
      
      <div>
        {(goals || []).map(g => g ? (
          <GoalRow key={g.id} g={g} prog={prog} T={T} cc={cc} onEdit={()=>{setEditingId(g.id);setCat(g.cat);setBookIdKey(g.isC?'custom_c'+g.origIdx:g.cat+'_s'+g.idx);setTarget(g.target);setDeadline(g.deadline);setOtherName(g.otherName||"");setShowSheet(true);}} onDelete={()=>setGoals(prev=>(prev||[]).filter(x=>x.id!==g.id))} custom={prog?.custom}/>
        ) : null)}
      </div>
      
      <Sheet show={showSheet} onClose={()=>setShowSheet(false)} title={editingId ? (T.isEn ? "Edit Goal" : "עריכת יעד") : T.UI.newGoal} T={T}>
        <FL label={T.UI.topic} T={T}>
          <FS T={T} value={cat} onChange={e=>{setCat(e.target.value);setBookIdKey("");setTarget("");}}>
            {CATS.map(c=><option key={c} value={c}>{T.CAT_L[c]}</option>)}
          </FS>
        </FL>
        {cat !== "other" && bkList.length > 0 && (
          <FL label={T.UI.book} T={T}>
            <FS T={T} value={bookIdKey} onChange={e=>{setBookIdKey(e.target.value);setTarget("");}}>
              <option value="">{T.UI.selectBook}</option>
              {bkList.map(b=><option key={b.idKey} value={b.idKey}>{b.n}</option>)}
            </FS>
          </FL>
        )}
        <FL label={`${T.UI.target} ${maxTot > 0 ? `(${T.UI.max || "Max"}: ${maxTot})` : ""}`} T={T}>
          <FI T={T} type="number" value={target} onChange={e=>setTarget(e.target.value)} placeholder={maxTot > 0 ? `${maxTot}` : ""}/>
        </FL>
        <FL label={T.UI.deadline} T={T}>
          <DualDateInput T={T} value={deadline} onChange={e=>setDeadline(e.target.value)}/>
        </FL>
        <PB T={T} onClick={save} style={{marginTop:16,background:NAVY}}>{T.UI.saveGoal}</PB>
      </Sheet>
    </div>
  );
}

/* ── SETTINGS ── */
function SettingsScreen({sett,setSett,T,onLogout,user}){
  const[legalType, setLegalType] = useState(null);
  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}><div style={{fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:20,textAlign:"start"}}>{T.UI.settings}</div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}><div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5,textAlign:"start"}}>{T.UI.appearance}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}><div style={{textAlign:"start"}}><div style={{fontSize:T.f(14),fontWeight:600,color:T.navy}}>{T.UI.darkMode}</div><div style={{fontSize:T.f(11),color:T.muted}}>{T.UI.darkSub}</div></div><Toggle on={sett.dark} onToggle={()=>setSett(s=>({...s,dark:!s.dark}))} primary={T.primary}/></div><div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:T.f(14),fontWeight:600,color:T.navy,marginBottom:10,textAlign:"start"}}>{T.UI.fontSize}</div><div style={{display:"flex",gap:8}}>{[{v:0,l:T.UI.small},{v:1,l:T.UI.medium},{v:2,l:T.UI.large}].map(o=><button key={o.v} onClick={()=>setSett(s=>({...s,fontSize:o.v}))} style={{flex:1,height:"48px",borderRadius:10,border:`2px solid ${sett.fontSize===o.v?T.primary:T.border}`,background:sett.fontSize===o.v?T.primary:"transparent",color:sett.fontSize===o.v?"#fff":T.muted,fontWeight:sett.fontSize===o.v?700:400,fontFamily:T.font}}>{o.l}</button>)}</div></div><div style={{padding:"14px 16px"}}><div style={{fontSize:T.f(14),fontWeight:600,color:T.navy,marginBottom:10,textAlign:"start"}}>{T.UI.language}</div><div style={{display:"flex",gap:8}}>{[{v:"he",l:"עברית"},{v:"en",l:"English"}].map(o=><button key={o.v} onClick={()=>setSett(s=>({...s,lang:o.v}))} style={{flex:1,height:"48px",borderRadius:10,border:`2px solid ${sett.lang===o.v?T.primary:T.border}`,background:sett.lang===o.v?T.primary:"transparent",color:sett.lang===o.v?"#fff":T.muted,fontWeight:sett.lang===o.v?700:400,fontFamily:T.font}}>{o.l}</button>)}</div></div></div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}><div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5,textAlign:"start"}}>{T.UI.support}</div><div style={{padding:"14px 16px"}}><a href="mailto:eitanshachor1@gmail.com" style={{display:"flex", alignItems:"center", gap:10, color:T.navy, textDecoration:"none", fontSize:T.f(14), fontWeight:600}}>{T.isEn ? "Contact Developer" : "צור קשר / דיווח על באגים"}</a></div></div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}><div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5,textAlign:"start"}}>{T.UI.legal}</div><div style={{padding:"14px 16px", borderBottom:`1px solid ${T.border}`}}><button onClick={()=>setLegalType('terms')} style={{background:"none",border:"none",cursor:"pointer",color:T.navy,fontSize:T.f(14),fontWeight:600,textAlign:"start",padding:0,width:"100%"}}>{T.UI.terms}</button></div><div style={{padding:"14px 16px"}}><button onClick={()=>setLegalType('privacy')} style={{background:"none",border:"none",cursor:"pointer",color:T.navy,fontSize:T.f(14),fontWeight:600,textAlign:"start",padding:0,width:"100%"}}>{T.UI.privacy}</button></div></div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}><div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5,textAlign:"start"}}>{T.UI.account}</div><div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,textAlign:"start"}}><div style={{fontSize:T.f(14),fontWeight:700,color:T.navy}}>{user?.name||"משתמש"}</div><div style={{fontSize:T.f(12),color:T.muted,marginTop:2}}>{user?.email||""}</div></div><div style={{padding:"14px 16px"}}><button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:T.f(14),fontWeight:700,width:"100%",textAlign:"start"}}>{T.UI.signOut}</button></div></div>
      <div style={{textAlign:"center",fontSize:T.f(11),color:T.muted,lineHeight:1.8,marginTop:24}}><div style={{fontWeight:900,color:T.navy,fontSize:T.f(16),letterSpacing:1}}>א<span style={{color:T.gold||GOLD}}>ל</span>י<span style={{color:T.gold||GOLD}}>ב</span>א</div><div style={{direction: "ltr"}}>v 1.0.2</div><div>© {new Date().getFullYear()} פותח ע״י איתן שחור. כל הזכויות שמורות.</div></div>
      <LegalSheet show={!!legalType} onClose={()=>setLegalType(null)} type={legalType} T={T} /></div>
  );
}

/* ── AUTH SCREEN ── */
function AuthScreen({onLogin,T,globalError}){
  const [err,setErr]=useState("");
  const [legalType,setLegalType]=useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:20,background:T.bg}}>
      <div style={{width:100,height:100,background:`linear-gradient(145deg,${NAVY},#0A1E3A)`,borderRadius:32,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 12px 40px rgba(26,58,107,0.5)`,border:`2px solid ${GOLD}44`}}>
        <LogoAliba T={T} size={54}/>
      </div>
      <div style={{textAlign:"center", marginBottom:20}}>
        <div style={{fontSize:T.f(36),fontWeight:900,color:T.navy,marginBottom:4,letterSpacing:1}}>
          א<span style={{color:T.gold||GOLD}}>ל</span>י<span style={{color:T.gold||GOLD}}>ב</span>א
        </div>
        <div style={{fontSize:T.f(14),color:T.muted, fontWeight:500}}>{T.UI.slogan}</div>
      </div>
      
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:14}}>
        {globalError && <div style={{color:T.red,fontSize:T.f(13),marginBottom:8,textAlign:"center", background: "#fee2e2", padding: "10px", borderRadius: 8}}>{globalError}</div>}
        
        <FI T={T} placeholder={T.isEn ? "Email" : "אימייל"} value={email} onChange={e=>setEmail(e.target.value)} type="email" />
        <FI T={T} type="password" placeholder={T.isEn ? "Password" : "סיסמה"} value={password} onChange={e=>setPassword(e.target.value)} />
        <PB T={T} onClick={()=>onLogin({method:"email", email, password})} style={{background:T.primary, height: "54px"}}>{T.isEn ? "Login" : "כניסה"}</PB>

        <div style={{textAlign:"center", color:T.muted, fontSize:T.f(12), margin:"4px 0"}}>{T.UI.or || "או"}</div>

        <button onClick={()=>onLogin({method:"google"})} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"13px 20px",borderRadius:14,border:`1.5px solid ${T.border}`,background:T.card,cursor:"pointer",fontSize:T.f(15),fontWeight:700,color:T.navy,fontFamily:T.font,height:"54px",boxShadow:"0 4px 12px rgba(0,0,0,0.05)",transition:"all 0.2s"}}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {T.UI.continueWith} Google
        </button>

        <button onClick={()=>onLogin({method:"apple"})} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"13px 20px",borderRadius:14,border:`1px solid #000`,background:"#000",cursor:"pointer",fontSize:T.f(15),fontWeight:700,color:"#fff",fontFamily:T.font,height:"54px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",transition:"all 0.2s"}}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.078 1.52-.046 2.093-.974 3.935-.974 1.83 0 2.453.974 3.985.932 1.595-.04 2.62-1.554 3.618-3.02 1.157-1.697 1.633-3.344 1.657-3.428-.035-.015-3.213-1.233-3.24-4.92-.023-3.08 2.518-4.568 2.632-4.636-1.442-2.106-3.677-2.39-4.475-2.445-2.022-.132-4.004 1.35-5.51 1.35z"/><path fill="#fff" d="M15.523 4.363c.844-1.025 1.41-2.453 1.256-3.873-1.21.05-2.716.808-3.585 1.826-.777.893-1.455 2.355-1.267 3.75 1.354.105 2.753-.674 3.596-1.703z"/></svg>
          {T.UI.continueWith} Apple
        </button>
      </div>
      
      {err&&<div style={{color:T.red,fontSize:T.f(13),marginTop:12,textAlign:"center"}}>{err}</div>}
      
      <div style={{marginTop:32, display:"flex", gap:16, justifyContent:"center"}}>
        <button onClick={()=>setLegalType('terms')} style={{background:"none", border:"none", textDecoration:"underline", color:T.muted, cursor:"pointer", fontFamily:T.font, fontSize:T.f(13)}}>{T.UI.terms}</button>
        <button onClick={()=>setLegalType('privacy')} style={{background:"none", border:"none", textDecoration:"underline", color:T.muted, cursor:"pointer", fontFamily:T.font, fontSize:T.f(13)}}>{T.UI.privacy}</button>
      </div>
      
      <LegalSheet show={!!legalType} onClose={()=>setLegalType(null)} type={legalType} T={T} />
    </div>
  );
}

/* ── ROOT ── */
export default function App(){
  useEffect(()=>{ if(!document.getElementById("hf")){const l=document.createElement("link");l.id="hf"; l.rel="stylesheet"; l.href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@300;400;500;600;700;800;900&display=swap";document.head.appendChild(l);} },[]);
  
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [libCat, setLibCat] = useState("gemara");
  const [detail, setDetail] = useState(null);
  const [sett, setSett] = useState({ dark: false, fontSize: 1, lang: "he" });
  const [prog, setProg] = useState(IP);
  const [goals, setGoals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeDays, setActiveDays] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          const safeEmail = u.email || "";
          setUser({
            uid: u.uid,
            email: safeEmail,
            name: u.displayName || (safeEmail ? safeEmail.split("@")[0] : "משתמש")
          });
          const docSnap = await getDoc(doc(db, "users", u.uid));
          if (docSnap.exists() && docSnap.data()) {
            const data = docSnap.data();
            setProg(desProg(data.prog));
            setGoals(Array.isArray(data.goals) ? data.goals : []);
            setSett(prev => ({ ...prev, ...(data.sett || {}) }));
            setActivity(Array.isArray(data.activity) ? data.activity : []);
            setActiveDays(Array.isArray(data.activeDays) ? data.activeDays : []);
          } else {
            setProg(IP); setGoals([]); setActivity([]); setActiveDays([]);
          }
        } else {
          setUser(null); setProg(IP); setGoals([]); setActivity([]); setActiveDays([]);
        }
      } catch (e) {
        console.error(e);
        setAuthErrorMsg(e.message || "Auth error");
      } finally {
        if (!cancelled) {
          setLoaded(true);
          setIsAuthLoading(false);
        }
      }
    });

    const emergencyTimeout = setTimeout(() => {
        if (isAuthLoading && !cancelled) {
            setIsAuthLoading(false);
            setLoaded(true);
        }
    }, 6000);

    return () => {
      cancelled = true;
      clearTimeout(emergencyTimeout);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
      if (!loaded || !user) return;
      const saveTimer = setTimeout(() => {
          const rawData = { prog: serProg(prog), goals: goals || [], sett: sett, activity: (activity || []).slice(0, 50), activeDays: (activeDays || []).slice(-60) };
          setDoc(doc(db, "users", user.uid), JSON.parse(JSON.stringify(rawData)), { merge: true }).catch(e => console.error("Firebase Save Error:", e));
      }, 500);
      return () => clearTimeout(saveTimer);
  }, [prog, goals, sett, activity, activeDays, loaded, user]);

  const streak=useMemo(()=>{ if(!Array.isArray(activeDays) || !activeDays.length) return 0; const sorted=[...new Set(activeDays)].sort().reverse(); const td=todayKey(), yd=new Date(); yd.setDate(yd.getDate()-1); const ydStr=yd.toISOString().slice(0,10); if(sorted[0]!==td&&sorted[0]!==ydStr)return 0; let count=1; for(let i=1;i<sorted.length;i++){ if(sorted[i]===(new Date(new Date(sorted[i-1]).getTime()-86400000).toISOString().slice(0,10))) count++; else break; } return count; },[activeDays]);
  const T=useMemo(()=>mkT(sett.dark,sett.fontSize,sett.lang||"he"),[sett.dark,sett.fontSize,sett.lang]);
  const cc=sett.dark?CC_D:CC_L, cl=sett.dark?CL_D:CL_L, appSt={direction:T.isEn?"ltr":"rtl",fontFamily:T.font,maxWidth:480, margin:"0 auto", minHeight:"100vh", width:"100%", display:"flex",flexDirection:"column",background:T.bg,color:T.navy,boxSizing:"border-box", position:"relative"};

  if (isAuthLoading || (user && !loaded)) {
     return (
       <div style={{...appSt, justifyContent: "center", alignItems: "center", height: "100vh"}}>
         <LogoAliba T={T} size={64}/>
         <div style={{fontSize: T.f(18), color: T.navy, fontWeight: 700, marginTop: 24}}>טוען... ⏳</div>
       </div>
     );
  }

if (!user) return (
    <div style={appSt}>
      <AuthScreen 
        globalError={authErrorMsg} 
        onLogin={async ({ method, email, password }) => {
          setAuthErrorMsg("");
          try {
            if (method === "email") {
              await signInWithEmailAndPassword(auth, email, password);
              return;
            }
            
            let provider = method === "apple" ? new OAuthProvider("apple.com") : new GoogleAuthProvider();
            if (method === "apple") {
              provider.addScope("email");
              provider.addScope("name");
            }
            
            try {
              await signInWithPopup(auth, provider);
            } catch (err) {
              if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
                setAuthErrorMsg(err.message || "Login failed");
              }
            }
          } catch (err) {
            if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
              setAuthErrorMsg(err.message || "Login failed");
            }
          }
        }}
        T={T} 
      />
    </div>
  );

  if (detail) return (
    <div style={appSt}>
      <DetailScreen 
        detail={detail} 
        prog={prog} 
        T={T} 
        cc={cc} 
        cl={cl} 
        setProg={setProg} 
        goBack={() => setDetail(null)} 
        onActivity={(it) => {
          setActivity(p => [{ ...it, timeStr: new Date().toLocaleString("he-IL",{day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"}), date: todayKey() }, ...(Array.isArray(p) ? p : [])].slice(0, 50));
          setActiveDays(p => [...new Set([...(Array.isArray(p) ? p : []), todayKey()])].slice(-60));
        }}
      />
    </div>
  );

  const NAV=[{k:"home",l:T.UI.home,ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>},{k:"library",l:T.UI.library,ico:<IcoBook/>},{k:"goals",l:T.UI.goals,ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>},{k:"settings",l:T.UI.settings,ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}];

  return (<div style={appSt}>
    <WelcomePrompt T={T} />
    <InstallPrompt T={T} sett={sett} setSett={setSett} />
    {tab==="home"&&<HomeScreen prog={prog} goals={goals} T={T} cc={cc} setTab={setTab} setDetail={setDetail} activity={activity} setLibCat={setLibCat}/>}
    {tab==="library"&&<LibraryScreen prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} setDetail={setDetail} libCat={libCat} setLibCat={setLibCat}/>}
    {tab==="goals"&&<GoalsScreen goals={goals} setGoals={setGoals} prog={prog} T={T} cc={cc}/>}
    {tab==="settings"&&<SettingsScreen sett={sett} setSett={setSett} T={T} onLogout={()=>{signOut(auth);setTab("home");}} user={user}/>}
    <div style={{background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",position:"sticky",bottom:0,zIndex:10}}>{NAV.map(it=>(<button key={it.k} onClick={()=>setTab(it.k)} style={{flex:1,padding:"9px 2px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontSize:T.f(9),color:tab===it.k?T.gold||GOLD:T.muted,border:"none",background:"none",cursor:"pointer",fontWeight:tab===it.k?800:400,fontFamily:T.font}}>{it.ico}{it.l}</button>))}</div>
  </div>);
}
