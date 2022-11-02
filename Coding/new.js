function Otaku(name, age) {
  this.name = name;
  this.age = age;

  this.habit = 'Games';
  // return {
  //   name: name,
  //   habit: 'Games',
  // };
  // return 'handsome boy';
}

Otaku.prototype.strength = 60;

Otaku.prototype.sayYourName = function () {
  console.log('I am ' + this.name);
};

const objectFactory = function (fn, ...args) {
  const obj = new Object();
  obj.__proto__ = fn.prototype;
  const res = fn.apply(obj, args);
  return typeof res === 'object' ? res : obj;
};

const person = objectFactory(Otaku, 'Kevin', 18);
console.log(person.name); // Kevin
console.log(person.age); // 18
console.log(person.habit); // Games
console.log(person.strength); // 60
person.sayYourName(); // I am Kevin
