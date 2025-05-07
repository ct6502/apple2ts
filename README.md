# Apple2TS - Apple II Emulator in Typescript

Created by Chris Torrence (chris&lt;at&gt;ct6502&lt;dot&gt;org), with significant contributions from Michael Morrison (codebythepound&lt;at&gt;gmail&lt;dot&gt;com). Thanks also to the Apple II community for feedback, bug reports, and feature requests.

![node.js CI](https://github.com/ct6502/apple2ts/actions/workflows/main-build-deploy.yml/badge.svg)
![build/deploy](https://github.com/chris-torrence/apple2ts/actions/workflows/pages/pages-build-deployment/badge.svg)

This project was originally create using [Create React App](https://github.com/facebook/create-react-app) and was then migrated to [vite](https://vitejs.dev/guide/) following [these steps](https://darekkay.com/blog/create-react-app-to-vite/).

## Development

Be sure to install `node.js` and `npm` on your system using either `nvm` (the Node version manager) or the Node installer. Either one should work fine.

In the project directory, to run the app in development mode:

```
npm install
npm start
```

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

To builds the app for production:

```sh
npm install
npm run build
```

This will create the build in the `dist` folder.
It correctly bundles React in production mode and optimizes the build for best performance. The build is minified and the filenames include hash values. These hashes force the browser to reload when the file content changes, ensure that the filenames are unique, and also verify the integrity of the file.

There should be no errors generated. If you see errors, be sure to check that your version of node and npm are up to date. If there are still errors, contact the author.

**Note**: This project uses Github Pages to host the emulator. You should not need to build the package, except to confirm that the build will work correctly when changes are committed.

### Deployment

When you check in code changes to Github, Github will automatically run one of two workflows. The `main-build-deploy.yml` workflow will run for code checked into the main branch, while `pull-request-build-only.yml` will run for pull requests. The `main-build-deploy.yml` workflow should fire off two Github Actions. The first will build and test the code, while the second (using `npm run deploy`) will deploy the build to Github Pages.

For the Github Actions, the secrets.GH_SECRET needs to be set to your current Personal Access Token. This needs to be regenerated each year. To do this, go under your main profile, choose Developer Settings -> Personal access tokens -> Fine-grained tokens, choose "gp-pages deploy". Choose an expiration date for one year in the future. Copy the new PAT and save it somewhere safe. Once you have the new Github PAT, you can set it on the repo. Under [Settings](https://github.com/ct6502/apple2ts/settings), choose "Secrets and variables" -> "Actions", then click Edit on the GH_SECRET.

## Upgrade Packages

<https://www.hostingadvice.com/how-to/update-npm-packages/>

### Install npm-check-updates package

```sh
npm install -g npm-check-updates
npm outdated
ncu --upgrade
npm install
```

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

## Testing

### If you change disk drive code

1. Press _Boot_ then _Reset_, type some characters, click on _File save_ button, verify `apple2ts.a2ts` is downloaded.
1. Refresh browser, click on File open button, choose downloaded `apple2ts.at2s`, verify state is restored.
1. Refresh browser, click on _Choose Disk Image_ (with all the thumbnails), click on `Total Replay`, verify it loads in hard drive 1.
1. Click on _Choose Disk Image_, click on `MECC Inspector`, verify hard drive is now empty, `MECC` is in floppy drive 1, boots, and loads.
1. Click on _Choose Disk Image_, click on `ProDOS`, verify floppy drive is now empty, `ProDOS` is in hard drive 1, boots, and loads.
1. Left click on hard drive, choose _Save Disk to Device_, pick a new name like `Test.po`, press OK, verify that the disk label changes to the new name.
1. Use down arrow to move down to `BASIC.SYSTEM`, press Enter/Return, verify that system goes to basic prompt.
1. Type:
    ```
    10 PRINT "HELLO"
    SAVE TEST
    ```
1. Confirm that the disk label briefly turns red with an asterisk. After a second or less, the label turns white again, with no asterisk.
1. Refresh browser, click on hard drive 1, choose _Load Disk from Device (Read/Write)_, choose your `Test.po`. After disk boots, verify that your `TEST` file is at the bottom of the file list.

### Cloud Testing

11. Click on hard drive 1, choose either _Save Disk to OneDrive_ or _Google Drive_ (whichever is easier to test). Choose a folder on your cloud drive, verify that blue spinner spins and then stops.
1. Refresh browser, click on hard drive 1, choose _Load Disk from OneDrive/GoogleDrive_, pick your `Test.po` disk. Verify that disk boots and loads.
1. Using same steps as earlier, create a new BASIC program called `CLOUD`. Verify that the disk label turns red with an asterisk. After a minute or less, the label turns white again, with no asterisk.
1. Refresh browser, click on hard drive 1, choose _Load Disk from OneDrive/GoogleDrive_, pick your `Test.po` disk. Verify that disk boots and loads, and the `CLOUD` file is at the bottom of the file list.
1. Click on hard drive 1, select _Add Disk to Collection_.
1. Refresh browser, click on _Choose Disk Image_, select the `Test.po` from the list of starred items, confirm authentication from the cloud server, then verify that the disk boots. 
1. Click on _Choose Disk Image_, click on the "filled star" for `Test.po` to remove it from the list. The disk should immediately disappear from the list.

### Internet Archive Testing

18. Refresh browser, click on hard drive 1, choose _Load Disk from Internet Archive_, choose _Apple II Library: Games_, then choose one of the games by clicking on the thumbnail image. Verify that the game boots.
1. Refresh browser, click on hard drive 1, choose _Load Disk from Internet Archive_, choose _Apple II Library: Games_, then on one of the disk images, click on the bottom portion (tooltip should say _Click to view details_). Verify the IA page for that game opens up in a new tab.
1. Back in the emulator, in the Internet Archive dialog, click on the "unfilled star" for one of the games. Click somewhere else to dismiss dialog. Click on _Choose Disk Image_, verify that the game is at the top of the list. Select it and verify that the game boots.
1. Click on _Choose Disk Image_, click on the "filled star" for the game to remove the game from the list. The game should immediately disappear from the list.


## Localhost Certificates

Gamepads will only work with a secure (https) context.
To enable https when running from localhost, you need to [generate a
certificate](https://flaviocopes.com/react-how-to-configure-https-localhost/)
and [install it on your system](https://flaviocopes.com/macos-install-ssl-local/).

To enable https with vite, use the
[@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) plugin.

## Update CHANGELOG

Install the [Github Changelog Generator](https://github.com/github-changelog-generator/github-changelog-generator) by running:

```sh
gem install github_changelog_generator
```

You may need to update to Ruby v3.x to install this gem.

Go through the commits, and add any missing tags. For a given commit sha (say `1befdec`), checkout the commit, force the date to be the commit date, and then add the tag:

```sh
git checkout 1befdec
GIT_COMMITTER_DATE="$(git show --format=%aD | head -1)"
git tag -a v3.0 -m"v3.0"
git push origin --tags
git checkout main
```

If you don't already have one, [generate a Github token](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20Generator%20token) to run the Changelog Generator script with authentication. You only need "repo" scope for private repositories.

Now run the script:

```sh
github_changelog_generator --token xxxxx -u ct6502 -p apple2ts
```

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

[Turtle icon created by Freepik - Flaticon](https://www.flaticon.com/free-icons/turtle)
