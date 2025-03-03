<p align="center">
  <img src="https://user-images.githubusercontent.com/2793951/54391096-418f4500-46a4-11e9-8d0c-b00ff7ba4198.png" alt="flydrive">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kodepandai/flydrive-gcs"><img src="https://img.shields.io/npm/dm/@kodepandai/flydrive-gcs.svg?style=flat-square" alt="Download"></a>
  <a href="https://www.npmjs.com/package/@kodepandai/flydrive-gcs"><img src="https://img.shields.io/npm/v/@kodepandai/flydrive-gcs.svg?style=flat-square" alt="Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/@kodepandai/flydrive-gcs.svg?style=flat-square" alt="License"></a>
</p>

`flydrive` is a framework-agnostic package which provides a powerful wrapper to manage file Storage in [Node.js](https://nodejs.org).

This package is the driver for Google Cloud Storage.

---

## Getting Started

This package is available in the npm registry.
It can easily be installed with `npm` or `yarn`.

```bash
$ npm i @kodepandai/flydrive-gcs
# or
$ yarn add @kodepandai/flydrive-gcs
```

```javascript
const { GoogleCloudStorage } = require('@kodepandai/flydrive-gcs');
const { StorageManager } = require('@kodepandai/flydrive');
const storage = new StorageManager({
  // ...

  gcs: {
    driver: 'gcs',
    config: {
      keyFilename: process.env.GCS_KEYFILENAME,
      bucket: process.env.GCS_BUCKET,
    },
  },
});

storage.registerDriver('gcs', GoogleCloudStorage);
```
