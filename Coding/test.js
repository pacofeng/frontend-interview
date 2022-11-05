function A() {}
var a = new A();

console.log(A.prototype.constructor === A);
console.log(a.constructor === A);
console.log(a.__proto__ === A.prototype);
