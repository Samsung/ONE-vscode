function getTypeArray(delimeter, type) {
  let result = '';
  for (key in type) {
    result = result + type[key] + delimeter;
  }
  result = result.slice(0, -1);
  return result;
}
