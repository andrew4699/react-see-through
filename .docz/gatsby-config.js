const { mergeWith } = require('lodash/fp')
const fs = require('fs-extra')

let custom = {}
const hasGatsbyConfig = fs.existsSync('./gatsby-config.custom.js')

if (hasGatsbyConfig) {
  try {
    custom = require('./gatsby-config.custom')
  } catch (err) {
    console.error(
      `Failed to load your gatsby-config.js file : `,
      JSON.stringify(err),
    )
  }
}

const config = {
  pathPrefix: '/',

  siteMetadata: {
    title: 'React See Through',
    description: 'Draw attention to one element on your page',
  },
  plugins: [
    {
      resolve: 'gatsby-theme-docz',
      options: {
        themeConfig: {},
        themesDir: 'src',
        mdxExtensions: ['.md', '.mdx'],
        docgenConfig: {},
        menu: [],
        mdPlugins: [],
        hastPlugins: [],
        ignore: [],
        typescript: false,
        ts: false,
        propsParser: true,
        'props-parser': true,
        debug: false,
        native: false,
        openBrowser: false,
        o: false,
        open: false,
        'open-browser': false,
        root: '/home/andrew/workspace/react-see-through/.docz',
        base: '/',
        source: './',
        src: './',
        files: '**/*.{md,markdown,mdx}',
        public: '/public',
        dest: '.docz/dist',
        d: '.docz/dist',
        editBranch: 'master',
        eb: 'master',
        'edit-branch': 'master',
        config: '',
        title: 'React See Through',
        description: 'Draw attention to one element on your page',
        host: 'localhost',
        port: 3000,
        p: 3000,
        separator: '-',
        paths: {
          root: '/home/andrew/workspace/react-see-through',
          templates:
            '/home/andrew/workspace/react-see-through/node_modules/docz-core/dist/templates',
          docz: '/home/andrew/workspace/react-see-through/.docz',
          cache: '/home/andrew/workspace/react-see-through/.docz/.cache',
          app: '/home/andrew/workspace/react-see-through/.docz/app',
          appPackageJson:
            '/home/andrew/workspace/react-see-through/package.json',
          gatsbyConfig:
            '/home/andrew/workspace/react-see-through/gatsby-config.js',
          gatsbyBrowser:
            '/home/andrew/workspace/react-see-through/gatsby-browser.js',
          gatsbyNode: '/home/andrew/workspace/react-see-through/gatsby-node.js',
          gatsbySSR: '/home/andrew/workspace/react-see-through/gatsby-ssr.js',
          importsJs:
            '/home/andrew/workspace/react-see-through/.docz/app/imports.js',
          rootJs: '/home/andrew/workspace/react-see-through/.docz/app/root.jsx',
          indexJs:
            '/home/andrew/workspace/react-see-through/.docz/app/index.jsx',
          indexHtml:
            '/home/andrew/workspace/react-see-through/.docz/app/index.html',
          db: '/home/andrew/workspace/react-see-through/.docz/app/db.json',
        },
      },
    },
  ],
}

const merge = mergeWith((objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
})

module.exports = merge(config, custom)
