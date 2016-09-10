export default function forEachAll(
  anArray,
  callback,
  scope
) {
  for (let i = 0; i < anArray.length; i++) {
    callback.call(scope, i, anArray[i]);
  }
}
