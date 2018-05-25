'use strict'

const axios = require('axios')
const semver = require('semver')
const NPM_REGISTRY = `http://registry.npmjs.org`
const NPM_REGISTRY_API = `https://api.npmjs.org`

class PackageRepoUtils {
  constructor (options = {}) {
    this.registryUrl = options.registryUrl ? options.registryUrl : NPM_REGISTRY
    this.registryApiUrl = options.registryApiUrl
      ? options.registryApiUrl
      : NPM_REGISTRY_API
    this.pkgInfoCache = {}
  }

  formatPackageForUrl (pkg) {
    return pkg.replace('/', '%2F')
  }

  getPackageInfo (pkg) {
    if (this.pkgInfoCache[pkg]) {
      return Promise.resolve(this.pkgInfoCache[pkg])
    } else {
      return axios
        .get(`${this.registryUrl}/${this.formatPackageForUrl(pkg)}`)
        .then(response => {
          this.pkgInfoCache[pkg] = response.data
          return response.data
        })
    }
  }

  getLatestVersion (pkg) {
    return axios
      .get(`${this.registryUrl}/${this.formatPackageForUrl(pkg)}`)
      .then(response => {
        return response.data['dist-tags'] &&
          response.data['dist-tags']['latest']
          ? response.data['dist-tags']['latest']
          : null
      })
  }

  getDownloadInfo (pkg) {
    return axios
      .get(`${this.registryApiUrl}/downloads/point/last-month/${pkg}`)
      .then(response => {
        return response.data['downloads']
      })
  }

  getReadmeInfo (pkg) {
    return axios
      .get(`${this.registryUrl}/${this.formatPackageForUrl(pkg)}`)
      .then(response => {
        return response.data['readme']
      })
  }

  parsePackageVersion (version) {
    return semver.coerce(version)
  }
}

module.exports = PackageRepoUtils
