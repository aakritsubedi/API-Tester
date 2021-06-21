const storageUtils = {
  get: (key) => {
    return localStorage.getItem(key)
  },
  clear: (key) => {
    if (key) {
      localStorage.removeItem(key)
    }

    localStorage.clear()
  },
  set: (key, value) => {
    localStorage.setItem(key, value)
  },
}

module.exports = storageUtils
