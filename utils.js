const { sep, normalize } = require('path');

exports.promisify = function(fn) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      fn(...args, function(err, ...res) {
        if (err) return reject(err);
        if (res.length === 1) return resolve(res[0]);
        resolve(res);
      });
    });
  };
};

exports.getModuleParts = function(name) {
  let parts = normalize(name).split(sep);
  if (parts[0].charAt(0) === '@') {
    // Scoped module (e.g. @scope/module). Merge the first two parts back together.
    parts.splice(0, 2, `${parts[0]}/${parts[1]}`);
  }
  return parts;
}

