/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
*/
export function invertObj(obj = undefined) {

  if (obj === undefined) return undefined;

  const properties = Object.entries(obj);
  let newObject = {};

  for (const [key, value] of properties) {
    newObject[value] = key
  }

  return newObject;
}
