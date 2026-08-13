# Apple2TS - Apple II Emulator in Typescript

Created by Chris Torrence (chris&lt;at&gt;ct6502&lt;dot&gt;org), with significant contributions from @boredsenseless (Lawrence Sanchez), codebythepound (Michael Morrison), and @anomixer. Thanks also to the Apple II community for feedback, bug reports, and feature requests.

Copyright (c) 2026 Chris Torrence and the Apple2TS contributors

Copyright in individual contributions remains with their respective authors. “Apple2TS contributors” does not imply collective ownership of every part of the project or an assignment of contributor copyright.

![node.js CI](https://github.com/ct6502/apple2ts/actions/workflows/main-build-deploy.yml/badge.svg)

This project was originally create using [Create React App](https://github.com/facebook/create-react-app) and was then migrated to [vite](https://vitejs.dev/guide/) following [these steps](https://darekkay.com/blog/create-react-app-to-vite/).

Note: The integrated server and CLI were moved out of this repository into `apple2ts-server`.

## Dynamic Slot Manager

Apple2TS features a flexible **Slot Manager** system allowing real-time configuration of expansion cards across Slots 1 through 7 via the Machine Settings menu:

- **Slot 1**: Super Serial Card (Printer / Serial Communications)
- **Slot 2**: Microsoft Z-80 SoftCard (CP/M), VERA Graphics Card, Passport MIDI Card
- **Slot 3**: Aux Card (128K RAM / 80-Col / dHGR) on Apple IIe; locked to `None` on Apple II+
- **Slot 4**: Mockingboard Sound Card, Apple II Mouse Card, VERA Graphics Card, Microsoft Z-80 SoftCard
- **Slot 5**: Apple II Mouse Card, Mockingboard Sound Card, Microsoft Z-80 SoftCard (Dual Mockingboards supported!)
- **Slot 6**: Disk II Floppy Controller (140KB 5.25" floppies)
- **Slot 7**: SmartPort Hard Drive Card (800KB 3.5" disks, 2MB–32MB hard drive images)

Single-instance cards automatically handle slot exclusivity, and UI peripheral buttons (printer, floppy drives, hard drives) dynamically disable and grey out when their respective slot is set to `None`.

---

## AI Agent Integration

**[AI Agent Integration Guide](src/ui/mcp/README.md)**

Apple2TS includes an integrated AI Agent capable of interacting with the emulator (inspecting CPU registers, viewing screen text, reading/writing memory, managing breakpoints, etc.). It supports:
- Anthropic Claude
- OpenAI ChatGPT
- DeepSeek AI
- Google Gemini
- **Ollama (Local)** (with tool-calling models like `ornith:9b`, `qwen2.5-coder`, etc.)

Refer to the guide above for detailed setup, including environment configurations for local Ollama.

---

## Development

Be sure to install `node.js` and `npm` on your system using either `nvm` (the Node version manager) or the Node installer. Either one should work fine.

In the project directory, to run the app in development mode:

```
npm ci --ignore-scripts
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
npm ci --ignore-scripts
npm run build
```

This will create the build in the `dist` folder.
It correctly bundles React in production mode and optimizes the build for best performance. The build is minified and the filenames include hash values. These hashes force the browser to reload when the file content changes, ensure that the filenames are unique, and also verify the integrity of the file.

There should be no errors generated. If you see errors, be sure to check that your version of node and npm are up to date. If there are still errors, contact the author.

**Note**: This project uses Github Pages to host the emulator. You should not need to build the package, except to confirm that the build will work correctly when changes are committed.

### Deployment

When you check in code changes to Github, Github will automatically run one of two workflows. The `main-build-deploy.yml` workflow will run for code checked into the main branch, while `pull-request-build-only.yml` will run for pull requests. Both workflows lint, build, and test the code. For pushes to `main`, the workflow also deploys the build to Github Pages using the built-in `GITHUB_TOKEN` — no Personal Access Token or repository secret is required.

## Upgrade Packages

<https://www.hostingadvice.com/how-to/update-npm-packages/>

### Install npm-check-updates package

```sh
npm install -g npm-check-updates
npm outdated
ncu --upgrade
npm ci --ignore-scripts
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

### MIDI Testing

Apple2TS uses its built-in software synthesizer by default. Selecting **Enable External MIDI…** from the **Audio Configuration** menu may trigger a browser permission prompt before external MIDI outputs are listed. If the selected output disappears, Apple2TS returns to its built-in synthesizer. On macOS, the [built-in IAC Driver](https://support.apple.com/guide/audio-midi-setup/transfer-midi-information-between-apps-ams1013/mac) can provide virtual MIDI buses for testing.

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

### DemoZoo Testing

The Cloudflare Pages workflow is opt-in and requires the following repository configuration:

- **Required repository variable:** `CLOUDFLARE_PAGES_ENABLED=true`
- **Required repository secret:** `CLOUDFLARE_API_TOKEN`, containing a Cloudflare API token that can deploy to Pages
- **Required repository secret:** `CLOUDFLARE_ACCOUNT_ID`, containing the Cloudflare account ID that owns the Pages project
- **Optional repository variable:** `CLOUDFLARE_PAGES_PROJECT`, containing the existing Cloudflare Pages project name; it defaults to `apple2ts`

The Cloudflare Pages project must be created in the specified Cloudflare account before the workflow runs. The API token and account ID are configured in GitHub under **Settings → Secrets and variables → Actions**. The enable flag and project name are repository variables; the API token and account ID are repository secrets. Repositories that do not set `CLOUDFLARE_PAGES_ENABLED=true` skip the Cloudflare deployment and are unaffected.

1. On the Cloudflare Pages deployment, refresh the browser, click on hard drive 1, choose _Load Disk from DemoZoo_, and verify that the DemoZoo production list opens with screenshots and page navigation.
1. Use the type filters (Demo, Game, Intro, Cracktro, and Music), then open a production and verify that its disk image loads and boots.
1. Open a production with only a YouTube link and verify that the confirmation dialog opens a new browser tab when accepted.
1. Open a production whose DemoZoo download link is an external project page, such as Brutal Deluxe or another provider, and verify that the direct `.dsk`, `.woz`, `.po`, or `.zip` image is discovered and loaded.
1. Test a production with multiple download links where the first source is unavailable, and verify that the next working disk-image link is tried automatically.
1. Refresh the browser and repeat the test with another production to verify that the disk is replaced and the new production boots.
1. On a GitHub Pages deployment, DemoZoo can be enabled with an external proxy. Set these repository variables under **Settings → Secrets and variables → Actions → Variables**:
   - `VITE_DEMOZOO_ENABLED=true`
   - `VITE_DEMOZOO_PROXY_URL=https://<your-proxy-project>.pages.dev`
   The proxy project must expose the DemoZoo and disk proxy endpoints used by Apple2TS. The frontend then routes DemoZoo/API, external download-page, and disk-image requests through that proxy, avoiding browser CORS restrictions.
2. On the Cloudflare Pages deployment, DemoZoo uses the same-origin Pages Functions and does not require `VITE_DEMOZOO_PROXY_URL`. Verify that the DemoZoo production list opens with screenshots and page navigation.


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

If you don't already have one, [generate a Github token](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20Generator%20token) to run the Changelog Generator script with authentication. You only need "repo" scope for private repositories.

To retroactively generate a changelog, first go through the commits, and add any missing tags. For a given commit sha (say `1befdec`), checkout the commit, force the date to be the commit date, and then add the tag:

```sh
git checkout 1befdec
GIT_COMMITTER_DATE="$(git show --format=%aD | head -1)"
git tag -a v1.2.3 -m"v1.2.3"
git push origin --tags
git checkout main
```

Do this repeatedly until you've added all of your missing tags.

To create or update the changelog, run the script:

```sh
# Extract version from package.json
(optional) npm version patch (or minor/major) - do not do "git tag"
VERSION=$(node -p "require('./package.json').version")
# Generate changelog with the version from package.json
github_changelog_generator --token $GITHUB_TOKEN -u ct6502 -p apple2ts --future-release "v$VERSION"
git add .
git commit -m "Update CHANGELOG for v$VERSION"
# Now create and push the tag (skip this line if you did npm version ...)
git tag -a "v$VERSION" -m"v$VERSION"
git push --follow-tags
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

## Major Contributors

Chris Torrence — Project creator and primary maintainer, responsible for the core Apple II emulator architecture, CPU, graphics, disk support, UI, etc.

Lawrence Sanchez (boredsenseless) — Built and maintains the disk collection/launcher system, including cloud drive support, Internet Archive and favorites, and HDV export functionality.

Mike Morrison (code-bythepound) — Hardware card emulation including the VERA display adapter, SuperSerial card and ImageWriter, and MIDI support.

anomixer — Full internationalization (i18n) with 13 languages, improved joystick/numpad input handling, and integrated Ollama and Google Gemini AI providers.

Dongsu Jang — Implemented a CLI/server interface with REST APIs.

3AMCinnamonRoll — Fixed raster timing, stabilized the memory map UI, added keyboard mode selection, improved HGR/DHGR frame exports, and improve CI/linting.

## Additional Info and Sponsors

<a href="https://corsfix.com"><img src="public/assets/corsfix.png" alt="Corsfix" width="32" style="vertical-align: middle"></a> [CORS Proxy by Corsfix](https://corsfix.com)

Silver CJK Pixel Font is courtesy of [Poppy Works](https://poppyworks.itch.io/silver), and is used under a CC BY 4.0 license.

[Turtle icon created by Freepik - Flaticon](https://www.flaticon.com/free-icons/turtle)
