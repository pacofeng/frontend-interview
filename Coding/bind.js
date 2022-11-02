// this => bar
// context => foo
Function.prototype.bind2 = function (context, ...args) {
  if (typeof this !== 'function') {
    throw new Error(
      'Function.prototype.bind2 - what is trying to be bound is not callable'
    );
  }

  const self = this;

  const tempFn = function () {};
  const innerFn = function (...innerArgs) {
    return self.apply(
      this instanceof innerFn ? this : context,
      args.concat(innerArgs)
    );
  };
  // 通过一个空函数来进行中转, 修改tempFn.prototype的时候，不会直接修改绑定函数的prototype
  tempFn.prototype = this.prototype;
  // 修改返回函数的prototype为绑定函数的prototype，实例就可以继承绑定函数的原型中的值
  innerFn.prototype = new tempFn();
  // innerFn.prototype = this.prototype;
  return innerFn;
};

var foo = {
  value: 1,
};

function bar(name, age) {
  this.test = 'test';
  console.log(this.value);
  console.log(name);
  console.log(age);
}

bar.prototype.friend = 'kevin';

// 返回了一个函数
var bindFoo = bar.bind2(foo, 'pacoo');
bindFoo(40); // 1, pacoo, 40
console.log('-------------------');
var obj = new bindFoo(18); // undefined, pacoo, 40
console.log(obj.test); // test
console.log(obj.friend); // kevin

bindFoo.prototype.ttt = '1111';
console.log(bindFoo.prototype); // { ttt: '1111' }
console.log(bar.prototype); // { friend: 'kevin' }
