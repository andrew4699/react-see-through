const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/home/andrew/workspace/react-see-through/.docz/.cache/dev-404-page.js"))),
  "component---readme-md": hot(preferDefault(require("/home/andrew/workspace/react-see-through/README.md"))),
  "component---examples-see-through-mdx": hot(preferDefault(require("/home/andrew/workspace/react-see-through/examples/SeeThrough.mdx"))),
  "component---src-pages-404-js": hot(preferDefault(require("/home/andrew/workspace/react-see-through/.docz/src/pages/404.js")))
}

