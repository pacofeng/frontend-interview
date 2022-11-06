const debounce = function (func, wait) {
  let timer;
  return function (args) {
    const context = this;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      func.call(context, args);
    }, wait);
  };
};
