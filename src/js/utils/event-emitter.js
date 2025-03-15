export default class EventEmitter {
  constructor() {
    this.callbacks = {}
    this.callbacks.base = {}
  }

  on(_names, callback) {
    // Errors
    if (_names === undefined || _names === '') {
      console.warn('wrong names')
      return false
    }

    if (callback === undefined) {
      console.warn('wrong callback')
      return false
    }

    // Resolve names
    const names = this.resolveNames(_names)

    // Each name
    for (const _name of names) {
      // Resolve name
      const name = this.resolveName(_name)

      // Create namespace if not exist
      if (!(this.callbacks[name.namespace] instanceof Object))
        this.callbacks[name.namespace] = {}

      // Create callback if not exist
      if (!Array.isArray(this.callbacks[name.namespace][name.value]))
        this.callbacks[name.namespace][name.value] = []

      // Add callback
      this.callbacks[name.namespace][name.value].push(callback)
    }

    return this
  }

  off(_names) {
    // Errors
    if (_names === undefined || _names === '') {
      console.warn('wrong name')
      return false
    }

    // Resolve names
    const names = this.resolveNames(_names)

    // Each name
    for (const _name of names) {
      // Resolve name
      const name = this.resolveName(_name)

      // Remove namespace
      if (name.namespace !== 'base' && name.value === '') {
        delete this.callbacks[name.namespace]
      }

      // Remove specific callback in namespace
      else {
        // Default
        if (name.namespace === 'base') {
          // Try to remove from each namespace
          for (const namespace in this.callbacks) {
            if (
              this.callbacks[namespace] instanceof Object
              && Array.isArray(this.callbacks[namespace][name.value])
            ) {
              delete this.callbacks[namespace][name.value]

              // Remove namespace if empty
              if (Object.keys(this.callbacks[namespace]).length === 0)
                delete this.callbacks[namespace]
            }
          }
        }

        // Specified namespace
        else if (
          this.callbacks[name.namespace] instanceof Object
          && Array.isArray(this.callbacks[name.namespace][name.value])
        ) {
          delete this.callbacks[name.namespace][name.value]

          // Remove namespace if empty
          if (Object.keys(this.callbacks[name.namespace]).length === 0)
            delete this.callbacks[name.namespace]
        }
      }
    }

    return this
  }

  trigger(_name, _arguments) {
    // Errors
    if (_name === undefined || _name === '') {
      console.warn('wrong name')
      return false
    }

    let finalResult
    let result

    // Default args
    const arguments_ = Array.isArray(_arguments) ? _arguments : []

    // Resolve names (should on have one event)
    let name = this.resolveNames(_name)

    // Resolve name
    name = this.resolveName(name[0])

    // Default namespace
    if (name.namespace === 'base') {
      // Try to find callback in each namespace
      for (const namespace in this.callbacks) {
        if (
          this.callbacks[namespace] instanceof Object
          && Array.isArray(this.callbacks[namespace][name.value])
        ) {
          const callbacks = this.callbacks[namespace][name.value]
          for (const callback of callbacks) {
            result = callback.apply(this, arguments_)
            if (finalResult === undefined) {
              finalResult = result
            }
          }
        }
      }
    }

    // Specified namespace
    else if (this.callbacks[name.namespace] instanceof Object) {
      if (name.value === '') {
        console.warn('wrong name')
        return this
      }
      const callbacks = this.callbacks[name.namespace][name.value]
      for (const callback of callbacks) {
        result = callback.apply(this, arguments_)

        if (finalResult === undefined)
          finalResult = result
      }
    }

    return finalResult
  }

  resolveNames(_names) {
    let names = _names
    names = names.replaceAll(/[^\d ,./A-Z]/gi, '')
    names = names.replaceAll(/[,/]+/g, ' ')
    names = names.split(' ')

    return names
  }

  resolveName(name) {
    const newName = {}
    const parts = name.split('.')

    newName.original = name
    newName.value = parts[0]
    newName.namespace = 'base' // Base namespace

    // Specified namespace
    if (parts.length > 1 && parts[1] !== '') {
      newName.namespace = parts[1]
    }

    return newName
  }
}
