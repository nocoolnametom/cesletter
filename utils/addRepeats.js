function addRepeats(sites) {
  return sites.reduce((prev, curr) => {
    if (curr.reattempt) {
      return prev.concat(curr).concat(curr);
    }
    return prev.concat(curr);
  }, []);
}

module.exports = addRepeats;
