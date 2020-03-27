const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---readme-md": hot(preferDefault(require("/home/andrew/workspace/react-see-through/README.md"))),
  "component---src-see-through-see-through-mdx": hot(preferDefault(require("/home/andrew/workspace/react-see-through/src/SeeThrough/SeeThrough.mdx"))),
  "component---src-pages-404-js": hot(preferDefault(require("/home/andrew/workspace/react-see-through/.docz/src/pages/404.js")))
}

