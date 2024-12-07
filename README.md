# Apple2TS - Apple II Emulator in Typescript

Created by Chris Torrence (chris&lt;at&gt;ct6502&lt;dot&gt;org), with significant contributions from Michael Morrison (codebythepound&lt;at&gt;gmail&lt;dot&gt;com). Thanks also to the Apple II community for feedback, bug reports, and feature requests.

![node.js CI](https://github.com/ct6502/apple2ts/actions/workflows/main-build-deploy.yml/badge.svg)
![build/deploy](https://github.com/chris-torrence/apple2ts/actions/workflows/pages/pages-build-deployment/badge.svg)

This project was originally create using [Create React App](https://github.com/facebook/create-react-app) and was then migrated to [vite](https://vitejs.dev/guide/) following [these steps](https://darekkay.com/blog/create-react-app-to-vite/).

## Development

Be sure to install `node.js` and `npm` on your system using either `nvm` (the Node version manager) or the Node installer. Either one should work fine.

In the project directory, run:

`npm install`

To run the app in development mode:

`npm start`

This should automatically open your browser to [http://localhost:6502](http://localhost:6502).

The page will reload when you make changes. You may also see any lint errors in the console.

### Emulator Settings

You can append parameters to the URL (to control say the emulator speed or the starting disk image) by using the following syntax:

`npm start --urlparam=<parameters>`

For example:

`npm start --urlparam=speed=fast#Replay`

This will start the emulator in fast mode and load the Total Replay disk image.

### Testing

Runs all of the jest unit tests:

`npm test`

Run a single test:

`npm test memory.test.ts`

Run in watch mode:

`npm test -- --watch`

### Building the Package

`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for best performance.

The build is minified and the filenames include hash values. These hashes force the browser to reload when the file content changes, ensure that the filenames are unique, and also verify the integrity of the file.

**Note**: This project uses Github Pages to host the emulator. You should not need to build the package, except to confirm that the build will work correctly when changes are committed.

### Deployment

When you check in code changes to Github, Github will automatically run one of two workflows. The `main-build-deploy.yml` workflow will run for code checked into the main branch, while `pull-request-build-only.yml` will run for pull requests. The `main-build-deploy.yml` workflow should fire off two Github Actions. The first will build and test the code, while the second (using `npm run deploy`) will deploy the build to Github Pages.

## Upgrade Packages

<https://www.hostingadvice.com/how-to/update-npm-packages/>

### Install npm-check-updates package

`npm install -g npm-check-updates`

`npm outdated`

`ncu --upgrade`

`npm install`

## VS Code Chrome Debugging

The `launch.json` file contains the debug configurations and should not need to be modified.

To debug the emulator, open the Run/Debug panel and click the "Launch Chrome" play button. Or simply press the `F5` key.

Any debug output or console.log messages should appear in the Debug Console. You should also be able to set breakpoints in the code, examine variable values, and execute simple JavaScript statements in the Debug Console.

## Android Chrome Debugging

Using Android Studio, create a new device (like a phone), start the device.

Start the emulator with `npm run host` to make the application available to the network. You must do this - you cannot run on `localhost:6502` or `10.0.2.2:6502` on Android (it's some conflict with vite and chrome).

Navigate to the provided URL - it will be something like `10.0.0.xxx:6502`.

On your Desktop Chrome, go to `chrome://inspect/#devices` and then choose the appropriate "Remote Target".

## iOS Debugging

<https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios>

## Jest Test Debugging in VS Code

In VS Code, add breakpoints to the test code. Then open up `package.json`, hover over
the "test" script, and select 'Debug Script'.

## Localhost Certificates

Gamepads will only work with a secure (https) context.
To enable https when running from localhost, you need to [generate a
certificate](https://flaviocopes.com/react-how-to-configure-https-localhost/)
and [install it on your system](https://flaviocopes.com/macos-install-ssl-local/).

## Apple II ROMs

To make a ROM image, save the raw binary data from the C000-FFFF ROM in a single file.
Then convert the file to a Base64 encoding. On the Mac, you can use the following command:

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

## Additional Info and Sponsors

[![sponsored-by-grida](https://s3.us-west-1.amazonaws.com/brand.grida.co/badges-for-github/sponsored-by-grida-oss-program.png)](https://grida.co)
