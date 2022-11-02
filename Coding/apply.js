Function.prototype.apply2 = function (context, args) {
  const currentContext = context || window;
  currentContext.fn = this;

  const res = currentContext.fn(...args);

  delete currentContext.fn;

  return res;
};

const foo = {
  value: 2,
};

function bar(name, age) {
  return {
    value: this.value,
    name: name,
    age: age,
  };
}

console.log(bar.apply2(foo, ['paco', 4])); // {value: 2, name: 'paco', age: 4}
