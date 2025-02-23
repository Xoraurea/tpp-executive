# Welcome to Executive!

Executive is a first-of-its-kind third-party mod loader for The Political Process, allowing players to install modifications which customise and add new functionality to the game. *Executive is not affiliated with Verlumino or The Political Process.*

- [Welcome to Executive!](#welcome-to-executive)
  - [Setting up Executive](#setting-up-executive)
    - [Copying files](#copying-files)
    - [Modifying index.html and package.json](#modifying-indexhtml-and-packagejson)
    - [Installing mods](#installing-mods)
  - [Creating mods for Executive](#creating-mods-for-executive)
    - [Installing the nw.js SDK](#installing-the-nwjs-sdk)
    - [Creating a new mod](#creating-a-new-mod)

## Setting up Executive

Installing Executive is as easy as copying the mod loader's files to your game directory and making two small modifications to existing files. Your game folder can be found by opening your Steam library, right-clicking on `The Political Process`, opening `Properties`, navigating to `Installed Files` and then clicking `Browse`. For most people, the directory this opens will be at `C:\Program Files (x86)\Steam\steamapps\common\The Political Process`.

1. Copy `executive.js`, the `modFiles` directory and the `executive` directory to your game folder.
2. Add three lines to the pre-existing `index.html` file in the game folder.
3. Modify the `package.json` file with one additional line.
4. Add mods and play!

### Copying files

Once you've opened your game folder, download the most recent release of Executive compatible with your game version from the sidebar and extract it wherever you like. The first decimal place of the game version is the most important in determining compatibility – for example, an Executive release targeted at The Political Process 0.307 will likely work with The Political Process 0.31 without major issues.

From the files extracted, copy `executive.js`, the `modFiles` folder and the `executive` folder to the game folder you opened before. If `package.json` and `index.html` are amongst the extracted files, you can copy these too, overwriting the existing versions, and skip to [Installing mods](#installing-mods).

If your download doesn't contain `package.json` and `index.html`, you now need to modify the necessary files to load Executive.

### Modifying index.html and package.json

For Executive to load successfully, you'll need to copy three lines into two game files – future releases of Executive will likely include an install script to simplify this process. This step **must** be repeated if The Political Process updates or you reverify your game files in Steam.

The first file to modify is `index.html`. Open the file in any text editor, and scroll down until you find the line containing nothing except `<script>`. Paste the following two lines *below* the `<script>` line.

```
{ const fs = nw.require('fs');
globalThis.preGlobals = Object.keys(globalThis);
```

Once you've pasted these lines in, the start of the section should match the following.

```
<script>
    { const fs = nw.require('fs');
      globalThis.preGlobals = Object.keys(globalThis);

      nw.Window.get().evalNWBin(null, 'binFiles/variables.bin');
```

After pasting these two lines, scroll down to the line containing nothing except `</script>`. Once you're there, paste the following snippet **above** (not below) the `</script>` line.

```
nw.Window.get().eval(null, fs.readFileSync("executive.js", "utf-8")); };
```

Once you've pasted this line in, the end of the section should match the following.

```
    nw.Window.get().evalNWBin(null, 'binFiles/uiMenus.bin');
    nw.Window.get().eval(null, fs.readFileSync("executive.js", "utf-8")); };
</script>
```

Once you're done, save the file and close it. You can now move on to `package.json`, which only requires one modification. Find the line containing `"main": "index.html",` and insert a new line below, pasting the following snippet.

```
"chromium-args": "--mixed-context",
```

Save this file and close it.

### Installing mods

**You've now successfully installed Executive!** To test your modded copy of the game, open it in Steam – you should see a `Mods` button added to the main menu, and the version string shown in the bottom right should now also contain the Executive version and the number of mods loaded (one, for now).

You're now ready to install mods! Mods are stored as folders in `modFiles`, containing at least a `main.js` and a `manifest.json` file. You can name the containing folder whatever you want, but it'll likely be helpful to name it something specific to the mod it contains. If you'd like some mods to get started with, check out [this](https://github.com/Xoraurea/my-tpp-mods) repository.

**Security Notice:** As with any computer program, by installing mods, you are granting the developer(s) of the mod the ability to run code and access files on your computer. Do **not** install a mod if you do not trust its source or its developer(s). The Executive project holds no responsibility or liability for the result of installing third-party modifications.

Once you've found a mod you'd like to use, download it and copy the folder containing `main.js` and `manifest.json` to `modFiles` in the game folder. No further setup is needed – Executive will automatically detect and load the mod when you next install the game.

## Creating mods for Executive

Creating a mod for The Political Process with Executive is accessible for anyone with moderate knowledge of JavaScript and HTML/CSS. As the game utilises nw.js, a framework based on Chromium and Node.js, working on mods within the game is akin to working on a web app.

### Installing the nw.js SDK

The first step to create a mod is to install the SDK release of nw.js – this allows for use of the Inspector within the game. Navigate to https://dl.nwjs.io and grab the Windows SDK release of nw.js v0.41.2 for x64 – incompatibility of the game's compiled bytecode will likely prevent the use of other versions of nw.js. Once the archive has downloaded, copy and paste its contents over the folder for The Political Process, replacing any files necessary. After doing this, opening The Political Process and right-clicking in-game will provide the `Inspect element` option.

### Creating a new mod

The first step to creating a new mod is to navigate to the `modFiles` folder in your game folder and clone the template repository for an Executive mod. If you have Git installed on your system, this can be done by running `git clone https://github.com/Xoraurea/tpp-template-mod.git` in the `modFiles` folder. The template mod files will be placed in `tpp-template-mod`, which can be renamed as you wish.

The first file to edit is `manifest.json`. This file tells Executive about your mod.

- `id` should be changed to a unique identifier for your mod.
- `name`, `description` and `author` are included for the benefit of the mod list and can be set to whatever you like. 
- `version` describes the semantic version of the mod. Executive uses a mod folder's semantic version to resolve conflicts between mods with equal IDs – the newer version of a mod will always take precedence over the older version. 
- `required_loader_version` describes the minimum version of Executive required to run the mod. If the version of Executive is lower than the version required by the mod, Executive will refuse to load it.

Your mod is now ready to run. Start the game now – if all has gone well, you should see a dialog saying "Hello, Executive world!". Now, with your `manifest.json` set up, you're free to begin writing code for your mod! Open `main.js` in your editor of choice and begin the [Getting Started](documentation/executive/tutorials/getting-started.md) tutorial.