export function report(error) {
  console.error(error);
  e.stack = error.stack || '';
  useBugsnag().notify(e);
}
