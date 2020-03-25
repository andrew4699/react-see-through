# React NPM Package Boilerplate

Boilerplate code for publishing a React NPM package.

* Bundled with [Webpack](https://webpack.js.org/)
* Develop with Hot Module Replacement [(HMR)](https://webpack.js.org/concepts/hot-module-replacement/)
* Includes linting with [ESLint](http://eslint.org/)
* Testing with [Jest](http://facebook.github.io/jest/).

## Usage

1. Install modules - `yarn`

2. Start example and start coding - `yarn start`

3. Run tests - `yarn test`

4. Bundle with - `yarn build`

5. To test if it works correctly in another project you can use npm `npm install -S ../react-npm-component-boilerplate` Note the relative path

E.g. this folder structure

```
    ./workspace/
        MyProject
        react-npm-boilerplate
```

## Extra

Adjust your `.eslintrc` config file to your own preference.

## NPM equivalent

yarn | npm
---- | ---
`yarn` | `npm install`
`yarn test` | `npm run test`
`yarn build` | `npm run build`

## License

MIT © Dinesh Pandiyan