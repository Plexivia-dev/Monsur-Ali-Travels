function icaoCheckDigit(str) {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    let val = 0;
    if (c >= 48 && c <= 57) val = c - 48; // 0-9
    else if (c >= 65 && c <= 90) val = c - 55; // A-Z (A=10, B=11, etc.)
    else if (c === 60) val = 0; // '<'
    sum += val * weights[i % 3];
  }
  return sum % 10;
}

console.log('BF0547103 check digit:', icaoCheckDigit('BF0547103'), 'Expected: 6');
console.log('BW0193203 check digit:', icaoCheckDigit('BW0193203'), 'Expected: 7');
console.log('AB8451089 check digit:', icaoCheckDigit('AB8451089'), 'Expected: 8');

console.log('DOB 920709 check digit:', icaoCheckDigit('920709'), 'Expected: 7');
console.log('DOB 940423 check digit:', icaoCheckDigit('940423'), 'Expected: 2');
console.log('DOB 021104 check digit:', icaoCheckDigit('021104'), 'Expected: 8');

console.log('EXP 200616 check digit:', icaoCheckDigit('200616'), 'Expected: 5');
console.log('EXP 230724 check digit:', icaoCheckDigit('230724'), 'Expected: 2');
console.log('EXP 170102 check digit:', icaoCheckDigit('170102'), 'Expected: 7');
