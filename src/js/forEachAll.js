function forEachAll(anArray, callback, scope) {
  for (var i = 0; i < anArray.length; i++) {
    callback.call(scope, i, anArray[i]); // passes back stuff we need
  }
};
module.exports = forEachAll;