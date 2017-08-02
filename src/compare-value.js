export default function compareValue(compare) {
  return (a, b) => compare(a.outer.value, b.outer.value);
}
