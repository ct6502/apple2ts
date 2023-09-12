# Apple2TS - Apple II Emulator in Typescript

Created by Chris Torrence (chris&lt;at&gt;ct6502&lt;dot&gt;org), with significant contributions from Michael Morrison (codebythepound&lt;at&gt;gmail&lt;dot&gt;com).

![node.js CI](https://github.com/chris-torrence/apple2ts/actions/workflows/node.js.yml/badge.svg)
![build/deploy](https://github.com/chris-torrence/apple2ts/actions/workflows/pages/pages-build-deployment/badge.svg)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available NPM Scripts

In the project directory, you can run:

### `npm install`

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:6502](http://localhost:6502) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## VS Code Chrome Debugging

Stop all running Chrome instances and then:

`/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222`

Use `npm start` to start the running instance.

In launch.json, add a launch configuration:

```json
    {
      "name": "Attach to Chrome",
      "port": 9222,
      "request": "attach",
      "type": "chrome",
      "url": "http://localhost:6502",
      "webRoot": "${workspaceFolder}"
    },

```

## Localhost Certificates

Gamepads will only work with a secure (https) context.
To enable https when running from localhost, you need to [generate a
certificate](https://flaviocopes.com/react-how-to-configure-https-localhost/)
and [install it on your system](https://flaviocopes.com/macos-install-ssl-local/).

## Apple II ROMs

This repository doesn't contain any Apple II ROMs. However, these are fairly easy to find on the web.
To make a ROM image, save the raw binary data from the C000-FFFF ROM in a single file.
Then convert the file to a Base64 encoding. On the Mac, I used the following command:

```sh
    openssl base64 -in rom_2e.bin -out rom_2e.base64.ts
```

Finally, edit the `.ts` file, and change the file to be an exported string variable by prepending:

```ts
    export const rom=`
```

Don't forget to append the trailing back quote ` at the end of the file.

## Apple II 6502 References

[NMOS 6502 Opcodes](http://www.6502.org/tutorials/6502opcodes.html)

[6502 Programmers Reference](https://www.csh.rit.edu/~moffitt/docs/6502.html)

[Assembly Lines: The Complete Book](https://archive.org/details/AssemblyLinesCompleteWagner)

## Flowcharts for Apple II Emulator

![Apple II Emulator - Main Loop](images/Apple%20II%20Emulator%20-%20Main%20Loop.png)

![Process Instruction](images/Process%20Instruction.png)

## Original Create React App README

### Create React App - Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

<https://www.kevinhooke.com/2022/11/10/gp-pages-deploy-fails-when-run-from-github-action-author-identity-unknown/>

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
