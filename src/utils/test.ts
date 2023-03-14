import { generateMap } from "./generateMap";

self.onmessage = (e: MessageEvent) => {
  if (e.data.message === "mapGen") {
    let payload = generateMap(e.data.payload);
    const res = {
      message: "mapGenRes",
      isFetching: false,
      payload,
    };
    self.postMessage(res);
  }
};

//
//
//

(function (f, a, c) {
  var s,
    l = 256,
    p = "random",
    d = c.pow(l, 6),
    g = c.pow(2, 52),
    y = 2 * g,
    h = l - 1;
  function n(n, t, r) {
    function e() {
      for (var n = u.g(6), t = d, r = 0; n < g; ) (n = (n + r) * l), (t *= l), (r = u.g(1));
      for (; y <= n; ) (n /= 2), (t /= 2), (r >>>= 1);
      return (n + r) / t;
    }
    var o = [],
      i = j(
        (function n(t, r) {
          var e,
            o = [],
            i = typeof t;
          if (r && "object" == i)
            for (e in t)
              try {
                o.push(n(t[e], r - 1));
              } catch (n) {}
          return o.length ? o : "string" == i ? t : t + "\0";
        })(
          (t = 1 == t ? { entropy: !0 } : t || {}).entropy
            ? [n, S(a)]
            : null == n
            ? (function () {
                try {
                  var n;
                  return (
                    s && (n = s.randomBytes)
                      ? (n = n(l))
                      : // @ts-expect-error
                        ((n = new Uint8Array(l)), (f.crypto || f.msCrypto).getRandomValues(n)),
                    S(n)
                  );
                } catch (n) {
                  var t = f.navigator,
                    r = t && t.plugins;
                  return [+new Date(), f, r, f.screen, S(a)];
                }
              })()
            : n,
          3
        ),
        o
      ),
      u = new m(o);
    return (
      (e.int32 = function () {
        return 0 | u.g(4);
      }),
      (e.quick = function () {
        return u.g(4) / 4294967296;
      }),
      (e.double = e),
      j(S(u.S), a),
      (
        t.pass ||
        r ||
        function (n, t, r, e) {
          return (
            e &&
              (e.S && v(e, u),
              (n.state = function () {
                return v(u, {});
              })),
            r ? ((c[p] = n), t) : n
          );
        }
      )(e, i, "global" in t ? t.global : this == c, t.state)
    );
  }
  function m(n) {
    var t,
      r = n.length,
      u = this,
      e = 0,
      o = (u.i = u.j = 0),
      i = (u.S = []);
    for (r || (n = [r++]); e < l; ) i[e] = e++;
    for (e = 0; e < l; e++) (i[e] = i[(o = h & (o + n[e % r] + (t = i[e])))]), (i[o] = t);
    (u.g = function (n) {
      for (var t, r = 0, e = u.i, o = u.j, i = u.S; n--; )
        (t = i[(e = h & (e + 1))]), (r = r * l + i[h & ((i[e] = i[(o = h & (o + t))]) + (i[o] = t))]);
      return (u.i = e), (u.j = o), r;
    })(l);
  }
  function v(n, t) {
    return (t.i = n.i), (t.j = n.j), (t.S = n.S.slice()), t;
  }
  function j(n, t) {
    for (var r, e = n + "", o = 0; o < e.length; ) t[h & o] = h & ((r ^= 19 * t[h & o]) + e.charCodeAt(o++));
    return S(t);
  }
  function S(n) {
    return String.fromCharCode.apply(0, n);
  }
  // @ts-expect-error
  if ((j(c.random(), a), "object" == typeof module && module.exports)) {
    // @ts-expect-error
    module.exports = n;
    try {
      // @ts-expect-error
      s = require("crypto");
    } catch (n) {}
  } else
    "function" == typeof define && define.amd
      ? // @ts-expect-error
        define(function () {
          return n;
        })
      : (c["seed" + p] = n);
})("undefined" != typeof self ? self : this, [], Math);
