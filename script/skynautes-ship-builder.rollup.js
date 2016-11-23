(function () {
'use strict';

const Private = () => {
    const map = new WeakMap();
    return (key) => {
        if(map.has(key)) {
            return map.get(target);
        }
        const value = {};
        map.set(key, value);
        return value;
    };
};

const skipWS = function skipWS(str, i) {
    const len = str.length;
    while(i < len && str[i].match(/\s/)) { ++i; }
    return [i];
};



const str = function str(val) {
    return (s, i) => {
        if(s.startsWith(val, i)) { return [i + val.length, val]; }
    };
};

const regex = function regex(re) {
    return (s, i) => {
        const m = s.slice(i).match(re);
        if(m && s.startsWith(m[0], i)) { return [i + m[0].length, m]; }
    }
};

const toLex = function toLex(val) {
    if(typeof val === 'string') {
        return str(val);
    }
    else if(val instanceof RegExp) {
        return regex(val);
    }
    return val;
};

const rep = function rep(val, min = 0, max = null) {
    const lex = toLex(val);
    return (str, i, skip) => {
        let result = [];
        for(let res = lex(str, i, skip); res; res = lex(str, i, skip)) {
            if(res.length>1) {
                result.push(res[1]);
            }
            [i] = skip(str, res[0]);
        }
        if(result.length < min || (max && result.length > max)) { return; }
        return [i, result];
    }
};

const opt = function opt(val) {
    const lex = toLex(val);
    return (str, i, skip) => {
        const res = lex(str, i, skip);
        return res || [i];
    };
};

const omit = function omit (val) {
    const lex = toLex(val);
    return (str, i, skip) => {
        const res = lex(str, i, skip);
        return res && res.slice(0, 1);
    };
};



const linear = function linear(...vals) {
    const lexes = vals.map(toLex);
    return (str, i, skip) => {
        let result = [];
        for(const lex of lexes) {
            const res = lex(str, i, skip);
            if(!res) { return; }
            if(res.length>1) {
                result.push(res[1]);
            }
            [i] = skip(str, res[0]);
        }
        return [i, result];
    };
};

const raw = function raw(val) {
    const lex = toLex(val);
    return (str, i, skip) => {
        const res = lex(str, i, skip);
        return res && [res[0], str.slice(i, res[0])];
    };
};

const exec = function exec(val, str, skip) {
    const lex = toLex(val);
    const res = lex(str, skip(str, 0)[0], skip);
    if(res) { res[0] = skip(str, res[0])[0]; }
    return res;
};

const priv = Private();

const Registry = function Registry(document, prefix) {
    const p = priv(document);
    if(p.hasOwnProperty(prefix)) { return p[prefix]; }
    return p[prefix] = {
        register(name, cls) {
            return document.registerElement(prefix + name, cls);
        }
    };
};

const propName = raw(regex(/[^\s:;]+/));
const propValue = raw(regex(/[^\s:;]+/));
const prop = linear(propName, omit(':'), rep(propValue, 1));
const style = linear(prop, rep(linear(omit(';'), prop)), omit(opt(';')));
const parseStyle = function parseStyle(str$$1) {
    const res = exec(style, str$$1, skipWS);
    if(res && res[0] == str$$1.length) {
        const props = res[1];
        const result = { [props[0][0]]: props[0][1] };
        for(const [[key, values]] of props[1]) {
            result[key] = values;
        }
        return result;
    }
};

const prefix = 'dicentra-';
const attrName = `data-${prefix}grid`;

const initialize = document => {
    const registry = Registry(document, prefix);
    const register = registry.register;

    const priv = Private();

    const Grid = register(
        'grid',
        class Grid extends HTMLElement {
            createdCallback() {
                const shadow = this.createShadowRoot();
                Object.assign(priv(this), {
                    shadow
                });
                const attr = this.getAttribute(attrName);
                if(attr) { this.attributeChangedCallback(attrName, null, attr); }
            }
            attributeChangedCallback(attr, oldVal, newVal) {
                console.log(parseStyle(newVal));
                console.log(attr, oldVal, newVal);
            }
        }
    );
};

initialize(document);

}());
