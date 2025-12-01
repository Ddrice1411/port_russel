// middleware/auth.js
// Pour l'instant : on ne bloque rien, on laisse tout passer
module.exports = function (req, res, next) {
  next();
};