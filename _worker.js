var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (!patternCache[label]) {
      if (match[2]) {
        patternCache[label] = [label, match[1], new RegExp("^" + match[2] + "$")];
      } else {
        patternCache[label] = [label, match[1], true];
      }
    }
    return patternCache[label];
  }
  return null;
}, "getPattern");
var getPath = /* @__PURE__ */ __name((request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : "";
}, "getPath");
var getQueryStrings = /* @__PURE__ */ __name((url) => {
  const queryIndex = url.indexOf("?", 8);
  return queryIndex === -1 ? "" : "?" + url.slice(queryIndex + 1);
}, "getQueryStrings");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((...paths) => {
  let p = "";
  let endsWithSlash = false;
  for (let path of paths) {
    if (p[p.length - 1] === "/") {
      p = p.slice(0, -1);
      endsWithSlash = true;
    }
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (path === "/" && endsWithSlash) {
      p = `${p}/`;
    } else if (path !== "/") {
      p = `${p}${path}`;
    }
    if (path === "/" && p === "") {
      p = "/";
    }
  }
  return p;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (!path.match(/\:.+\?$/)) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return /%/.test(value) ? decodeURIComponent_(value) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = /* @__PURE__ */ __name((cookie, name) => {
  const pairs = cookie.trim().split(";");
  return pairs.reduce((parsedCookie, pairStr) => {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      return parsedCookie;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      return parsedCookie;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
    }
    return parsedCookie;
  }, {});
}, "parse");
var _serialize = /* @__PURE__ */ __name((name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain) {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite}`;
  }
  if (opt.partitioned) {
    cookie += "; Partitioned";
  }
  return cookie;
}, "_serialize");
var serialize = /* @__PURE__ */ __name((name, value, opt = {}) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
}, "serialize");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/utils/stream.js
var StreamingApi = /* @__PURE__ */ __name(class {
  constructor(writable, _readable) {
    this.abortSubscribers = [];
    this.writable = writable;
    this.writer = writable.getWriter();
    this.encoder = new TextEncoder();
    const reader = _readable.getReader();
    this.responseReadable = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        done ? controller.close() : controller.enqueue(value);
      },
      cancel: () => {
        this.abortSubscribers.forEach((subscriber) => subscriber());
      }
    });
  }
  async write(input) {
    try {
      if (typeof input === "string") {
        input = this.encoder.encode(input);
      }
      await this.writer.write(input);
    } catch (e) {
    }
    return this;
  }
  async writeln(input) {
    await this.write(input + "\n");
    return this;
  }
  sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async close() {
    try {
      await this.writer.close();
    } catch (e) {
    }
  }
  async pipe(body) {
    this.writer.releaseLock();
    await body.pipeTo(this.writable, { preventClose: true });
    this.writer = this.writable.getWriter();
  }
  async onAbort(listener) {
    this.abortSubscribers.push(listener);
  }
}, "StreamingApi");

// node_modules/hono/dist/context.js
var __accessCheck = /* @__PURE__ */ __name((obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
}, "__accessCheck");
var __privateGet = /* @__PURE__ */ __name((obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
}, "__privateGet");
var __privateAdd = /* @__PURE__ */ __name((obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
}, "__privateAdd");
var __privateSet = /* @__PURE__ */ __name((obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
}, "__privateSet");
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = /* @__PURE__ */ __name((headers, map = {}) => {
  Object.entries(map).forEach(([key, value]) => headers.set(key, value));
  return headers;
}, "setHeaders");
var _status;
var _executionCtx;
var _headers;
var _preparedHeaders;
var _res;
var _isFresh;
var Context = /* @__PURE__ */ __name(class {
  constructor(req, options) {
    this.env = {};
    this._var = {};
    this.finalized = false;
    this.error = void 0;
    __privateAdd(this, _status, 200);
    __privateAdd(this, _executionCtx, void 0);
    __privateAdd(this, _headers, void 0);
    __privateAdd(this, _preparedHeaders, void 0);
    __privateAdd(this, _res, void 0);
    __privateAdd(this, _isFresh, true);
    this.renderer = (content) => this.html(content);
    this.notFoundHandler = () => new Response();
    this.render = (...args) => this.renderer(...args);
    this.setRenderer = (renderer) => {
      this.renderer = renderer;
    };
    this.header = (name, value, options2) => {
      if (value === void 0) {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).delete(name);
        } else if (__privateGet(this, _preparedHeaders)) {
          delete __privateGet(this, _preparedHeaders)[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options2?.append) {
        if (!__privateGet(this, _headers)) {
          __privateSet(this, _isFresh, false);
          __privateSet(this, _headers, new Headers(__privateGet(this, _preparedHeaders)));
          __privateSet(this, _preparedHeaders, {});
        }
        __privateGet(this, _headers).append(name, value);
      } else {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).set(name, value);
        } else {
          __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
          __privateGet(this, _preparedHeaders)[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options2?.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    this.status = (status) => {
      __privateSet(this, _isFresh, false);
      __privateSet(this, _status, status);
    };
    this.set = (key, value) => {
      this._var ?? (this._var = {});
      this._var[key] = value;
    };
    this.get = (key) => {
      return this._var ? this._var[key] : void 0;
    };
    this.newResponse = (data, arg, headers) => {
      if (__privateGet(this, _isFresh) && !headers && !arg && __privateGet(this, _status) === 200) {
        return new Response(data, {
          headers: __privateGet(this, _preparedHeaders)
        });
      }
      if (arg && typeof arg !== "number") {
        const headers2 = setHeaders(new Headers(arg.headers), __privateGet(this, _preparedHeaders));
        return new Response(data, {
          headers: headers2,
          status: arg.status
        });
      }
      const status = typeof arg === "number" ? arg : __privateGet(this, _status);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers());
      setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
      if (__privateGet(this, _res)) {
        __privateGet(this, _res).headers.forEach((v, k) => {
          __privateGet(this, _headers)?.set(k, v);
        });
        setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
      }
      headers ?? (headers = {});
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          __privateGet(this, _headers).set(k, v);
        } else {
          __privateGet(this, _headers).delete(k);
          for (const v2 of v) {
            __privateGet(this, _headers).append(k, v2);
          }
        }
      }
      return new Response(data, {
        status,
        headers: __privateGet(this, _headers)
      });
    };
    this.body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    this.text = (text, arg, headers) => {
      if (!__privateGet(this, _preparedHeaders)) {
        if (__privateGet(this, _isFresh) && !headers && !arg) {
          return new Response(text);
        }
        __privateSet(this, _preparedHeaders, {});
      }
      __privateGet(this, _preparedHeaders)["content-type"] = TEXT_PLAIN;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    this.json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    this.jsonT = (object, arg, headers) => {
      return this.json(object, arg, headers);
    };
    this.html = (html, arg, headers) => {
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {})).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    this.redirect = (location, status = 302) => {
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers());
      __privateGet(this, _headers).set("Location", location);
      return this.newResponse(null, status);
    };
    this.streamText = (cb, arg, headers) => {
      headers ?? (headers = {});
      this.header("content-type", TEXT_PLAIN);
      this.header("x-content-type-options", "nosniff");
      this.header("transfer-encoding", "chunked");
      return this.stream(cb, arg, headers);
    };
    this.stream = (cb, arg, headers) => {
      const { readable, writable } = new TransformStream();
      const stream = new StreamingApi(writable, readable);
      cb(stream).finally(() => stream.close());
      return typeof arg === "number" ? this.newResponse(stream.responseReadable, arg, headers) : this.newResponse(stream.responseReadable, arg);
    };
    this.cookie = (name, value, opt) => {
      const cookie = serialize(name, value, opt);
      this.header("set-cookie", cookie, { append: true });
    };
    this.notFound = () => {
      return this.notFoundHandler(this);
    };
    this.req = req;
    if (options) {
      __privateSet(this, _executionCtx, options.executionCtx);
      this.env = options.env;
      if (options.notFoundHandler) {
        this.notFoundHandler = options.notFoundHandler;
      }
    }
  }
  get event() {
    if (__privateGet(this, _executionCtx) && "respondWith" in __privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (__privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    __privateSet(this, _isFresh, false);
    return __privateGet(this, _res) || __privateSet(this, _res, new Response("404 Not Found", { status: 404 }));
  }
  set res(_res2) {
    __privateSet(this, _isFresh, false);
    if (__privateGet(this, _res) && _res2) {
      __privateGet(this, _res).headers.delete("content-type");
      for (const [k, v] of __privateGet(this, _res).headers.entries()) {
        if (k === "set-cookie") {
          const cookies = __privateGet(this, _res).headers.getSetCookie();
          _res2.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res2.headers.append("set-cookie", cookie);
          }
        } else {
          _res2.headers.set(k, v);
        }
      }
    }
    __privateSet(this, _res, _res2);
    this.finalized = true;
  }
  get var() {
    return { ...this._var };
  }
  get runtime() {
    const global = globalThis;
    if (global?.Deno !== void 0) {
      return "deno";
    }
    if (global?.Bun !== void 0) {
      return "bun";
    }
    if (typeof global?.WebSocketPair === "function") {
      return "workerd";
    }
    if (typeof global?.EdgeRuntime === "string") {
      return "edge-light";
    }
    if (global?.fastly !== void 0) {
      return "fastly";
    }
    if (global?.__lagon__ !== void 0) {
      return "lagon";
    }
    if (global?.process?.release?.name === "node") {
      return "node";
    }
    return "other";
  }
}, "Context");
_status = /* @__PURE__ */ new WeakMap();
_executionCtx = /* @__PURE__ */ new WeakMap();
_headers = /* @__PURE__ */ new WeakMap();
_preparedHeaders = /* @__PURE__ */ new WeakMap();
_res = /* @__PURE__ */ new WeakMap();
_isFresh = /* @__PURE__ */ new WeakMap();

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        if (context instanceof Context) {
          context.req.routeIndex = i;
        }
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (!handler) {
        if (context instanceof Context && context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      } else {
        try {
          res = await handler(context, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && context instanceof Context && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/http-exception.js
var HTTPException = /* @__PURE__ */ __name(class extends Error {
  constructor(status = 500, options) {
    super(options?.message);
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      return this.res;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
}, "HTTPException");

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = { all: false }) => {
  const contentType = request.headers.get("Content-Type");
  if (isFormDataContent(contentType)) {
    return parseFormData(request, options);
  }
  return {};
}, "parseBody");
function isFormDataContent(contentType) {
  if (contentType === null) {
    return false;
  }
  return contentType.startsWith("multipart/form-data") || contentType.startsWith("application/x-www-form-urlencoded");
}
__name(isFormDataContent, "isFormDataContent");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = {};
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] && isArrayField(form[key])) {
    appendToExistingArray(form[key], value);
  } else if (form[key]) {
    convertToNewArray(form, key, value);
  } else {
    form[key] = value;
  }
}, "handleParsingAllValues");
function isArrayField(field) {
  return Array.isArray(field);
}
__name(isArrayField, "isArrayField");
var appendToExistingArray = /* @__PURE__ */ __name((arr, value) => {
  arr.push(value);
}, "appendToExistingArray");
var convertToNewArray = /* @__PURE__ */ __name((form, key, value) => {
  form[key] = [form[key], value];
}, "convertToNewArray");

// node_modules/hono/dist/request.js
var __accessCheck2 = /* @__PURE__ */ __name((obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
}, "__accessCheck");
var __privateGet2 = /* @__PURE__ */ __name((obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
}, "__privateGet");
var __privateAdd2 = /* @__PURE__ */ __name((obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
}, "__privateAdd");
var __privateSet2 = /* @__PURE__ */ __name((obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
}, "__privateSet");
var _validatedData;
var _matchResult;
var HonoRequest = /* @__PURE__ */ __name(class {
  constructor(request, path = "/", matchResult = [[]]) {
    __privateAdd2(this, _validatedData, void 0);
    __privateAdd2(this, _matchResult, void 0);
    this.routeIndex = 0;
    this.bodyCache = {};
    this.cachedBody = (key) => {
      const { bodyCache, raw: raw2 } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody) {
        return cachedBody;
      }
      if (bodyCache.arrayBuffer) {
        return (async () => {
          return await new Response(bodyCache.arrayBuffer)[key]();
        })();
      }
      return bodyCache[key] = raw2[key]();
    };
    this.raw = request;
    this.path = path;
    __privateSet2(this, _matchResult, matchResult);
    __privateSet2(this, _validatedData, {});
  }
  param(key) {
    return key ? this.getDecodedParam(key) : this.getAllDecodedParams();
  }
  getDecodedParam(key) {
    const paramKey = __privateGet2(this, _matchResult)[0][this.routeIndex][1][key];
    const param = this.getParamValue(paramKey);
    return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : void 0;
  }
  getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(__privateGet2(this, _matchResult)[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.getParamValue(__privateGet2(this, _matchResult)[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
      }
    }
    return decoded;
  }
  getParamValue(paramKey) {
    return __privateGet2(this, _matchResult)[1] ? __privateGet2(this, _matchResult)[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name.toLowerCase()) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  cookie(key) {
    const cookie = this.raw.headers.get("Cookie");
    if (!cookie) {
      return;
    }
    const obj = parse(cookie);
    if (key) {
      const value = obj[key];
      return value;
    } else {
      return obj;
    }
  }
  async parseBody(options) {
    if (this.bodyCache.parsedBody) {
      return this.bodyCache.parsedBody;
    }
    const parsedBody = await parseBody(this, options);
    this.bodyCache.parsedBody = parsedBody;
    return parsedBody;
  }
  json() {
    return this.cachedBody("json");
  }
  text() {
    return this.cachedBody("text");
  }
  arrayBuffer() {
    return this.cachedBody("arrayBuffer");
  }
  blob() {
    return this.cachedBody("blob");
  }
  formData() {
    return this.cachedBody("formData");
  }
  addValidatedData(target, data) {
    __privateGet2(this, _validatedData)[target] = data;
  }
  valid(target) {
    return __privateGet2(this, _validatedData)[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return __privateGet2(this, _matchResult)[0].map(([[, route]]) => route);
  }
  get routePath() {
    return __privateGet2(this, _matchResult)[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
  get headers() {
    return this.raw.headers;
  }
  get body() {
    return this.raw.body;
  }
  get bodyUsed() {
    return this.raw.bodyUsed;
  }
  get integrity() {
    return this.raw.integrity;
  }
  get keepalive() {
    return this.raw.keepalive;
  }
  get referrer() {
    return this.raw.referrer;
  }
  get signal() {
    return this.raw.signal;
  }
}, "HonoRequest");
_validatedData = /* @__PURE__ */ new WeakMap();
_matchResult = /* @__PURE__ */ new WeakMap();

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/hono-base.js
var __accessCheck3 = /* @__PURE__ */ __name((obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
}, "__accessCheck");
var __privateGet3 = /* @__PURE__ */ __name((obj, member, getter) => {
  __accessCheck3(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
}, "__privateGet");
var __privateAdd3 = /* @__PURE__ */ __name((obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
}, "__privateAdd");
var __privateSet3 = /* @__PURE__ */ __name((obj, member, value, setter) => {
  __accessCheck3(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
}, "__privateSet");
var COMPOSED_HANDLER = Symbol("composedHandler");
function defineDynamicClass() {
  return class {
  };
}
__name(defineDynamicClass, "defineDynamicClass");
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  const message = "Internal Server Error";
  return c.text(message, 500);
}, "errorHandler");
var _path;
var _Hono = /* @__PURE__ */ __name(class extends defineDynamicClass() {
  constructor(options = {}) {
    super();
    this._basePath = "/";
    __privateAdd3(this, _path, "/");
    this.routes = [];
    this.notFoundHandler = notFoundHandler;
    this.errorHandler = errorHandler;
    this.onError = (handler) => {
      this.errorHandler = handler;
      return this;
    };
    this.notFound = (handler) => {
      this.notFoundHandler = handler;
      return this;
    };
    this.head = () => {
      console.warn("`app.head()` is no longer used. `app.get()` implicitly handles the HEAD method.");
      return this;
    };
    this.handleEvent = (event) => {
      return this.dispatch(event.request, event, void 0, event.request.method);
    };
    this.fetch = (request, Env, executionCtx) => {
      return this.dispatch(request, executionCtx, Env, request.method);
    };
    this.request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== void 0) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    this.fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
      });
    };
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.map((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          __privateSet3(this, _path, args1);
        } else {
          this.addRoute(method, __privateGet3(this, _path), args1);
        }
        args.map((handler) => {
          if (typeof handler !== "string") {
            this.addRoute(method, __privateGet3(this, _path), handler);
          }
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      if (!method) {
        return this;
      }
      __privateSet3(this, _path, path);
      for (const m of [method].flat()) {
        handlers.map((handler) => {
          this.addRoute(m.toUpperCase(), __privateGet3(this, _path), handler);
        });
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        __privateSet3(this, _path, arg1);
      } else {
        handlers.unshift(arg1);
      }
      handlers.map((handler) => {
        this.addRoute(METHOD_NAME_ALL, __privateGet3(this, _path), handler);
      });
      return this;
    };
    const strict = options.strict ?? true;
    delete options.strict;
    Object.assign(this, options);
    this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
  }
  clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  route(path, app2) {
    const subApp = this.basePath(path);
    if (!app2) {
      return subApp;
    }
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  showRoutes() {
    const length = 8;
    this.routes.map((route) => {
      console.log(
        `\x1B[32m${route.method}\x1B[0m ${" ".repeat(length - route.method.length)} ${route.path}`
      );
    });
  }
  mount(path, applicationHandler, optionHandler) {
    const mergedPath = mergePath(this._basePath, path);
    const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      const options = optionHandler ? optionHandler(c) : [c.env, executionContext];
      const optionsArray = Array.isArray(options) ? options : [options];
      const queryStrings = getQueryStrings(c.req.url);
      const res = await applicationHandler(
        new Request(
          new URL((c.req.path.slice(pathPrefixLength) || "/") + queryStrings, c.req.url),
          c.req.raw
        ),
        ...optionsArray
      );
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  get routerName() {
    this.matchRoute("GET", "/");
    return this.router.name;
  }
  addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  matchRoute(method, path) {
    return this.router.match(method, path);
  }
  handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.matchRoute(method, path);
    const c = new Context(new HonoRequest(request, path, matchResult), {
      env,
      executionCtx,
      notFoundHandler: this.notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.notFoundHandler(c);
        });
      } catch (err) {
        return this.handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.notFoundHandler(c))
      ).catch((err) => this.handleError(err, c)) : res;
    }
    const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. You may forget returning Response object or `await next()`"
          );
        }
        return context.res;
      } catch (err) {
        return this.handleError(err, c);
      }
    })();
  }
}, "_Hono");
var Hono = _Hono;
_path = /* @__PURE__ */ new WeakMap();

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class {
  constructor() {
    this.children = {};
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.children[regexpStr];
      if (!node) {
        if (Object.keys(this.children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[regexpStr] = new Node();
        if (name !== "") {
          node.varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.varIndex]);
      }
    } else {
      node = this.children[token];
      if (!node) {
        if (Object.keys(this.children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.children[k];
      return (typeof c.varIndex === "number" ? `(${k})@${c.varIndex}` : k) + c.buildRegExpStr();
    });
    if (typeof this.index === "number") {
      strList.unshift(`#${this.index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  constructor() {
    this.context = { varIndex: 0 };
    this.root = new Node();
  }
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (typeof handlerIndex !== "undefined") {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (typeof paramIndex !== "undefined") {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var methodNames = [METHOD_NAME_ALL, ...METHODS].map((method) => method.toUpperCase());
var emptyParam = [];
var nullMatcher = [/^$/, [], {}];
var wildcardRegExpCache = {};
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ?? (wildcardRegExpCache[path] = new RegExp(
    path === "*" ? "" : `^${path.replace(/\/\*/, "(?:|/.*)")}$`
  ));
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = {};
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = {};
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, {}]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = {};
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  constructor() {
    this.name = "RegExpRouter";
    this.middleware = { [METHOD_NAME_ALL]: {} };
    this.routes = { [METHOD_NAME_ALL]: {} };
  }
  add(method, path, handler) {
    var _a;
    const { middleware, routes } = this;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (methodNames.indexOf(method) === -1) {
      methodNames.push(method);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = {};
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          var _a2;
          (_a2 = middleware[m])[path] || (_a2[path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
        });
      } else {
        (_a = middleware[method])[path] || (_a[path] = findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []);
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        var _a2;
        if (method === METHOD_NAME_ALL || method === m) {
          (_a2 = routes[m])[path2] || (_a2[path2] = [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ]);
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  buildAllMatchers() {
    const matchers = {};
    methodNames.forEach((method) => {
      matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
    });
    this.middleware = this.routes = void 0;
    return matchers;
  }
  buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.middleware, this.routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute || (hasOwnRoute = true);
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  constructor(init) {
    this.name = "SmartRouter";
    this.routers = [];
    this.routes = [];
    Object.assign(this, init);
  }
  add(method, path, handler) {
    if (!this.routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.routes) {
      throw new Error("Fatal error");
    }
    const { routers, routes } = this;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        routes.forEach((args) => {
          router.add(...args);
        });
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.routers = [router];
      this.routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.routes || this.routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var Node2 = /* @__PURE__ */ __name(class {
  constructor(method, handler, children) {
    this.order = 0;
    this.params = {};
    this.children = children || {};
    this.methods = [];
    this.name = "";
    if (method && handler) {
      const m = {};
      m[method] = { handler, possibleKeys: [], score: 0, name: this.name };
      this.methods = [m];
    }
    this.patterns = [];
  }
  insert(method, path, handler) {
    this.name = `${method} ${path}`;
    this.order = ++this.order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    const parentPatterns = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      if (Object.keys(curNode.children).includes(p)) {
        parentPatterns.push(...curNode.patterns);
        curNode = curNode.children[p];
        const pattern2 = getPattern(p);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.children[p] = new Node2();
      const pattern = getPattern(p);
      if (pattern) {
        curNode.patterns.push(pattern);
        parentPatterns.push(...curNode.patterns);
        possibleKeys.push(pattern[1]);
      }
      parentPatterns.push(...curNode.patterns);
      curNode = curNode.children[p];
    }
    if (!curNode.methods.length) {
      curNode.methods = [];
    }
    const m = {};
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      name: this.name,
      score: this.order
    };
    m[method] = handlerSet;
    curNode.methods.push(m);
    return curNode;
  }
  gHSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.methods.length; i < len; i++) {
      const m = node.methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = {};
        handlerSet.possibleKeys.forEach((key) => {
          const processed = processedSet[handlerSet.name];
          handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
          processedSet[handlerSet.name] = true;
        });
        handlerSets.push(handlerSet);
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.params = {};
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.children[part];
        if (nextNode) {
          nextNode.params = node.params;
          if (isLast === true) {
            if (nextNode.children["*"]) {
              handlerSets.push(...this.gHSets(nextNode.children["*"], method, node.params, {}));
            }
            handlerSets.push(...this.gHSets(nextNode, method, node.params, {}));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.patterns.length; k < len3; k++) {
          const pattern = node.patterns[k];
          const params = { ...node.params };
          if (pattern === "*") {
            const astNode = node.children["*"];
            if (astNode) {
              handlerSets.push(...this.gHSets(astNode, method, node.params, {}));
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp && matcher.test(restPathString)) {
            params[name] = restPathString;
            handlerSets.push(...this.gHSets(child, method, node.params, params));
            continue;
          }
          if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
            if (typeof key === "string") {
              params[name] = part;
              if (isLast === true) {
                handlerSets.push(...this.gHSets(child, method, params, node.params));
                if (child.children["*"]) {
                  handlerSets.push(...this.gHSets(child.children["*"], method, params, node.params));
                }
              } else {
                child.params = params;
                tempNodes.push(child);
              }
            }
          }
        }
      }
      curNodes = tempNodes;
    }
    const results = handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [results.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  constructor() {
    this.name = "TrieRouter";
    this.node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (const p of results) {
        this.node.insert(method, p, handler);
      }
      return;
    }
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// src/utils/errors.js
var AuthError = class extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
};
__name(AuthError, "AuthError");
var ERRORS = {
  INVALID_INPUT: { status: 400, message: "\u8F93\u5165\u5185\u5BB9\u4E0D\u5408\u6CD5\uFF0C\u8BF7\u68C0\u67E5\u540E\u91CD\u8BD5" },
  REQUEST_TOO_LARGE: { status: 413, message: "\u8BF7\u6C42\u5185\u5BB9\u8FC7\u5927" },
  INVALID_JSON: { status: 400, message: "\u8BF7\u6C42\u683C\u5F0F\u4E0D\u6B63\u786E" },
  WEAK_PASSWORD: { status: 400, message: "\u5BC6\u7801\u5F3A\u5EA6\u4E0D\u8DB3" },
  MISSING_TOKEN: { status: 401, message: "\u8BF7\u5148\u767B\u5F55" },
  SESSION_INVALID: { status: 401, message: "\u767B\u5F55\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" },
  INVALID_CREDENTIALS: { status: 401, message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" },
  RATE_LIMITED: { status: 429, message: "\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" },
  FORBIDDEN: { status: 403, message: "\u6CA1\u6709\u6743\u9650\u6267\u884C\u8BE5\u64CD\u4F5C" },
  USERNAME_TAKEN: { status: 409, message: "\u8BE5\u7528\u6237\u540D\u6216\u90AE\u7BB1\u5DF2\u88AB\u4F7F\u7528" },
  USER_NOT_FOUND: { status: 404, message: "\u7BA1\u7406\u5458\u8D26\u53F7\u4E0D\u5B58\u5728" },
  OLD_PASSWORD_WRONG: { status: 400, message: "\u5F53\u524D\u5BC6\u7801\u4E0D\u6B63\u786E" },
  CANNOT_DELETE_SELF: { status: 400, message: "\u4E0D\u80FD\u5220\u9664\u5F53\u524D\u767B\u5F55\u7684\u8D26\u53F7" },
  LAST_ADMIN: { status: 400, message: "\u7CFB\u7EDF\u5FC5\u987B\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u7BA1\u7406\u5458\u8D26\u53F7" },
  NOT_FOUND: { status: 404, message: "\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728" },
  INTERNAL: { status: 500, message: "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" }
};

// src/utils/password.js
var PBKDF2_ITERATIONS = 1e5;
var SALT_BYTES = 16;
var KEY_BITS = 256;
var MAX_PASSWORD_LENGTH = 128;
var MIN_PASSWORD_LENGTH = 10;
var WEAK_FRAGMENTS = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "letmein",
  "admin",
  "baotong",
  "btgl2024",
  "iloveyou",
  "welcome",
  "111111"
];
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex, "bytesToHex");
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
__name(hexToBytes, "hexToBytes");
function constantTimeEqual(a, b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array))
    return false;
  if (a.length !== b.length)
    return false;
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(a, b);
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
__name(constantTimeEqual, "constantTimeEqual");
async function derive(password, salt, iterations = PBKDF2_ITERATIONS) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      keyMaterial,
      KEY_BITS
    )
  );
}
__name(derive, "derive");
async function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    throw new Error("INVALID_PASSWORD");
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt);
  return `${bytesToHex(salt)}:${bytesToHex(derived)}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string" || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }
  const parts = stored.split(":");
  if (parts.length !== 2)
    return false;
  const [saltHex, hashHex] = parts;
  if (!/^[0-9a-f]{32}$/.test(saltHex) || !/^[0-9a-f]{64}$/.test(hashHex)) {
    return false;
  }
  try {
    const derived = await derive(password, hexToBytes(saltHex));
    return constantTimeEqual(derived, hexToBytes(hashHex));
  } catch (error) {
    console.error("[password] verify failed:", error);
    return false;
  }
}
__name(verifyPassword, "verifyPassword");
function validatePasswordComplexity(password, username = "") {
  const errors = [];
  if (typeof password !== "string")
    return ["\u5BC6\u7801\u683C\u5F0F\u4E0D\u5408\u6CD5"];
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`\u5BC6\u7801\u81F3\u5C11 ${MIN_PASSWORD_LENGTH} \u4F4D`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`\u5BC6\u7801\u4E0D\u80FD\u8D85\u8FC7 ${MAX_PASSWORD_LENGTH} \u4F4D`);
  }
  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;
  if (classes < 3) {
    errors.push("\u9700\u5305\u542B\u5927\u5199\u5B57\u6BCD\u3001\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u7B26\u53F7\u4E2D\u7684\u81F3\u5C11 3 \u7C7B");
  }
  if (/\s/.test(password))
    errors.push("\u5BC6\u7801\u4E0D\u80FD\u5305\u542B\u7A7A\u683C");
  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    errors.push("\u5BC6\u7801\u4E0D\u80FD\u5305\u542B\u7528\u6237\u540D");
  }
  if (WEAK_FRAGMENTS.some((w) => password.toLowerCase().includes(w))) {
    errors.push("\u5BC6\u7801\u5305\u542B\u8FC7\u4E8E\u5E38\u89C1\u7684\u8BCD\u7EC4\uFF0C\u8BF7\u66F4\u6362");
  }
  return errors;
}
__name(validatePasswordComplexity, "validatePasswordComplexity");
function validateUsername(username) {
  if (typeof username !== "string")
    return ["\u7528\u6237\u540D\u683C\u5F0F\u4E0D\u5408\u6CD5"];
  const value = username.trim();
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(value)) {
    return ["\u7528\u6237\u540D\u9700\u4E3A 3-32 \u4F4D\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u6216\u8FDE\u5B57\u7B26"];
  }
  return [];
}
__name(validateUsername, "validateUsername");
function validateEmail(email) {
  if (typeof email !== "string")
    return ["\u90AE\u7BB1\u683C\u5F0F\u4E0D\u5408\u6CD5"];
  const value = email.trim();
  if (value.length > 254 || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value)) {
    return ["\u90AE\u7BB1\u683C\u5F0F\u4E0D\u5408\u6CD5"];
  }
  return [];
}
__name(validateEmail, "validateEmail");

// src/utils/database.js
var PUBLIC_FIELDS = "id, username, email, created_at, last_login, session_version, role_level";
async function getUserByUsername(db, username) {
  const { results } = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).all();
  return results[0] || null;
}
__name(getUserByUsername, "getUserByUsername");
async function getUserById(db, id) {
  const { results } = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).all();
  return results[0] || null;
}
__name(getUserById, "getUserById");
async function updateUserLastLogin(db, id) {
  await db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(id).run();
}
__name(updateUserLastLogin, "updateUserLastLogin");
async function createUser(db, { username, email, passwordHash, roleLevel }) {
  try {
    const { success } = await db.prepare(
      `INSERT INTO users (username, email, password_hash, created_at, session_version, role_level)
         VALUES (?, ?, ?, datetime('now'), 1, ?)`
    ).bind(username, email, passwordHash, roleLevel).run();
    return { ok: Boolean(success) };
  } catch (error) {
    if (String(error && error.message).includes("UNIQUE")) {
      return { ok: false, reason: "CONFLICT" };
    }
    throw error;
  }
}
__name(createUser, "createUser");
async function getAllUsers(db) {
  const { results } = await db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY id ASC`).all();
  return results;
}
__name(getAllUsers, "getAllUsers");
async function countUsers(db) {
  const { results } = await db.prepare("SELECT COUNT(*) AS n FROM users").all();
  return results[0] ? results[0].n : 0;
}
__name(countUsers, "countUsers");
async function countSuperAdmins(db) {
  const { results } = await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role_level = 1").all();
  return results[0] ? results[0].n : 0;
}
__name(countSuperAdmins, "countSuperAdmins");
async function updateUserLevel(db, id, roleLevel) {
  await db.prepare("UPDATE users SET role_level = ? WHERE id = ?").bind(roleLevel, id).run();
}
__name(updateUserLevel, "updateUserLevel");
async function updateUserPassword(db, id, passwordHash) {
  await db.prepare(
    "UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?"
  ).bind(passwordHash, id).run();
}
__name(updateUserPassword, "updateUserPassword");
async function updateUserProfile(db, id, username, email) {
  try {
    await db.prepare("UPDATE users SET username = ?, email = ? WHERE id = ?").bind(username, email, id).run();
    return { ok: true };
  } catch (error) {
    if (String(error && error.message).includes("UNIQUE")) {
      return { ok: false, reason: "CONFLICT" };
    }
    throw error;
  }
}
__name(updateUserProfile, "updateUserProfile");
async function deleteUser(db, id) {
  const { success } = await db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  return Boolean(success);
}
__name(deleteUser, "deleteUser");
async function writeAuditLog(db, entry) {
  await db.prepare(
    `INSERT INTO audit_logs
         (actor_id, actor_username, action, target_id, target_username, ip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    entry.actorId ?? null,
    entry.actorUsername ?? null,
    entry.action,
    entry.targetId ?? null,
    entry.targetUsername ?? null,
    entry.ip ?? null
  ).run();
}
__name(writeAuditLog, "writeAuditLog");
async function getAuditLogs(db, limit = 50) {
  const { results } = await db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?").bind(Math.min(Math.max(Number(limit) || 50, 1), 100)).all();
  return results;
}
__name(getAuditLogs, "getAuditLogs");

// src/utils/session.js
var SESSION_TTL_SECONDS = 24 * 60 * 60;
var TOKEN_BYTES = 32;
var KEY_PREFIX = "sess:";
var TOKEN_PATTERN = /^[0-9a-f]{64}$/;
var RATE_LIMIT_MAX = 5;
var RATE_LIMIT_WINDOW = 15 * 60;
var RATE_LIMIT_PREFIX = "rl:login:";
function bytesToHex2(bytes) {
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex2, "bytesToHex");
async function generateSessionToken(kv, user) {
  const token = bytesToHex2(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));
  const now = Date.now();
  const session = {
    user_id: user.id,
    username: user.username,
    session_version: user.session_version,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + SESSION_TTL_SECONDS * 1e3).toISOString()
  };
  await kv.put(KEY_PREFIX + token, JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS
  });
  return token;
}
__name(generateSessionToken, "generateSessionToken");
async function readSession(kv, token) {
  if (!token || !TOKEN_PATTERN.test(token))
    return null;
  const raw2 = await kv.get(KEY_PREFIX + token);
  if (!raw2)
    return null;
  let session;
  try {
    session = JSON.parse(raw2);
  } catch {
    return null;
  }
  if (!session || typeof session.user_id !== "number" || typeof session.username !== "string" || typeof session.session_version !== "number" || typeof session.expires_at !== "string") {
    return null;
  }
  const expiresAt = Date.parse(session.expires_at);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    await kv.delete(KEY_PREFIX + token);
    return null;
  }
  return session;
}
__name(readSession, "readSession");
async function deleteSessionToken(kv, token) {
  if (!token || !TOKEN_PATTERN.test(token))
    return false;
  try {
    await kv.delete(KEY_PREFIX + token);
    return true;
  } catch (error) {
    console.error("[session] delete failed:", error);
    return false;
  }
}
__name(deleteSessionToken, "deleteSessionToken");
async function validateSession(env, token) {
  const session = await readSession(env.SESSIONS, token);
  if (!session)
    return null;
  const user = await getUserById(env.DB, session.user_id);
  if (!user || user.session_version !== session.session_version) {
    await deleteSessionToken(env.SESSIONS, token);
    return null;
  }
  return { user, session, token };
}
__name(validateSession, "validateSession");
function loginRateLimitKey(ip, username) {
  return `${ip}|${String(username || "").toLowerCase().slice(0, 64)}`;
}
__name(loginRateLimitKey, "loginRateLimitKey");
async function checkLoginRateLimit(kv, bucket) {
  const key = RATE_LIMIT_PREFIX + bucket;
  try {
    const raw2 = await kv.get(key);
    if (!raw2)
      return true;
    const record = JSON.parse(raw2);
    if (!record || Date.now() > record.reset_at)
      return true;
    return record.count < RATE_LIMIT_MAX;
  } catch (error) {
    console.error("[ratelimit] check failed:", error);
    return true;
  }
}
__name(checkLoginRateLimit, "checkLoginRateLimit");
async function recordLoginFailure(kv, bucket) {
  const key = RATE_LIMIT_PREFIX + bucket;
  try {
    const raw2 = await kv.get(key);
    let count = 1;
    let resetAt = Date.now() + RATE_LIMIT_WINDOW * 1e3;
    if (raw2) {
      const record = JSON.parse(raw2);
      if (record && Date.now() <= record.reset_at) {
        count = record.count + 1;
        resetAt = record.reset_at;
      }
    }
    await kv.put(key, JSON.stringify({ count, reset_at: resetAt }), {
      expirationTtl: RATE_LIMIT_WINDOW
    });
  } catch (error) {
    console.warn("[ratelimit] record skipped:", error && error.message);
  }
}
__name(recordLoginFailure, "recordLoginFailure");
async function clearLoginFailures(kv, bucket) {
  try {
    await kv.delete(RATE_LIMIT_PREFIX + bucket);
  } catch {
  }
}
__name(clearLoginFailures, "clearLoginFailures");

// src/utils/announcement.js
var ALLOWED_TAGS = /* @__PURE__ */ new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "h3",
  "h4"
]);
var DEFAULTS = {
  enabled: false,
  kind: "modal",
  title: "",
  body_html: "",
  bg_color: "#667eea",
  text_color: "#ffffff",
  font_size: 18,
  title_size: 28,
  panel_width: 70,
  panel_height: 60,
  radius: 18,
  overlay_opacity: 0.72,
  button_text: "\u6211\u77E5\u9053\u4E86",
  // 语义：是否给访客显示「不再提示」按钮（勾选=允许永久隐藏；不勾选=每次访问都展示）。
  // 注意：「我知道了」大按钮永远只关闭本次弹窗，不写入任何本地记忆。
  show_once: true
};
function escapeText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(escapeText, "escapeText");
function escapeAttr(value) {
  return escapeText(value).replace(/'/g, "&#39;");
}
__name(escapeAttr, "escapeAttr");
function stripDangerousBlocks(input) {
  return String(input).replace(/<!--[\s\S]*?-->/g, "").replace(/<\s*(script|style|iframe|object|embed|svg|math|template)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "").replace(/<\s*(script|style|iframe|object|embed|svg|math|template)\b[^>]*\/?\s*>/gi, "");
}
__name(stripDangerousBlocks, "stripDangerousBlocks");
function sanitizeHtml(input) {
  const source = stripDangerousBlocks(input || "").slice(0, 4e3);
  let out = "";
  let i = 0;
  while (i < source.length) {
    const lt = source.indexOf("<", i);
    if (lt === -1) {
      out += escapeText(source.slice(i));
      break;
    }
    out += escapeText(source.slice(i, lt));
    const gt = source.indexOf(">", lt);
    if (gt === -1) {
      out += escapeText(source.slice(lt));
      break;
    }
    const raw2 = source.slice(lt, gt + 1);
    const match = /^<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>$/.exec(raw2);
    if (!match) {
      out += escapeText(raw2);
      i = gt + 1;
      continue;
    }
    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();
    const attrs = match[3] || "";
    if (!ALLOWED_TAGS.has(tag)) {
      i = gt + 1;
      continue;
    }
    if (closing) {
      out += `</${tag}>`;
      i = gt + 1;
      continue;
    }
    if (tag === "br") {
      out += "<br>";
      i = gt + 1;
      continue;
    }
    let cleanAttrs = "";
    if (tag === "a") {
      const hrefMatch = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      const href = hrefMatch ? hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? "" : "";
      const url = href.trim();
      if (/^(https?:\/\/|mailto:|\/)/i.test(url)) {
        cleanAttrs = ` href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer"`;
      }
    }
    out += `<${tag}${cleanAttrs}>`;
    i = gt + 1;
  }
  return out;
}
__name(sanitizeHtml, "sanitizeHtml");
function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 100) / 100 : fallback;
}
__name(clampNumber, "clampNumber");
function color(value, fallback) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}
__name(color, "color");
function shortText(value, max, fallback = "") {
  if (typeof value !== "string")
    return fallback;
  return escapeText(value.trim().slice(0, max));
}
__name(shortText, "shortText");
function normalizeAnnouncement(input) {
  if (!input || typeof input !== "object")
    return { ok: false, errors: ["\u63D0\u4EA4\u5185\u5BB9\u683C\u5F0F\u4E0D\u6B63\u786E"] };
  const errors = [];
  const title = shortText(input.title, 100);
  const body = sanitizeHtml(input.body_html);
  const buttonText = shortText(input.button_text, 20, "\u6211\u77E5\u9053\u4E86");
  const value = {
    enabled: input.enabled === true || input.enabled === 1,
    kind: input.kind === "bar" ? "bar" : "modal",
    title,
    body_html: body,
    bg_color: color(input.bg_color, DEFAULTS.bg_color),
    text_color: color(input.text_color, DEFAULTS.text_color),
    font_size: clampNumber(input.font_size, 12, 48, DEFAULTS.font_size),
    title_size: clampNumber(input.title_size, 16, 64, DEFAULTS.title_size),
    panel_width: clampNumber(input.panel_width, 30, 100, DEFAULTS.panel_width),
    panel_height: clampNumber(input.panel_height, 20, 90, DEFAULTS.panel_height),
    radius: clampNumber(input.radius, 0, 40, DEFAULTS.radius),
    overlay_opacity: clampNumber(input.overlay_opacity, 0, 0.95, DEFAULTS.overlay_opacity),
    button_text: buttonText || "\u6211\u77E5\u9053\u4E86",
    show_once: input.show_once !== false && input.show_once !== 0
  };
  if (value.enabled && !title.trim())
    errors.push("\u53D1\u5E03\u65F6\u5FC5\u987B\u586B\u5199\u516C\u544A\u6807\u9898");
  if (value.enabled && !body.trim())
    errors.push("\u53D1\u5E03\u65F6\u5FC5\u987B\u586B\u5199\u516C\u544A\u6B63\u6587");
  return errors.length ? { ok: false, errors } : { ok: true, value };
}
__name(normalizeAnnouncement, "normalizeAnnouncement");
function publicAnnouncement(row) {
  if (!row)
    return null;
  return {
    enabled: Boolean(row.enabled),
    kind: row.kind,
    title: row.title,
    body_html: row.body_html,
    bg_color: row.bg_color,
    text_color: row.text_color,
    font_size: row.font_size,
    title_size: row.title_size,
    panel_width: row.panel_width,
    panel_height: row.panel_height,
    radius: row.radius,
    overlay_opacity: row.overlay_opacity,
    button_text: row.button_text,
    show_once: Boolean(row.show_once),
    version: row.updated_at || ""
  };
}
__name(publicAnnouncement, "publicAnnouncement");

// src/utils/permissions.js
var LEVEL = { SUPER: 1, EDITOR: 2, VIEWER: 3 };
var LEVEL_LABEL = {
  1: "\u4E00\u7EA7 \xB7 \u8D85\u7EA7\u7BA1\u7406\u5458",
  2: "\u4E8C\u7EA7 \xB7 \u666E\u901A\u7BA1\u7406",
  3: "\u4E09\u7EA7 \xB7 \u7559\u8A00\u67E5\u770B"
};
var MATRIX = {
  MANAGE_ADMINS: [1],
  MANAGE_ANNOUNCEMENT: [1, 2],
  MANAGE_NEWS: [1, 2],
  VIEW_MESSAGES: [1, 3],
  DELETE_MESSAGES: [1],
  VIEW_AUDIT_LOGS: [1]
};
function normalizeLevel(value) {
  const n = Number(value);
  return n === 1 || n === 2 || n === 3 ? n : LEVEL.VIEWER;
}
__name(normalizeLevel, "normalizeLevel");
function userLevel(user) {
  return normalizeLevel(user && user.role_level);
}
__name(userLevel, "userLevel");
function levelLabel(value) {
  return LEVEL_LABEL[normalizeLevel(value)] || LEVEL_LABEL[3];
}
__name(levelLabel, "levelLabel");
function can(user, permission) {
  const allowed = MATRIX[permission];
  return Array.isArray(allowed) && allowed.includes(userLevel(user));
}
__name(can, "can");

// src/utils/news.js
function escapeText2(value) {
  return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeText2, "escapeText");
var ALLOWED_ATTACH_EXT = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "mp4",
  "webm",
  "mov",
  "m4v"
];
function safeAttachment(value) {
  if (typeof value !== "string")
    return null;
  const s = value.trim().slice(0, 200);
  if (!s)
    return null;
  if (s.includes("..") || s.includes(":") || s.startsWith("/") || /[<>"']/.test(s)) {
    return null;
  }
  const ext = s.toLowerCase().split(".").pop();
  if (!ALLOWED_ATTACH_EXT.includes(ext))
    return null;
  return s;
}
__name(safeAttachment, "safeAttachment");
function normalizeNews(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["\u63D0\u4EA4\u5185\u5BB9\u683C\u5F0F\u4E0D\u6B63\u786E"] };
  }
  const errors = [];
  const title = typeof input.title === "string" ? escapeText2(input.title.trim().slice(0, 120)) : "";
  const summary = typeof input.summary === "string" ? escapeText2(input.summary.trim().slice(0, 240)) : "";
  const contentHtml = sanitizeHtml(input.content_html);
  const importanceRaw = Number(input.importance);
  const importance = Number.isFinite(importanceRaw) && importanceRaw >= 1 && importanceRaw <= 5 ? Math.round(importanceRaw) : 3;
  const isPublished = input.is_published === true || input.is_published === 1;
  const attachmentRaw = typeof input.attachment === "string" ? input.attachment.trim() : "";
  const attachment = attachmentRaw ? safeAttachment(attachmentRaw) : null;
  if (!title)
    errors.push("\u65B0\u95FB\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A");
  if (!contentHtml.trim())
    errors.push("\u65B0\u95FB\u6B63\u6587\u4E0D\u80FD\u4E3A\u7A7A");
  if (attachmentRaw && !attachment) {
    errors.push("\u9644\u4EF6\u683C\u5F0F\u6216\u8DEF\u5F84\u4E0D\u6B63\u786E\uFF1A\u4EC5\u652F\u6301 PDF / Word / Excel / \u56FE\u7247 / \u89C6\u9891\uFF0C\u4E14\u4E3A\u7AD9\u5185\u76F8\u5BF9\u8DEF\u5F84");
  }
  return errors.length ? { ok: false, errors } : {
    ok: true,
    value: {
      title,
      summary,
      content_html: contentHtml,
      importance,
      attachment,
      is_published: isPublished ? 1 : 0
    }
  };
}
__name(normalizeNews, "normalizeNews");
function publicNews(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content_html: row.content_html,
    importance: row.importance,
    attachment: row.attachment,
    published_at: row.published_at,
    created_at: row.created_at
  };
}
__name(publicNews, "publicNews");
function adminNews(row) {
  return {
    ...publicNews(row),
    is_published: Boolean(row.is_published),
    updated_at: row.updated_at,
    updated_by: row.updated_by
  };
}
__name(adminNews, "adminNews");
function normalizeMessage(input) {
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["\u63D0\u4EA4\u5185\u5BB9\u683C\u5F0F\u4E0D\u6B63\u786E"] };
  }
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 40) : "";
  const contact = typeof input.contact === "string" ? input.contact.trim().slice(0, 80) : "";
  const content = typeof input.content === "string" ? input.content.trim().slice(0, 1e3) : "";
  if (!content)
    return { ok: false, errors: ["\u8BF7\u586B\u5199\u7559\u8A00\u5185\u5BB9"] };
  return { ok: true, value: { name, contact, content } };
}
__name(normalizeMessage, "normalizeMessage");

// src/index.js
var APP_VERSION = "1.0.0";
var app = new Hono2();
var MAX_BODY_BYTES = 16384;
function apiError(c, code, overrideMessage) {
  const def = ERRORS[code] || ERRORS.INTERNAL;
  return c.json(
    { success: false, code, error: overrideMessage || def.message },
    def.status
  );
}
__name(apiError, "apiError");
function bearerToken(c) {
  const header = c.req.header("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : null;
}
__name(bearerToken, "bearerToken");
function clientIp(c) {
  return c.req.header("CF-Connecting-IP") || (c.req.header("X-Forwarded-For") || "").split(",")[0].trim() || "unknown";
}
__name(clientIp, "clientIp");
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    last_login: user.last_login,
    level: userLevel(user),
    level_label: levelLabel(user.role_level)
  };
}
__name(publicUser, "publicUser");
function requirePermission(c, user, permission) {
  return can(user, permission) ? null : apiError(c, "FORBIDDEN");
}
__name(requirePermission, "requirePermission");
function parseId(raw2) {
  const id = Number(raw2);
  return Number.isInteger(id) && id > 0 ? id : null;
}
__name(parseId, "parseId");
async function readJson(c) {
  const length = Number(c.req.header("Content-Length") || 0);
  if (length > MAX_BODY_BYTES) {
    throw new AuthError("REQUEST_TOO_LARGE", "too large", 413);
  }
  let value;
  try {
    value = await c.req.json();
  } catch {
    throw new AuthError("INVALID_JSON", "invalid json", 400);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AuthError("INVALID_JSON", "invalid json", 400);
  }
  return value;
}
__name(readJson, "readJson");
async function authenticate(c) {
  const token = bearerToken(c);
  if (!token)
    return null;
  try {
    return await validateSession(c.env, token);
  } catch (error) {
    console.error("[auth] validate failed:", error);
    return null;
  }
}
__name(authenticate, "authenticate");
async function safeAudit(c, entry) {
  try {
    await writeAuditLog(c.env.DB, { ...entry, ip: clientIp(c) });
  } catch (error) {
    console.error("[audit] write failed:", error);
  }
}
__name(safeAudit, "safeAudit");
function allowedOrigins(c) {
  const configured = (c.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const self = new URL(c.req.url).origin;
  return [.../* @__PURE__ */ new Set([self, ...configured])];
}
__name(allowedOrigins, "allowedOrigins");
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  if (origin && allowedOrigins(c).includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    c.header("Access-Control-Max-Age", "600");
  }
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "SAMEORIGIN");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  if (new URL(c.req.url).pathname.startsWith("/api/")) {
    c.header("Cache-Control", "no-store");
  }
  if (c.req.method === "OPTIONS")
    return c.text("", 204);
  await next();
});
app.onError((err, c) => {
  if (err instanceof AuthError)
    return apiError(c, err.code);
  console.error("[unhandled]", err);
  return apiError(c, "INTERNAL");
});
app.get(
  "/health",
  (c) => c.json({
    status: "ok",
    version: APP_VERSION,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: "Cloudflare Workers"
  })
);
app.post("/api/login", async (c) => {
  const ip = clientIp(c);
  const body = await readJson(c);
  const { username, password } = body;
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || username.length > 64 || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    return apiError(c, "INVALID_INPUT");
  }
  const name = username.trim();
  const bucket = loginRateLimitKey(ip, name);
  if (!await checkLoginRateLimit(c.env.SESSIONS, bucket)) {
    return apiError(c, "RATE_LIMITED");
  }
  const user = await getUserByUsername(c.env.DB, name);
  const valid = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !valid) {
    await recordLoginFailure(c.env.SESSIONS, bucket);
    await safeAudit(c, { action: "LOGIN_FAILED", targetUsername: name });
    return apiError(c, "INVALID_CREDENTIALS");
  }
  await clearLoginFailures(c.env.SESSIONS, bucket);
  await updateUserLastLogin(c.env.DB, user.id);
  const token = await generateSessionToken(c.env.SESSIONS, user);
  await safeAudit(c, {
    actorId: user.id,
    actorUsername: user.username,
    action: "LOGIN_SUCCESS"
  });
  return c.json({
    success: true,
    message: "\u767B\u5F55\u6210\u529F",
    token,
    user: publicUser(user)
  });
});
app.post("/api/logout", async (c) => {
  const token = bearerToken(c);
  if (token) {
    const auth = await authenticate(c);
    await deleteSessionToken(c.env.SESSIONS, token);
    if (auth) {
      await safeAudit(c, {
        actorId: auth.user.id,
        actorUsername: auth.user.username,
        action: "LOGOUT"
      });
    }
  }
  return c.json({ success: true, message: "\u9000\u51FA\u6210\u529F" });
});
app.get("/api/verify", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  return c.json({ success: true, message: "\u4F1A\u8BDD\u6709\u6548", user: publicUser(auth.user) });
});
app.get("/api/admins", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_ADMINS");
  if (denied)
    return denied;
  return c.json({ success: true, users: await getAllUsers(c.env.DB) });
});
app.post("/api/admins", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_ADMINS");
  if (denied)
    return denied;
  const body = await readJson(c);
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = body.password;
  const issues = [
    ...validateUsername(username),
    ...validateEmail(email),
    ...validatePasswordComplexity(password, username)
  ];
  if (issues.length) {
    return c.json(
      { success: false, code: "WEAK_PASSWORD", error: issues.join("\uFF1B") },
      400
    );
  }
  const passwordHash = await hashPassword(password);
  const roleLevel = normalizeLevel(body.level);
  const result = await createUser(c.env.DB, { username, email, passwordHash, roleLevel });
  if (!result.ok)
    return apiError(c, "USERNAME_TAKEN");
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: "REGISTER_ADMIN",
    targetUsername: `${username}\uFF08${levelLabel(roleLevel)}\uFF09`
  });
  return c.json({
    success: true,
    message: "\u7BA1\u7406\u5458\u521B\u5EFA\u6210\u529F",
    user: { username, email, level: roleLevel }
  });
});
app.put("/api/admins/:id", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_ADMINS");
  if (denied)
    return denied;
  const id = parseId(c.req.param("id"));
  if (!id)
    return apiError(c, "INVALID_INPUT");
  const target = await getUserById(c.env.DB, id);
  if (!target)
    return apiError(c, "USER_NOT_FOUND");
  const body = await readJson(c);
  const wantsProfile = body.username !== void 0 || body.email !== void 0;
  const wantsPassword = body.password !== void 0;
  const wantsLevel = body.level !== void 0;
  if (!wantsProfile && !wantsPassword && !wantsLevel) {
    return apiError(c, "INVALID_INPUT");
  }
  if (wantsLevel) {
    const nextLevel = normalizeLevel(body.level);
    if (userLevel(target) === 1 && nextLevel !== 1) {
      const superCount = await countSuperAdmins(c.env.DB);
      if (superCount <= 1) {
        return c.json(
          {
            success: false,
            code: "LAST_SUPER_ADMIN",
            error: "\u7CFB\u7EDF\u5FC5\u987B\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u4E00\u7EA7\u8D85\u7EA7\u7BA1\u7406\u5458"
          },
          400
        );
      }
    }
    await updateUserLevel(c.env.DB, id, nextLevel);
    await safeAudit(c, {
      actorId: auth.user.id,
      actorUsername: auth.user.username,
      action: "CHANGE_LEVEL",
      targetId: id,
      targetUsername: `${target.username} \u2192 ${levelLabel(nextLevel)}`
    });
  }
  if (wantsProfile) {
    const username = body.username !== void 0 ? String(body.username).trim() : target.username;
    const email = body.email !== void 0 ? String(body.email).trim() : target.email;
    const issues = [...validateUsername(username), ...validateEmail(email)];
    if (issues.length) {
      return c.json(
        { success: false, code: "INVALID_INPUT", error: issues.join("\uFF1B") },
        400
      );
    }
    const result = await updateUserProfile(c.env.DB, id, username, email);
    if (!result.ok)
      return apiError(c, "USERNAME_TAKEN");
    await safeAudit(c, {
      actorId: auth.user.id,
      actorUsername: auth.user.username,
      action: "UPDATE_ADMIN",
      targetId: id,
      targetUsername: username
    });
  }
  if (wantsPassword) {
    const issues = validatePasswordComplexity(body.password, target.username);
    if (issues.length) {
      return c.json(
        { success: false, code: "WEAK_PASSWORD", error: issues.join("\uFF1B") },
        400
      );
    }
    if (id === auth.user.id) {
      const oldPassword = body.oldPassword;
      if (typeof oldPassword !== "string" || !await verifyPassword(oldPassword, auth.user.password_hash)) {
        return apiError(c, "OLD_PASSWORD_WRONG");
      }
    }
    await updateUserPassword(c.env.DB, id, await hashPassword(body.password));
    await safeAudit(c, {
      actorId: auth.user.id,
      actorUsername: auth.user.username,
      action: id === auth.user.id ? "CHANGE_OWN_PASSWORD" : "RESET_ADMIN_PASSWORD",
      targetId: id,
      targetUsername: target.username
    });
  }
  return c.json({
    success: true,
    message: "\u7BA1\u7406\u5458\u4FE1\u606F\u5DF2\u66F4\u65B0",
    // 改密会使该账号所有会话（含操作者自己）立即失效
    sessionRevoked: wantsPassword
  });
});
app.delete("/api/admins/:id", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_ADMINS");
  if (denied)
    return denied;
  const id = parseId(c.req.param("id"));
  if (!id)
    return apiError(c, "INVALID_INPUT");
  if (id === auth.user.id)
    return apiError(c, "CANNOT_DELETE_SELF");
  const target = await getUserById(c.env.DB, id);
  if (!target)
    return apiError(c, "USER_NOT_FOUND");
  const total = await countUsers(c.env.DB);
  if (total <= 1)
    return apiError(c, "LAST_ADMIN");
  if (userLevel(target) === 1) {
    const superCount = await countSuperAdmins(c.env.DB);
    if (superCount <= 1) {
      return c.json(
        {
          success: false,
          code: "LAST_SUPER_ADMIN",
          error: "\u4E0D\u80FD\u5220\u9664\u6700\u540E\u4E00\u4E2A\u4E00\u7EA7\u8D85\u7EA7\u7BA1\u7406\u5458"
        },
        400
      );
    }
  }
  await deleteUser(c.env.DB, id);
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: "DELETE_ADMIN",
    targetId: id,
    targetUsername: target.username
  });
  return c.json({ success: true, message: "\u7BA1\u7406\u5458\u5DF2\u5220\u9664" });
});
app.put("/api/me/password", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const body = await readJson(c);
  const { oldPassword, newPassword } = body;
  if (typeof oldPassword !== "string" || !await verifyPassword(oldPassword, auth.user.password_hash)) {
    return apiError(c, "OLD_PASSWORD_WRONG");
  }
  const issues = validatePasswordComplexity(newPassword, auth.user.username);
  if (issues.length) {
    return c.json(
      { success: false, code: "WEAK_PASSWORD", error: issues.join("\uFF1B") },
      400
    );
  }
  await updateUserPassword(c.env.DB, auth.user.id, await hashPassword(newPassword));
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: "CHANGE_OWN_PASSWORD"
  });
  return c.json({ success: true, message: "\u5BC6\u7801\u5DF2\u4FEE\u6539\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55", sessionRevoked: true });
});
app.get("/api/audit-logs", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "VIEW_AUDIT_LOGS");
  if (denied)
    return denied;
  return c.json({ success: true, logs: await getAuditLogs(c.env.DB) });
});
app.get("/api/site/announcement", async (c) => {
  try {
    const row = await c.env.DB.prepare("SELECT * FROM announcements WHERE id = 1").first();
    const data = publicAnnouncement(row);
    if (!data || !data.enabled)
      return c.json({ success: true, announcement: null });
    c.header("Cache-Control", "public, max-age=30");
    return c.json({ success: true, announcement: data });
  } catch (error) {
    console.error("[announcement] public read failed:", error);
    return c.json({ success: true, announcement: null });
  }
});
app.get("/api/admin/announcement", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_ANNOUNCEMENT");
  if (denied)
    return denied;
  const row = await c.env.DB.prepare("SELECT * FROM announcements WHERE id = 1").first();
  return c.json({ success: true, announcement: row });
});
app.put("/api/admin/announcement", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_ANNOUNCEMENT");
  if (denied)
    return denied;
  const body = await readJson(c);
  const result = normalizeAnnouncement(body);
  if (!result.ok) {
    return c.json(
      { success: false, code: "INVALID_INPUT", error: result.errors.join("\uFF1B") },
      400
    );
  }
  const v = result.value;
  await c.env.DB.prepare(`
    UPDATE announcements SET
      enabled = ?, kind = ?, title = ?, body_html = ?,
      bg_color = ?, text_color = ?, font_size = ?, title_size = ?,
      panel_width = ?, panel_height = ?, radius = ?, overlay_opacity = ?,
      button_text = ?, show_once = ?, updated_at = datetime('now'), updated_by = ?
    WHERE id = 1
  `).bind(
    v.enabled ? 1 : 0,
    v.kind,
    v.title,
    v.body_html,
    v.bg_color,
    v.text_color,
    v.font_size,
    v.title_size,
    v.panel_width,
    v.panel_height,
    v.radius,
    v.overlay_opacity,
    v.button_text,
    v.show_once ? 1 : 0,
    auth.user.username
  ).run();
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: v.enabled ? "PUBLISH_ANNOUNCEMENT" : "UNPUBLISH_ANNOUNCEMENT"
  });
  return c.json({
    success: true,
    message: v.enabled ? "\u516C\u544A\u5DF2\u53D1\u5E03\uFF0C\u8BBF\u5BA2\u8FDB\u7AD9\u5373\u53EF\u770B\u5230" : "\u516C\u544A\u5DF2\u505C\u7528"
  });
});
app.get("/api/site/news", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC, id DESC LIMIT 30"
    ).all();
    c.header("Cache-Control", "public, max-age=30");
    return c.json({ success: true, news: (results || []).map(publicNews) });
  } catch (error) {
    console.error("[news] public read failed:", error);
    return c.json({ success: true, news: [] });
  }
});
app.get("/api/admin/news", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_NEWS");
  if (denied)
    return denied;
  const { results } = await c.env.DB.prepare("SELECT * FROM news ORDER BY id DESC LIMIT 100").all();
  return c.json({ success: true, news: (results || []).map(adminNews) });
});
app.post("/api/admin/news", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_NEWS");
  if (denied)
    return denied;
  const body = await readJson(c);
  const norm = normalizeNews(body);
  if (!norm.ok) {
    return c.json({ success: false, code: "INVALID_INPUT", error: norm.errors.join("\uFF1B") }, 400);
  }
  const v = norm.value;
  await c.env.DB.prepare(`
    INSERT INTO news
      (title, summary, content_html, importance, attachment, is_published,
       published_at, created_at, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?,
       CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END,
       datetime('now'), datetime('now'), ?)
  `).bind(
    v.title,
    v.summary,
    v.content_html,
    v.importance,
    v.attachment,
    v.is_published,
    v.is_published,
    auth.user.username
  ).run();
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: v.is_published ? "PUBLISH_NEWS" : "SAVE_NEWS_DRAFT",
    targetUsername: v.title
  });
  return c.json({ success: true, message: v.is_published ? "\u65B0\u95FB\u5DF2\u53D1\u5E03" : "\u8349\u7A3F\u5DF2\u4FDD\u5B58" });
});
app.put("/api/admin/news/:id", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_NEWS");
  if (denied)
    return denied;
  const id = parseId(c.req.param("id"));
  if (!id)
    return apiError(c, "INVALID_INPUT");
  const exists = await c.env.DB.prepare("SELECT id FROM news WHERE id = ?").bind(id).first();
  if (!exists)
    return apiError(c, "NOT_FOUND");
  const body = await readJson(c);
  const norm = normalizeNews(body);
  if (!norm.ok) {
    return c.json({ success: false, code: "INVALID_INPUT", error: norm.errors.join("\uFF1B") }, 400);
  }
  const v = norm.value;
  await c.env.DB.prepare(`
    UPDATE news SET
      title = ?, summary = ?, content_html = ?, importance = ?, attachment = ?,
      is_published = ?,
      published_at = CASE WHEN ? = 1 THEN COALESCE(published_at, datetime('now')) ELSE published_at END,
      updated_at = datetime('now'), updated_by = ?
    WHERE id = ?
  `).bind(
    v.title,
    v.summary,
    v.content_html,
    v.importance,
    v.attachment,
    v.is_published,
    v.is_published,
    auth.user.username,
    id
  ).run();
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: v.is_published ? "PUBLISH_NEWS" : "SAVE_NEWS_DRAFT",
    targetId: id,
    targetUsername: v.title
  });
  return c.json({ success: true, message: "\u65B0\u95FB\u5DF2\u66F4\u65B0" });
});
app.delete("/api/admin/news/:id", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "MANAGE_NEWS");
  if (denied)
    return denied;
  const id = parseId(c.req.param("id"));
  if (!id)
    return apiError(c, "INVALID_INPUT");
  const row = await c.env.DB.prepare("SELECT title FROM news WHERE id = ?").bind(id).first();
  if (!row)
    return apiError(c, "NOT_FOUND");
  await c.env.DB.prepare("DELETE FROM news WHERE id = ?").bind(id).run();
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: "DELETE_NEWS",
    targetId: id,
    targetUsername: row.title
  });
  return c.json({ success: true, message: "\u65B0\u95FB\u5DF2\u5220\u9664" });
});
app.post("/api/site/messages", async (c) => {
  const ip = clientIp(c);
  const bucket = "msg|" + ip;
  if (!await checkLoginRateLimit(c.env.SESSIONS, bucket)) {
    return apiError(c, "RATE_LIMITED");
  }
  const body = await readJson(c);
  const norm = normalizeMessage(body);
  if (!norm.ok) {
    return c.json({ success: false, code: "INVALID_INPUT", error: norm.errors.join("\uFF1B") }, 400);
  }
  const v = norm.value;
  await c.env.DB.prepare(
    "INSERT INTO messages (name, contact, content, ip, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
  ).bind(v.name, v.contact, v.content, ip).run();
  await recordLoginFailure(c.env.SESSIONS, bucket);
  await safeAudit(c, { action: "NEW_MESSAGE", targetUsername: v.name || "\u533F\u540D" });
  return c.json({ success: true, message: "\u7559\u8A00\u5DF2\u63D0\u4EA4\uFF0C\u6211\u4EEC\u4F1A\u5C3D\u5FEB\u67E5\u770B" });
});
app.get("/api/admin/messages", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "VIEW_MESSAGES");
  if (denied)
    return denied;
  const { results } = await c.env.DB.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 100").all();
  return c.json({ success: true, messages: results || [] });
});
app.put("/api/admin/messages/:id/read", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "VIEW_MESSAGES");
  if (denied)
    return denied;
  const id = parseId(c.req.param("id"));
  if (!id)
    return apiError(c, "INVALID_INPUT");
  await c.env.DB.prepare("UPDATE messages SET is_read = 1 WHERE id = ?").bind(id).run();
  return c.json({ success: true, message: "\u5DF2\u6807\u8BB0\u4E3A\u5DF2\u8BFB" });
});
app.delete("/api/admin/messages/:id", async (c) => {
  const auth = await authenticate(c);
  if (!auth)
    return apiError(c, "SESSION_INVALID");
  const denied = requirePermission(c, auth.user, "DELETE_MESSAGES");
  if (denied)
    return denied;
  const id = parseId(c.req.param("id"));
  if (!id)
    return apiError(c, "INVALID_INPUT");
  await c.env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
  await safeAudit(c, {
    actorId: auth.user.id,
    actorUsername: auth.user.username,
    action: "DELETE_MESSAGE",
    targetId: id
  });
  return c.json({ success: true, message: "\u7559\u8A00\u5DF2\u5220\u9664" });
});
app.get("*", async (c) => {
  const path = new URL(c.req.url).pathname;
  if (path.startsWith("/api/"))
    return apiError(c, "NOT_FOUND");
  try {
    return await c.env.ASSETS.fetch(c.req.raw);
  } catch (error) {
    console.error("[assets] fetch failed:", error);
    return c.text("\u670D\u52A1\u9519\u8BEF", 500);
  }
});
var src_default = app;
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
