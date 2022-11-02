// ─A─B─C─ ─D─ ─ ─ ─ ─ ─ E─ ─F─G
// After throttling at wait time of 3 dashes
// ─A─ ─ ─C─ ─ ─D ─ ─ ─ ─ E─ ─ ─G

const throttle = function (func, wait) {
  let lastArgs = null;
  let waiting = false;

  const startCooling = function () {
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        func.apply(this, lastArgs);
        waiting = true;
        lastArgs = null;
        startCooling();
      }
    }, wait);
  };

  return function (...args) {
    const context = this;
    if (waiting) {
      lastArgs = args;
    } else {
      func.apply(context, args);
      waiting = true;
      startCooling.call(context);
    }
  };
};
