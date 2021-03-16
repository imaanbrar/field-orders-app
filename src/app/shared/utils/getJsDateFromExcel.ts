export {
  getJsDateFromExcel
}

function getJsDateFromExcel(date: any): Date | undefined;
function getJsDateFromExcel(date: any, _default: Date): Date;
function getJsDateFromExcel(date: any, _default?): any {
  const excelDate = Number(date);

  if (isNaN(excelDate)) {
    return _default;
  }
  // JavaScript dates can be constructed by passing milliseconds
  // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

  // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
  // 2. Convert to milliseconds.
  // 3. Add the timezone offset to return the time back to 00:00 on the correct day
  const jsDate = new Date((excelDate - (25568 + 1)) * 86400 * 1000);

  return new Date(jsDate.getTime() + (jsDate.getTimezoneOffset() * 60 * 1000));
}
