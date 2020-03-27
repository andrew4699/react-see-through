const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/home/andrew/workspace/react-see-through/.docz/.cache/dev-404-page.js"))),
  "component---docs-see-through-mdx": hot(preferDefault(require("/home/andrew/workspace/react-see-through/docs/SeeThrough.mdx"))),
  "component---readme-md": hot(preferDefault(require("/home/andrew/workspace/react-see-through/README.md"))),
  "component---src-pages-404-js": hot(preferDefault(require("/home/andrew/workspace/react-see-through/.docz/src/pages/404.js")))
}

