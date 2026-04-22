import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Analytics } from '@vercel/analytics/react';

/* ── HEBREW DATE (proper letters, not digits) ── */
function toHeb(n) {
  if (!n || n <= 0) return "";
  const M = [[400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],[90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],
             [50,"נ"],[40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],[9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],
             [5,"ה"],[4,"ד"],[3,"ג"],[2,"ב"],[1,"א"]];
  let rem = n, r = "";
  for (const [v,s] of M) while (rem >= v) { r += s; rem -= v; }
  return r.replace("יה","טו").replace("יו","טז");
}
function addGeresh(s) {
  if (!s) return "";
  if (s.length === 1) return s + "׳";
  return s.slice(0,-1) + '״' + s.slice(-1);
}
function hebDateFull(d) {
  try {
    d = d || new Date();
    const pp = new Intl.DateTimeFormat("he-u-ca-hebrew",
      {day:"numeric",month:"long",year:"numeric"}).formatToParts(d);
    const dayN  = parseInt(pp.find(p=>p.type==="day")  ?.value?.replace(/\D/g,"")||0);
    const monS  = pp.find(p=>p.type==="month")?.value || "";
    const yearN = parseInt(pp.find(p=>p.type==="year") ?.value?.replace(/\D/g,"")||0)%1000;
    const dayH  = addGeresh(toHeb(dayN));
    const yearH = addGeresh(toHeb(yearN));
    return `${dayH} ב${monS} ${yearH}`;
  } catch { return ""; }
}
function hebStr(s) { return s ? hebDateFull(new Date(s+"T12:00:00")) : ""; }
function todayKey() { return new Date().toISOString().slice(0,10); }

/* ── DATA ── */
const GEMARA = [
  {n:"ברכות",s:"זרעים",d:64,p:9,ch:["מאימתי","היה קורא","מי שמתו","תפלת השחר","אחד שאל","כיצד מברכין","שלשה שאכלו","אלו דברים","הרואה"]},
  {n:"שבת",s:"מועד",d:157,p:24},{n:"עירובין",s:"מועד",d:105,p:10},
  {n:"פסחים",s:"מועד",d:121,p:10},{n:"שקלים",s:"מועד",d:22,p:8},
  {n:"יומא",s:"מועד",d:88,p:8,ch:["שבעת ימים","בראשונה","אמר להם הממונה","טרף בקלפי","בא לו כהן גדול","אמר להם הממונה ב","שני שעירים","הוציאו לו"]},
  {n:"סוכה",s:"מועד",d:56,p:5,ch:["סוכה גבוהה","הישן","המשלח","לולב וערבה","החליל"]},
  {n:"ביצה",s:"מועד",d:40,p:5},
  {n:"ראש השנה",s:"מועד",d:35,p:4,ch:["ארבעה ראשי שנים","אם אינן מכירין","ראו אותו","יו\"ט של ר\"ה"]},
  {n:"תענית",s:"מועד",d:31,p:4},{n:"מגילה",s:"מועד",d:32,p:4},
  {n:"מועד קטן",s:"מועד",d:29,p:3},{n:"חגיגה",s:"מועד",d:27,p:3},
  {n:"יבמות",s:"נשים",d:122,p:16},{n:"כתובות",s:"נשים",d:112,p:13},
  {n:"נדרים",s:"נשים",d:91,p:11},{n:"נזיר",s:"נשים",d:66,p:9},
  {n:"סוטה",s:"נשים",d:49,p:9},{n:"גיטין",s:"נשים",d:90,p:9},
  {n:"קידושין",s:"נשים",d:82,p:4},{n:"בבא קמא",s:"נזיקין",d:119,p:10},
  {n:"בבא מציעא",s:"נזיקין",d:119,p:10},{n:"בבא בתרא",s:"נזיקין",d:176,p:10},
  {n:"סנהדרין",s:"נזיקין",d:113,p:11},{n:"מכות",s:"נזיקין",d:24,p:3},
  {n:"שבועות",s:"נזיקין",d:49,p:8},{n:"עבודה זרה",s:"נזיקין",d:76,p:5},
  {n:"הוריות",s:"נזיקין",d:14,p:3},{n:"זבחים",s:"קדשים",d:120,p:14},
  {n:"מנחות",s:"קדשים",d:110,p:13},{n:"חולין",s:"קדשים",d:142,p:12},
  {n:"בכורות",s:"קדשים",d:61,p:9},{n:"ערכין",s:"קדשים",d:34,p:9},
  {n:"תמורה",s:"קדשים",d:34,p:7},{n:"כריתות",s:"קדשים",d:28,p:6},
  {n:"מעילה",s:"קדשים",d:22,p:6},{n:"נידה",s:"טהרות",d:73,p:10},
];
const MISHNA = [
  {s:"זרעים",m:"ברכות",p:9,ms:[5,8,6,7,5,8,5,8,5]},{s:"זרעים",m:"פאה",p:8,ms:[6,8,8,11,8,11,8,9]},
  {s:"זרעים",m:"דמאי",p:7,ms:[4,5,6,7,7,11,8]},{s:"זרעים",m:"כלאים",p:9,ms:[9,11,7,9,8,9,8,6,10]},
  {s:"זרעים",m:"שביעית",p:10,ms:[8,10,10,10,9,6,7,11,9,9]},{s:"זרעים",m:"תרומות",p:11,ms:[10,6,9,13,9,6,7,12,7,12,10]},
  {s:"זרעים",m:"מעשרות",p:5,ms:[8,8,10,6,8]},{s:"זרעים",m:"מעשר שני",p:5,ms:[7,10,13,12,15]},
  {s:"זרעים",m:"חלה",p:4,ms:[9,8,10,11]},{s:"זרעים",m:"ערלה",p:3,ms:[9,17,9]},{s:"זרעים",m:"ביכורים",p:4,ms:[11,11,12,5]},
  {s:"מועד",m:"שבת",p:24,ms:[11,7,6,7,4,10,4,4,7,6,6,6,7,4,3,8,8,3,6,5,3,6,6,5]},
  {s:"מועד",m:"עירובין",p:10,ms:[10,6,9,11,9,10,11,11,4,15]},{s:"מועד",m:"פסחים",p:10,ms:[7,8,8,9,10,2,13,8,11,9]},
  {s:"מועד",m:"שקלים",p:8,ms:[7,5,4,9,6,7,7,8]},{s:"מועד",m:"יומא",p:8,ms:[8,7,11,6,7,8,5,9]},
  {s:"מועד",m:"סוכה",p:5,ms:[11,9,15,10,8]},{s:"מועד",m:"ביצה",p:5,ms:[10,10,8,7,7]},
  {s:"מועד",m:"ראש השנה",p:4,ms:[9,8,8,9]},{s:"מועד",m:"תענית",p:4,ms:[7,10,9,8]},
  {s:"מועד",m:"מגילה",p:4,ms:[11,6,6,10]},{s:"מועד",m:"מועד קטן",p:3,ms:[10,5,9]},{s:"מועד",m:"חגיגה",p:3,ms:[8,7,8]},
  {s:"נשים",m:"יבמות",p:16,ms:[16,10,10,13,13,6,6,6,6,9,7,6,13,9,10,7]},
  {s:"נשים",m:"כתובות",p:13,ms:[10,10,9,12,9,7,10,8,9,6,6,4,11]},
  {s:"נשים",m:"נדרים",p:11,ms:[4,5,11,8,6,10,9,7,9,8,12]},{s:"נשים",m:"נזיר",p:9,ms:[7,10,7,7,7,11,4,2,5]},
  {s:"נשים",m:"סוטה",p:9,ms:[9,6,8,5,9,3,8,7,15]},{s:"נשים",m:"גיטין",p:9,ms:[6,7,8,9,9,7,9,10,10]},
  {s:"נשים",m:"קידושין",p:4,ms:[10,10,13,14]},
  {s:"נזיקין",m:"בבא קמא",p:10,ms:[4,6,11,9,7,6,7,7,12,10]},{s:"נזיקין",m:"בבא מציעא",p:10,ms:[8,11,12,12,11,8,11,10,13,6]},
  {s:"נזיקין",m:"בבא בתרא",p:10,ms:[6,15,10,9,11,8,10,8,8,8]},{s:"נזיקין",m:"סנהדרין",p:11,ms:[6,5,8,5,5,6,11,7,6,6,6]},
  {s:"נזיקין",m:"מכות",p:3,ms:[10,8,16]},{s:"נזיקין",m:"שבועות",p:8,ms:[7,5,11,13,5,7,8,6]},
  {s:"נזיקין",m:"עדיות",p:8,ms:[14,10,12,12,7,3,9,7]},{s:"נזיקין",m:"עבודה זרה",p:5,ms:[9,7,12,12,12]},
  {s:"נזיקין",m:"אבות",p:6,ms:[18,16,18,22,23,11]},{s:"נזיקין",m:"הוריות",p:3,ms:[5,7,8]},
  {s:"קדשים",m:"זבחים",p:14,ms:[4,5,8,6,8,7,6,12,7,9,8,6,8,3]},{s:"קדשים",m:"מנחות",p:13,ms:[4,5,7,5,9,7,6,7,9,9,9,5,11]},
  {s:"קדשים",m:"חולין",p:12,ms:[7,10,7,7,5,7,7,4,8,4,6,5]},{s:"קדשים",m:"בכורות",p:9,ms:[7,9,4,10,6,12,7,10,8]},
  {s:"קדשים",m:"ערכין",p:9,ms:[4,6,5,5,8,5,5,7,8]},{s:"קדשים",m:"תמורה",p:7,ms:[6,3,4,3,6,5,6]},
  {s:"קדשים",m:"כריתות",p:6,ms:[7,6,10,3,8,9]},{s:"קדשים",m:"מעילה",p:6,ms:[4,9,3,6,5,4]},
  {s:"קדשים",m:"תמיד",p:7,ms:[4,5,9,3,7,3,4]},{s:"קדשים",m:"מידות",p:5,ms:[9,6,8,7,4]},{s:"קדשים",m:"קינים",p:3,ms:[4,5,6]},
  {s:"טהרות",m:"כלים",p:30,ms:[9,8,8,4,11,4,6,11,8,8,9,8,8,8,6,8,17,9,10,7,3,10,5,17,9,9,12,10,9,16]},
  {s:"טהרות",m:"אהלות",p:18,ms:[8,7,7,7,7,7,6,6,15,7,9,8,9,10,10,9,5,10]},
  {s:"טהרות",m:"נגעים",p:14,ms:[6,5,4,11,5,8,5,10,3,10,12,7,12,13]},
  {s:"טהרות",m:"פרה",p:12,ms:[4,3,5,4,9,5,12,10,9,6,9,12]},{s:"טהרות",m:"טהרות",p:10,ms:[9,8,8,13,9,10,9,10,9,8]},
  {s:"טהרות",m:"מקוואות",p:10,ms:[8,10,4,5,6,11,7,5,7,8]},{s:"טהרות",m:"נידה",p:10,ms:[7,7,7,7,9,14,5,4,11,8]},
  {s:"טהרות",m:"מכשירין",p:6,ms:[6,11,8,10,11,8]},{s:"טהרות",m:"זבים",p:5,ms:[6,3,3,7,12]},
  {s:"טהרות",m:"טבול יום",p:4,ms:[5,8,6,7]},{s:"טהרות",m:"ידים",p:4,ms:[5,4,5,8]},{s:"טהרות",m:"עוקצין",p:3,ms:[6,10,12]},
];
const TANACH = [
  {s:"תורה",b:"בראשית",c:50},{s:"תורה",b:"שמות",c:40},{s:"תורה",b:"ויקרא",c:27},
  {s:"תורה",b:"במדבר",c:36},{s:"תורה",b:"דברים",c:34},
  {s:"נביאים",b:"יהושע",c:24},{s:"נביאים",b:"שופטים",c:21},{s:"נביאים",b:"שמואל א",c:31},
  {s:"נביאים",b:"שמואל ב",c:24},{s:"נביאים",b:"מלכים א",c:22},{s:"נביאים",b:"מלכים ב",c:25},
  {s:"נביאים",b:"ישעיהו",c:66},{s:"נביאים",b:"ירמיהו",c:52},{s:"נביאים",b:"יחזקאל",c:48},
  {s:"נביאים",b:"הושע",c:14},{s:"נביאים",b:"יואל",c:4},{s:"נביאים",b:"עמוס",c:9},
  {s:"נביאים",b:"עובדיה",c:1},{s:"נביאים",b:"יונה",c:4},{s:"נביאים",b:"מיכה",c:7},
  {s:"נביאים",b:"נחום",c:3},{s:"נביאים",b:"חבקוק",c:3},{s:"נביאים",b:"צפניה",c:3},
  {s:"נביאים",b:"חגי",c:2},{s:"נביאים",b:"זכריה",c:14},{s:"נביאים",b:"מלאכי",c:3},
  {s:"כתובים",b:"תהלים",c:150},{s:"כתובים",b:"משלי",c:31},{s:"כתובים",b:"איוב",c:42},
  {s:"כתובים",b:"שיר השירים",c:8},{s:"כתובים",b:"רות",c:4},{s:"כתובים",b:"איכה",c:5},
  {s:"כתובים",b:"קהלת",c:12},{s:"כתובים",b:"אסתר",c:10},{s:"כתובים",b:"דניאל",c:12},
  {s:"כתובים",b:"עזרא",c:10},{s:"כתובים",b:"נחמיה",c:13},
  {s:"כתובים",b:"דברי הימים א",c:29},{s:"כתובים",b:"דברי הימים ב",c:36},
];
const PARSHIOT = [
  ["בראשית","נח","לך לך","וירא","חיי שרה","תולדות","ויצא","וישלח","וישב","מקץ","ויגש","ויחי"],
  ["שמות","וארא","בא","בשלח","יתרו","משפטים","תרומה","תצוה","כי תשא","ויקהל","פקודי"],
  ["ויקרא","צו","שמיני","תזריע","מצורע","אחרי מות","קדושים","אמור","בהר","בחוקותי"],
  ["במדבר","נשא","בהעלותך","שלח","קרח","חקת","בלק","פינחס","מטות","מסעי"],
  ["דברים","ואתחנן","עקב","ראה","שופטים","כי תצא","כי תבוא","נצבים","וילך","האזינו","וזאת הברכה"],
];
const MUSAR = [
  {n:"מסילת ישרים",a:'רמח"ל',p:26},{n:"חובת הלבבות",a:"רבינו בחיי",p:10},
  {n:"שערי תשובה",a:"רבינו יונה",p:4},{n:"אורחות צדיקים",a:"אנונימי",p:30},
  {n:"תומר דבורה",a:'רמ"ק',p:10},{n:"פלא יועץ",a:"ר' אליעזר פאפו",p:90},
  {n:"חפץ חיים",a:"החפץ חיים",p:17},{n:"שמירת הלשון",a:"החפץ חיים",p:30},
  {n:"אהבת חסד",a:"החפץ חיים",p:24},{n:"מכתב מאליהו",a:"ר' אליהו דסלר",p:5},
  {n:"עלי שור",a:"ר' שלמה וולבה",p:2},{n:"נתיבות שלום",a:'אדמו"ר מסלונים',p:5},
  {n:'ליקוטי מוהר"ן',a:"ר' נחמן מברסלב",p:286},{n:"ספר המידות",a:"ר' נחמן מברסלב",p:30},
  {n:"ספר הישר",a:'ר"ת',p:13},
];
const RAV_KOOK = [
  {n:"אורות",g:"אורות",p:9},{n:"אורות התשובה",g:"אורות",p:17},
  {n:"אורות ארץ ישראל",g:"אורות",p:5},{n:"אורות המלחמה",g:"אורות",p:9},
  {n:"אורות התחיה",g:"אורות",p:9},{n:"אורות ישראל",g:"אורות",p:9},
  {n:"אורות הקודש א",g:"אורות הקודש",p:9},{n:"אורות הקודש ב",g:"אורות הקודש",p:9},
  {n:"אורות הקודש ג",g:"אורות הקודש",p:9},{n:"אורות הקודש ד",g:"אורות הקודש",p:7},
  {n:"אורות התורה",g:"אורות",p:13},{n:"אורות האמונה",g:"אורות",p:8},
  {n:"עין איה ברכות א",g:"עין איה",p:9},{n:"עין איה ברכות ב",g:"עין איה",p:9},
  {n:"עין איה שבת א",g:"עין איה",p:11},{n:"עין איה שבת ב",g:"עין איה",p:11},
  {n:"שמונה קבצים",g:"שמונה קבצים",p:9},
  {n:"אגרות הראיה א",g:"אגרות הראיה",p:9},{n:"אגרות הראיה ב",g:"אגרות הראיה",p:9},
  {n:"אגרות הראיה ג",g:"אגרות הראיה",p:9},{n:"אגרות הראיה ד",g:"אגרות הראיה",p:9},
  {n:"מאמרי הראיה א",g:"מאמרים",p:9},{n:"מאמרי הראיה ב",g:"מאמרים",p:9},
  {n:"מוסר אביך",g:"שונות",p:6},{n:"עולת ראיה א",g:"שונות",p:9},
  {n:"עולת ראיה ב",g:"שונות",p:9},{n:"ארפלי טוהר",g:"שונות",p:9},{n:"ריש מילין",g:"שונות",p:9},
];
const MACHSHAVA = [
  {n:"נפש החיים",a:"ר' חיים מוולוז'ין",p:4},{n:"כוזרי",a:'ריה"ל',p:5},
  {n:"מורה נבוכים",a:'רמב"ם',p:3},{n:"דרך ה'",a:'רמח"ל',p:4},
  {n:"דעת תבונות",a:'רמח"ל',p:1},{n:"תניא",a:'אדמו"ר הזקן',p:4},
  {n:"אמונות ודעות",a:'רס"ג',p:10},{n:"ספר העיקרים",a:"ר' יוסף אלבו",p:4},
  {n:"נצח ישראל",a:'מהר"ל',p:58},{n:"נתיבות עולם",a:'מהר"ל',p:2},
  {n:"גבורות ה'",a:'מהר"ל',p:73},{n:"באר הגולה",a:'מהר"ל',p:7},
];

const CATS = ["gemara","mishna","tanach","musar","ravKook","machshava","custom"];
const CAT_HE = {gemara:"גמרא",mishna:"משניות",tanach:'תנ"ך',musar:"מוסר",ravKook:"רב קוק",machshava:"מחשבה",custom:"אישי"};
const CAT_EN = {gemara:"Gemara",mishna:"Mishna",tanach:"Tanach",musar:"Musar",ravKook:"Rav Kook",machshava:"Machshava",custom:"My Books"};
const NAVY="#1A3A6B", GOLD="#C9A84C", GOLD2="#E8C060";
const CC_L={gemara:NAVY,mishna:"#0A5757",tanach:"#7A4818",musar:"#1A5C2E",ravKook:"#1A2B6B",machshava:"#4A1A5C",custom:"#444"};
const CL_L={gemara:"#E8EFF8",mishna:"#E3F6F6",tanach:"#FDF3E3",musar:"#E3F5EC",ravKook:"#E8EBF8",machshava:"#F5E8FC",custom:"#F0F0F0"};
const CC_D={gemara:"#93C5FD",mishna:"#5EEAD4",tanach:"#FCD34D",musar:"#6EE7B7",ravKook:"#A5B4FC",machshava:"#F9A8D4",custom:"#D1D5DB"};
const CL_D={gemara:"#1E3A5F",mishna:"#1A3A38",tanach:"#3D2800",musar:"#1A3A28",ravKook:"#1A2A5F",machshava:"#3A1A48",custom:"#374151"};

const QUOTES = [
  "לא עליך המלאכה לגמור, ולא אתה בן חורין ליבטל ממנה",
  "תלמוד תורה כנגד כולם",
  "עשה לך רב, וקנה לך חבר",
  "הוי שקוד ללמוד תורה, ודע מה שתשיב לאפיקורוס",
  "כל ישראל יש להם חלק לעולם הבא",
  "בן בג בג אומר: הפוך בה והפוך בה, דכולא בה",
  "חביבין ישראל שניתן להם כלי חמדה",
  "אם ראית תלמיד חכם שעבר עבירה בלילה, אל תהרהר אחריו ביום",
];

/* ── HELPERS ── */
function getBkList(cat, custom) {
  custom = custom || [];
  if (cat==="gemara") return GEMARA.map((t,i)=>({i,n:t.n,sub:t.s,cat}));
  if (cat==="mishna") return MISHNA.map((t,i)=>({i,n:t.m,sub:t.s,cat}));
  if (cat==="tanach") return TANACH.map((t,i)=>({i,n:t.b,sub:t.s,cat}));
  if (cat==="musar") return MUSAR.map((t,i)=>({i,n:t.n,sub:t.a,cat}));
  if (cat==="ravKook") return RAV_KOOK.map((t,i)=>({i,n:t.n,sub:t.g,cat}));
  if (cat==="machshava") return MACHSHAVA.map((t,i)=>({i,n:t.n,sub:t.a,cat}));
  if (cat==="custom") return custom.map((t,i)=>({i,n:t.name,sub:t.catLabel||"",cat}));
  return [];
}
function getAllBooks(custom) {
  return CATS.flatMap(c => getBkList(c, custom));
}
function totalMs(i) { const m=MISHNA[i]; return m?.ms?m.ms.reduce((a,b)=>a+b,0):m?.p||0; }
function perekAmudKeys(masIdx, p) {
  const g=GEMARA[masIdx]; if(!g) return [];
  const D=g.d, P=g.p;
  const s=Math.round(2+(p-1)/P*D), e=Math.round(2+p/P*D);
  const r=[]; for(let d=s;d<e&&d<=D;d++) r.push(`${d}a`,`${d}b`); return r;
}
function perekMsKeys(masIdx, p) {
  const cnt=MISHNA[masIdx]?.ms?.[p-1]||0;
  return Array.from({length:cnt},(_,i)=>`${p}:${i+1}`);
}
function bkTotal(cat, i, custom, tmode) {
  if (cat==="gemara") return GEMARA[i]?.d||0;
  if (cat==="mishna") return totalMs(i);
  if (cat==="tanach") return (tmode==="parshiot"&&PARSHIOT[i])?PARSHIOT[i].length:TANACH[i]?.c||0;
  if (cat==="musar") return MUSAR[i]?.p||0;
  if (cat==="ravKook") return RAV_KOOK[i]?.p||0;
  if (cat==="machshava") return MACHSHAVA[i]?.p||0;
  if (cat==="custom") return (custom||[])[i]?.chapters||0;
  return 0;
}
function calcDone(prog, cat, i) {
  if (cat==="gemara") { const g=prog.gemara?.[i]; if(!g)return 0; if(g.full)return GEMARA[i]?.d||0; return Math.round((g.done?.size||0)/2); }
  if (cat==="mishna") { const m=prog.mishna?.[i]; if(!m)return 0; if(m.full)return totalMs(i); return m.done?.size||0; }
  if (cat==="custom") return prog.custom?.[i]?.done?.size||0;
  if (cat==="tanach") { const tm=prog.tmode?.[i]||"perakim"; return tm==="parshiot"?(prog.tparsh?.[i]?.size||0):(prog.tanach?.[i]?.size||0); }
  return prog[cat]?.[i]?.size||0;
}
function pct(d,t) { return t>0?Math.min(100,Math.round(d*100/t)):0; }

/* ── BADGES ── */
const BADGE_DEFS = [
  {id:"first",emoji:"🌱",label:"צעד ראשון",desc:"סימנת ליחידה הראשונה",check:s=>s.totalItems>=1},
  {id:"d10",emoji:"⭐",label:"10 דפים",desc:"למדת 10 דפי גמרא",check:s=>s.dapim>=10},
  {id:"d100",emoji:"🌟",label:"100 דפים",desc:"למדת 100 דפי גמרא",check:s=>s.dapim>=100},
  {id:"masechet",emoji:"📗",label:"מסכת שלמה",desc:"השלמת מסכת ראשונה",check:s=>s.gFull>=1},
  {id:"m50",emoji:"📖",label:"50 משניות",desc:"למדת 50 משניות",check:s=>s.mishna>=50},
  {id:"m500",emoji:"📚",label:"500 משניות",desc:"למדת 500 משניות",check:s=>s.mishna>=500},
  {id:"seder",emoji:"🏛️",label:"סדר שלם",desc:"השלמת מסכת משנה שלמה",check:s=>s.mFull>=1},
  {id:"tanach10",emoji:"✡️",label:"10 פרקי תנ\"ך",desc:"למדת 10 פרקי תנ\"ך",check:s=>s.tanach>=10},
  {id:"musar1",emoji:"🕊️",label:"ספר מוסר",desc:"השלמת ספר מוסר",check:s=>s.musarFull>=1},
  {id:"streak3",emoji:"🔥",label:"3 ימים רצוף",desc:"3 ימים רצופים של למידה",check:s=>s.streak>=3},
  {id:"streak7",emoji:"💫",label:"שבוע שלם",desc:"שבעה ימים רצופים",check:s=>s.streak>=7},
  {id:"streak30",emoji:"👑",label:"חודש שלם",desc:"30 יום רצופים — עוצמה!",check:s=>s.streak>=30},
];
function computeBadges(stats) {
  return BADGE_DEFS.filter(b=>b.check(stats)).map(b=>b.id);
}

/* ── STORAGE SERIALIZATION ── */
function serProg(prog) {
  const o={gemara:{},mishna:{},tanach:{},tparsh:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};
  for(const[k,v] of Object.entries(prog.gemara||{})) o.gemara[k]={done:[...(v.done||new Set())],full:!!v.full};
  for(const[k,v] of Object.entries(prog.mishna||{})) o.mishna[k]={done:[...(v.done||new Set())],full:!!v.full};
  for(const[k,v] of Object.entries(prog.tanach||{})) o.tanach[k]=[...v];
  for(const[k,v] of Object.entries(prog.tparsh||{})) o.tparsh[k]=[...v];
  o.tmode={...prog.tmode};
  for(const c of["musar","ravKook","machshava"]) for(const[k,v] of Object.entries(prog[c]||{})) o[c][k]=[...v];
  o.custom=(prog.custom||[]).map(b=>({...b,done:[...(b.done||new Set())]}));
  o.notes={...prog.notes}; o.chazara={...prog.chazara};
  return o;
}
function desProg(data) {
  if(!data) return null;
  const o={gemara:{},mishna:{},tanach:{},tparsh:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};
  for(const[k,v] of Object.entries(data.gemara||{})) o.gemara[k]={done:new Set(v.done),full:!!v.full};
  for(const[k,v] of Object.entries(data.mishna||{})) o.mishna[k]={done:new Set(v.done),full:!!v.full};
  for(const[k,v] of Object.entries(data.tanach||{})) o.tanach[k]=new Set(v);
  for(const[k,v] of Object.entries(data.tparsh||{})) o.tparsh[k]=new Set(v);
  o.tmode={...data.tmode};
  for(const c of["musar","ravKook","machshava"]) for(const[k,v] of Object.entries(data[c]||{})) o[c][k]=new Set(v);
  o.custom=(data.custom||[]).map(b=>({...b,done:new Set(b.done)}));
  o.notes={...data.notes}; o.chazara={...data.chazara};
  return o;
}
const IP={gemara:{},mishna:{},tanach:{},tparsh:{},tmode:{},musar:{},ravKook:{},machshava:{},custom:[],notes:{},chazara:{}};

/* ── THEME ── */
function mkT(dark, sz, lang) {
  const sc=[0.88,1,1.14][sz]||1, f=n=>Math.round(n*sc);
  const isEn=lang==="en";
  const CAT_L=isEn?CAT_EN:CAT_HE;
  const CAT_UNIT=isEn
    ?{gemara:"dapim",mishna:"mishnayot",tanach:"chapters",musar:"chapters",ravKook:"chapters",machshava:"chapters",custom:"chapters"}
    :{gemara:"דפים",mishna:"משניות",tanach:"פרקים",musar:"פרקים",ravKook:"פרקים",machshava:"פרקים",custom:"פרקים"};
  const base=dark
    ?{bg:"#0D1B2E",card:"#152438",navy:"#D0E4FF",gold:GOLD2,muted:"#8A9BB0",border:"rgba(200,220,255,0.10)",input:"#1E3050",shadow:"0 2px 16px rgba(0,0,0,0.5)",primary:"#4A7FC0",red:"#FCA5A5"}
    :{bg:"#FAF7EE",card:"#FFFFFF",navy:NAVY,gold:GOLD,muted:"#6B7280",border:"rgba(26,58,107,0.10)",input:"#F3EED8",shadow:"0 2px 14px rgba(26,58,107,0.09)",primary:NAVY,red:"#B91C1C"};
  return {...base,f,dark,CAT_L,CAT_UNIT,isEn,font:"'Heebo',system-ui,sans-serif"};
}

/* ── UI PRIMITIVES ── */
function Bar({p,color,h,dark}) {
  return (
    <div style={{background:dark?"rgba(255,255,255,0.08)":"rgba(26,58,107,0.08)",borderRadius:99,height:h||6,overflow:"hidden"}}>
      <div style={{width:`${p}%`,height:"100%",background:color,borderRadius:99,transition:"width .4s"}}/>
    </div>
  );
}
function Ring({p,color,size=60,stroke=7,label,sub,dark}) {
  const r=(size-stroke)/2, c=2*Math.PI*r, off=c-(p/100)*c;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark?"rgba(255,255,255,0.10)":"rgba(26,58,107,0.08)"} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .5s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}>
        <span style={{fontSize:size<50?10:13,fontWeight:800,lineHeight:1}}>{label}</span>
        {sub&&<span style={{fontSize:7,opacity:.6,lineHeight:1}}>{sub}</span>}
      </div>
    </div>
  );
}
function Sheet({show,onClose,title,T,children}) {
  if(!show) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",zIndex:600}}>
      <div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"16px 18px 52px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 -8px 32px rgba(0,0,0,0.3)"}}>
        <div style={{width:38,height:4,background:T.border,borderRadius:99,margin:"0 auto 14px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontSize:T.f(17),fontWeight:700,color:T.navy,fontFamily:T.font}}>{title}</span>
          <button onClick={onClose} style={{background:T.input,border:"none",cursor:"pointer",color:T.muted,fontSize:18,padding:"3px 12px",borderRadius:9,fontFamily:T.font}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function FI({T,style,...r}) { return <input {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:T.f(14),fontFamily:T.font,direction:"rtl",outline:"none",boxSizing:"border-box",...(style||{})}}/>; }
function FS({T,style,children,...r}) { return <select {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:T.f(14),fontFamily:T.font,direction:"rtl",outline:"none",boxSizing:"border-box",...(style||{})}}>{children}</select>; }
function FTA({T,style,...r}) { return <textarea {...r} style={{width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,color:T.navy,fontSize:T.f(14),fontFamily:T.font,direction:"rtl",outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:90,...(style||{})}}/>; }
function FL({label,T,children}) { return <div style={{marginBottom:14}}><label style={{fontSize:T.f(12),color:T.muted,display:"block",marginBottom:5,fontWeight:600,fontFamily:T.font}}>{label}</label>{children}</div>; }
function PB({onClick,children,T,color,style}) { return <button onClick={onClick} style={{width:"100%",padding:13,background:color||T.primary,color:"#fff",border:"none",borderRadius:12,fontSize:T.f(15),fontWeight:700,cursor:"pointer",fontFamily:T.font,...(style||{})}}>{children}</button>; }
function MB({active,onClick,label,color,T}) { return <button onClick={onClick} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`2px solid ${active?color:T.border}`,background:active?color:"transparent",color:active?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:active?700:400,fontFamily:T.font,transition:"all .2s"}}>{label}</button>; }
function Toggle({on,onToggle,primary}) { return <div onClick={onToggle} style={{width:50,height:28,borderRadius:14,background:on?primary:"#D1D5DB",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,width:22,height:22,borderRadius:"50%",background:"#fff",left:on?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></div>; }

function BookCard({cat,idx,prog,T,cc,cl,onPress,custom}) {
  const list=getBkList(cat,custom), item=list[idx]; if(!item) return null;
  const tmode=prog.tmode?.[idx]||"perakim";
  const dn=calcDone(prog,cat,idx), tot=bkTotal(cat,idx,custom,tmode);
  const col=cc[cat]||T.primary, p=pct(dn,tot), fin=dn>=tot&&tot>0;
  return (
    <div onClick={()=>onPress({cat,idx})} style={{background:T.card,borderRadius:14,padding:"13px 15px",marginBottom:8,cursor:"pointer",boxShadow:T.shadow,borderRight:`4px solid ${fin?col:"transparent"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
        <div style={{flex:1}}>
          <div style={{fontSize:T.f(15),fontWeight:700,color:T.navy}}>{item.n}</div>
          {item.sub&&<div style={{fontSize:T.f(11),color:T.muted,marginTop:1}}>{item.sub}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginRight:8}}>
          {fin&&<span style={{fontSize:T.f(10),padding:"3px 8px",borderRadius:20,background:cl[cat],color:col,fontWeight:800}}>הושלם</span>}
          <span style={{fontSize:T.f(12),color:T.muted}}>{dn}/{tot}</span>
        </div>
      </div>
      <Bar p={p} color={col} h={5} dark={T.dark}/>
    </div>
  );
}

/* ── DETAIL SCREEN ── */
function DetailScreen({detail,prog,T,cc,cl,setProg,goBack,onActivity}) {
  const {cat,idx}=detail;
  const list=getBkList(cat,prog.custom), item=list[idx];
  const col=cc[cat]||T.primary, lightCol=cl[cat]||"#E8EFF8";
  const [viewMode,setViewMode]=useState(cat==="gemara"?"amudim":cat==="mishna"?"mishna":"perakim");
  const [noteSheet,setNoteSheet]=useState(null);
  const [editNote,setEditNote]=useState("");
  const [editChz,setEditChz]=useState(0);
  const tMode=prog.tmode?.[idx]||"perakim";
  const isTorah=cat==="tanach"&&idx<5;

  const items=useMemo(()=>{
    const arr=[];
    if(cat==="gemara"){
      if(viewMode==="amudim"){ const D=GEMARA[idx]?.d||0; for(let d=2;d<=D;d++){arr.push({key:`${d}a`,label:`${toHeb(d)}.`});arr.push({key:`${d}b`,label:`${toHeb(d)}:`});} }
      else if(viewMode==="perakim"){ const P=GEMARA[idx]?.p||0,chs=GEMARA[idx]?.ch||[]; for(let p=1;p<=P;p++) arr.push({key:`p${p}`,label:`פרק ${toHeb(p)}`,sub:chs[p-1]||""}); }
    } else if(cat==="mishna"){
      if(viewMode==="mishna"){ const ms=MISHNA[idx]?.ms||[]; ms.forEach((cnt,pi)=>{for(let m=1;m<=cnt;m++) arr.push({key:`${pi+1}:${m}`,label:`${toHeb(pi+1)},${toHeb(m)}`});}); }
      else if(viewMode==="perakim"){ const P=MISHNA[idx]?.p||0; for(let p=1;p<=P;p++) arr.push({key:`pp${p}`,label:`פרק ${toHeb(p)}`,sub:`${MISHNA[idx]?.ms?.[p-1]||0} משניות`}); }
    } else if(cat==="tanach"){
      const tm=isTorah?tMode:"perakim";
      if(tm==="parshiot"&&PARSHIOT[idx]) PARSHIOT[idx].forEach(ps=>arr.push({key:ps,label:ps}));
      else for(let i=1;i<=(TANACH[idx]?.c||0);i++) arr.push({key:i,label:`פרק ${toHeb(i)}`});
    } else {
      const src={musar:MUSAR,ravKook:RAV_KOOK,machshava:MACHSHAVA}[cat];
      const p=(src||[])[idx]?.p||prog.custom[idx]?.chapters||0;
      for(let i=1;i<=p;i++) arr.push({key:i,label:toHeb(i)});
    }
    return arr;
  },[cat,idx,viewMode,tMode,prog.custom]);

  function isOn(key) {
    if(cat==="gemara"){const g=prog.gemara?.[idx];if(!g)return false;if(g.full)return true;if(String(key).startsWith("p")){const pn=parseInt(String(key).slice(1));const ak=perekAmudKeys(idx,pn);return ak.length>0&&ak.every(k=>g.done?.has(k));}return g.done?.has(key)||false;}
    if(cat==="mishna"){const m=prog.mishna?.[idx];if(!m)return false;if(m.full)return true;if(String(key).startsWith("pp")){const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);return mk.length>0&&mk.every(k=>m.done?.has(k));}return m.done?.has(key)||false;}
    if(cat==="custom") return prog.custom?.[idx]?.done?.has(key)||false;
    if(cat==="tanach"&&typeof key==="string") return prog.tparsh?.[idx]?.has(key)||false;
    return prog[cat]?.[idx]?.has(key)||false;
  }
  function isPartial(key) {
    if(cat==="gemara"&&String(key).startsWith("p")){const g=prog.gemara?.[idx];if(!g||g.full)return false;const pn=parseInt(String(key).slice(1));const ak=perekAmudKeys(idx,pn);const cnt=ak.filter(k=>g.done?.has(k)).length;return cnt>0&&cnt<ak.length;}
    if(cat==="mishna"&&String(key).startsWith("pp")){const m=prog.mishna?.[idx];if(!m||m.full)return false;const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);const cnt=mk.filter(k=>m.done?.has(k)).length;return cnt>0&&cnt<mk.length;}
    return false;
  }
  function toggle(key) {
    const wasOn=isOn(key);
    setProg(prev=>{
      if(cat==="gemara"){const g={...prev.gemara},cur=g[idx]||{done:new Set(),full:false};let nd=new Set(cur.done);if(String(key).startsWith("p")){const pn=parseInt(String(key).slice(1));const ak=perekAmudKeys(idx,pn);const allOn=ak.every(k=>nd.has(k));allOn?ak.forEach(k=>nd.delete(k)):ak.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);}g[idx]={done:nd,full:false};return{...prev,gemara:g};}
      if(cat==="mishna"){const mm={...prev.mishna},cur=mm[idx]||{done:new Set(),full:false};let nd=new Set(cur.done);if(String(key).startsWith("pp")){const pn=parseInt(String(key).slice(2));const mk=perekMsKeys(idx,pn);const allOn=mk.every(k=>nd.has(k));allOn?mk.forEach(k=>nd.delete(k)):mk.forEach(k=>nd.add(k));}else{nd.has(key)?nd.delete(key):nd.add(key);}mm[idx]={done:nd,full:false};return{...prev,mishna:mm};}
      if(cat==="custom"){const arr=[...prev.custom],nd=new Set(arr[idx].done);nd.has(key)?nd.delete(key):nd.add(key);arr[idx]={...arr[idx],done:nd};return{...prev,custom:arr};}
      if(cat==="tanach"&&typeof key==="string"){const tp={...(prev.tparsh||{})},nd=new Set(tp[idx]||[]);nd.has(key)?nd.delete(key):nd.add(key);tp[idx]=nd;return{...prev,tparsh:tp};}
      const cp={...prev[cat]},nd=new Set(cp[idx]||[]);nd.has(key)?nd.delete(key):nd.add(key);cp[idx]=nd;return{...prev,[cat]:cp};
    });
    if(!wasOn) onActivity({cat,bk:item?.n||"",label:typeof key==="string"&&!key.startsWith("p")?key:String(key)});
  }
  function setGFull(full){setProg(prev=>{const g={...prev.gemara},cur=g[idx]||{done:new Set()};if(full){const nd=new Set();const D=GEMARA[idx]?.d||0;for(let d=2;d<=D;d++){nd.add(`${d}a`);nd.add(`${d}b`);}g[idx]={done:nd,full:true};}else g[idx]={done:cur.done,full:false};return{...prev,gemara:g};});if(full)onActivity({cat,bk:item?.n||"",label:"מסכת שלמה"});}
  function setMFull(full){setProg(prev=>{const mm={...prev.mishna},cur=mm[idx]||{done:new Set()};if(full){const nd=new Set();const ms=MISHNA[idx]?.ms||[];ms.forEach((cnt,pi)=>{for(let m=1;m<=cnt;m++)nd.add(`${pi+1}:${m}`);});mm[idx]={done:nd,full:true};}else mm[idx]={done:cur.done,full:false};return{...prev,mishna:mm};});if(full)onActivity({cat,bk:item?.n||"",label:"מסכת שלמה"});}
  function setTMode(mode){setProg(prev=>({...prev,tmode:{...(prev.tmode||{}),[idx]:mode}}));}

  const isFull=(cat==="gemara"&&!!prog.gemara?.[idx]?.full)||(cat==="mishna"&&!!prog.mishna?.[idx]?.full);
  const totForMode=isFull?bkTotal(cat,idx,prog.custom,tMode):items.length;
  const doneCnt=isFull?bkTotal(cat,idx,prog.custom,tMode):items.filter(it=>isOn(it.key)).length;
  const p=pct(doneCnt,totForMode);
  const isParsh=cat==="tanach"&&tMode==="parshiot"&&isTorah;

  function openNote(key,label){const k=`${cat}:${idx}:${key}`;setEditNote(prog.notes?.[k]||"");setEditChz(prog.chazara?.[k]||0);setNoteSheet({key,label});}
  function saveNote(){const k=`${cat}:${idx}:${noteSheet.key}`;setProg(prev=>({...prev,notes:{...prev.notes,[k]:editNote},chazara:{...prev.chazara,[k]:editChz}}));setNoteSheet(null);}

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:T.bg}}>
      <div style={{background:T.card,padding:"14px 16px 16px",borderBottom:`1px solid ${T.border}`}}>
        <button onClick={goBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:T.f(13),marginBottom:12,padding:0,fontFamily:T.font}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          חזרה
        </button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:T.f(22),fontWeight:900,color:T.navy}}>{item?.n}</div>
            {item?.sub&&<div style={{fontSize:T.f(12),color:T.muted,marginTop:2}}>{item.sub} · {T.CAT_L[cat]}</div>}
          </div>
          <div style={{background:lightCol,borderRadius:14,padding:"10px 16px",textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:T.f(24),fontWeight:900,color:col}}>{p}%</div>
            <div style={{fontSize:T.f(10),color:col,opacity:.8}}>{doneCnt}/{totForMode}</div>
          </div>
        </div>
        <div style={{marginTop:12}}><Bar p={p} color={col} h={8} dark={T.dark}/></div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"14px 16px 32px"}}>
        {cat==="gemara"&&!isFull&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600}}>סמן לפי:</div>
            <div style={{display:"flex",gap:8}}>
              <MB active={viewMode==="amudim"} onClick={()=>setViewMode("amudim")} label="עמודים" color={col} T={T}/>
              <MB active={viewMode==="perakim"} onClick={()=>setViewMode("perakim")} label="פרקים" color={col} T={T}/>
              <MB active={!!isFull} onClick={()=>setGFull(true)} label="שלמה" color={col} T={T}/>
            </div>
            <div style={{fontSize:T.f(11),color:T.muted,marginTop:6,textAlign:"center"}}>מעבר בין מצבים שומר את כל הסימונים</div>
          </div>
        )}
        {cat==="mishna"&&!isFull&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600}}>סמן לפי:</div>
            <div style={{display:"flex",gap:8}}>
              <MB active={viewMode==="mishna"} onClick={()=>setViewMode("mishna")} label="משניות" color={col} T={T}/>
              <MB active={viewMode==="perakim"} onClick={()=>setViewMode("perakim")} label="פרקים" color={col} T={T}/>
              <MB active={!!isFull} onClick={()=>setMFull(true)} label="מסכת שלמה" color={col} T={T}/>
            </div>
          </div>
        )}
        {isTorah&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:T.f(12),color:T.muted,marginBottom:8,fontWeight:600}}>סמן לפי:</div>
            <div style={{display:"flex",gap:8}}>
              <MB active={tMode==="perakim"} onClick={()=>setTMode("perakim")} label="פרקים" color={col} T={T}/>
              <MB active={tMode==="parshiot"} onClick={()=>setTMode("parshiot")} label="פרשות" color={col} T={T}/>
            </div>
          </div>
        )}
        {isFull?(
          <div style={{padding:28,background:lightCol,borderRadius:16,textAlign:"center",border:`2px solid ${col}`}}>
            <div style={{fontSize:52,marginBottom:8}}>✓</div>
            <div style={{fontSize:T.f(18),fontWeight:900,color:col}}>{item?.n} — הושלמה!</div>
            <div style={{fontSize:T.f(13),color:T.muted,marginTop:4}}>{bkTotal(cat,idx,prog.custom,"perakim")} {T.CAT_UNIT[cat]}</div>
            <button onClick={()=>cat==="gemara"?setGFull(false):setMFull(false)} style={{marginTop:14,fontSize:T.f(13),color:T.muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:T.font}}>בטל</button>
          </div>
        ):(
          <>
            {items.length>0&&<div style={{fontSize:T.f(12),color:T.muted,marginBottom:10}}>{doneCnt} סומנו מתוך {totForMode}</div>}
            <div style={{display:"grid",gridTemplateColumns:`repeat(${(cat==="gemara"&&viewMode==="amudim")?4:4},1fr)`,gap:6}}>
              {items.map(it=>{
                const on=isOn(it.key), part=isPartial(it.key);
                const nk=`${cat}:${idx}:${it.key}`;
                const hasN=!!(prog.notes?.[nk]||"").trim(), chzN=prog.chazara?.[nk]||0;
                const bg=on?col:part?(col+"33"):"transparent";
                const fc=on?"#fff":part?col:T.muted;
                return (
                  <div key={String(it.key)} style={{position:"relative"}}>
                    <button onClick={()=>toggle(it.key)} style={{width:"100%",padding:isParsh?"11px 4px":"9px 4px",border:`2px solid ${on?col:part?col:T.border}`,borderRadius:10,fontSize:T.f(12),cursor:"pointer",background:bg,color:fc,fontWeight:on||part?700:400,minHeight:isParsh?50:44,fontFamily:T.font,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                      <span>{it.label}</span>
                      {it.sub&&<span style={{fontSize:T.f(9),opacity:.7}}>{it.sub}</span>}
                      {chzN>0&&<span style={{fontSize:9,background:"rgba(255,255,255,0.35)",borderRadius:10,padding:"1px 5px",marginTop:1}}>×{chzN}</span>}
                    </button>
                    <button onClick={e=>{e.stopPropagation();openNote(it.key,it.label);}} style={{position:"absolute",top:2,right:2,background:hasN?GOLD:"transparent",border:"none",cursor:"pointer",width:14,height:14,borderRadius:"50%",fontSize:9,color:hasN?"#fff":T.muted,display:"flex",alignItems:"center",justifyContent:"center",opacity:hasN?1:.5,padding:0,lineHeight:1}}>✎</button>
                  </div>
                );
              })}
            </div>
            {items.length>0&&(
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button onClick={()=>items.forEach(it=>!isOn(it.key)&&toggle(it.key))} style={{flex:1,padding:11,borderRadius:10,border:`1.5px solid ${T.border}`,background:"none",cursor:"pointer",fontSize:T.f(13),color:T.navy,fontFamily:T.font}}>סמן הכל</button>
                <button onClick={()=>items.forEach(it=>(isOn(it.key)||isPartial(it.key))&&toggle(it.key))} style={{flex:1,padding:11,borderRadius:10,border:`1.5px solid ${T.border}`,background:"none",cursor:"pointer",fontSize:T.f(13),color:T.muted,fontFamily:T.font}}>נקה הכל</button>
              </div>
            )}
            <div style={{fontSize:T.f(10),color:T.muted,textAlign:"center",marginTop:8}}>לחץ ✎ להערות וחזרות</div>
          </>
        )}
      </div>
      <Sheet show={!!noteSheet} onClose={()=>setNoteSheet(null)} title={`הערות — ${noteSheet?.label||""}`} T={T}>
        <FL label="הערה" T={T}>
          <FTA T={T} value={editNote} onChange={e=>setEditNote(e.target.value)} placeholder="כתוב הערה..."/>
        </FL>
        <FL label="מספר חזרות" T={T}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginTop:4}}>
            <button onClick={()=>setEditChz(Math.max(0,editChz-1))} style={{width:44,height:44,borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,cursor:"pointer",fontSize:26,color:T.navy,fontFamily:T.font,lineHeight:1}}>−</button>
            <span style={{fontSize:T.f(30),fontWeight:900,color:T.navy,minWidth:50,textAlign:"center"}}>{editChz}</span>
            <button onClick={()=>setEditChz(editChz+1)} style={{width:44,height:44,borderRadius:10,border:`1.5px solid ${T.border}`,background:T.input,cursor:"pointer",fontSize:26,color:T.navy,fontFamily:T.font,lineHeight:1}}>+</button>
          </div>
        </FL>
        <PB T={T} onClick={saveNote} style={{marginTop:12,background:col}}>שמור</PB>
      </Sheet>
    </div>
  );
}

/* ── HOME SCREEN ── */
function HomeScreen({prog,goals,T,cc,setTab,streak,activity,earned}) {
  const today=useMemo(()=>hebDateFull(),[]);
  const [now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id);},[]);
  const quote=useMemo(()=>QUOTES[new Date().getDay()%QUOTES.length],[]);

  const S=useMemo(()=>({
    dapim:GEMARA.reduce((s,_,i)=>s+calcDone(prog,"gemara",i),0),
    mishna:MISHNA.reduce((s,_,i)=>s+calcDone(prog,"mishna",i),0),
    tanach:TANACH.reduce((s,_,i)=>s+calcDone(prog,"tanach",i),0),
    musar:MUSAR.reduce((s,_,i)=>s+calcDone(prog,"musar",i),0)+RAV_KOOK.reduce((s,_,i)=>s+calcDone(prog,"ravKook",i),0)+MACHSHAVA.reduce((s,_,i)=>s+calcDone(prog,"machshava",i),0),
    gFull:GEMARA.filter((_,i)=>{const d=calcDone(prog,"gemara",i);return d>0&&d>=GEMARA[i].d;}).length,
    mFull:MISHNA.filter((_,i)=>{const d=calcDone(prog,"mishna",i);return d>0&&d>=totalMs(i);}).length,
  }),[prog]);

  const rows=[
    {cat:"gemara",l:"גמרא",v:S.dapim,tot:GEMARA.reduce((s,t)=>s+t.d,0),unit:"דפים"},
    {cat:"mishna",l:"משניות",v:S.mishna,tot:MISHNA.reduce((s,_,i)=>s+totalMs(i),0),unit:"משניות"},
    {cat:"tanach",l:'תנ"ך',v:S.tanach,tot:TANACH.reduce((s,t)=>s+t.c,0),unit:"פרקים"},
    {cat:"musar",l:"מוסר",v:S.musar,tot:MUSAR.reduce((s,t)=>s+t.p,0)+RAV_KOOK.reduce((s,t)=>s+t.p,0)+MACHSHAVA.reduce((s,t)=>s+t.p,0),unit:"פרקים"},
  ];
  const empty=S.dapim===0&&S.mishna===0&&S.tanach===0&&S.musar===0;
  const hh=String(now.getHours()).padStart(2,"0");
  const mm2=String(now.getMinutes()).padStart(2,"0");
  const recentBadges=BADGE_DEFS.filter(b=>earned.includes(b.id)).slice(-3);

  return (
    <div style={{flex:1,overflow:"auto",background:T.bg}}>
      {/* HERO */}
      <div style={{background:`linear-gradient(160deg,#0A1E3A 0%,${NAVY} 60%,#173A5A 100%)`,padding:"22px 18px 22px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,left:-50,width:200,height:200,borderRadius:"50%",border:`1px solid ${GOLD}18`}}/>
        <div style={{position:"absolute",bottom:-70,right:-40,width:240,height:240,borderRadius:"50%",border:`1px solid ${GOLD}14`}}/>
        <div style={{position:"relative"}}>
          {/* Clock row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:T.f(52),fontWeight:800,color:"#fff",lineHeight:1,letterSpacing:-1,fontFamily:"'Heebo',system-ui,sans-serif"}}>{hh}:{mm2}</div>
              {today&&<div style={{fontSize:T.f(13),color:GOLD,fontWeight:700,marginTop:3}}>{today}</div>}
              <div style={{fontSize:T.f(11),color:"rgba(255,255,255,0.45)",marginTop:1}}>{now.toLocaleDateString("he-IL",{weekday:"long"})}</div>
            </div>
            {/* Streak */}
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 14px",textAlign:"center",border:`1px solid ${GOLD}33`,backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:T.f(22),lineHeight:1}}>🔥</div>
              <div style={{fontSize:T.f(20),fontWeight:900,color:GOLD,lineHeight:1,marginTop:3}}>{streak}</div>
              <div style={{fontSize:T.f(10),color:"rgba(255,255,255,0.6)"}}>ימים רצוף</div>
            </div>
          </div>
          {/* Quote */}
          <div style={{fontSize:T.f(11),color:"rgba(255,255,255,0.6)",fontStyle:"italic",borderRight:`2px solid ${GOLD}`,paddingRight:9,marginBottom:14,lineHeight:1.5}}>"{quote}"</div>
          {/* Stat pills */}
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {[{l:"מסכתות",v:S.gFull,c:CC_D.gemara},{l:"דפים",v:S.dapim,c:CC_D.gemara},{l:"משניות",v:S.mishna,c:CC_D.mishna},{l:'פרקי תנ"ך',v:S.tanach,c:CC_D.tanach}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.10)",borderRadius:20,padding:"5px 11px",fontSize:T.f(11),color:"#fff",border:`1px solid ${GOLD}22`}}>
                <span style={{fontWeight:800,color:s.c}}>{s.v}</span> {s.l}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px 80px"}}>
        {/* STAT CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {rows.map(r=>{
            const p2=pct(r.v,r.tot);
            return (
              <div key={r.cat} onClick={()=>setTab("library")} style={{background:T.card,borderRadius:14,padding:"13px",boxShadow:T.shadow,cursor:"pointer",borderTop:`3px solid ${cc[r.cat]}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:T.f(11),color:T.muted,marginBottom:2}}>{r.l}</div>
                    <div style={{fontSize:T.f(26),fontWeight:900,color:cc[r.cat]}}>{r.v}</div>
                    <div style={{fontSize:T.f(10),color:T.muted}}>{r.unit}</div>
                  </div>
                  <Ring p={p2} color={cc[r.cat]} size={46} stroke={5} label={`${p2}%`} dark={T.dark}/>
                </div>
                <Bar p={p2} color={cc[r.cat]} h={4} dark={T.dark}/>
              </div>
            );
          })}
        </div>

        {/* RECENT BADGES */}
        {recentBadges.length>0&&(
          <div style={{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:14,boxShadow:T.shadow}}>
            <div style={{fontSize:T.f(12),fontWeight:700,color:T.muted,marginBottom:10}}>הישגים אחרונים</div>
            <div style={{display:"flex",gap:10}}>
              {recentBadges.map(b=>(
                <div key={b.id} style={{flex:1,background:T.dark?"rgba(201,168,76,0.15)":"#FBF5E0",borderRadius:10,padding:"8px 6px",textAlign:"center",border:`1px solid ${GOLD}44`}}>
                  <div style={{fontSize:22,marginBottom:3}}>{b.emoji}</div>
                  <div style={{fontSize:T.f(10),fontWeight:700,color:T.gold||GOLD}}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE GOALS */}
        {goals.length>0&&(
          <>
            <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:10}}>יעדים פעילים</div>
            {goals.slice(0,2).map(g=>{
              const isO=g.cat==="other", nm=isO?g.otherName:getBkList(g.cat,prog.custom)[g.idx]?.n||"";
              const cur=isO?0:calcDone(prog,g.cat,g.idx), p2=pct(Math.min(cur,g.target),g.target);
              const rem=Math.max(0,Math.round((new Date(g.deadline)-new Date())/86400000)), col2=cc[g.cat]||T.primary;
              return (
                <div key={g.id} onClick={()=>setTab("goals")} style={{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer",boxShadow:T.shadow,borderRight:`3px solid ${col2}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div><div style={{fontSize:T.f(14),fontWeight:700,color:T.navy}}>{nm}</div><div style={{fontSize:T.f(11),color:T.muted}}>{rem} ימים שנותרו</div></div>
                    <div style={{fontSize:T.f(22),fontWeight:900,color:col2}}>{p2}%</div>
                  </div>
                  <Bar p={p2} color={col2} h={6} dark={T.dark}/>
                </div>
              );
            })}
          </>
        )}

        {/* RECENT ACTIVITY */}
        {activity.length>0&&(
          <>
            <div style={{fontSize:T.f(14),fontWeight:800,color:T.navy,marginBottom:10,marginTop:goals.length>0?4:0}}>פעילות אחרונה</div>
            <div style={{background:T.card,borderRadius:14,padding:"4px 14px",boxShadow:T.shadow}}>
              {activity.slice(0,5).map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<Math.min(activity.length,5)-1?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:18}}>{a.cat==="gemara"?"📖":a.cat==="mishna"?"📗":a.cat==="tanach"?"✡️":a.cat==="musar"?"🕊️":"📚"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:T.f(13),fontWeight:600,color:T.navy}}>{a.bk}</div>
                    <div style={{fontSize:T.f(11),color:T.muted}}>{a.label} · {a.time}</div>
                  </div>
                  <div style={{width:8,height:8,borderRadius:"50%",background:cc[a.cat]||T.primary,flexShrink:0}}/>
                </div>
              ))}
            </div>
          </>
        )}

        {empty&&(
          <div style={{textAlign:"center",padding:"36px 16px",background:T.card,borderRadius:16,boxShadow:T.shadow}}>
            <div style={{fontSize:52,marginBottom:12}}>📚</div>
            <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:8}}>ברוך הבא!</div>
            <div style={{fontSize:T.f(14),color:T.muted,lineHeight:1.7}}>לך לספרייה והתחל לסמן את הלמידה שלך</div>
            <button onClick={()=>setTab("library")} style={{marginTop:18,padding:"12px 28px",background:T.primary,color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontSize:T.f(15),fontWeight:700,fontFamily:T.font}}>פתח ספרייה</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── LIBRARY SCREEN (with cross-category search) ── */
function LibraryScreen({prog,T,cc,cl,setProg,setDetail,libCat,setLibCat}) {
  const [search,setSearch]=useState("");
  const [custSheet,setCustSheet]=useState(false);
  const [cd,setCd]=useState({name:"",chapters:"",cat:"musar"});

  // Cross-category search
  const allResults=useMemo(()=>{
    if(!search.trim()) return [];
    const q=search.trim();
    return getAllBooks(prog.custom).filter(b=>b.n.includes(q)||b.sub?.includes(q));
  },[search,prog.custom]);

  const filtered=useMemo(()=>{
    if(search.trim()) return [];
    return getBkList(libCat,prog.custom);
  },[libCat,search,prog.custom]);

  function addCustom(){if(!cd.name||!cd.chapters)return;const lbl={musar:"מוסר",ravKook:"רב קוק",machshava:"מחשבה",other:"אישי"}[cd.cat]||"אישי";setProg(prev=>({...prev,custom:[...prev.custom,{name:cd.name,chapters:parseInt(cd.chapters),catLabel:lbl,cat:cd.cat,done:new Set()}]}));setCustSheet(false);setCd({name:"",chapters:"",cat:"musar"});}
  function removeCustom(i){setProg(prev=>{const arr=[...prev.custom];arr.splice(i,1);return{...prev,custom:arr};});}

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`}}>
        <div style={{padding:"14px 16px 0",fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:10}}>ספרייה</div>
        <div style={{padding:"0 16px 10px"}}>
          <FI T={T} value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  חיפוש בכל הספרים..."/>
        </div>
        {!search.trim()&&(
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:12,paddingRight:16,paddingLeft:16,scrollbarWidth:"none"}}>
            {CATS.map(c=><button key={c} onClick={()=>setLibCat(c)} style={{whiteSpace:"nowrap",padding:"7px 15px",borderRadius:20,fontSize:T.f(13),border:`2px solid ${libCat===c?cc[c]:T.border}`,background:libCat===c?cc[c]:"transparent",cursor:"pointer",color:libCat===c?"#fff":T.muted,fontWeight:libCat===c?800:400,flexShrink:0,fontFamily:T.font}}>{T.CAT_L[c]}</button>)}
          </div>
        )}
      </div>
      <div style={{flex:1,overflow:"auto",padding:"12px 16px 80px"}}>
        {search.trim()?(
          <>
            {allResults.length===0&&<div style={{textAlign:"center",padding:40,color:T.muted,fontSize:T.f(14)}}>לא נמצאו תוצאות</div>}
            {allResults.length>0&&<div style={{fontSize:T.f(11),color:T.muted,marginBottom:10}}>{allResults.length} תוצאות</div>}
            {allResults.map(bk=>(
              <div key={`${bk.cat}-${bk.i}`}>
                <div style={{fontSize:T.f(10),color:cc[bk.cat]||T.muted,fontWeight:700,marginBottom:3,paddingRight:4}}>{T.CAT_L[bk.cat]}</div>
                <BookCard cat={bk.cat} idx={bk.i} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog.custom}/>
              </div>
            ))}
          </>
        ):(
          <>
            {libCat==="custom"&&<button onClick={()=>setCustSheet(true)} style={{width:"100%",padding:13,borderRadius:14,border:`2px dashed ${T.border}`,background:"transparent",cursor:"pointer",color:T.muted,fontSize:T.f(14),marginBottom:10,fontFamily:T.font}}>+ הוסף ספר אישי</button>}
            {filtered.map(bk=>(
              <div key={bk.i}>
                <BookCard cat={libCat} idx={bk.i} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} custom={prog.custom}/>
                {libCat==="custom"&&<button onClick={()=>removeCustom(bk.i)} style={{fontSize:T.f(12),color:T.red,background:"none",border:"none",cursor:"pointer",marginTop:-4,marginBottom:8,paddingRight:6,fontFamily:T.font}}>מחק</button>}
              </div>
            ))}
            {filtered.length===0&&libCat==="custom"&&<div style={{textAlign:"center",padding:32,color:T.muted,fontSize:T.f(14)}}>לחץ למעלה להוספת ספר</div>}
          </>
        )}
      </div>
      <Sheet show={custSheet} onClose={()=>setCustSheet(false)} title="הוסף ספר אישי" T={T}>
        <FL label="שם הספר" T={T}><FI T={T} value={cd.name} onChange={e=>setCd(f=>({...f,name:e.target.value}))} placeholder="שם הספר..."/></FL>
        <FL label="מספר פרקים / סימנים" T={T}><FI T={T} type="number" value={cd.chapters} onChange={e=>setCd(f=>({...f,chapters:e.target.value}))} placeholder="20"/></FL>
        <FL label="קטגוריה" T={T}>
          <FS T={T} value={cd.cat} onChange={e=>setCd(f=>({...f,cat:e.target.value}))}>
            <option value="musar">מוסר</option><option value="ravKook">רב קוק</option>
            <option value="machshava">מחשבה</option><option value="other">אישי / אחר</option>
          </FS>
        </FL>
        <PB T={T} onClick={addCustom} style={{marginTop:6,background:NAVY}}>הוסף ספר</PB>
      </Sheet>
    </div>
  );
}

/* ── GOALS SCREEN ── */
function GoalRow({g,prog,T,cc,onDelete,custom}) {
  const isO=g.cat==="other", list=isO?[]:getBkList(g.cat,custom);
  const nm=isO?g.otherName:(list[g.idx]?.n||""); if(!nm) return null;
  const cur=isO?0:calcDone(prog,g.cat,g.idx), p=pct(Math.min(cur,g.target),g.target);
  const end=new Date(g.deadline), start=new Date(g.startDate);
  const td=Math.max(1,Math.round((end-start)/86400000));
  const el=Math.max(0,Math.round((new Date()-start)/86400000));
  const rem=Math.max(0,Math.round((end-new Date())/86400000));
  const exp=Math.min(100,Math.round(el*100/td));
  const onTrack=isO||p>=exp, needed=(!isO&&rem>0)?Math.ceil((g.target-cur)/rem):0;
  const col=cc[g.cat]||T.primary, hd=hebStr(g.deadline);
  const unit=isO?"יחידות":(T.CAT_UNIT[g.cat]||"");
  return (
    <div style={{background:T.card,borderRadius:16,padding:"15px 16px",marginBottom:12,boxShadow:T.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div>
          <div style={{fontSize:T.f(16),fontWeight:900,color:T.navy}}>{nm}</div>
          <div style={{fontSize:T.f(11),color:T.muted}}>{isO?"אישי":T.CAT_L[g.cat]}</div>
        </div>
        {!isO&&<span style={{fontSize:T.f(11),padding:"4px 11px",borderRadius:20,background:onTrack?"#DCFCE7":"#FEE2E2",color:onTrack?"#166534":"#B91C1C",fontWeight:800,flexShrink:0}}>{onTrack?"במסלול ✓":"מאחור"}</span>}
      </div>
      <Bar p={p} color={col} h={8} dark={T.dark}/>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:T.f(12),color:T.muted,margin:"6px 0 12px"}}>
        <span>{cur}/{g.target} {unit}</span>
        <span style={{color:col,fontWeight:800}}>{p}%</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[{l:"ימים שנותרו",v:rem},{l:"נדרש ליום",v:(!isO&&needed>0)?needed:"-"},{l:"יעד נוכחי",v:isO?"-":`${exp}%`}].map(s=>(
          <div key={s.l} style={{background:T.input,borderRadius:10,padding:"9px 10px"}}>
            <div style={{fontSize:T.f(17),fontWeight:900,color:T.navy}}>{s.v}</div>
            <div style={{fontSize:T.f(10),color:T.muted,marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:T.f(12),color:T.muted}}>
        <div><div>{new Date(g.deadline).toLocaleDateString("he-IL")}</div>{hd&&<div style={{color:col,fontWeight:700,marginTop:2}}>{hd}</div>}</div>
        <button onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:T.f(13),fontFamily:T.font}}>מחק</button>
      </div>
    </div>
  );
}

function GoalsScreen({goals,setGoals,prog,T,cc}) {
  const [sheet,setSheet]=useState(false);
  const [gf,setGf]=useState({cat:"gemara",idx:"0",target:"",deadline:"",otherName:""});
  const bkList=gf.cat==="other"?[]:getBkList(gf.cat,prog.custom);
  const maxTot=gf.cat==="other"?0:bkTotal(gf.cat,parseInt(gf.idx)||0,prog.custom,"perakim");
  const unit=gf.cat==="other"?"יחידות":(T.CAT_UNIT[gf.cat]||"");

  function save() {
    if(!gf.target||!gf.deadline) return;
    if(gf.cat==="other"&&!gf.otherName) return;
    setGoals(prev=>[...prev,{
      id:Date.now(),cat:gf.cat,idx:parseInt(gf.idx)||0,
      target:parseInt(gf.target),deadline:gf.deadline,
      startDate:new Date().toISOString().slice(0,10),otherName:gf.otherName
    }]);
    setSheet(false);
    setGf({cat:"gemara",idx:"0",target:"",deadline:"",otherName:""});
  }

  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy}}>יעדים</div>
        <button onClick={()=>setSheet(true)} style={{fontSize:T.f(13),padding:"9px 16px",borderRadius:12,background:T.primary,color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontFamily:T.font}}>+ יעד חדש</button>
      </div>

      {goals.length===0&&(
        <div style={{textAlign:"center",padding:"50px 16px",background:T.card,borderRadius:16,boxShadow:T.shadow}}>
          <div style={{fontSize:52,marginBottom:14}}>🎯</div>
          <div style={{fontSize:T.f(17),fontWeight:900,color:T.navy,marginBottom:8}}>אין יעדים עדיין</div>
          <div style={{fontSize:T.f(14),color:T.muted,lineHeight:1.7}}>הגדר יעד ועקוב אחרי הקצב שלך</div>
          <button onClick={()=>setSheet(true)} style={{marginTop:16,padding:"11px 24px",background:T.primary,color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontSize:T.f(14),fontWeight:700,fontFamily:T.font}}>+ יעד ראשון</button>
        </div>
      )}

      {goals.map(g=><GoalRow key={g.id} g={g} prog={prog} T={T} cc={cc} onDelete={()=>setGoals(prev=>prev.filter(x=>x.id!==g.id))} custom={prog.custom}/>)}

      <Sheet show={sheet} onClose={()=>setSheet(false)} title="יעד חדש" T={T}>
        <FL label="תחום" T={T}>
          <FS T={T} value={gf.cat} onChange={e=>setGf(f=>({...f,cat:e.target.value,idx:"0",target:"",otherName:""}))}>
            <option value="gemara">{T.CAT_L.gemara}</option>
            <option value="mishna">{T.CAT_L.mishna}</option>
            <option value="musar">{T.CAT_L.musar}</option>
            <option value="ravKook">{T.CAT_L.ravKook}</option>
            <option value="machshava">{T.CAT_L.machshava}</option>
            <option value="custom">{T.CAT_L.custom}</option>
            <option value="other">ספר אחר (לא מהרשימה)</option>
          </FS>
        </FL>
        {gf.cat==="other"?(
          <FL label="שם הספר" T={T}><FI T={T} value={gf.otherName} onChange={e=>setGf(f=>({...f,otherName:e.target.value}))} placeholder="שם הספר..."/></FL>
        ):(bkList.length>0&&
          <FL label="ספר / מסכת" T={T}>
            <FS T={T} value={gf.idx} onChange={e=>setGf(f=>({...f,idx:e.target.value,target:""}))}>
              {bkList.map(b=><option key={b.i} value={b.i}>{b.n}</option>)}
            </FS>
          </FL>
        )}
        <FL label={`יעד (${unit})${maxTot>0?` · מקסימום: ${maxTot}`:""}`} T={T}>
          <FI T={T} type="number" value={gf.target} onChange={e=>setGf(f=>({...f,target:e.target.value}))} placeholder={maxTot>0?String(maxTot):"הכנס מספר..."}/>
        </FL>
        <FL label="תאריך יעד" T={T}>
          <FI T={T} type="date" value={gf.deadline} onChange={e=>setGf(f=>({...f,deadline:e.target.value}))} style={{direction:"ltr"}}/>
          {gf.deadline&&hebStr(gf.deadline)&&<div style={{fontSize:T.f(12),color:GOLD,marginTop:5,fontWeight:700}}>{hebStr(gf.deadline)}</div>}
        </FL>
        <PB T={T} onClick={save} style={{marginTop:6,background:NAVY}}>שמור יעד</PB>
      </Sheet>
    </div>
  );
}

/* ── STATS SCREEN ── */
function StatsScreen({prog,T,cc,earned}) {
  const S=useMemo(()=>({
    dapim:GEMARA.reduce((s,_,i)=>s+calcDone(prog,"gemara",i),0),
    mishna:MISHNA.reduce((s,_,i)=>s+calcDone(prog,"mishna",i),0),
    tanach:TANACH.reduce((s,_,i)=>s+calcDone(prog,"tanach",i),0),
    musar:MUSAR.reduce((s,_,i)=>s+calcDone(prog,"musar",i),0),
    rk:RAV_KOOK.reduce((s,_,i)=>s+calcDone(prog,"ravKook",i),0),
    mach:MACHSHAVA.reduce((s,_,i)=>s+calcDone(prog,"machshava",i),0),
    gFull:GEMARA.filter((_,i)=>{const d=calcDone(prog,"gemara",i);return d>0&&d>=GEMARA[i].d;}).length,
    mFull:MISHNA.filter((_,i)=>{const d=calcDone(prog,"mishna",i);return d>0&&d>=totalMs(i);}).length,
    musarFull:MUSAR.filter((_,i)=>{const d=calcDone(prog,"musar",i);return d>0&&d>=MUSAR[i].p;}).length,
    rkFull:RAV_KOOK.filter((_,i)=>{const d=calcDone(prog,"ravKook",i);return d>0&&d>=RAV_KOOK[i].p;}).length,
    machFull:MACHSHAVA.filter((_,i)=>{const d=calcDone(prog,"machshava",i);return d>0&&d>=MACHSHAVA[i].p;}).length,
  }),[prog]);
  const rows=[
    {cat:"gemara",l:"גמרא",dn:S.dapim,tot:GEMARA.reduce((s,t)=>s+t.d,0),x:`${S.gFull} מסכתות שלמות`,unit:"דפים"},
    {cat:"mishna",l:"משניות",dn:S.mishna,tot:MISHNA.reduce((s,_,i)=>s+totalMs(i),0),x:`${S.mFull} מסכתות שלמות`,unit:"משניות"},
    {cat:"tanach",l:'תנ"ך',dn:S.tanach,tot:TANACH.reduce((s,t)=>s+t.c,0),x:"",unit:"פרקים"},
    {cat:"musar",l:"מוסר",dn:S.musarFull,tot:MUSAR.length,x:`${S.musar} פרקים נלמדו`,unit:"ספרים שלמים"},
    {cat:"ravKook",l:"רב קוק",dn:S.rkFull,tot:RAV_KOOK.length,x:`${S.rk} פרקים`,unit:"ספרים שלמים"},
    {cat:"machshava",l:"מחשבה",dn:S.machFull,tot:MACHSHAVA.length,x:`${S.mach} פרקים`,unit:"ספרים שלמים"},
  ];
  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:16}}>סטטיסטיקות</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[{l:"דפי גמרא",v:S.dapim,c:cc.gemara},{l:"מסכתות שלמות",v:S.gFull,c:cc.gemara},{l:"משניות",v:S.mishna,c:cc.mishna},{l:'פרקי תנ"ך',v:S.tanach,c:cc.tanach},{l:"ספרי מוסר",v:S.musarFull,c:cc.musar},{l:"ספרי מחשבה",v:S.machFull,c:cc.machshava}].map(s=>(
          <div key={s.l} style={{background:T.card,borderRadius:14,padding:"12px 10px",boxShadow:T.shadow}}>
            <div style={{fontSize:T.f(26),fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:T.f(11),color:T.muted,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      {rows.map(x=>(
        <div key={x.cat} style={{background:T.card,borderRadius:14,padding:"13px 15px",marginBottom:10,boxShadow:T.shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
            <div><div style={{fontSize:T.f(15),fontWeight:700,color:T.navy}}>{x.l}</div>{x.x&&<div style={{fontSize:T.f(11),color:T.muted,marginTop:1}}>{x.x}</div>}</div>
            <div style={{textAlign:"left"}}><div style={{fontSize:T.f(18),fontWeight:900,color:cc[x.cat]}}>{pct(x.dn,x.tot)}%</div><div style={{fontSize:T.f(11),color:T.muted}}>{x.dn}/{x.tot} {x.unit}</div></div>
          </div>
          <Bar p={pct(x.dn,x.tot)} color={cc[x.cat]} h={8} dark={T.dark}/>
        </div>
      ))}
      {/* BADGES */}
      <div style={{fontSize:T.f(16),fontWeight:800,color:T.navy,marginTop:4,marginBottom:12}}>הישגים</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {BADGE_DEFS.map(b=>{
          const got=earned.includes(b.id);
          return (
            <div key={b.id} style={{background:got?(T.dark?"rgba(201,168,76,0.15)":"#FBF5E0"):T.card,borderRadius:12,padding:"12px",boxShadow:T.shadow,opacity:got?1:.5,border:got?`1px solid ${GOLD}44`:`1px solid ${T.border}`}}>
              <div style={{fontSize:26,marginBottom:4}}>{b.emoji}</div>
              <div style={{fontSize:T.f(12),fontWeight:700,color:got?T.gold||GOLD:T.navy}}>{b.label}</div>
              <div style={{fontSize:T.f(10),color:T.muted,marginTop:2}}>{b.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── SETTINGS SCREEN ── */
function SettingsScreen({sett,setSett,T,onLogout}) {
  return (
    <div style={{flex:1,overflow:"auto",padding:"14px 16px 80px"}}>
      <div style={{fontSize:T.f(18),fontWeight:900,color:T.navy,marginBottom:20}}>הגדרות</div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5}}>מראה</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div><div style={{fontSize:T.f(14),fontWeight:600,color:T.navy}}>מצב כהה</div><div style={{fontSize:T.f(11),color:T.muted}}>רקע כהה ללמידה בלילה</div></div>
          <Toggle on={sett.dark} onToggle={()=>setSett(s=>({...s,dark:!s.dark}))} primary={T.primary}/>
        </div>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:T.f(14),fontWeight:600,color:T.navy,marginBottom:10}}>גודל טקסט</div>
          <div style={{display:"flex",gap:8}}>{[{v:0,l:"קטן"},{v:1,l:"רגיל"},{v:2,l:"גדול"}].map(o=><button key={o.v} onClick={()=>setSett(s=>({...s,fontSize:o.v}))} style={{flex:1,padding:9,borderRadius:10,border:`2px solid ${sett.fontSize===o.v?T.primary:T.border}`,background:sett.fontSize===o.v?T.primary:"transparent",color:sett.fontSize===o.v?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:sett.fontSize===o.v?700:400,fontFamily:T.font}}>{o.l}</button>)}</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <div style={{fontSize:T.f(14),fontWeight:600,color:T.navy,marginBottom:10}}>שפה / Language</div>
          <div style={{display:"flex",gap:8}}>{[{v:"he",l:"עברית"},{v:"en",l:"English"}].map(o=><button key={o.v} onClick={()=>setSett(s=>({...s,lang:o.v}))} style={{flex:1,padding:9,borderRadius:10,border:`2px solid ${sett.lang===o.v?T.primary:T.border}`,background:sett.lang===o.v?T.primary:"transparent",color:sett.lang===o.v?"#fff":T.muted,fontSize:T.f(13),cursor:"pointer",fontWeight:sett.lang===o.v?700:400,fontFamily:T.font}}>{o.l}</button>)}</div>
        </div>
      </div>
      <div style={{background:T.card,borderRadius:16,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
        <div style={{fontSize:T.f(11),color:T.muted,fontWeight:700,padding:"12px 16px 8px",borderBottom:`1px solid ${T.border}`,letterSpacing:.5}}>חשבון</div>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:T.f(14),fontWeight:700,color:T.navy}}>ישראל ישראלי</div>
          <div style={{fontSize:T.f(12),color:T.muted,marginTop:2}}>israel@gmail.com</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:T.f(14),fontWeight:700,fontFamily:T.font,padding:0}}>התנתקות</button>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:T.f(11),color:T.muted,lineHeight:2,marginTop:24}}>
        <div style={{fontWeight:800,color:T.gold||GOLD,fontSize:T.f(14)}}>מעקב למידה תורנית</div>
        <div>פותח על ידי <strong style={{color:T.navy}}>איתן שחור</strong></div>
        <div>© כל הזכויות שמורות</div>
        <div style={{opacity:.6,marginTop:4}}>גרסה 1.0</div>
      </div>
    </div>
  );
}

/* ── ROOT APP ── */
export default function App() {
  useEffect(()=>{
    if(!document.getElementById("hf")){const l=document.createElement("link");l.id="hf";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap";document.head.appendChild(l);}
  },[]);

  const [loggedIn,setLoggedIn]=useState(false);
  const [tab,setTab]=useState("home");
  const [libCat,setLibCat]=useState("gemara");
  const [detail,setDetail]=useState(null);
  const [sett,setSett]=useState({dark:false,fontSize:1,lang:"he"});
  const [prog,setProg]=useState(IP);
  const [goals,setGoals]=useState([]);
  const [activity,setActivity]=useState([]); // [{cat,bk,label,time,date}]
  const [activeDays,setActiveDays]=useState([]); // ["2024-01-01",...]
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    async function load(){
      try{
        const ps = localStorage.getItem("prog_v2");
        const gs = localStorage.getItem("goals_v2");
        const ss = localStorage.getItem("sett_v2");
        
        if(ps){const d=desProg(JSON.parse(ps));if(d)setProg(d);}
        if(gs) setGoals(JSON.parse(gs));
        if(ss) setSett(JSON.parse(ss));
      } catch{}
      setLoaded(true);
    }
    load();
  },[]);

  useEffect(()=>{if(!loaded)return;localStorage.setItem("prog_v2",JSON.stringify(serProg(prog)));},[prog,loaded]);
  useEffect(()=>{if(!loaded)return;localStorage.setItem("goals_v2",JSON.stringify(goals));},[goals,loaded]);
  useEffect(()=>{if(!loaded)return;localStorage.setItem("sett_v2",JSON.stringify(sett));},[sett,loaded]);
  function onActivity(item) {
    const now=new Date();
    const time=now.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
    const date=todayKey();
    setActivity(prev=>[{...item,time,date},...prev].slice(0,50));
    setActiveDays(prev=>{if(prev.includes(date))return prev;return [...prev,date].slice(-60);});
  }

  // Streak calculation
  const streak=useMemo(()=>{
    if(!activeDays.length) return 0;
    const sorted=[...activeDays].sort().reverse();
    const td=todayKey();
    const yd=new Date(); yd.setDate(yd.getDate()-1); const ydStr=yd.toISOString().slice(0,10);
    if(sorted[0]!==td&&sorted[0]!==ydStr) return 0;
    let count=1,cur=new Date(sorted[0]);
    for(let i=1;i<sorted.length;i++){
      const prev=new Date(cur); prev.setDate(prev.getDate()-1);
      if(sorted[i]===prev.toISOString().slice(0,10)){count++;cur=prev;}else break;
    }
    return count;
  },[activeDays]);

  // Badges
  const stats=useMemo(()=>{
    const dapim=GEMARA.reduce((s,_,i)=>s+calcDone(prog,"gemara",i),0);
    const mishna=MISHNA.reduce((s,_,i)=>s+calcDone(prog,"mishna",i),0);
    const tanach=TANACH.reduce((s,_,i)=>s+calcDone(prog,"tanach",i),0);
    const musar=MUSAR.reduce((s,_,i)=>s+calcDone(prog,"musar",i),0);
    const gFull=GEMARA.filter((_,i)=>{const d=calcDone(prog,"gemara",i);return d>0&&d>=GEMARA[i].d;}).length;
    const mFull=MISHNA.filter((_,i)=>{const d=calcDone(prog,"mishna",i);return d>0&&d>=totalMs(i);}).length;
    const musarFull=MUSAR.filter((_,i)=>{const d=calcDone(prog,"musar",i);return d>0&&d>=MUSAR[i].p;}).length;
    const totalItems=dapim+mishna+tanach+musar;
    return{dapim,mishna,tanach,musar,gFull,mFull,musarFull,totalItems,streak};
  },[prog,streak]);
  const earned=useMemo(()=>computeBadges(stats),[stats]);

  const T=useMemo(()=>mkT(sett.dark,sett.fontSize,sett.lang||"he"),[sett.dark,sett.fontSize,sett.lang]);
  const cc=sett.dark?CC_D:CC_L;
  const cl=sett.dark?CL_D:CL_L;
  const appSt={direction:"rtl",fontFamily:T.font,maxWidth:480,margin:"0 auto",minHeight:"100vh",display:"flex",flexDirection:"column",background:T.bg,color:T.navy};

  if(!loggedIn) return (
    <div style={{...appSt,alignItems:"center",justifyContent:"center",padding:32,gap:28}}>
      <div style={{width:100,height:100,background:`linear-gradient(145deg,${NAVY},#0A1E3A)`,borderRadius:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,boxShadow:`0 12px 40px rgba(26,58,107,0.5)`,border:`2px solid ${GOLD}44`}}>📖</div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:T.f(26),fontWeight:900,marginBottom:4}}>מעקב למידה תורנית</div>
        <div style={{fontSize:T.f(12),color:GOLD,fontWeight:600,marginBottom:8}}>פותח על ידי איתן שחור</div>
        <div style={{fontSize:T.f(14),color:T.muted,lineHeight:1.8}}>עקוב אחרי ההספקים שלך — גמרא, משניות, תנ"ך ועוד</div>
      </div>
      <button onClick={()=>setLoggedIn(true)} style={{display:"flex",alignItems:"center",gap:12,padding:"15px 28px",borderRadius:16,border:`1.5px solid ${T.border}`,background:T.card,cursor:"pointer",fontSize:T.f(16),fontWeight:700,color:T.navy,direction:"ltr",boxShadow:T.shadow,fontFamily:T.font}}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        התחברות עם Google
      </button>
    </div>
  );

  if(detail) return (
    <div style={appSt}>
      <DetailScreen detail={detail} prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} goBack={()=>setDetail(null)} onActivity={onActivity}/>
    </div>
  );

  const NAV=[
    {k:"home",l:T.isEn?"Home":"בית",ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>},
    {k:"library",l:T.isEn?"Library":"ספרייה",ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>},
    {k:"goals",l:T.isEn?"Goals":"יעדים",ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>},
    {k:"stats",l:T.isEn?"Stats":"נתונים",ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
    {k:"settings",l:T.isEn?"Settings":"הגדרות",ico:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>},
  ];

  return (
    <div style={appSt}>
      {tab==="home"&&<HomeScreen prog={prog} goals={goals} T={T} cc={cc} setTab={setTab} streak={streak} activity={activity} earned={earned}/>}
      {tab==="library"&&<LibraryScreen prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} setDetail={setDetail} libCat={libCat} setLibCat={setLibCat}/>}
      {tab==="goals"&&<GoalsScreen goals={goals} setGoals={setGoals} prog={prog} T={T} cc={cc}/>}
      {tab==="stats"&&<StatsScreen prog={prog} T={T} cc={cc} earned={earned}/>}
      {tab==="settings"&&<SettingsScreen sett={sett} setSett={setSett} T={T} onLogout={()=>setLoggedIn(false)}/>}
      <div style={{background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",position:"sticky",bottom:0,zIndex:10}}>
        {NAV.map(it=>(
          <button key={it.k} onClick={()=>setTab(it.k)} style={{flex:1,padding:"9px 2px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontSize:T.f(9),color:tab===it.k?T.gold||GOLD:T.muted,border:"none",background:"none",cursor:"pointer",fontWeight:tab===it.k?800:400,fontFamily:T.font}}>
            {it.ico}{it.l}
          </button>
        ))}
      </div>
      <Analytics />
    </div>
  );
}