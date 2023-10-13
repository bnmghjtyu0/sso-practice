module.exports = {
  isTokenValid: function (token) {
    if (token && token === "passport") {
      return true;
    } else {
      return false;
    }
  },
};
