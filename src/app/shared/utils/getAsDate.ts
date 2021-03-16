export {
  getAsDate
}
function getAsDate(date: string | number | Date | undefined): Date | undefined;
function getAsDate(date: string | number | Date | undefined, _default: Date): Date;
function getAsDate(date: string | number | Date | undefined, _default?): any {

  if (date == null) {
    return _default;
  }

  if (date instanceof Date) {
    return date;
  }

  if (typeof date === 'string') {
    const parsed = Date.parse(date);

    return !isNaN(parsed) ? new Date(parsed) : _default;
  }

  const parsed = new Date(date);

  return !isNaN(parsed.getTime()) ? parsed : _default
}
