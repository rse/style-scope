
const posthtml      = require("posthtml")
const postcss       = require("postcss")

const posthtmlScope = require("./posthtml")
const postcssScope  = require("./postcss")

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

