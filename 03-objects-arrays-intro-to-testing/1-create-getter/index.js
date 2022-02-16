/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const delimiter = '.';

  const selector = (obj, pathSplited = path) => {
    if (obj === undefined) {
      return undefined;
    }

    const firstDelimiterIndex = pathSplited.indexOf(delimiter);

    if (firstDelimiterIndex === -1) {
      return obj[pathSplited];
    }

    const first = pathSplited.slice(0, firstDelimiterIndex);
    const rest = pathSplited.slice(firstDelimiterIndex + 1);

    return selector(obj[first], rest);
  }

  return selector;
}
