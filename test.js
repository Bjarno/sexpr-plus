var assert = require('assert');
var sexpr = require(process.cwd() + '/');
var SParse = function(s) {
    try {
        return sexpr.parse(s);
    } catch (e) {
        console.error(e);
        return e
    }
}
var SyntaxError = sexpr.SyntaxError;

assert.deepEqual(SParse('a'), "a");
assert.deepEqual(SParse('"a"'), new String("a"));
assert.deepEqual(SParse('((a b c)(()()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse('((a b c) (() ()))'), [['a','b','c'],[[],[]]]);
assert.deepEqual(SParse("((a 'b 'c))"), [['a',['quote','b'],['quote','c']]]);
assert.deepEqual(SParse("(a '(a b c))"),  ['a', ['quote', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a ' (a b c))"), ['a', ['quote', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a '' (a b c))"), ['a', ['quote', ['quote', ['a', 'b', 'c']]]], 'Multiple quotes should not be flattened');
assert.deepEqual(SParse("((a `b `c))"), [['a',['quasiquote','b'],['quasiquote','c']]]);
assert.deepEqual(SParse("(a `(a b c))"),  ['a', ['quasiquote', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a ` (a b c))"), ['a', ['quasiquote', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a `` (a b c))"), ['a', ['quasiquote', ['quasiquote', ['a', 'b', 'c']]]], 'Multiple quasiquotes should not be flattened');
assert.deepEqual(SParse("((a ,b ,c))"), [['a',['unquote','b'],['unquote','c']]]);
assert.deepEqual(SParse("(a ,(a b c))"),  ['a', ['unquote', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a , (a b c))"), ['a', ['unquote', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a ,, (a b c))"), ['a', ['unquote', ['unquote', ['a', 'b', 'c']]]], 'Multiple unquotes should not be flattened');
assert.deepEqual(SParse("((a ,@b ,@c))"), [['a',['unquote-splicing','b'],['unquote-splicing','c']]]);
assert.deepEqual(SParse("(a ,@(a b c))"),  ['a', ['unquote-splicing', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a ,@ (a b c))"), ['a', ['unquote-splicing', ['a', 'b', 'c']]]);
assert.deepEqual(SParse("(a ,@,@ (a b c))"), ['a', ['unquote-splicing', ['unquote-splicing', ['a', 'b', 'c']]]], 'Multiple unquote-splicings should not be flattened');
assert(SParse("()()") instanceof SyntaxError, 'Any character after a complete expression should be an error');
assert(SParse("((a) b))") instanceof SyntaxError, 'Any character after a complete expression should be an error');
assert(SParse("((a))abc") instanceof SyntaxError, 'Any character after a complete expression should be an error');
assert(SParse("(')") instanceof SyntaxError, 'A \' without anything to quote should be an error');
assert.deepEqual(SParse("'()"), ['quote', []], 'A quoted empty list should parse');
assert.deepEqual(SParse("()"), [], 'An empty list should parse');
assert.deepEqual(SParse("'a"), ['quote', 'a'], 'A quoted atom should parse');
assert.deepEqual(SParse("'(a)"), ['quote', ['a']], 'A quoted atom in a list should parse');
assert.deepEqual(SParse("a"), 'a', 'An atom should parse');
assert.deepEqual(SParse("(a'b)"), ['a', ['quote', 'b']], 'Quote should act symbol delimiting');
assert.deepEqual(SParse("(a`b)"), ['a', ['quasiquote', 'b']], 'Quasiquote should act symbol delimiting');
assert.deepEqual(SParse("(a,b)"), [ 'a', ['unquote', 'b']], 'Unquote should act symbol delimiting');
assert.deepEqual(SParse("(a,@b)"), ['a', ['unquote-splicing', 'b']], 'Unquote-splicing should act symbol delimiting');
assert.deepEqual(SParse("(a\\'b)"), ['a\'b'], 'Escaped single quotes in symbols should parse');
assert.deepEqual(SParse("(a\\\"b)"), ['a\"b'], 'Escaped double quotes in symbols should parse');
assert.deepEqual(SParse("(a\\\\b)"), ['a\\b'], 'Escaped \\ in symbols should parse as \\');
assert.deepEqual(SParse("(a\\b)"), ['ab'], 'Escaped normal characters in symbols should parse as normal');
assert.deepEqual(SParse("(a\\;b)"), ['a;b'], 'Escaped semicolon in symbols should parse');
assert.deepEqual(SParse("(a\\ b)"), ['a b'], 'Escaped space in symbols should parse');

assert.deepEqual(SParse('(+ 1 2)'), [ '+', '1', '2'], "special characters work");

assert.deepEqual(SParse("(\n; comments\n;inside\n\n)"), [], 'empty list with comments inside');
assert.deepEqual(SParse("a ; here's a comment"), 'a', 'comment following atom');
assert.deepEqual(SParse("(a b) ; here's a comment"), ['a', 'b'], 'comment following form');
assert.deepEqual(SParse("(a b) ; (a comment)"), ['a', 'b'], 'comment looking like a form');
assert.deepEqual(SParse('(a ;) \n b)'), ['a', 'b'], "Form with comment between");
assert.deepEqual(SParse('("a ;)"\n)'), [new String('a ;)')], "No comments inside strings");

var error = SParse("(\n'");
assert(error instanceof SyntaxError, "Parsing (\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 2");

error = SParse("(\r\n'");
assert(error instanceof SyntaxError, "Parsing (\\r\\n' Should be an error");
assert(error.line == 2, "line should be 2");
assert(error.col == 2, "col should be 1");

assert.deepEqual(SParse('(a "a")'), ['a', new String('a')], 'Strings should parse as String objects');
assert.deepEqual(SParse('(a"s"b)'), ['a', new String('s'), 'b'], 'Strings should act symbol delimiting');
assert.deepEqual(SParse('(a\\"s\\"b)'), ['a"s"b'], 'Escaped double quotes in symbols should parse');
assert.deepEqual(SParse('(a "\\"\n")'), ['a', new String('"\n')], 'Escaped double quotes \\" should work in Strings');
assert.deepEqual(SParse('(a "\\\\")'), ['a', new String('\\')], 'Escaped \\ should work in Strings');
assert.deepEqual(SParse('(a "\\a")'), ['a', new String('a')], 'Escaped characters should work in Strings');
assert(SParse('(a "string)') instanceof SyntaxError, 'Prematurely ending strings should produce an error');
assert(SParse('\'"string"', ['quote', new String('string')], 'A quoted string should parse'));

assert.deepEqual(SParse('(a /a/)'), ['a', new RegExp('a')], 'Regexes should parse as RegExp objects');
assert.deepEqual(SParse('(\\/)'), ['/'], 'Single slashes still parse as atoms');
assert.deepEqual(SParse('(a /a/g)'), ['a', /a/g], 'Regexes can have flags');
assert.deepEqual(SParse('(a /\\/a/g)'), ['a', new RegExp("\/a", "g")], 'Slashes can be escaped in regexes');
assert.deepEqual(SParse('(a /\\\\a/g)'), ['a', /\a/g], 'Backslashes can be escaped in regexes');
assert.deepEqual(SParse('(a /\\\\a/g)'), ['a', /\a/g], 'Backslashes can be escaped in regexes');

error = SParse("(\"a)");
assert(error instanceof SyntaxError);
assert(error.message == "Syntax error: Unterminated string literal", error.message);

assert.deepEqual(SParse('  a   '), 'a', 'Whitespace should be ignored');
assert.deepEqual(SParse('    '), '', 'The empty expression should parse');

error = SParse('(a ;)');
assert(error instanceof SyntaxError, "Form unfinished due to comment");
