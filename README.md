
Style-Scope
===========

PostCSS and PostHTML plugins for locally scoping styles.

<p/>
<img src="https://nodei.co/npm/style-scope.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/style-scope.png" alt=""/>

About
-----

This is a pair of plugins for the HTML/CSS post-processors
[PostHTML](https://github.com/posthtml/posthtml) and
[PostCSS](http://postcss.org/) to provide a locally scoped style
functionality where the scope of CSS rules is retricted to a group of HTML
elements to prevent their application on deeper nested HTML elements. It is
intended to be used for post-processing CSS and HTML of components in a
Single-Page-Application.

Usage
-----

The following sample...

```js
const posthtml      = require("posthtml")
const postcss       = require("postcss")

const posthtmlScope = require("style-scope/posthtml")
const postcssScope  = require("style-scope/postcss")

const html = `
<!-- HTML -->
<div foo="bar" quux>
    <div scope="s1">
        <span>a1</span>
        <div scope="s2">
            <span>a2</span>
            <span scope="none">a2</span>
        </div>
        <span>a3</span>
    </div>
</div>
`

const css = `
/* CSS */
.foo, .bar, .quux {}
@scope s1;
.foo, .bar, .quux {}
@scope s2 {
    .foo {}
    @scope none {
        .bar {}
    }
    .quux {}
}
#foo > .bar[quux] {}
#foo.bar.quux:hover:not(foo, bar, quux) {}
@scope s3;
#foo + .bar[baz='quux'] ~ quux {}
.foo {}
`

posthtml([ posthtmlScope({ rootScope: "sample" }) ])
    .process(html, {})
    .then((result) => { console.log(result.html) })

postcss([ postcssScope({ rootScope: "sample" }) ])
    .process(css, {})
    .then((result) => { console.log(result.css) })

```

...produces the following output:

```
<!-- HTML -->
<div foo="bar" quux="" scope-sample>
    <div scope-s1>
        <span scope-s1>a1</span>
        <div scope-s2>
            <span scope-s2>a2</span>
            <span>a2</span>
        </div>
        <span scope-s1>a3</span>
    </div>
</div>

/* CSS */
.foo[scope-sample], .bar[scope-sample], .quux[scope-sample] {}
.foo[scope-s1], .bar[scope-s1], .quux[scope-s1] {}
.foo[scope-s2] {}
.bar {}
.quux[scope-s2] {}
#foo[scope-s1] > .bar[quux][scope-s1] {}
#foo.bar.quux:hover:not(foo[scope-s1], bar[scope-s1], quux[scope-s1])[scope-s1] {}
#foo[scope-s3] + .bar[baz='quux'] ~ quux[scope-s3] {}
.foo[scope-s3] {}
```

License
-------

Copyright (c) 2017-2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

