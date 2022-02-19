/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = -1) {

  if (size === 0) return '';
  if (size === -1) return string;

  let newString = '';
  let countInRow = 1;
  let lastSymbol = '';

  for (let i = 0; i < string.length; i++) {
    if (lastSymbol !== string[i]) {
      countInRow = 1;
    } else {
      countInRow++;
    }

    if (countInRow <= size) {
      newString += string[i];
    }

    lastSymbol = string[i];
  }

  return newString;
}


