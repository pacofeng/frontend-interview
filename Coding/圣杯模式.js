const inherit = (target, origin) => {
  var fn = function () {};
  fn.prototype = origin.prototype;
  target.prototype = new fn();

  target.prototype.constructor = target;
};

// 基类
var Person = function (name, age) {
  this.name = name;
  this.age = age;
};
Person.prototype.test = 'this is a test';
Person.prototype.testFunc = function () {
  console.log('this is a testFunc');
};

// 子类
var Student = function (name, age, gender, score) {
  Person.apply(this, [name, age]);
  this.gender = gender;
  this.score = score;
};
inherit(Student, Person); // 使用圣杯模式实现继承
// 在子类上面添加方法
Student.prototype.testStuFunc = function () {
  console.log('this is a testStuFunc');
};

// 测试
var zhangsan = new Student('张三', 18, '男', 100);

console.log(zhangsan.name); // 张三
console.log(zhangsan.age); // 18
console.log(zhangsan.gender); // 男
console.log(zhangsan.score); // 100
console.log(zhangsan.test); // this is a test
zhangsan.testFunc(); // this is a testFunc
zhangsan.testStuFunc(); // this is a testStuFunc
