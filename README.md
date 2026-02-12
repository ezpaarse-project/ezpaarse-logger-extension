# ezpaarse-logger-extension

Companion extension for [ezPAARSE logger](https://analyses.ezpaarse.org/ezlogger), which helps ezPAARSE contributors in analyzing platform URLs.
The extension captures the web traffic of the browser and sends it to the web app, so that users can analyze it with ezPAARSE.

## Screenshots

![extension screenshot](./store-assets/screenshot_01.jpg)
![web app screenshot](./store-assets/screenshot_02.jpg)

## Installation

- Google Chrome: get it from the [WebStore](https://chrome.google.com/webstore/detail/ezpaarse-logger-extension/cpjllnfdfhkmbkplldfndmfdbabcbidc)
- Firefox: grab the latest XPI file from [here](https://github.com/ezpaarse-project/ezpaarse-logger-extension/releases)

## Running in dev mode

> [!NOTE]
> Requirements: Node >=20.19.0

1. Install NPM packages

```Shell
npm install
```

2. Run

```Shell
# Chrome/Chromium
npm run dev

# Firefox
npm run dev:firefox
```

**Note:**  
To run the extension with another Chromium-based browser, set the `CHROME_PATH` environment variable with the path to the browser executable. You can also save it in a `.env` file.

Example:
```Shell
CHROME_PATH=/usr/bin/brave-browser
```

## Build for production

The following command builds the extension for production, and generates ZIP archives to be published on the stores. For the Firefox build, a source ZIP is also generated.

Files are generated into the `.output` directory.

```Shell
npm run zip
```

Alternatively, you can build for a specific browser :

```Shell
# Build for Chrome
npm run zip

# Build for Firefox only
npm run zip:firefox
```


## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar).
