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

/*  PostHTML Plugin SPI  */
module.exports = function (options) {
    /*  default options  */
    options = Object.assign({}, {
        attrName:    "scope",
        attrNameEsc: "scope-esc",
        attrPrefix:  "scope-",
        rootScope:   "none"
    }, options)

    /*  provide tree processor  */
    return (tree) => {
        /*  walk down a single HTML node  */
        const walkNode = (node, scope) => {
            /*  operate only on HTML tag nodes  */
            if (!(typeof node === "object" && node.tag !== undefined))
                return

            /*  extract scope=xxx attribute  */
            if (typeof node.attrs === "object" && node.attrs[options.attrName]) {
                scope = node.attrs[options.attrName]
                delete node.attrs[options.attrName]
            }

            /*  rename escaped attribute to non-escaped attribute  */
            if (typeof node.attrs === "object" && node.attrs[options.attrNameEsc]) {
                let value = node.attrs[options.attrNameEsc]
                delete node.attrs[options.attrNameEsc]
                node.attrs[options.attrName] = value
            }

            /*  inject scope-xxx attribute inside scoped context  */
            if (scope !== "none") {
                if (node.attrs === undefined)
                    node.attrs = {}
                node.attrs[`${options.attrPrefix}${scope}`] = true
            }

            /*  walk down to all child nodes  */
            if (typeof node.content === "object")
                walkTree(node.content, scope) /* RECURSION */
        }

        /*  walk down all HTML tree nodes  */
        const walkTree = (tree, scope) => {
            tree.forEach((node) => {
                walkNode(node, scope)
            })
        }

        /*  start walking the HTML tree  */
        walkTree(tree, options.rootScope)
    }
}

