/* @flow */
/* eslint no-var:0 */
function forEachAll(
  anArray/* : NodeList<*>|Array<any> */,
  callback/* : Function */,
  scope/* : any */
) {
  var i;
  for (i = 0; i < anArray.length; i++) {
    callback.call(scope, i, anArray[i]); // passes back stuff we need
  }
}

module.exports = forEachAll;
