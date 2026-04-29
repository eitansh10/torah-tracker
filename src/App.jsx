import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMVwPx4MngQY-tUB15H3LeeYI5sdVJg14",
  authDomain: "torah-tracker-3051d.firebaseapp.com",
  projectId: "torah-tracker-3051d",
  storageBucket: "torah-tracker-3051d.firebasestorage.app",
  messagingSenderId: "1080062742776",
  appId: "1:1080062742776:web:4539305f8aae6ba93f6b0d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const NAVY = "#1A3A6B";
const GOLD = "#C9A84C";

const IP = {
  gemara: {},
  mishna: {},
  tanach: {},
  tmode: {},
  musar: {},
  ravKook: {},
  machshava: {},
  custom: [],
  notes: {},
  chazara: {},
};

const CATS = ["gemara", "mishna", "tanach", "musar", "ravKook", "machshava", "custom"];

const CC_L = {
  gemara: NAVY,
  mishna: "#0A5757",
  tanach: "#7A4818",
  musar: "#1A5C2E",
  ravKook: "#1A2B6B",
  machshava: "#4A1A5C",
  custom: "#444",
};

const CL_L = {
  gemara: "#E8EFF8",
  mishna: "#E3F6F6",
  tanach: "#FDF3E3",
  musar: "#E3F5EC",
  ravKook: "#E8EBF8",
  machshava: "#F5E8FC",
  custom: "#F0F0F0",
};

const CC_D = {
  gemara: "#93C5FD",
  mishna: "#5EEAD4",
  tanach: "#FCD34D",
  musar: "#6EE7B7",
  ravKook: "#A5B4FC",
  machshava: "#F9A8D4",
  custom: "#D1D5DB",
};

const CL_D = {
  gemara: "#1E3A5F",
  mishna: "#1A3A38",
  tanach: "#3D2800",
  musar: "#1A3A28",
  ravKook: "#1A2A5F",
  machshava: "#3A1A48",
  custom: "#374151",
};

const GEMARA = [
  { n: "ברכות", s: "זרעים", d: 64, p: 9 },
  { n: "שבת", s: "מועד", d: 157, p: 24 },
  { n: "עירובין", s: "מועד", d: 105, p: 10 },
  { n: "פסחים", s: "מועד", d: 121, p: 10 },
  { n: "שקלים", s: "מועד", d: 22, p: 8 },
  { n: "יומא", s: "מועד", d: 88, p: 8 },
  { n: "סוכה", s: "מועד", d: 56, p: 5 },
  { n: "ביצה", s: "מועד", d: 40, p: 5 },
  { n: "ראש השנה", s: "מועד", d: 35, p: 4 },
  { n: "תענית", s: "מועד", d: 31, p: 4 },
  { n: "מגילה", s: "מועד", d: 32, p: 4 },
  { n: "מועד קטן", s: "מועד", d: 29, p: 3 },
  { n: "חגיגה", s: "מועד", d: 27, p: 3 },
  { n: "יבמות", s: "נשים", d: 122, p: 16 },
  { n: "כתובות", s: "נשים", d: 112, p: 13 },
  { n: "נדרים", s: "נשים", d: 91, p: 11 },
  { n: "נזיר", s: "נשים", d: 66, p: 9 },
  { n: "סוטה", s: "נשים", d: 49, p: 9 },
  { n: "גיטין", s: "נשים", d: 90, p: 9 },
  { n: "קידושין", s: "נשים", d: 82, p: 4 },
  { n: "בבא קמא", s: "נזיקין", d: 119, p: 10 },
  { n: "בבא מציעא", s: "נזיקין", d: 119, p: 10 },
  { n: "בבא בתרא", s: "נזיקין", d: 176, p: 10 },
  { n: "סנהדרין", s: "נזיקין", d: 113, p: 11 },
  { n: "מכות", s: "נזיקין", d: 24, p: 3 },
  { n: "שבועות", s: "נזיקין", d: 49, p: 8 },
  { n: "עבודה זרה", s: "נזיקין", d: 76, p: 5 },
  { n: "הוריות", s: "נזיקין", d: 14, p: 3 },
  { n: "זבחים", s: "קדשים", d: 120, p: 14 },
  { n: "מנחות", s: "קדשים", d: 110, p: 13 },
  { n: "חולין", s: "קדשים", d: 142, p: 12 },
  { n: "בכורות", s: "קדשים", d: 61, p: 9 },
  { n: "ערכין", s: "קדשים", d: 34, p: 9 },
  { n: "תמורה", s: "קדשים", d: 34, p: 7 },
  { n: "כריתות", s: "קדשים", d: 28, p: 6 },
  { n: "מעילה", s: "קדשים", d: 22, p: 6 },
  { n: "נידה", s: "טהרות", d: 73, p: 10 },
];

const MISHNA = [
  { m: "ברכות", s: "זרעים", p: 9, ms: [5, 8, 6, 7, 5, 8, 5, 8, 5] },
  { m: "פאה", s: "זרעים", p: 8, ms: [6, 8, 8, 11, 8, 11, 8, 9] },
  { m: "דמאי", s: "זרעים", p: 7, ms: [4, 5, 6, 7, 7, 11, 8] },
  { m: "כלאים", s: "זרעים", p: 9, ms: [9, 11, 7, 9, 8, 9, 8, 6, 10] },
  { m: "שביעית", s: "זרעים", p: 10, ms: [8, 10, 10, 10, 9, 6, 7, 11, 9, 9] },
  { m: "תרומות", s: "זרעים", p: 11, ms: [10, 6, 9, 13, 9, 6, 7, 12, 7, 12, 10] },
  { m: "מעשרות", s: "זרעים", p: 5, ms: [8, 8, 10, 6, 8] },
  { m: "מעשר שני", s: "זרעים", p: 5, ms: [7, 10, 13, 12, 15] },
  { m: "חלה", s: "זרעים", p: 4, ms: [9, 8, 10, 11] },
  { m: "ערלה", s: "זרעים", p: 3, ms: [9, 17, 9] },
  { m: "ביכורים", s: "זרעים", p: 4, ms: [11, 11, 12, 5] },
  { m: "שבת", s: "מועד", p: 24, ms: [11, 7, 6, 7, 4, 10, 4, 4, 7, 6, 6, 6, 7, 4, 3, 8, 8, 3, 6, 5, 3, 6, 6, 5] },
  { m: "עירובין", s: "מועד", p: 10, ms: [10, 6, 9, 11, 9, 10, 11, 11, 4, 15] },
  { m: "פסחים", s: "מועד", p: 10, ms: [7, 8, 8, 9, 10, 2, 13, 8, 11, 9] },
  { m: "שקלים", s: "מועד", p: 8, ms: [7, 5, 4, 9, 6, 7, 7, 8] },
  { m: "יומא", s: "מועד", p: 8, ms: [8, 7, 11, 6, 7, 8, 5, 9] },
  { m: "סוכה", s: "מועד", p: 5, ms: [11, 9, 15, 10, 8] },
  { m: "ביצה", s: "מועד", p: 5, ms: [10, 10, 8, 7, 7] },
  { m: "ראש השנה", s: "מועד", p: 4, ms: [9, 8, 8, 9] },
  { m: "תענית", s: "מועד", p: 4, ms: [7, 10, 9, 8] },
  { m: "מגילה", s: "מועד", p: 4, ms: [11, 6, 6, 10] },
  { m: "מועד קטן", s: "מועד", p: 3, ms: [10, 5, 9] },
  { m: "חגיגה", s: "מועד", p: 3, ms: [8, 7, 8] },
  { m: "יבמות", s: "נשים", p: 16, ms: [16, 10, 10, 13, 13, 6, 6, 6, 6, 9, 7, 6, 13, 9, 10, 7] },
  { m: "כתובות", s: "נשים", p: 13, ms: [10, 10, 9, 12, 9, 7, 10, 8, 9, 6, 6, 4, 11] },
  { m: "נדרים", s: "נשים", p: 11, ms: [4, 5, 11, 8, 6, 10, 9, 7, 9, 8, 12] },
  { m: "נזיר", s: "נשים", p: 9, ms: [7, 10, 7, 7, 7, 11, 4, 2, 5] },
  { m: "סוטה", s: "נשים", p: 9, ms: [9, 6, 8, 5, 9, 3, 8, 7, 15] },
  { m: "גיטין", s: "נשים", p: 9, ms: [6, 7, 8, 9, 9, 7, 9, 10, 10] },
  { m: "קידושין", s: "נשים", p: 4, ms: [10, 10, 13, 14] },
  { m: "בבא קמא", s: "נזיקין", p: 10, ms: [4, 6, 11, 9, 7, 6, 7, 7, 12, 10] },
  { m: "בבא מציעא", s: "נזיקין", p: 10, ms: [8, 11, 12, 12, 11, 8, 11, 10, 13, 6] },
  { m: "בבא בתרא", s: "נזיקין", p: 10, ms: [6, 15, 10, 9, 11, 8, 10, 8, 8, 8] },
  { m: "סנהדרין", s: "נזיקין", p: 11, ms: [6, 5, 8, 5, 5, 6, 11, 7, 6, 6, 6] },
  { m: "מכות", s: "נזיקין", p: 3, ms: [10, 8, 16] },
  { m: "שבועות", s: "נזיקין", p: 8, ms: [7, 5, 11, 13, 5, 7, 8, 6] },
  { m: "עדיות", s: "נזיקין", p: 8, ms: [14, 10, 12, 12, 7, 3, 9, 7] },
  { m: "עבודה זרה", s: "נזיקין", p: 5, ms: [9, 7, 12, 12, 12] },
  { m: "אבות", s: "נזיקין", p: 6, ms: [18, 16, 18, 22, 23, 11] },
  { m: "הוריות", s: "נזיקין", p: 3, ms: [5, 7, 8] },
  { m: "זבחים", s: "קדשים", p: 14, ms: [4, 5, 8, 6, 8, 7, 6, 12, 7, 9, 8, 6, 8, 3] },
  { m: "מנחות", s: "קדשים", p: 13, ms: [4, 5, 7, 5, 9, 7, 6, 7, 9, 9, 9, 5, 11] },
  { m: "חולין", s: "קדשים", p: 12, ms: [7, 10, 7, 7, 5, 7, 7, 4, 8, 4, 6, 5] },
  { m: "בכורות", s: "קדשים", p: 9, ms: [7, 9, 4, 10, 6, 12, 7, 10, 8] },
  { m: "ערכין", s: "קדשים", p: 9, ms: [4, 6, 5, 5, 8, 5, 5, 7, 8] },
  { m: "תמורה", s: "קדשים", p: 7, ms: [6, 3, 4, 3, 6, 5, 6] },
  { m: "כריתות", s: "קדשים", p: 6, ms: [7, 6, 10, 3, 8, 9] },
  { m: "מעילה", s: "קדשים", p: 6, ms: [4, 9, 3, 6, 5, 4] },
  { m: "תמיד", s: "קדשים", p: 7, ms: [4, 5, 9, 3, 7, 3, 4] },
  { m: "מידות", s: "קדשים", p: 5, ms: [9, 6, 8, 7, 4] },
  { m: "קינים", s: "קדשים", p: 3, ms: [4, 5, 6] },
  { m: "כלים", s: "טהרות", p: 30, ms: [9, 8, 8, 4, 11, 4, 6, 11, 8, 8, 9, 8, 8, 8, 6, 8, 17, 9, 10, 7, 3, 10, 5, 17, 9, 9, 12, 10, 9, 16] },
  { m: "אהלות", s: "טהרות", p: 18, ms: [8, 7, 7, 7, 7, 7, 6, 6, 15, 7, 9, 8, 9, 10, 10, 9, 5, 10] },
  { m: "נגעים", s: "טהרות", p: 14, ms: [6, 5, 4, 11, 5, 8, 5, 10, 3, 10, 12, 7, 12, 13] },
  { m: "פרה", s: "טהרות", p: 12, ms: [4, 3, 5, 4, 9, 5, 12, 10, 9, 6, 9, 12] },
  { m: "טהרות", s: "טהרות", p: 10, ms: [9, 8, 8, 13, 9, 10, 9, 10, 9, 8] },
  { m: "מקוואות", s: "טהרות", p: 10, ms: [8, 10, 4, 5, 6, 11, 7, 5, 7, 8] },
  { m: "נידה", s: "טהרות", p: 10, ms: [7, 7, 7, 7, 9, 14, 5, 4, 11, 8] },
  { m: "מכשירין", s: "טהרות", p: 6, ms: [6, 11, 8, 10, 11, 8] },
  { m: "זבים", s: "טהרות", p: 5, ms: [6, 3, 3, 7, 12] },
  { m: "טבול יום", s: "טהרות", p: 4, ms: [5, 8, 6, 7] },
  { m: "ידים", s: "טהרות", p: 4, ms: [5, 4, 5, 8] },
  { m: "עוקצין", s: "טהרות", p: 3, ms: [6, 10, 12] },
];

const TANACH = [
  { b: "בראשית", s: "תורה", c: 50 },
  { b: "שמות", s: "תורה", c: 40 },
  { b: "ויקרא", s: "תורה", c: 27 },
  { b: "במדבר", s: "תורה", c: 36 },
  { b: "דברים", s: "תורה", c: 34 },
  { b: "יהושע", s: "נביאים", c: 24 },
  { b: "שופטים", s: "נביאים", c: 21 },
  { b: "שמואל א", s: "נביאים", c: 31 },
  { b: "שמואל ב", s: "נביאים", c: 24 },
  { b: "מלכים א", s: "נביאים", c: 22 },
  { b: "מלכים ב", s: "נביאים", c: 25 },
  { b: "ישעיהו", s: "נביאים", c: 66 },
  { b: "ירמיהו", s: "נביאים", c: 52 },
  { b: "יחזקאל", s: "נביאים", c: 48 },
  { b: "הושע", s: "נביאים", c: 14 },
  { b: "יואל", s: "נביאים", c: 4 },
  { b: "עמוס", s: "נביאים", c: 9 },
  { b: "עובדיה", s: "נביאים", c: 1 },
  { b: "יונה", s: "נביאים", c: 4 },
  { b: "מיכה", s: "נביאים", c: 7 },
  { b: "נחום", s: "נביאים", c: 3 },
  { b: "חבקוק", s: "נביאים", c: 3 },
  { b: "צפניה", s: "נביאים", c: 3 },
  { b: "חגי", s: "נביאים", c: 2 },
  { b: "זכריה", s: "נביאים", c: 14 },
  { b: "מלאכי", s: "נביאים", c: 3 },
  { b: "תהלים", s: "כתובים", c: 150 },
  { b: "משלי", s: "כתובים", c: 31 },
  { b: "איוב", s: "כתובים", c: 42 },
  { b: "שיר השירים", s: "כתובים", c: 8 },
  { b: "רות", s: "כתובים", c: 4 },
  { b: "איכה", s: "כתובים", c: 5 },
  { b: "קהלת", s: "כתובים", c: 12 },
  { b: "אסתר", s: "כתובים", c: 10 },
  { b: "דניאל", s: "כתובים", c: 12 },
  { b: "עזרא", s: "כתובים", c: 10 },
  { b: "נחמיה", s: "כתובים", c: 13 },
  { b: "דברי הימים א", s: "כתובים", c: 29 },
  { b: "דברי הימים ב", s: "כתובים", c: 36 },
];

const MUSAR = [
  { n: "מסילת ישרים", a: 'רמח"ל', p: 26 },
  { n: "חובת הלבבות", a: "רבינו בחיי", p: 10 },
  { n: "שערי תשובה", a: "רבינו יונה", p: 4 },
  { n: "אורחות צדיקים", a: "אנונימי", p: 30 },
  { n: "תומר דבורה", a: 'רמ"ק', p: 10 },
  { n: "פלא יועץ", a: "ר' אליעזר פאפו", p: 90 },
  { n: "חפץ חיים", a: "החפץ חיים", p: 17 },
  { n: "שמירת הלשון", a: "החפץ חיים", p: 30 },
  { n: "אהבת חסד", a: "החפץ חיים", p: 24 },
  { n: "מכתב מאליהו", a: "ר' אליהו דסלר", p: 5 },
  { n: "עלי שור", a: "ר' שלמה וולבה", p: 2 },
  { n: "נתיבות שלום", a: 'אדמו"ר מסלונים', p: 5 },
  { n: 'ליקוטי מוהר"ן', a: "ר' נחמן מברסלב", p: 286 },
  { n: "ספר המידות", a: "ר' נחמן מברסלב", p: 30 },
  { n: "ספר הישר", a: 'ר"ת', p: 13 },
];

const RAV_KOOK = [
  { n: "אורות התשובה", g: "אורות", p: 17 },
  { n: "אורות ארץ ישראל", g: "אורות", p: 5 },
  { n: "אורות המלחמה", g: "אורות", p: 9 },
  { n: "אורות התחיה", g: "אורות", p: 9 },
  { n: "אורות ישראל", g: "אורות", p: 9 },
  { n: "אורות הקודש א", g: "אורות הקודש", p: 9 },
  { n: "אורות הקודש ב", g: "אורות הקודש", p: 9 },
  { n: "אורות הקודש ג", g: "אורות הקודש", p: 9 },
  { n: "אורות הקודש ד", g: "אורות הקודש", p: 7 },
  { n: "אורות התורה", g: "אורות", p: 13 },
  { n: "אורות האמונה", g: "אורות", p: 8 },
  { n: "עין איה ברכות א", g: "עין איה", p: 9 },
  { n: "עין איה ברכות ב", g: "עין איה", p: 9 },
  { n: "עין איה שבת א", g: "עין איה", p: 11 },
  { n: "עין איה שבת ב", g: "עין איה", p: 11 },
  { n: "שמונה קבצים", g: "שמונה קבצים", p: 9 },
  { n: "אגרות הראיה א", g: "אגרות הראיה", p: 9 },
  { n: "אגרות הראיה ב", g: "אגרות הראיה", p: 9 },
  { n: "אגרות הראיה ג", g: "אגרות הראיה", p: 9 },
  { n: "אגרות הראיה ד", g: "אגרות הראיה", p: 9 },
  { n: "מאמרי הראיה א", g: "מאמרים", p: 9 },
  { n: "מאמרי הראיה ב", g: "מאמרים", p: 9 },
  { n: "מוסר אביך", g: "שונות", p: 6 },
  { n: "עולת ראיה א", g: "שונות", p: 9 },
  { n: "עולת ראיה ב", g: "שונות", p: 9 },
  { n: "ארפלי טוהר", g: "שונות", p: 9 },
  { n: "ריש מילין", g: "שונות", p: 9 },
  { n: "אורות", g: "אורות", p: 9 },
];

const MACHSHAVA = [
  { n: "נפש החיים", a: "ר' חיים מוולוז'ין", p: 4 },
  { n: "כוזרי", a: 'ריה"ל', p: 5 },
  { n: "מורה נבוכים", a: 'רמב"ם', p: 3 },
  { n: "דרך ה'", a: 'רמח"ל', p: 4 },
  { n: "דעת תבונות", a: 'רמח"ל', p: 1 },
  { n: "תניא", a: 'אדמו"ר הזקן', p: 4 },
  { n: "אמונות ודעות", a: 'רס"ג', p: 10 },
  { n: "ספר העיקרים", a: "ר' יוסף אלבו", p: 4 },
  { n: "נצח ישראל", a: 'מהר"ל', p: 58 },
  { n: "נתיבות עולם", a: 'מהר"ל', p: 2 },
  { n: "גבורות ה'", a: 'מהר"ל', p: 73 },
  { n: "באר הגולה", a: 'מהר"ל', p: 7 },
];

const PARASHA_CHAPTERS = {
  בראשית: [1, 2, 3, 4, 5, 6],
  נח: [6, 7, 8, 9, 10, 11],
  "לך לך": [12, 13, 14, 15, 16, 17],
  וירא: [18, 19, 20, 21, 22],
  "חיי שרה": [23, 24, 25],
  תולדות: [25, 26, 27, 28],
  ויצא: [28, 29, 30, 31, 32],
  וישלח: [32, 33, 34, 35, 36],
  וישב: [37, 38, 39, 40],
  מקץ: [41, 42, 43, 44],
  ויגש: [44, 45, 46, 47],
  ויחי: [47, 48, 49, 50],
  שמות: [1, 2, 3, 4, 5, 6],
  וארא: [6, 7, 8, 9],
  בא: [10, 11, 12, 13],
  בשלח: [13, 14, 15, 16, 17],
  יתרו: [18, 19, 20],
  משפטים: [21, 22, 23, 24],
  תרומה: [25, 26, 27],
  תצוה: [27, 28, 29, 30],
  "כי תשא": [30, 31, 32, 33, 34],
  ויקהל: [35, 36, 37, 38],
  פקודי: [38, 39, 40],
  ויקרא: [1, 2, 3, 4, 5],
  צו: [6, 7, 8],
  שמיני: [9, 10, 11],
  תזריע: [12, 13],
  מצורע: [14, 15],
  "אחרי מות": [16, 17, 18],
  קדושים: [19, 20],
  אמור: [21, 22, 23, 24],
  בהר: [25, 26],
  בחוקותי: [26, 27],
  במדבר: [1, 2, 3, 4],
  נשא: [4, 5, 6, 7],
  בהעלותך: [8, 9, 10, 11, 12],
  שלח: [13, 14, 15],
  קרח: [16, 17, 18],
  חקת: [19, 20, 21],
  בלק: [22, 23, 24, 25],
  פינחס: [25, 26, 27, 28, 29, 30],
  מטות: [30, 31, 32],
  מסעי: [33, 34, 35, 36],
  דברים: [1, 2, 3],
  ואתחנן: [3, 4, 5, 6, 7],
  עקב: [7, 8, 9, 10, 11],
  ראה: [11, 12, 13, 14, 15, 16],
  שופטים: [16, 17, 18, 19, 20, 21],
  "כי תצא": [21, 22, 23, 24, 25],
  "כי תבוא": [26, 27, 28, 29],
  נצבים: [29, 30],
  וילך: [31],
  האזינו: [32],
  "וזאת הברכה": [33, 34],
};

const PARSHIOT = [
  ["בראשית", "נח", "לך לך", "וירא", "חיי שרה", "תולדות", "ויצא", "וישלח", "וישב", "מקץ", "ויגש", "ויחי"],
  ["שמות", "וארא", "בא", "בשלח", "יתרו", "משפטים", "תרומה", "תצוה", "כי תשא", "ויקהל", "פקודי"],
  ["ויקרא", "צו", "שמיני", "תזריע", "מצורע", "אחרי מות", "קדושים", "אמור", "בהר", "בחוקותי"],
  ["במדבר", "נשא", "בהעלותך", "שלח", "קרח", "חקת", "בלק", "פינחס", "מטות", "מסעי"],
  ["דברים", "ואתחנן", "עקב", "ראה", "שופטים", "כי תצא", "כי תבוא", "נצבים", "וילך", "האזינו", "וזאת הברכה"],
];

function toHeb(n) {
  if (!n || n <= 0) return "";
  const M = [[400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"], [50, "נ"], [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"]];
  let rem = n, r = "";
  for (const [v, s] of M) while (rem >= v) { r += s; rem -= v; }
  return r.replace("יה", "טו").replace("יו", "טז");
}

function addGeresh(s) {
  return !s ? "" : s.length === 1 ? s + "׳" : s.slice(0, -1) + "״" + s.slice(-1);
}

function hebDateFull(d) {
  try {
    const pp = new Intl.DateTimeFormat("he-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" }).formatToParts(d || new Date());
    const dayN = parseInt(pp.find((p) => p.type === "day")?.value?.replace(/\D/g, "") || 0);
    const monS = pp.find((p) => p.type === "month")?.value || "";
    const yearN = parseInt(pp.find((p) => p.type === "year")?.value?.replace(/\D/g, "") || 0) % 1000;
    return `${addGeresh(toHeb(dayN))} ב${monS} ${addGeresh(toHeb(yearN))}`;
  } catch {
    return "";
  }
}

function hebStr(s) {
  return s ? hebDateFull(new Date(s + "T12:00:00")) : "";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function safeHas(setOrObj, val) {
  if (!setOrObj) return false;
  if (setOrObj instanceof Set) return setOrObj.has(val);
  if (Array.isArray(setOrObj)) return setOrObj.includes(val);
  return false;
}

function totalMs(i) {
  const m = MISHNA[i];
  return m?.ms ? m.ms.reduce((a, b) => a + b, 0) : m?.p || 0;
}

function getBkList(cat, custom) {
  const custArr = Array.isArray(custom) ? custom : [];
  let base = [];
  if (cat === "gemara") base = GEMARA.map((t, i) => ({ i, n: t.n, sub: t.s, cat }));
  else if (cat === "mishna") base = MISHNA.map((t, i) => ({ i, n: t.m, sub: t.s, cat }));
  else if (cat === "tanach") base = TANACH.map((t, i) => ({ i, n: t.b, sub: t.s, cat }));
  else if (cat === "musar") base = MUSAR.map((t, i) => ({ i, n: t.n, sub: t.a, cat }));
  else if (cat === "ravKook") base = RAV_KOOK.map((t, i) => ({ i, n: t.n, sub: t.g, cat }));
  else if (cat === "machshava") base = MACHSHAVA.map((t, i) => ({ i, n: t.n, sub: t.a, cat }));
  base = base.map((b) => ({ ...b, isC: false, idKey: `${cat}_s${b.i}` }));
  const customsInCat = custArr.map((c, i) => ({ i, n: c.name, sub: c.catLabel || "", cat: c.cat, isC: true, origIdx: i, idKey: `custom_c${i}` }));
  if (cat === "custom") return customsInCat;
  return [...customsInCat.filter((c) => c.cat === cat), ...base];
}

function getAllBooks(custom) {
  return CATS.flatMap((c) => getBkList(c, custom));
}

function perekAmudKeys(masIdx, p) {
  const g = GEMARA[masIdx];
  if (!g) return [];
  const D = g.d, P = g.p;
  const s = Math.round(2 + ((p - 1) / P) * D);
  const e = Math.round(2 + (p / P) * D);
  const r = [];
  for (let d = s; d < e && d <= D; d++) r.push(`${d}a`, `${d}b`);
  return r;
}

function perekMsKeys(masIdx, p) {
  const cnt = MISHNA[masIdx]?.ms?.[p - 1] || 0;
  return Array.from({ length: cnt }, (_, i) => `${p}:${i + 1}`);
}

function bkTotal(cat, i) {
  if (cat === "gemara") return GEMARA[i]?.d || 0;
  if (cat === "mishna") return totalMs(i);
  if (cat === "tanach") return TANACH[i]?.c || 0;
  if (cat === "musar") return MUSAR[i]?.p || 0;
  if (cat === "ravKook") return RAV_KOOK[i]?.p || 0;
  if (cat === "machshava") return MACHSHAVA[i]?.p || 0;
  return 0;
}

function calcDone(prog, cat, i) {
  if (!prog) return 0;
  if (cat === "gemara") return Math.round((prog.gemara?.[i]?.done?.size || 0) / 2);
  if (cat === "mishna") return prog.mishna?.[i]?.done?.size || 0;
  if (cat === "custom") return prog.custom?.[i]?.done?.size || 0;
  if (cat === "tanach") return prog.tanach?.[i]?.size || 0;
  return prog[cat]?.[i]?.size || 0;
}

function pct(d, t) {
  return t > 0 ? Math.min(100, Math.round((d * 100) / t)) : 0;
}

function serProg(prog) {
  const p = prog || IP;
  const o = { gemara: {}, mishna: {}, tanach: {}, tmode: {}, musar: {}, ravKook: {}, machshava: {}, custom: [], notes: {}, chazara: {} };
  const sArr = (s) => Array.isArray(s) ? s : (s instanceof Set ? [...s] : []);
  for (const [k, v] of Object.entries(p.gemara || {})) o.gemara[k] = { done: sArr(v?.done) };
  for (const [k, v] of Object.entries(p.mishna || {})) o.mishna[k] = { done: sArr(v?.done) };
  for (const [k, v] of Object.entries(p.tanach || {})) o.tanach[k] = sArr(v);
  o.tmode = { ...(p.tmode || {}) };
  for (const c of ["musar", "ravKook", "machshava"]) for (const [k, v] of Object.entries(p[c] || {})) o[c][k] = sArr(v);
  o.custom = (Array.isArray(p.custom) ? p.custom : []).map((b) => ({ ...b, done: sArr(b?.done) }));
  o.notes = { ...(p.notes || {}) };
  o.chazara = { ...(p.chazara || {}) };
  return o;
}

function desProg(data) {
  if (!data) return IP;
  const o = { gemara: {}, mishna: {}, tanach: {}, tmode: {}, musar: {}, ravKook: {}, machshava: {}, custom: [], notes: {}, chazara: {} };
  const toSet = (arr) => new Set(Array.isArray(arr) ? arr : []);
  for (const [k, v] of Object.entries(data.gemara || {})) o.gemara[k] = { done: toSet(v?.done) };
  for (const [k, v] of Object.entries(data.mishna || {})) o.mishna[k] = { done: toSet(v?.done) };
  for (const [k, v] of Object.entries(data.tanach || {})) o.tanach[k] = toSet(v);
  o.tmode = { ...(data.tmode || {}) };
  for (const c of ["musar", "ravKook", "machshava"]) for (const [k, v] of Object.entries(data[c] || {})) o[c][k] = toSet(v);
  o.custom = Array.isArray(data.custom) ? data.custom.map((b) => ({ ...b, done: toSet(b?.done) })) : [];
  o.notes = data.notes || {};
  o.chazara = data.chazara || {};
  return o;
}

function mkT(dark, sz, lang) {
  const sc = [0.88, 1, 1.14][sz] || 1;
  const f = (n) => Math.round(n * sc);
  const isEn = lang === "en";
  const CAT_L = isEn
    ? { gemara: "Gemara", mishna: "Mishna", tanach: "Tanach", musar: "Musar", ravKook: "Rav Kook", machshava: "Machshava", custom: "Custom" }
    : { gemara: "גמרא", mishna: "משניות", tanach: 'תנ"ך', musar: "מוסר", ravKook: "ספרי הראי״ה", machshava: "מחשבה", custom: "אישי" };
  const CAT_UNIT = isEn
    ? { gemara: "dapim", mishna: "mishnayot", tanach: "chapters", musar: "chapters", ravKook: "chapters", machshava: "chapters", custom: "chapters" }
    : { gemara: "דפים", mishna: "משניות", tanach: "פרקים", musar: "פרקים", ravKook: "פרקים", machshava: "פרקים", custom: "פרקים" };
  const CAT_UNIT_SING = isEn
    ? { gemara: "daf", mishna: "mishna", tanach: "chapter", musar: "chapter", ravKook: "chapter", machshava: "chapter", custom: "chapter" }
    : { gemara: "דף", mishna: "משנה", tanach: "פרק", musar: "פרק", ravKook: "פרק", machshava: "פרק", custom: "פרק" };

  const UI = isEn
    ? {
        home: "Home",
        library: "Library",
        goals: "Goals",
        settings: "Settings",
        welcome: "Welcome!",
        startTracking: "Go to library and start tracking",
        openLib: "Open Library",
        activeGoals: "Active Goals",
        recentActivity: "Recent Activity",
        daysLeft: "days left",
        dafYomi: "Daf Yomi",
        parasha: "Weekly Parasha",
        dailyHalacha: "Daily Halacha",
        zmanim: "Zmanim",
        markBy: "Mark by:",
        amudim: "Amudim",
        perakim: "Chapters",
        mishnayot: "Mishnayot",
        parshiot: "Parashiyot",
        cancel: "Cancel",
        markAll: "Mark All",
        clearAll: "Clear All",
        notes: "Notes",
        repetitions: "Repetitions",
        save: "Save",
        addBook: "+ Add Custom Book",
        searchPlaceholder: "Search books...",
        completed: "Completed",
        del: "Delete",
        newGoal: "+ New Goal",
        noGoals: "No goals yet",
        setGoal: "Set a goal and track your pace",
        firstGoal: "+ First Goal",
        topic: "Category",
        book: "Book / Tractate",
        target: "Target",
        deadline: "Target Date",
        saveGoal: "Save Goal",
        darkMode: "Dark Mode",
        fontSize: "Font Size",
        language: "Language",
        account: "Account",
        signOut: "Sign Out",
        login: "Login",
        register: "Create Account",
        email: "Email",
        password: "Password",
        name: "Full Name",
        continueWith: "Continue with Google",
        or: "or",
        noResults: "No results found",
        results: "Results",
        addCustom: "Add custom book",
        slogan: "Your Learning Center",
        developedBy: "Developed by Eitan Shachor. All rights reserved.",
      }
    : {
        home: "בית",
        library: "ספרייה",
        goals: "יעדים",
        settings: "הגדרות",
        welcome: "ברוך הבא!",
        startTracking: "לך לספרייה והתחל לסמן",
        openLib: "פתח ספרייה",
        activeGoals: "יעדים פעילים",
        recentActivity: "פעילות אחרונה",
        daysLeft: "ימים שנותרו",
        dafYomi: "דף יומי",
        parasha: "פרשת השבוע",
        dailyHalacha: "הלכה יומית",
        zmanim: "זמני היום",
        markBy: "סמן לפי:",
        amudim: "עמודים",
        perakim: "פרקים",
        mishnayot: "משניות",
        parshiot: "פרשות",
        cancel: "בטל",
        markAll: "סמן הכל",
        clearAll: "נקה הכל",
        notes: "הערות",
        repetitions: "חזרות",
        save: "שמור",
        addBook: "+ הוסף ספר אישי",
        searchPlaceholder: "חיפוש בכל הספרים...",
        completed: "הושלם",
        del: "מחק",
        newGoal: "+ יעד חדש",
        noGoals: "אין יעדים עדיין",
        setGoal: "הגדר יעד ועקוב אחרי הקצב שלך",
        firstGoal: "+ יעד ראשון",
        topic: "תחום",
        book: "ספר / מסכת",
        target: "יעד",
        deadline: "תאריך יעד",
        saveGoal: "שמור יעד",
        darkMode: "מצב כהה",
        fontSize: "גודל טקסט",
        language: "שפה",
        account: "חשבון",
        signOut: "התנתקות",
        login: "כניסה",
        register: "יצירת חשבון",
        email: "אימייל",
        password: "סיסמה",
        name: "שם מלא",
        continueWith: "המשך עם גוגל",
        or: "או",
        noResults: "לא נמצאו תוצאות",
        results: "תוצאות",
        addCustom: "הוסף ספר אישי",
        slogan: "מרכז הלימוד שלך",
        developedBy: "פותח ע״י איתן שחור. כל הזכויות שמורות.",
      };

  const base = dark
    ? { bg: "#0D1B2E", card: "#152438", navy: "#D0E4FF", gold: "#E8C060", muted: "#8A9BB0", border: "rgba(200,220,255,0.10)", input: "#1E3050", shadow: "0 2px 16px rgba(0,0,0,0.5)", primary: "#4A7FC0", red: "#FCA5A5" }
    : { bg: "#FAF7EE", card: "#FFFFFF", navy: NAVY, gold: GOLD, muted: "#6B7280", border: "rgba(26,58,107,0.10)", input: "#F3EED8", shadow: "0 2px 14px rgba(26,58,107,0.09)", primary: NAVY, red: "#B91C1C" };

  return { ...base, f, dark, isEn, CAT_L, CAT_UNIT, CAT_UNIT_SING, UI, font: "'Heebo',system-ui,sans-serif" };
}

function Bar({ p, color, h, dark }) {
  return (
    <div style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(26,58,107,0.08)", borderRadius: 99, height: h || 6, overflow: "hidden" }}>
      <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s" }} />
    </div>
  );
}

function FI({ T, style, ...r }) {
  return <input {...r} style={{ width: "100%", height: "48px", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.input, color: T.navy, fontSize: "16px", fontFamily: T.font, direction: T.isEn ? "ltr" : "rtl", textAlign: "start", outline: "none", boxSizing: "border-box", margin: 0, ...style }} />;
}

function FS({ T, children, style, ...r }) {
  return <select {...r} style={{ width: "100%", height: "48px", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.input, color: T.navy, fontSize: "16px", fontFamily: T.font, direction: T.isEn ? "ltr" : "rtl", textAlign: "start", outline: "none", boxSizing: "border-box", margin: 0, ...style }}>{children}</select>;
}

function FTA({ T, style, ...r }) {
  return <textarea {...r} style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.input, color: T.navy, fontSize: "16px", fontFamily: T.font, direction: T.isEn ? "ltr" : "rtl", textAlign: "start", outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 90, ...style }} />;
}

function FL({ label, T, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: T.f(12), color: T.muted, display: "block", marginBottom: 5, fontWeight: 600, fontFamily: T.font, textAlign: "start" }}>{label}</label>
      {children}
    </div>
  );
}

function PB({ onClick, children, T, color, style, disabled }) {
  return <button disabled={disabled} onClick={onClick} style={{ width: "100%", height: "48px", padding: 13, background: disabled ? "#ccc" : color || T.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: T.f(15), fontWeight: 700, cursor: "pointer", fontFamily: T.font, boxSizing: "border-box", margin: 0, ...style }}>{children}</button>;
}

function MB({ active, onClick, label, color, T }) {
  return <button onClick={onClick} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: `2px solid ${active ? color : T.border}`, background: active ? color : "transparent", color: active ? "#fff" : T.muted, fontSize: T.f(13), cursor: "pointer", fontWeight: active ? 700 : 400, fontFamily: T.font }}>{label}</button>;
}

function Toggle({ on, onToggle, primary }) {
  return <div onClick={onToggle} style={{ width: 50, height: 28, borderRadius: 14, background: on ? primary : "#D1D5DB", cursor: "pointer", position: "relative", flexShrink: 0 }}><div style={{ position: "absolute", top: 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", left: on ? 25 : 3, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} /></div>;
}

function Sheet({ show, onClose, title, T, children }) {
  if (!show) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end", zIndex: 600 }}>
      <div style={{ background: T.card, borderRadius: "22px 22px 0 0", padding: "16px 18px 52px", width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ width: 38, height: 4, background: T.border, borderRadius: 99, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: T.f(17), fontWeight: 700, color: T.navy, fontFamily: T.font }}>{title}</span>
          <button onClick={onClose} style={{ background: T.input, border: "none", cursor: "pointer", color: T.muted, fontSize: 18, padding: "3px 12px", borderRadius: 9, fontFamily: T.font }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppHeader({ T, user, onLogout, setTab }) {
  return (
    <div style={{ padding: 16, background: T.card, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: T.navy, fontWeight: 900, fontSize: T.f(20) }}>{T.UI.slogan}</div>
          <div style={{ color: T.muted, fontSize: T.f(12) }}>{user?.name || user?.email || ""}</div>
        </div>
        <button onClick={onLogout} style={{ border: "none", background: T.input, color: T.navy, padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}>{T.UI.signOut}</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <MB active={false} onClick={() => setTab("home")} label={T.UI.home} color={T.primary} T={T} />
        <MB active={false} onClick={() => setTab("library")} label={T.UI.library} color={T.primary} T={T} />
        <MB active={false} onClick={() => setTab("goals")} label={T.UI.goals} color={T.primary} T={T} />
        <MB active={false} onClick={() => setTab("settings")} label={T.UI.settings} color={T.primary} T={T} />
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, T }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    try {
      await onLogin({ method: mode, name, email, pass });
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  async function submitGoogle() {
    setErr("");
    try {
      await onLogin({ method: "google" });
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div style={{ flex: 1, padding: 28, background: T.bg, color: T.navy }}>
      <div style={{ fontSize: T.f(28), fontWeight: 900, marginBottom: 8 }}>{T.UI.slogan}</div>
      <div style={{ color: T.muted, marginBottom: 18 }}>{mode === "login" ? T.UI.login : T.UI.register}</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setMode("login")} style={{ flex: 1, height: 44 }}> {T.UI.login} </button>
        <button onClick={() => setMode("register")} style={{ flex: 1, height: 44 }}> {T.UI.register} </button>
      </div>

      {mode === "register" && <div style={{ marginBottom: 12 }}><FI T={T} value={name} onChange={(e) => setName(e.target.value)} placeholder={T.UI.name} /></div>}
      <div style={{ marginBottom: 12 }}><FI T={T} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={T.UI.email} /></div>
      <div style={{ marginBottom: 12 }}><FI T={T} type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={T.UI.password} /></div>
      {err && <div style={{ color: T.red, marginBottom: 12 }}>{err}</div>}
      <PB T={T} onClick={submit}>{mode === "login" ? T.UI.login : T.UI.register}</PB>
      <div style={{ textAlign: "center", margin: "14px 0", color: T.muted }}>{T.UI.or}</div>
      <PB T={T} onClick={submitGoogle} color={GOLD}>{T.UI.continueWith}</PB>
    </div>
  );
}

function BookCard({ cat, item, prog, T, cc, cl, onPress }) {
  const dn = item.isC ? (prog?.custom?.[item.origIdx]?.done?.size || 0) : calcDone(prog, cat, item.i);
  const tot = item.isC ? (prog?.custom?.[item.origIdx]?.chapters || 0) : bkTotal(cat, item.i);
  const col = cc[cat] || T.primary;
  const p = pct(dn, tot);
  const fin = dn >= tot && tot > 0;
  return (
    <div onClick={() => onPress(item)} style={{ background: T.card, borderRadius: 14, padding: "13px 15px", marginBottom: 8, cursor: "pointer", boxShadow: T.shadow, borderRight: `4px solid ${fin ? col : "transparent"}`, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: T.f(15), fontWeight: 700, color: T.navy, textAlign: "start" }}>{item.n}</div>
          {item.sub && <div style={{ fontSize: T.f(11), color: T.muted, marginTop: 1, textAlign: "start" }}>{item.sub}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginRight: 8 }}>
          {fin && <span style={{ fontSize: T.f(10), padding: "3px 8px", borderRadius: 20, background: cl[cat], color: col, fontWeight: 800 }}>{T.UI.completed}</span>}
          <span style={{ fontSize: T.f(12), color: T.muted }}>{dn}/{tot}</span>
        </div>
      </div>
      <Bar p={p} color={col} h={5} dark={T.dark} />
    </div>
  );
}

function HomeScreen({ prog, goals, T, cc, setTab, activity }) {
  return (
    <div style={{ flex: 1, padding: 16 }}>
      <div style={{ background: T.card, borderRadius: 16, padding: 16, boxShadow: T.shadow, marginBottom: 14 }}>
        <div style={{ fontSize: T.f(18), fontWeight: 900, color: T.navy, marginBottom: 6 }}>{T.UI.welcome}</div>
        <div style={{ color: T.muted }}>{T.UI.startTracking}</div>
      </div>

      <div style={{ background: T.card, borderRadius: 16, padding: 16, boxShadow: T.shadow, marginBottom: 14 }}>
        <div style={{ fontSize: T.f(14), fontWeight: 800, color: T.navy, marginBottom: 10 }}>{T.UI.activeGoals}</div>
        {(goals || []).length === 0 ? (
          <div style={{ color: T.muted }}>{T.UI.noGoals}</div>
        ) : (
          goals.slice(0, 3).map((g, i) => <div key={i} style={{ marginBottom: 10, color: T.navy }}>{g.otherName || g.cat}</div>)
        )}
      </div>

      <div style={{ background: T.card, borderRadius: 16, padding: 16, boxShadow: T.shadow }}>
        <div style={{ fontSize: T.f(14), fontWeight: 800, color: T.navy, marginBottom: 10 }}>{T.UI.recentActivity}</div>
        {(activity || []).length === 0 ? <div style={{ color: T.muted }}>—</div> : activity.slice(0, 5).map((a, i) => <div key={i} style={{ marginBottom: 8, color: T.navy }}>{a.bk || a.label || "..."}</div>)}
      </div>
    </div>
  );
}

function LibraryScreen({ prog, T, cc, cl, setProg, setDetail, libCat, setLibCat }) {
  const [search, setSearch] = useState("");
  const [custSheet, setCustSheet] = useState(false);
  const [cd, setCd] = useState({ name: "", chapters: "", cat: "musar" });

  const allResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim();
    return getAllBooks(prog?.custom).filter((b) => b.n.includes(q) || (b.sub || "").includes(q));
  }, [search, prog]);

  const filtered = useMemo(() => {
    if (search.trim()) return [];
    return getBkList(libCat, prog?.custom);
  }, [libCat, search, prog]);

  function addCustom() {
    if (!cd.name || !cd.chapters) return;
    const lbl = { musar: "מוסר", ravKook: "ספרי הראי״ה", machshava: "מחשבה", other: "אישי" }[cd.cat] || "אישי";
    setProg((prev) => ({ ...(prev || IP), custom: [...((prev || IP).custom || []), { name: cd.name, chapters: parseInt(cd.chapters), catLabel: lbl, cat: cd.cat, done: new Set() }] }));
    setCustSheet(false);
    setCd({ name: "", chapters: "", cat: "musar" });
  }

  function removeCustom(i) {
    setProg((prev) => {
      const p = prev || IP;
      const arr = [...(p.custom || [])];
      arr.splice(i, 1);
      return { ...p, custom: arr };
    });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ padding: "14px 16px 0", fontSize: T.f(18), fontWeight: 900, color: T.navy, marginBottom: 10, textAlign: "start" }}>{T.UI.library}</div>
        <div style={{ padding: "0 16px 10px" }}>
          <FI T={T} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`🔎 ${T.UI.searchPlaceholder}`} />
        </div>
        {!search.trim() && (
          <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12, paddingRight: 16, paddingLeft: 16 }}>
            {CATS.map((c) => (
              <button key={c} onClick={() => setLibCat(c)} style={{ whiteSpace: "nowrap", padding: "7px 15px", borderRadius: 20, fontSize: T.f(13), border: `2px solid ${libCat === c ? cc[c] : T.border}`, background: libCat === c ? cc[c] : "transparent", cursor: "pointer", color: libCat === c ? "#fff" : T.muted, fontWeight: libCat === c ? 800 : 400, flexShrink: 0, fontFamily: T.font }}>
                {T.CAT_L[c]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px 80px" }}>
        {search.trim() ? (
          <div>
            {allResults.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: T.f(14) }}>{T.UI.noResults}</div>}
            {allResults.map((bk) => <BookCard key={bk.idKey} cat={bk.cat} item={bk} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} />)}
          </div>
        ) : (
          <div>
            {libCat === "custom" && <button onClick={() => setCustSheet(true)} style={{ width: "100%", height: "48px", borderRadius: 14, border: `2px dashed ${T.border}`, background: "transparent", cursor: "pointer", color: T.muted, fontSize: T.f(14), marginBottom: 10, fontFamily: T.font }}>{T.UI.addBook}</button>}
            {filtered.map((bk) => (
              <div key={bk.idKey}>
                <BookCard cat={libCat} item={bk} prog={prog} T={T} cc={cc} cl={cl} onPress={setDetail} />
                {bk.isC && <button onClick={() => removeCustom(bk.origIdx)} style={{ fontSize: T.f(12), color: T.red, background: "none", border: "none", cursor: "pointer", marginTop: -4, marginBottom: 8, paddingRight: 6, fontFamily: T.font, textAlign: "start" }}>{T.UI.del}</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet show={custSheet} onClose={() => setCustSheet(false)} title={T.UI.addBook} T={T}>
        <FL label={T.UI.book} T={T}><FI T={T} value={cd.name} onChange={(e) => setCd((f) => ({ ...f, name: e.target.value }))} /></FL>
        <FL label={T.UI.target} T={T}><FI T={T} type="number" value={cd.chapters} onChange={(e) => setCd((f) => ({ ...f, chapters: e.target.value }))} /></FL>
        <FL label={T.UI.topic} T={T}>
          <FS T={T} value={cd.cat} onChange={(e) => setCd((f) => ({ ...f, cat: e.target.value }))}>
            <option value="musar">מוסר</option>
            <option value="ravKook">ספרי הראי״ה</option>
            <option value="machshava">מחשבה</option>
            <option value="other">אישי / אחר</option>
          </FS>
        </FL>
        <PB T={T} onClick={addCustom} style={{ marginTop: 6, background: NAVY }}>{T.UI.save}</PB>
      </Sheet>
    </div>
  );
}

function GoalsScreen({ goals, setGoals, prog, T, cc }) {
  const [showSheet, setShowSheet] = useState(false);
  const [cat, setCat] = useState("gemara");
  const [bookIdKey, setBookIdKey] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [otherName, setOtherName] = useState("");

  const bkList = cat === "other" ? [] : getBkList(cat, prog?.custom);
  const selectedItem = bkList.find((b) => String(b.idKey) === bookIdKey);
  const maxTot = cat === "other" ? 0 : selectedItem ? (selectedItem.isC ? prog?.custom?.[selectedItem.origIdx]?.chapters : bkTotal(cat, selectedItem.i)) : 0;

  function openNew() {
    setCat("gemara");
    setBookIdKey("");
    setTarget("");
    setDeadline("");
    setOtherName("");
    setShowSheet(true);
  }

  function save() {
    if (!deadline) return;
    if (cat === "other" && !otherName) return;
    const goal = {
      id: Date.now(),
      cat,
      idx: selectedItem ? selectedItem.i : 0,
      isC: selectedItem ? selectedItem.isC : false,
      origIdx: selectedItem ? selectedItem.origIdx : 0,
      target: target ? parseInt(target) : maxTot,
      deadline,
      startDate: todayKey(),
      otherName,
    };
    setGoals((prev) => [...(prev || []), goal]);
    setShowSheet(false);
  }

  return (
    <div style={{ flex: 1, padding: 16 }}>
      <PB T={T} onClick={openNew} style={{ marginBottom: 12 }}>{T.UI.newGoal}</PB>
      {(goals || []).length === 0 ? <div style={{ color: T.muted }}>{T.UI.noGoals}</div> : goals.map((g) => <div key={g.id} style={{ background: T.card, borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: T.shadow }}>{g.otherName || T.CAT_L[g.cat] || g.cat}</div>)}

      <Sheet show={showSheet} onClose={() => setShowSheet(false)} title={T.UI.newGoal} T={T}>
        <FL label={T.UI.topic} T={T}>
          <FS T={T} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="gemara">{T.CAT_L.gemara}</option>
            <option value="mishna">{T.CAT_L.mishna}</option>
            <option value="tanach">{T.CAT_L.tanach}</option>
            <option value="musar">{T.CAT_L.musar}</option>
            <option value="ravKook">{T.CAT_L.ravKook}</option>
            <option value="machshava">{T.CAT_L.machshava}</option>
            <option value="other">אחר</option>
          </FS>
        </FL>
        {cat !== "other" && (
          <FL label={T.UI.book} T={T}>
            <FS T={T} value={bookIdKey} onChange={(e) => setBookIdKey(e.target.value)}>
              <option value="">בחר...</option>
              {bkList.map((b) => <option key={b.idKey} value={b.idKey}>{b.n}</option>)}
            </FS>
          </FL>
        )}
        {cat === "other" && <FL label={T.UI.book} T={T}><FI T={T} value={otherName} onChange={(e) => setOtherName(e.target.value)} /></FL>}
        <FL label={T.UI.target} T={T}><FI T={T} type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={String(maxTot || "")} /></FL>
        <FL label={T.UI.deadline} T={T}><FI T={T} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></FL>
        <PB T={T} onClick={save} style={{ marginTop: 6 }}>{T.UI.saveGoal}</PB>
      </Sheet>
    </div>
  );
}

function SettingsScreen({ sett, setSett, T, onLogout, user }) {
  return (
    <div style={{ flex: 1, padding: 16 }}>
      <div style={{ background: T.card, borderRadius: 16, padding: 16, boxShadow: T.shadow, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: T.navy, marginBottom: 8 }}>{T.UI.account}</div>
        <div style={{ color: T.muted, marginBottom: 8 }}>{user?.email}</div>
        <PB T={T} onClick={onLogout} color="#9CA3AF">{T.UI.signOut}</PB>
      </div>

      <div style={{ background: T.card, borderRadius: 16, padding: 16, boxShadow: T.shadow, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, color: T.navy }}>{T.UI.darkMode}</div>
          </div>
          <Toggle on={sett.dark} onToggle={() => setSett((s) => ({ ...s, dark: !s.dark }))} primary={T.primary} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: T.navy }}>{T.UI.fontSize}</div>
          <select value={sett.fontSize} onChange={(e) => setSett((s) => ({ ...s, fontSize: parseInt(e.target.value) }))}>
            <option value={0}>S</option>
            <option value={1}>M</option>
            <option value={2}>L</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, color: T.navy }}>{T.UI.language}</div>
          <select value={sett.lang} onChange={(e) => setSett((s) => ({ ...s, lang: e.target.value }))}>
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div style={{ color: T.muted, fontSize: T.f(12), textAlign: "center" }}>{T.UI.developedBy}</div>
    </div>
  );
}

function DetailScreen({ detail, prog, T, cc, cl, setProg, goBack }) {
  const { cat, i: idx, isC, origIdx } = detail;
  const item = getBkList(cat, prog?.custom).find((l) => l.idKey === (isC ? `custom_c${origIdx}` : `${cat}_s${idx}`));
  const col = cc[cat] || T.primary;
  const viewDefault = cat === "gemara" ? "amudim" : cat === "mishna" ? "mishna" : "perakim";
  const [viewMode, setViewMode] = useState(viewDefault);
  const [tMode, setTMode] = useState(prog?.tmode?.[idx] || "perakim");

  const items = useMemo(() => {
    const arr = [];
    if (isC) {
      const p = prog?.custom?.[origIdx]?.chapters || 0;
      for (let i = 1; i <= p; i++) arr.push({ key: i, label: toHeb(i) });
    } else if (cat === "gemara") {
      if (viewMode === "amudim") {
        const D = GEMARA[idx]?.d || 0;
        for (let d = 2; d <= D; d++) {
          arr.push({ key: `${d}a`, label: `${toHeb(d)}.` });
          arr.push({ key: `${d}b`, label: `${toHeb(d)}:` });
        }
      } else {
        const P = GEMARA[idx]?.p || 0;
        for (let p = 1; p <= P; p++) arr.push({ key: `p${p}`, label: `${toHeb(p)}` });
      }
    } else if (cat === "mishna") {
      if (viewMode === "mishna") {
        const ms = MISHNA[idx]?.ms || [];
        ms.forEach((cnt, pi) => { for (let m = 1; m <= cnt; m++) arr.push({ key: `${pi + 1}:${m}`, label: `${toHeb(pi + 1)},${toHeb(m)}` }); });
      } else {
        const P = MISHNA[idx]?.p || 0;
        for (let p = 1; p <= P; p++) arr.push({ key: `pp${p}`, label: `${toHeb(p)}` });
      }
    } else if (cat === "tanach") {
      const tm = idx < 5 ? tMode : "perakim";
      if (tm === "parshiot" && PARSHIOT[idx]) PARSHIOT[idx].forEach((ps) => arr.push({ key: ps, label: ps }));
      else for (let i = 1; i <= (TANACH[idx]?.c || 0); i++) arr.push({ key: i, label: toHeb(i) });
    } else {
      const src = { musar: MUSAR, ravKook: RAV_KOOK, machshava: MACHSHAVA }[cat];
      const p = (src || [])[idx]?.p || 0;
      for (let i = 1; i <= p; i++) arr.push({ key: i, label: toHeb(i) });
    }
    return arr;
  }, [cat, idx, viewMode, tMode, isC, origIdx, prog]);

  const doneCnt = isC ? (prog?.custom?.[origIdx]?.done?.size || 0) : calcDone(prog, cat, idx);
  const totForMode = isC ? (prog?.custom?.[origIdx]?.chapters || 0) : bkTotal(cat, idx);
  const p = pct(doneCnt, totForMode);

  function toggle(key) {
    setProg((prev) => {
      const p0 = prev || IP;
      const next = JSON.parse(JSON.stringify(serProg(p0)));
      if (isC) {
        const s = new Set(next.custom?.[origIdx]?.done || []);
        s.has(key) ? s.delete(key) : s.add(key);
        next.custom[origIdx].done = [...s];
      } else if (cat === "gemara") {
        next.gemara[idx] = next.gemara[idx] || { done: [] };
        const s = new Set(next.gemara[idx].done || []);
        s.has(key) ? s.delete(key) : s.add(key);
        next.gemara[idx].done = [...s];
      } else if (cat === "mishna") {
        next.mishna[idx] = next.mishna[idx] || { done: [] };
        const s = new Set(next.mishna[idx].done || []);
        s.has(key) ? s.delete(key) : s.add(key);
        next.mishna[idx].done = [...s];
      } else if (cat === "tanach") {
        next.tanach[idx] = next.tanach[idx] || [];
        const s = new Set(next.tanach[idx]);
        s.has(key) ? s.delete(key) : s.add(key);
        next.tanach[idx] = [...s];
      } else {
        next[cat][idx] = next[cat][idx] || [];
        const s = new Set(next[cat][idx]);
        s.has(key) ? s.delete(key) : s.add(key);
        next[cat][idx] = [...s];
      }
      return desProg(next);
    });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ background: T.card, padding: "14px 16px 16px", borderBottom: `1px solid ${T.border}` }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: T.f(13), marginBottom: 12, padding: 0, fontFamily: T.font }}>← חזרה</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: T.f(22), fontWeight: 900, color: T.navy, textAlign: "start" }}>{item?.n}</div>
            {item?.sub && <div style={{ fontSize: T.f(12), color: T.muted, marginTop: 2, textAlign: "start" }}>{item.sub} · {T.CAT_L[cat]}</div>}
          </div>
          <div style={{ background: cl[cat], borderRadius: 14, padding: "10px 16px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: T.f(24), fontWeight: 900, color: cc[cat] }}>{p}%</div>
            <div style={{ fontSize: T.f(10), color: cc[cat] }}>{doneCnt}/{totForMode}</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}><Bar p={p} color={col} h={8} dark={T.dark} /></div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 32px" }}>
        {cat === "gemara" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: T.f(12), color: T.muted, marginBottom: 8, fontWeight: 600, textAlign: "start" }}>{T.UI.markBy}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <MB active={viewMode === "amudim"} onClick={() => setViewMode("amudim")} label={T.UI.amudim} color={col} T={T} />
              <MB active={viewMode === "perakim"} onClick={() => setViewMode("perakim")} label={T.UI.perakim} color={col} T={T} />
            </div>
          </div>
        )}

        {cat === "mishna" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: T.f(12), color: T.muted, marginBottom: 8, fontWeight: 600, textAlign: "start" }}>{T.UI.markBy}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <MB active={viewMode === "mishna"} onClick={() => setViewMode("mishna")} label={T.UI.mishnayot} color={col} T={T} />
              <MB active={viewMode === "perakim"} onClick={() => setViewMode("perakim")} label={T.UI.perakim} color={col} T={T} />
            </div>
          </div>
        )}

        {cat === "tanach" && idx < 5 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: T.f(12), color: T.muted, marginBottom: 8, fontWeight: 600, textAlign: "start" }}>{T.UI.markBy}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <MB active={tMode === "perakim"} onClick={() => setTMode("perakim")} label={T.UI.perakim} color={col} T={T} />
              <MB active={tMode === "parshiot"} onClick={() => setTMode("parshiot")} label={T.UI.parshiot} color={col} T={T} />
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 }}>
          {items.map((it) => {
            const on = isC ? safeHas(prog?.custom?.[origIdx]?.done, it.key) :
              cat === "gemara" ? safeHas(prog?.gemara?.[idx]?.done, it.key) :
              cat === "mishna" ? safeHas(prog?.mishna?.[idx]?.done, it.key) :
              cat === "tanach" ? safeHas(prog?.tanach?.[idx], it.key) :
              safeHas(prog?.[cat]?.[idx], it.key);

            const bg = on ? col : "transparent";
            const fc = on ? "#fff" : T.muted;

            return (
              <button key={String(it.key)} onClick={() => toggle(it.key)} style={{ padding: "12px 4px", border: `2px solid ${on ? col : T.border}`, borderRadius: 10, background: bg, color: fc, cursor: "pointer", fontFamily: T.font, minHeight: 46 }}>
                {it.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [sett, setSett] = useState({ dark: false, fontSize: 1, lang: "he" });
  const [prog, setProg] = useState(IP);
  const [goals, setGoals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [libCat, setLibCat] = useState("gemara");
  const [detail, setDetail] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, email: currentUser.email, name: currentUser.displayName || currentUser.email?.split("@")[0] || "User" });
        try {
          const docSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProg(desProg(data.prog));
            setGoals(Array.isArray(data.goals) ? data.goals : []);
            setActivity(Array.isArray(data.activity) ? data.activity : []);
            if (data.sett) setSett((prev) => ({ ...prev, ...data.sett }));
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setUser(null);
      }
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!loaded || !user) return;
    const t = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), {
        prog: serProg(prog),
        goals: Array.isArray(goals) ? goals : [],
        sett,
        activity: (Array.isArray(activity) ? activity : []).slice(0, 50),
      }, { merge: true }).catch(console.error);
    }, 1200);
    return () => clearTimeout(t);
  }, [prog, goals, sett, activity, loaded, user]);

  const T = useMemo(() => mkT(sett.dark, sett.fontSize, sett.lang || "he"), [sett.dark, sett.fontSize, sett.lang]);
  const cc = sett.dark ? CC_D : CC_L;
  const cl = sett.dark ? CL_D : CL_L;

  async function handleLogin(credentials) {
    if (credentials.method === "login") {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.pass);
    } else if (credentials.method === "register") {
      const cred = await createUserWithEmailAndPassword(auth, credentials.email, credentials.pass);
      await setDoc(doc(db, "users", cred.user.uid), { sett, prog: serProg(IP), goals: [], activity: [] }, { merge: true });
    } else if (credentials.method === "google") {
      await signInWithPopup(auth, new GoogleAuthProvider());
    }
  }

  function handleLogout() {
    signOut(auth);
    setTab("home");
    setDetail(null);
  }

  const appSt = {
    direction: T.isEn ? "ltr" : "rtl",
    fontFamily: T.font,
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: T.bg,
    color: T.navy,
    boxSizing: "border-box",
  };

  if (!loaded) return <div style={{ padding: 24, color: NAVY }}>Loading...</div>;
  if (!user) return <div style={appSt}><AuthScreen onLogin={handleLogin} T={T} /></div>;

  if (detail) {
    return <div style={appSt}><DetailScreen detail={detail} prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} goBack={() => setDetail(null)} /></div>;
  }

  return (
    <div style={appSt}>
      <AppHeader T={T} user={user} onLogout={handleLogout} setTab={setTab} />
      {tab === "home" && <HomeScreen prog={prog} goals={goals} T={T} cc={cc} setTab={setTab} activity={activity} />}
      {tab === "library" && <LibraryScreen prog={prog} T={T} cc={cc} cl={cl} setProg={setProg} setDetail={setDetail} libCat={libCat} setLibCat={setLibCat} />}
      {tab === "goals" && <GoalsScreen goals={goals} setGoals={setGoals} prog={prog} T={T} cc={cc} />}
      {tab === "settings" && <SettingsScreen sett={sett} setSett={setSett} T={T} onLogout={handleLogout} user={user} />}

      <div style={{ background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", position: "sticky", bottom: 0, zIndex: 10 }}>
        <button onClick={() => setTab("home")} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", color: tab === "home" ? T.gold : T.muted, cursor: "pointer" }}>{T.UI.home}</button>
        <button onClick={() => setTab("library")} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", color: tab === "library" ? T.gold : T.muted, cursor: "pointer" }}>{T.UI.library}</button>
        <button onClick={() => setTab("goals")} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", color: tab === "goals" ? T.gold : T.muted, cursor: "pointer" }}>{T.UI.goals}</button>
        <button onClick={() => setTab("settings")} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", color: tab === "settings" ? T.gold : T.muted, cursor: "pointer" }}>{T.UI.settings}</button>
      </div>
    </div>
  );
}