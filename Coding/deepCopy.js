// map solves duplicated copy same reference
const deepCopy = (data, map = new WeakMap()) => {
  const dataType = Object.prototype.toString.call(data).slice(8, -1);
  switch (dataType) {
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'undefined':
    case 'Null':
      return data;
    case 'Function':
      return eval(data.toString());
    case 'RegExp':
      return new RegExp(data);
    case 'Date':
      return new Date(data.getTime());
    default:
      if (map.has(data)) {
        return data;
      } else {
        const cloneData = Array.isArray(data) ? [] : {};
        map.set(data, cloneData);
        for (let key in data) {
          cloneData[key] = deepCopy(data[key], map);
        }

        return cloneData;
      }
  }
};

const h = { g: 90 };
var data = { b: [1, 2], c: 34, d: { e: 56, f: { g: 78 } }, i: h, j: h };
var copyData = deepCopy(data);
data.i.g = 900;
copyData.i.g = 900;
console.log(data);
console.log(copyData);
