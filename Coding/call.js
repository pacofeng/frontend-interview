// 1. foo.fn = bar;
// 2. foo.fn();
// 3. delete foo.fn;

Function.prototype.call2 = function (context, ...args) {
  const currentContext = context || window;
  currentContext.tempFn = this;

  const res = currentContext.tempFn(...args);

  delete currentContext.tempFn;

  return res;
};

const value = 3;
const foo = {
  value: 2,
};

function bar(name, age) {
  console.log(this.value);
  return {
    value: this.value,
    name: name,
    age: age,
  };
}

console.log(bar.call2(foo, 'paco', 4));
