/*
**  style-scope -- PostCSS and PostHTML plugins for locally scoped style
**  Copyright (c) 2017 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const postcss               = require("postcss")
const postcssSelectorParser = require("postcss-selector-parser")

/*  PostCSS Plugin SPI  */
module.exports = postcss.plugin("postcss-scope", (options = {}) => {
    /*  default options  */
    options = Object.assign({}, {
        atDirective: "scope",
        attrPrefix:  "scope-",
        rootScope:   "none"
    }, options)

    /*  provide tree processor  */
    return (css /*, result */) => {
        /*  list of nodes to remove  */
        var remove = []

        /*  walk down a single CSS node  */
        const walkNode = (node, scope) => {
            var scopeLocal = scope
            if (typeof node === "object" && node.type === "atrule" && node.name === options.atDirective) {
                /*  @<directive> <id>  */
                var arg = node.params.replace(/^["']/, "").replace(/['"]$/, "")
                if (arg === "")
                    throw node.error(`postcss-scope: WARNING: missing scope argument on directive @${options.atDirective}`)
                if (typeof node.nodes === "object" && node.nodes instanceof Array && node.nodes.length > 0)
                    /*  @<directive> <id> { ... }  */
                    scopeLocal = arg
                else
                    /*  @<directive> <id>;  */
                    scope = arg
                remove.push(node)
            }
            else if (typeof node === "object" && node.type === "rule" && scope !== "none") {
                /*  <selector> { ... }  */
                node.selector = postcssSelectorParser((node) => {
                    node.walk((node /*, index */) => {
                        if (node.type === "selector") {
                            if (node.parent && node.parent.type === "pseudo" && node.parent.value !== ":not")
                                return
                            const mkAttr = () =>
                                postcssSelectorParser.attribute({ value: `${options.attrPrefix}${scope}` })
                            let insert = []
                            node.each((subnode) => {
                                if (subnode.type === "combinator")
                                    insert.push(subnode)
                            })
                            insert.forEach((subnode) => {
                                node.insertBefore(subnode, mkAttr())
                            })
                            node.append(mkAttr())
                        }
                    })
                }).process(node.selector, { lossless: true }).result
            }

            /*  walk down all child nodes  */
            if (typeof node.nodes === "object" && node.nodes instanceof Array) {
                node.nodes.forEach((node) => {
                    scopeLocal = walkNode(node, scopeLocal) /*  RECURSION  */
                })
            }
            return scope
        }
        walkNode(css, options.rootScope)

        /*  remove all previously processed @<directive> nodes  */
        const depth = (node) => {
            var depth = 0;
            while ((node = node.parent) !== undefined)
                depth++;
            return depth
        }
        remove.sort((a, b) => depth(b) - depth(a)).forEach((node) => {
            if (typeof node.nodes === "object" && node.nodes instanceof Array && node.nodes.length > 0) {
                var anchor = node
                var nodes = node.nodes.slice(0)
                nodes.forEach((node) => {
                    node.moveAfter(anchor)
                    anchor = node
                })
            }
            node.remove()
        })
    }
})

