const arr = [3, 4, 5, 3, 75, 4, 6, 75, 8678, { name: 123 }, { name: 123 }];

// 1. set
function removeDuplicate(arr) {
  return [...new Set(arr)];
}
console.log(removeDuplicate(arr));

// 2. loop
function removeDuplicate2(arr) {
  return arr.reduce((acc, cur) => {
    if (!acc.includes(cur)) {
      acc.push(cur);
    }
    return acc;
  }, []);
}
console.log(removeDuplicate2(arr));

// 3. map
function removeDuplicate3(arr) {
  const map = new Map();
  arr.forEach((element) => {
    map.set(element, true);
  });
  return map.keys();
}
console.log(removeDuplicate3(arr));
