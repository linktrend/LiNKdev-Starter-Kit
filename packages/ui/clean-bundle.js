import { readFileSync, writeFileSync } from 'fs';

// Read the generated bundle
let content = readFileSync('dist/index.js', 'utf8');

// Remove the problematic CommonJS compatibility code
content = content.replace(
  /var __require = \/\* @__PURE__ \*\/ \(\(x\) => typeof require !== "undefined" \? require : typeof Proxy !== "undefined" \? new Proxy\(x, \{\s*get: \(a, b\) => \(typeof require !== "undefined" \? require : a\)\[b\]\s*\}\) : x\)\(function\(x\) \{\s*if \(typeof require !== "undefined"\) return require\.apply\(this, arguments\);\s*throw Error\('Dynamic require of "' \+ x \+ '" is not supported'\);\s*\}\);/g,
  ''
);

content = content.replace(
  /var __commonJS = \(cb, mod\) => function __require2\(\) \{\s*return mod \|\| \(0, cb\[__getOwnPropNames\(cb\)\[0\]\]\)\(\(mod = \{ exports: \{\} \}\)\.exports, mod\), mod\.exports;\s*\};/g,
  ''
);

content = content.replace(
  /var __copyProps = \(to, from, except, desc\) => \{\s*if \(from && typeof from === "object" \|\| typeof from === "function"\) \{\s*for \(let key of __getOwnPropNames\(from\)\)\s*if \(!__hasOwnProp\.call\(to, key\) && key !== except\)\s*if \(desc && __getOwnPropDesc\(from, key\) \? desc\.enumerable : true\)\s*__defProp\(to, key, desc \? desc : __getOwnPropDesc\(from, key\)\);\s*\}\s*return to;\s*\};/g,
  ''
);

content = content.replace(
  /var __create = Object\.create;\s*var __defProp = Object\.defineProperty;\s*var __getOwnPropDesc = Object\.getOwnPropertyDescriptor;\s*var __getOwnPropNames = Object\.getOwnPropertyNames;\s*var __getProtoOf = Object\.getPrototypeOf;\s*var __hasOwnProp = Object\.prototype\.hasOwnProperty;/g,
  ''
);

// Remove more CommonJS compatibility functions
content = content.replace(
  /var __toESM = \(mod, isNodeMode, target\) => \(target = mod != null \? __create\(__getProtoOf\(mod\)\) : \{\}, __copyProps\(\s*\/\/ If the importer is in node compatibility mode or this is not an ESM\s*\/\/ file that has been converted to a CommonJS file using a Babel-\s*\/\/ compatible transform \(i\.e\. "__esModule" has not been set\), then set\s*\/\/ "default" to the CommonJS "module\.exports" for node compatibility\.\s*isNodeMode \|\| !mod \|\| !mod\.__esModule \? __defProp\(target, "default", \{ value: mod, enumerable: true \}\) : target,\s*mod\s*\)\);/g,
  ''
);

// Remove any remaining CommonJS helper functions
content = content.replace(
  /var __copyProps = \(to, from, except, desc\) => \{\s*if \(from && typeof from === "object" \|\| typeof from === "function"\) \{\s*for \(let key of __getOwnPropNames\(from\)\)\s*if \(!__hasOwnProp\.call\(to, key\) && key !== except\)\s*__defProp\(to, key, \{ get: \(\) => from\[key\], enumerable: !\(desc = __getOwnPropDesc\(from, key\)\) \|\| desc\.enumerable \}\);\s*\}\s*return to;\s*\};/g,
  ''
);

// Write the cleaned content back
writeFileSync('dist/index.js', content);

console.log('Bundle cleaned successfully');
