# ezpaarse-logger-extension

Firefox and Chrome extension used to help ezPAARSE contributors for analyzing platforms URLs.

It's a companion extension for [ezPAARSE logger](https://github.com/ezpaarse-project/ezpaarse-logger).


## Building

### Chrome



### Firefox

1. Get API keys

Connect to [Mozilla Addons](https://addons.mozilla.org/fr/developers/addons), get a JWT issuer and secret and put them in the `AMO_API_KEY` and `AMO_API_SECRET` environnement variables.

2. Adapt the manifest file

As of now, firefox does not support service_workers. Therefore, `"service_worker": "background.js"` should be manually replaced by `"scripts": ["background.js"]` in the `manifest.json` before building the extension.

3. Build the extension

```bash
make sign
```

The XPI file will be generated in the `web-ext-artifacts` directory.

## Installation

- Google Chrome: get it from the [WebStore](https://chrome.google.com/webstore/detail/ezpaarse-logger-extension/cpjllnfdfhkmbkplldfndmfdbabcbidc)
- Firefox: grab the latest XPI file from [here](https://github.com/ezpaarse-project/ezpaarse-logger-extension/releases)
