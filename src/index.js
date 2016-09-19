import jp from 'jsonpath';
import merge from 'merge';

class Ref {
  constructor(path) {
    this._ref = true;
    this.path = path;
  }
}

/**
 * Recursively troll a path to create the relevant dependencies all the way down
 * the chain. This lets us setup missing attributes on an object.
 * @param  {Object} obj  The object to setup.
 * @param  {String} path The path to initialize.
 */
var _initPath = function(obj, path) {
  var idx = path.lastIndexOf('.'),
      prefix = path.substr(0, idx),
      suffix = path.substr(idx + 1),
      paths;

  paths = jp.paths(obj, prefix);

  if (!paths.length) {
    _initPath(obj, prefix);
    paths = jp.paths(obj, prefix);
  }

  paths.forEach((p) => {
    return _applyToPath(obj, p.slice(1), _createObj(suffix, null));
  });
};

/**
 * Create a new object with one attribute given by name and val.
 * @param  {String} name Name of the attribute to set.
 * @param  {Object} val  Value for the attribute.
 * @return {Object}      An object with one attribute.
 */
var _createObj = function(name, val) {
  var o = {};

  o[name] = val;
  return o;
};

/**
 * Given `path`, append the supplied value to the end of the object. Path must
 * be resolved by jsonpath but shouldn't include the prefix ($).
 * @param  {Object} obj  The object that you want to apply to.
 * @param  {Array} path A resolved path from jsonpath.
 * @param  {Object} val An object to apply to the end.
 */
var _applyToPath = function(obj, path, val) {
  var pos = obj,
      len = path.length,
      key;

  if (len === 0) {
    merge(obj, val);
    return;
  }

  for (var i = 0; i < len; i++) {
    key = path[i];

    if (i < (len - 1)) {
      pos = pos[key];
    } else if (pos[key]) {
      pos[key] = merge(pos[key], val);
    } else {
      pos[key] = val;
    }
  }
};

var doConcat = function(obj, args) {
  var arr = [];

  for (var i = 0, len = args.length; i < len; i++) {
    var res = jp.query(obj, args[i]);

    if (res.length) {
      arr = arr.concat(res);
    }
  }

  return arr
}

var _contains = function(arr, obj) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] == obj) {
      return true
    }
  }

  return false;
}

var doUniq = function(obj, args) {
  var arr = doConcat(obj, args);

  if (arr.length) {
    var index = [],
        len = arr.length;

    for (var i = 0; i < len; i++) {
      if (!_contains(index, arr[i])) {
        index.push(arr[i]);
      }
    }

    arr = index;
  }

  return arr
}

const FUNCTIONS = {
  'concat': doConcat,
  'uniq':   doUniq,
};

const EXPRESSION_PATTERN = /^([^\$][\w]+)\((.*)\)$/;

/**
 * Queries an object and returns the value at path based on jsonpath. If that
 * path is unset, then def is returned.
 * @param  {Object} obj  An object to query.
 * @param  {String} path A path to query against.
 * @param  {Object} def  The default to return in case the query comes up empty.
 * @return {Object}      The value at path within obj or the default.
 */
var get = function(obj, path, def) {
  // TODO: This is a really nieve implementation of functions--we want to be
  // able to support much more complicated expressions one day--but this will
  // work for now.
  if (path.match(EXPRESSION_PATTERN)) {
    var match = path.match(EXPRESSION_PATTERN),
        fn = match[1].toLowerCase(),
        args = match[2].split(',');

    for (var i = 0, len = args.length; i < len; i++) {
      args[i] = args[i].trim();
    }

    var exec = FUNCTIONS[fn];

    if (!exec) {
      throw "unkown function: " + fn;
    }

    var res = exec(obj, args);

    if (res && res.length) {
      return res;
    }
  } else {
    var res = jp.query(obj, path);

    if (res.length) {
      return res[0];
    }
  }

  // If the default should be a ref from elsewhere then we will push for the
  // relevant query there.
  if (isRef(def)) {
    return jp.query(obj, def.path);
  }

  // It wasn't a ref so we'll just return the default value.
  return def;
};

/**
 * Updates an object based on the path. If it can't resolve the path, it'll
 * attempt to apply the relevant update to the object one level up in the
 * path.
 * @param  {Object} obj  An object to query.
 * @param  {String} path A path to query against.
 * @param  {Object} val  The value to set at the path.
 */
var set = function(obj, path, val) {
  var res = jp.apply(obj, path, () => val);

  if (!res.length) {
    _initPath(obj, path);
    jp.apply(obj, path, () => val);
  }
};

/**
 * Create a new reference that can be used to resolve other objections within an
 * object.
 * @param  {String} path The path to query for a value for.
 * @return {Ref}         A new instance of Ref
 */
var ref = function(path) {
  return new Ref(path);
};

/**
 * Returns true if the argument is a Ref, false otherwise.
 * @param  {Object} o Some object to test.
 * @return {boolean}  True if o is of type Ref, false otherwise.
 */
var isRef = function(o) {
  if (!o) {
    return false;
  }

  return o._ref;
};

module.exports = {
  set: set,
  get: get,
  ref: ref,
  isRef: isRef
};