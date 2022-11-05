class Example {
  constructor(name) {
    this.name = name;
  }
  init() {
    const fun = () => {
      console.log(this.name);
    };
    fun();
  }
}
const e = new Example('Hello');
e.init();
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////

function Example2(name) {
  'use strict';
  if (!new.target) {
    throw new TypeError('please use new constructor');
  }
  this.name = name;
}

Example2.prototype.init = function () {
  const fun = () => {
    console.log(this.name);
  };
  fun();
};

Object.defineProperty(Example2.prototype, 'init2', {
  enumerable: false,
  value: function () {
    'use strict';
    if (new.target) {
      throw new TypeError('init is not a  ');
    }
    var fun = function () {
      console.log(this.name);
    };
    fun.call(this);
  },
});

const e2 = new Example2('Hello');
e2.init2();
