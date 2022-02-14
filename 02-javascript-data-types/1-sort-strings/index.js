/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let arrCopy = [...arr];
  const options = ['ru-RU-u-kf-upper', 'en-EN-u-kf-upper' ];
  if (param == 'asc')
    return arrCopy.sort((a, b) => a.localeCompare(b, options));
  return arrCopy.sort((a, b) => b.localeCompare(a, options));
}
