const join = (a, b, c, d, e, f, g, h, i) => {
  return `${a}_${b}_${c}_${d}_${e}_${f}_${g}_${h}_${i}`;
};

// curry: 只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数
// 使用场景1 - 参数复用
// 使用场景2 - 延迟求值

const curry = function (fn) {
  return function innerFn(...args) {
    const context = this;
    if (args.length >= fn.length) {
      return fn.call(context, ...args);
    } else {
      return (...innerArgs) => innerFn.call(context, ...args, ...innerArgs);
    }
  };
};

// 不断的柯里化，累积传入的参数，最后执行。
const curry2 = function (fn) {
  var _args = [];
  return function cb() {
    if (arguments.length == 0) {
      return fn.apply(this, _args);
    }
    _args.push(...arguments);
    return cb;
  };
};

const curriedJoin = curry(join);
const curriedJoin2 = curry2(join);
console.log(curriedJoin(1, 2)(3)(4, 5, 6)(7, 8)(9));
console.log(curriedJoin2(1, 2)(3)(4, 5, 6)(7, 8)(9)());
