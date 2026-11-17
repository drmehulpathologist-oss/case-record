/**
 * Infertility Case Record – Google Sheet sync
 * Paste this whole file into Extensions > Apps Script of a blank Google Sheet,
 * change SECRET below, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). Copy the /exec URL into the app's Settings.
 */
const SECRET = 'CHANGE-THIS-KEY';   // the same key goes into the app's Settings
const SHEET_NAME = 'Cases';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.key !== SECRET) return out({ok: false, error: 'Wrong secret key'});
    const sh = sheet_(body.cols);
    const keys = keys_(sh, body.cols);
    const idCol = 0, updCol = keys.indexOf('updated');
    let values = sh.getDataRange().getValues();
    const rowOf = {};
    for (let i = 1; i < values.length; i++) rowOf[String(values[i][idCol])] = i + 1;

    const done = [], toDelete = [];
    (body.cases || []).forEach(c => {
      const r = rowOf[c.id];
      if (c.deleted) { if (r) toDelete.push(c.id); done.push(c.id); return; }
      if (r) {
        const existing = Number(values[r - 1][updCol]) || 0;
        if (existing > Number(c.updated || 0)) { done.push(c.id); return; } // a newer edit is already on the sheet
        sh.getRange(r, 1, 1, keys.length).setValues([keys.map(k => c[k] == null ? '' : String(c[k]))]);
      } else {
        sh.appendRow(keys.map(k => c[k] == null ? '' : String(c[k])));
        rowOf[c.id] = sh.getLastRow();
      }
      done.push(c.id);
    });

    if (toDelete.length) {
      const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
      for (let i = ids.length - 1; i >= 1; i--) if (toDelete.indexOf(String(ids[i][0])) >= 0) sh.deleteRow(i + 1);
    }
    return out({ok: true, ids: done});
  } catch (err) {
    return out({ok: false, error: String(err)});
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  if ((e.parameter || {}).key !== SECRET) return out({ok: false, error: 'Wrong secret key'});
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh) return out({ok: true, cases: []});
  const keys = JSON.parse(PropertiesService.getDocumentProperties().getProperty('keys') || '[]');
  const values = sh.getDataRange().getValues();
  const cases = [];
  for (let i = 1; i < values.length; i++) {
    if (!values[i][0]) continue;
    const o = {};
    keys.forEach((k, j) => o[k] = values[i][j] === '' ? '' : String(values[i][j]));
    cases.push(o);
  }
  return out({ok: true, cases: cases});
}

// Creates the sheet with readable headers the first time, stored as plain text so dates stay as typed
function sheet_(cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, sh.getMaxRows(), Math.max(cols.length, 60)).setNumberFormat('@');
    sh.getRange(1, 1, 1, cols.length).setValues([cols.map(c => c[1])]).setFontWeight('bold');
    sh.setFrozenRows(1);
    PropertiesService.getDocumentProperties().setProperty('keys', JSON.stringify(cols.map(c => c[0])));
  }
  return sh;
}

// Adds columns for any new fields from a newer version of the app
function keys_(sh, cols) {
  const props = PropertiesService.getDocumentProperties();
  const keys = JSON.parse(props.getProperty('keys') || '[]');
  cols.forEach(c => {
    if (keys.indexOf(c[0]) < 0) {
      keys.push(c[0]);
      const col = keys.length;
      if (col > sh.getMaxColumns()) sh.insertColumnsAfter(sh.getMaxColumns(), col - sh.getMaxColumns());
      sh.getRange(1, col, sh.getMaxRows(), 1).setNumberFormat('@');
      sh.getRange(1, col).setValue(c[1]).setFontWeight('bold');
    }
  });
  props.setProperty('keys', JSON.stringify(keys));
  return keys;
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
