var Conn = (function () {
  var $rdf = window.$rdf

  // constants
  // const appContainer = 'credentials'
  const appUrl = document.location.protocol + '//' + document.location.host +
                document.location.pathname

  // init static elements
  var signin = document.getElementById('signin')
  var welcome = document.getElementById('welcome')
  var start = document.getElementById('start')
  var search = document.getElementById('search')
  var searchElement = document.getElementById('search-area')
  var clearSearch = document.getElementById('clear-search')
  var cancelViews = document.getElementsByClassName('cancel-view')
  var noUsersFound = document.getElementById('no-users')
  var authorization = document.getElementById('authorization')
  var authorizations = document.getElementById('authorizations')
  var authInfo = document.getElementById('auth-info')
  var extendedInfo = document.getElementById('extended-info')
  var actionsElement = document.getElementById('actions')
  var feedback = document.getElementById('feedback')
  var newModal = document.getElementById('new')
  var overlay = document.getElementById('overlay')
  var infoButtons = document.getElementById('info-buttons')
  var cancelNewBtn = document.getElementsByClassName('cancel-new')
  var showNewModal = document.getElementsByClassName('show-new')
  var lookupElement = document.getElementById('lookup')

  var Solid = require('solid')

  // User object
  // var User = {}
  var User = {
    webid: 'https://deiu.me/profile#me',
    authList: 'https://deiu.me/Private/credentials.ttl'
  }
  // Map of Authorizations
  var Authorizations = {}

  // ------------ URL QUERY VALUES ------------
  // Map URL query items to their values
  // e.g. ?referrer=https... -> queryVals[referrer] returns 'https...'
  var queryVals = (function (a) {
    if (a === '') return {}
    var b = {}
    for (var i = 0; i < a.length; ++i) {
      var p = a[i].split('=', 2)
      if (p.length === 1) {
        b[p[0]] = ''
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '))
      }
    }
    return b
  })(window.location.search.substr(1).split('&'))

  // ------------ LIST CONF ------------
  var authTemplate = '<div class="auth-card pointer center">' +
    '<div class="authz tooltip" data-tooltip="View details">' +
    '<div class="column center">' +
    ' <div class="desc"></div>' +
    ' <div class="grey smaller origin"></div>' +
    ' <div class="grey smaller">Added on: <span class="date"></span></div>' +
    '</div>' +
    '</div>' +
  '</div>'

  var searchFields = ['origin', 'desc']
  var items = [
    {
      authz: 'https://abc#1',
      desc: 'Bob\'s personal server',
      origin: 'https://local1.databox.me:8443/',
      date: 'Monday, June 20 2016'
    },
    {
      authz: 'https://abc#2',
      desc: 'Alice\'s databox',
      origin: 'https://local2.databox.me:8443/',
      date: 'Wednesday, May 16th 2016'
    }
  ]
  // ------------ END LIST CONF ------------

  // ------------ TYPE REGISTRY ------------
  // Discovers where connections data is stored using the type registry
  // (also triggers a registration if no locations are found)
  // var registerApp = function (webid) {
  //   status.innerHTML = newStatus('Loading your profile data...')
  //   return Solid.identity.getProfile(webid)
  //     .then(function (profile) {
  //       var localUser = importSolidProfile(profile)
  //       User.webid = profile.webId
  //       User.name = localUser.name
  //       User.inbox = localUser.inbox
  //       // We need to register
  //       status.innerHTML = newStatus('Loading app data registry...')
  //       if (!profile.typeIndexListed.uri) {
  //         console.log('No registry found')
  //         // Create typeIndex
  //         profile.initTypeRegistry().then(function (profile) {
  //           registerType(profile)
  //         })
  //       } else {
  //         console.log('Found registry', profile.typeIndexListed.uri)
  //         // Load registry and find location for data
  //         // TODO add ConnectionsIndex to the solid terms vocab
  //         profile.loadTypeRegistry()
  //           .then(function (profile) {
  //             var privIndexes = profile.typeRegistryForClass(Solid.vocab.solid('PrivateConnections'))
  //             var pubIndexes = profile.typeRegistryForClass(Solid.vocab.solid('PublicConnections'))
  //             if (pubIndexes.concat(privIndexes).length === 0) {
  //               // register
  //               registerType(profile)
  //             } else {
  //               User.pubIndexes = pubIndexes
  //               User.privIndexes = privIndexes
  //               loadConnections()
  //             }
  //           })
  //           .catch(function (err) {
  //             console.log('Could not load type registry:', err)
  //           })
  //       }
  //     })
  //     .catch(function (err) {
  //       console.log('Could not load profile:', err)
  //       addFeedback('error', 'Could not load profile data')
  //     })
  // }

  // Register the app data location with the type registry
  // TODO this belongs in Solid.js
  // var registerType = function (profile) {
  //   if (profile.storage.length > 0) {
  //     status.innerHTML = newStatus('Creating app storage...')
  //     Solid.web.createContainer(profile.storage, appContainer, {}).then(function (meta) {
  //       var classToRegister = Solid.vocab.solid('PrivateConnections')
  //       // TODO add UI for storage selection
  //       var dataLocation = Solid.util.absoluteUrl(profile.storage[0], meta.url)
  //       var slug = 'privIndex.ttl'
  //       var isListed = false
  //       // create the index documents
  //       status.innerHTML = newStatus('Initializing app data registry (1/4)...')
  //       Solid.web.post(dataLocation, null, slug).then(function (response) {
  //         status.innerHTML = newStatus('Initializing app data registry (2/4)...')
  //         var location = Solid.util.absoluteUrl(dataLocation, response.url)
  //         profile.registerType(classToRegister, location, 'instance', isListed).then(function (profile) {
  //           var privIndexes = profile.typeRegistryForClass(Solid.vocab.solid('PrivateConnections'))
  //           classToRegister = Solid.vocab.solid('PublicConnections')
  //           // TODO add UI for storage selection
  //           var location = Solid.util.absoluteUrl(profile.storage[0], meta.url)
  //           slug = 'pubIndex.ttl'
  //           isListed = true
  //           status.innerHTML = newStatus('Initializing app data registry (3/4)...')
  //           Solid.web.post(dataLocation, null, slug).then(function (response) {
  //             status.innerHTML = newStatus('Initializing app data registry (4/4)...')
  //             location = Solid.util.absoluteUrl(dataLocation, response.url)
  //             profile.registerType(classToRegister, location, 'instance', isListed).then(function (profile) {
  //               var pubIndexes = profile.typeRegistryForClass(Solid.vocab.solid('PublicConnections'))
  //               User.webid = profile.webId
  //               User.pubIndexes = pubIndexes
  //               User.privIndexes = privIndexes
  //               loadConnections()
  //             })
  //             .catch(function (err) {
  //               console.log('Could not create public data registry:', err)
  //               addFeedback('error', 'Could not create public data registry')
  //             })
  //           })
  //           .catch(function (err) {
  //             console.log('Could not create public connection index:', err)
  //             addFeedback('error', 'Could not create public connection index')
  //           })
  //         })
  //         .catch(function (err) {
  //           console.log('Could not create private data registry:', err)
  //           addFeedback('error', 'Could not create private data registry')
  //         })
  //       }).catch(function (err) {
  //         console.log('Could not create private connection index:', err)
  //         addFeedback('error', 'Could not create private connection index')
  //       })
  //     })
  //     .catch(function (err) {
  //       console.log('Could not create data folder for app:', err)
  //       addFeedback('error', 'Could not create data folder for app')
  //     })
  //   }
  // }

  // -------------- END TYPE REGISTRY --------------

  // -------------- SEARCH LIST --------------
  // Search the connections list for a given value
  // @param fields {array}
  var searchList = function (fields) {
    fields = fields || searchFields
    var searchVal = document.getElementById('search').value
    if (searchVal.length > 0) {
      showElement(clearSearch)
    } else {
      hideElement(clearSearch)
    }
    if (searchVal.length >= 2) {
      uList.search(searchVal, fields)
      if (uList.visibleItems.length === 0) {
        showElement(noUsersFound)
      }
    } else {
      hideElement(noUsersFound)
      uList.search()
    }
  }

  // Reset/clear search field and show/hide elements
  var clearSearchList = function () {
    hideElement(clearSearch)
    hideElement(noUsersFound)
    search.value = ''
    uList.search()
  }

  // -------------- ADD/REMOVE AUTHORIZATIONS --------------
  var requestAuthz = function (uris) {
    var refAppUrl = queryVals['app']
    var refAppElem = document.getElementById('appUrl')
    refAppElem.innerHTML = refAppUrl

    authInfo.innerHTML = '<p><strong>External sites:</strong></p>'
    uris.forEach(function (uri) {
      authInfo.innerHTML += '<div>' +
      '<label for="' + uri + '">' +
      ' <input type="checkbox" name="origin" value="' + uri + '" id="' + uri + '" checked> ' + uri +
      '</label>'
      '</div>'
    })
    var tellMore = document.getElementById('tell-more')
    tellMore.addEventListener('click', function () {
      showElement(authInfo)
    })
    showModal()
  }

  var loadList = function () {
    if (!User.authList) {
      hideElement(signin)
      console.log('No data source provided for loading connections')
      return
    }

    hideElement(signin)

    // Handle routes/states
    var toAuth = queryVals['app']
    if (toAuth && toAuth.length > 0) {
      requestAuthz(['https://local1.databox.me:8443/', 'https://local2.databox.me:8443/'])
    }

    // done loading
    return Solid.web.get(User.authList)
      .then(function (response) {
        var g = response.parsedGraph()
        var connections = g.statementsMatching(
          undefined,
          Solid.vocab.rdf('type'),
          Solid.vocab.solid('Connection')
        )
        connections.forEach(function (person) {
          var profile = {}
          profile.webid = person.subject.uri
          profile.graph = g.statementsMatching(person.subject, undefined, undefined)
          var name = g.any(person.subject, Solid.vocab.foaf('name'))
          if (name) {
            profile.name = name.value
          }
          var picture = g.any(person.subject, Solid.vocab.foaf('img'))
          if (picture) {
            profile.picture = picture.uri
          }
          addToList(profile)
        })
        return connections.length
      })
      .catch(function () {
        // TODO handle errors in case of missing index files or no access
        return 0
      })
  }

  // Add a new connection to the index document
  // @param profile {object} Contains fields contained in the index document
  // @param isPublic {bool} If true, add the connection to the public index instead
  var addConnection = function (profile, isPublic) {
    // var indexType = (isPublic) ?
    var g = $rdf.graph()
    var webid = $rdf.sym(profile.webid)
    g.add(
      webid,
      Solid.vocab.rdf('type'),
      Solid.vocab.solid('Connection')
    )
    if (profile.name) {
      g.add(
        webid,
        Solid.vocab.foaf('name'),
        $rdf.lit(profile.name)
      )
    }
    if (profile.picture) {
      g.add(
        webid,
        Solid.vocab.foaf('img'),
        $rdf.sym(profile.picture)
      )
    }
    var toAdd = []
    var toDel = null
    profile.graph = g.statementsMatching(webid, undefined, undefined)
    profile.graph.forEach(function (st) {
      toAdd.push(st.toNT())
    })
    if (User.pubIndexes.length === 0 && User.privIndexes) {
      console.log('Error saving new contact. Could not find an index document to store the new connection.')
      addFeedback('error', 'Error saving new contact')
      return
    }
    var defaultIndex
    if (User.privIndexes.length > 0 && User.privIndexes[0].locationUri) {
      defaultIndex = User.privIndexes[0].locationUri
    }
    if (isPublic &&
      User.pubIndexes.length > 0 && User.pubIndexes[0].locationUri) {
      defaultIndex = User.pubIndexes[0].locationUri
    }
    profile.locationUri = defaultIndex
    Solid.web.patch(defaultIndex, toDel, toAdd)
      .then(function () {
        // Update the profile object with the new registry without reloading
        addToList(profile, 'name', 'asc', true)
      })
      .catch(function (err) {
        console.log('Error saving new contact:' + err)
        addFeedback('error', 'Error saving new contact')
      })
  }

  // Add the new connection to the list and sort the list
  // @param profile {object} Contains fields contained in the index document
  // @param sort {string} Value to use for sorting (name, email, etc.)
  // @param order {string} Value to use for ordering (asc / desc)
  // @param verbose {bool} If true, show feedback to the user
  var addToList = function (authz, sort, order, verbose) {
    sort = sort || 'name'
    order = order || 'asc'

    showElement(lookupElement)
    showElement(infoButtons)
    if (uList.get('origin', authz.uri).length > 0 && verbose) {
      addFeedback('', 'You are already connected with this person')
      return
    }
    var item = {}
    item.origin = item.url = authz.uri
    item.origin = authz.origin
    item.desc = authz.label
    // Add to list of connections
    Authorizations[authz.uri] = authz
    // Add to UI
    uList.add(item)
    hideElement(welcome)
    showElement(searchElement)
    showElement(actionsElement)
    // clear the info profile
    if (verbose) {
      addFeedback('success', 'Added new authorization')
    }
    uList.sort(sort, { order: order })
  }

  // Remove a connection
  var removeAuthz = function (uri) {
    var toAdd = null
    var toDel = []

    var authz = Authorizations[uri]
    authz.graph.forEach(function (st) {
      toDel.push(st.toNT())
    })
    Solid.web.patch(authz.locationUri, toDel, toAdd).then(function () {
      var moverlay = document.getElementById('delete-dialog')
      if (moverlay) {
        moverlay.getElementsByClassName('modal-header')[0].innerHTML = ''
        moverlay.getElementsByClassName('modal-footer')[0].innerHTML = ''
        moverlay.getElementsByClassName('modal-body')[0].innerHTML = `<div class="icon-success svg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="72px" height="72px">
            <g fill="none" stroke="#43C47A" stroke-width="2">
              <circle cx="36" cy="36" r="35" style="stroke-dasharray:240px, 240px; stroke-dashoffset: 480px;"></circle>
              <path d="M17.417,37.778l9.93,9.909l25.444-25.393" style="stroke-dasharray:50px, 50px; stroke-dashoffset: 0px;"></path>
            </g>
          </svg>
          <h6 class="green">Success!</h6>
        </div>`
        window.setTimeout(function () {
          moverlay.parentNode.removeChild(moverlay)
        }, 1500)
      }

      // Remove the connection from the local list
      delete Authorizations[uri]
      // Remove the UI element
      uList.remove('origin', uri)
      if (uList.size() === 0) {
        showElement(start)
      }
      cancelView()
    })
    .catch(function (err) {
      console.log(err)
      addFeedback('error', 'Could not remove connection from server')
    })
  }

  var viewAuthz = function (uri) {
    authorization.classList.remove('slide-out')
    authorization.classList.add('slide-in')
    hideElement(actionsElement)

    extendedInfo.innerHTML = newStatus('Loading authorization data...')

    console.log(Authorizations[uri])
  }

  var cancelView = function () {
    authorization.classList.remove('slide-in')
    authorization.classList.add('slide-out')
    if (uList.visibleItems.length === 0) {
      hideElement(searchElement)
      hideElement(actionsElement)
      showElement(welcome)
    } else {
      showElement(actionsElement)
    }
  }

  var extendedLook = function (data, parent) {
    var card = document.createElement('div')
    card.classList.add('card', 'no-border')

    var image = document.createElement('div')
    image.classList.add('text-center')
    card.appendChild(image)

    if (data.picture) {
      var picture = document.createElement('img')
      data.classList.add('img-responsive', 'centered', 'circle', 'user-picture')
      data.src = data.picture
      image.appendChild(picture)
    }

    var body = document.createElement('div')
    card.appendChild(body)
    body.classList.add('card-body')

    if (data.name) {
      var name = document.createElement('h4')
      name.classList.add('card-title', 'text-center')
      name.innerHTML = data.name
      body.appendChild(name)
    }

    if (!data.status) {
      data.status = 'invitation sent'
    }
    var status = document.createElement('h4')
    status.classList.add('card-meta', 'text-center', 'status', 'green')
    status.innerHTML = data.status
    body.appendChild(status)

    // URI
    var section = document.createElement('div')
    var label = document.createElement('h6')
    var icon = document.createElement('i')
    icon.classList.add('fa', 'fa-user')
    label.appendChild(icon)
    label.innerHTML += ' Label'
    section.appendChild(label)
    body.appendChild(section)

    var div = document.createElement('div')
    div.classList.add('card-meta')
    div.innerHTML = data.uri
    body.appendChild(div)

    // Actions
    var footer = document.createElement('div')
    card.appendChild(footer)
    footer.classList.add('card-footer', 'text-center')

    // // new contact button
    // var button = document.createElement('button')
    // footer.appendChild(button)
    // button.classList.add('btn', 'btn-lg', 'btn-primary')
    // button.innerHTML = 'Create contact'
    // button.addEventListener('click', function () {
    //   addToList(profile)
    //   deleteElement(card)
    //   closeModal()
    // }, false)

    // remove button
    var remove = document.getElementById('remove')
    remove.innerHTML = ''
    var removeBtn = document.createElement('button')
    remove.appendChild(removeBtn)
    removeBtn.classList.add('btn', 'btn-link')
    var removeIcon = document.createElement('i')
    removeBtn.appendChild(removeIcon)
    removeIcon.classList.add('fa', 'fa-trash-o')
    removeBtn.innerHTML += ' Remove connection'
    removeBtn.addEventListener('click', function () {
      removeDialog(data)
    })

    // finish
    parent.appendChild(card)
  }

  var quickLook = function (profile, parent) {
    var card = document.createElement('div')
    card.classList.add('card', 'no-border')

    var image = document.createElement('div')
    card.appendChild(image)
    image.classList.add('card-image')

    if (profile.picture) {
      var picture = document.createElement('img')
      picture.classList.add('img-responsive', 'centered')
      picture.src = profile.picture
      image.appendChild(picture)
    }

    var header = document.createElement('div')
    card.appendChild(header)
    header.classList.add('card-header', 'text-center')

    var body = document.createElement('div')
    card.appendChild(body)
    body.classList.add('card-body')
    body.innerHTML = 'Would you like to connect with this person?'

    var footer = document.createElement('div')
    card.appendChild(footer)
    footer.classList.add('card-footer', 'text-right')

    var cancel = document.createElement('button')
    footer.appendChild(cancel)
    cancel.classList.add('btn', 'btn-link')
    cancel.innerHTML = 'Cancel'
    cancel.addEventListener('click', function () {
      deleteElement(card)
      showElement(lookupElement)
      showElement(infoButtons)
    }, false)

    var button = document.createElement('button')
    footer.appendChild(button)
    button.classList.add('btn', 'btn-primary')
    button.innerHTML = 'Connect'
    button.addEventListener('click', function () {
      addConnection(profile)
      deleteElement(card)
      closeModal()
    }, false)

    // finish
    parent.appendChild(card)
  }

  // ------------ FEEDBACK ------------

  // Add visual feedback (toast) element to the DOM
  // @param msgType {string} one value of type [info, success, error]
  // @param msg {string} message to send
  var addFeedback = function (msgType, msg) {
    var timeout = 1500

    switch (msgType) {
      case 'success':
        msgType = 'toast-success'
        break
      case 'error':
        msgType = 'toast-danger'
        timeout = 0
        break
      case 'info':
        msgType = 'toast-primary'
        break
      default:
        msgType = ''
        break
    }

    var div = document.createElement('div')
    div.classList.add('toast', 'centered', 'mt-10')
    if (msgType && msgType.length > 0) {
      div.classList.add(msgType)
    }
    var btn = document.createElement('button')
    btn.classList.add('btn', 'btn-clear', 'float-right')
    // add event listener
    btn.addEventListener('click', function () {
      clearFeedback(div)
    }, false)
    // add self-timeout
    if (timeout > 0) {
      window.setTimeout(function () {
        clearFeedback(div)
      }, timeout)
    }
    // add the message
    div.innerHTML = msg
    // add button
    div.appendChild(btn)
    // append toast to DOM
    feedback.appendChild(div)
  }

  // Remove a feedback element
  // @param msg {string} message to send
  var clearFeedback = function (elem) {
    if (elem.parentNode) {
      elem.parentNode.removeChild(elem)
    }
  }

  // ------------ MODAL ------------
  var closeModal = function () {
    hideElement(newModal)
    hideElement(overlay)
    showElement(lookupElement)
    showElement(infoButtons)
    overlay.style.display = 'none'
  }

  var showModal = function () {
    // show modal
    showElement(newModal)
    showElement(overlay)
    overlay.style.display = 'flex'
  }

  var removeDialog = function (profile) {
    var body = document.getElementsByTagName('body')[0]
    var moverlay = document.createElement('div')
    body.appendChild(moverlay)
    moverlay.setAttribute('id', 'delete-dialog')
    moverlay.classList.add('modal-overlay', 'flex', 'center-page')
    var modal = document.createElement('div')
    moverlay.appendChild(modal)
    modal.classList.add('modal-temp', 'modal-sm')

    var container = document.createElement('div')
    modal.appendChild(container)
    container.classList.add('modal-container')
    container.setAttribute('role', 'document')

    var header = document.createElement('div')
    container.appendChild(header)
    header.classList.add('modal-header')

    var cancelTop = document.createElement('button')
    header.appendChild(cancelTop)
    cancelTop.classList.add('btn', 'btn-clear', 'float-right', 'cancel-new', 'tooltip')
    cancelTop.setAttribute('type', 'button')
    cancelTop.setAttribute('data-tooltip', 'Close')
    cancelTop.setAttribute('aria-label', 'Close')
    cancelTop.addEventListener('click', function () {
      moverlay.parentNode.removeChild(moverlay)
    }, false)

    var title = document.createElement('div')
    header.appendChild(title)
    title.classList.add('modal-title')
    title.innerHTML = 'Remove Connection'

    body = document.createElement('div')
    container.appendChild(body)
    body.classList.add('modal-body')
    body.innerHTML = '<h4 class"text-center">Are you sure you want to remove this authorization?</h4>'

    var footer = document.createElement('div')
    container.appendChild(footer)
    footer.classList.add('modal-footer')

    var cancel = document.createElement('button')
    footer.appendChild(cancel)
    cancel.classList.add('btn', 'btn-link')
    cancel.innerHTML = 'Cancel'
    cancel.addEventListener('click', function () {
      moverlay.parentNode.removeChild(moverlay)
    }, false)

    var del = document.createElement('button')
    footer.appendChild(del)
    del.classList.add('btn', 'btn-primary')
    del.innerHTML = 'Yes, remove it'
    del.addEventListener('click', function () {
      removeAuthz(profile.webid)
    }, false)
  }

  // // ------------ Local Storage ------------
  // var saveLocalUser = function (data) {
  //   try {
  //     window.localStorage.setItem(appUrl + 'userInfo', JSON.stringify(data))
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }
  // // load localstorage config data
  // var loadLocalUser = function () {
  //   try {
  //     var data = JSON.parse(window.localStorage.getItem(appUrl + 'userInfo'))
  //     if (data) {
  //       return data
  //     }
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  // ------------ UTILITY ------------
  var hideElement = function (elem) {
    if (elem) {
      elem.classList.add('hidden')
    }
  }

  var showElement = function (elem) {
    if (elem) {
      elem.classList.remove('hidden')
    }
  }

  var deleteElement = function (elem) {
    if (elem.parentNode) {
      elem.parentNode.removeChild(elem)
    }
  }

  var newStatus = function (msg) {
    return '<div class="text-center">' +
    ' <h4>' + msg + '</h4>' +
    ' <div class="loading"></div>' +
    '</div>'
  }

  // ------------ EVENT LISTENERS ------------

  // search event listener
  search.addEventListener('keyup', function () {
    searchList()
  }, false)

  clearSearch.addEventListener('click', function () {
    clearSearchList()
  }, false)

  for (var i = 0; i < showNewModal.length; i++) {
    showNewModal[i].addEventListener('click', function () {
      showModal()
    }, false)
  }

  for (i = 0; i < cancelViews.length; i++) {
    cancelViews[i].addEventListener('click', function () {
      cancelView()
    }, false)
  }

  // close modal clicks
  for (i = 0; i < cancelNewBtn.length; i++) {
    cancelNewBtn[i].addEventListener('click', function () {
      closeModal()
    }, false)
  }

  // Init
  var listOptions = {
    listClass: 'authorizations-list',
    searchClass: 'search-authz',
    valueNames: [
      'origin',
      'date',
      'desc',
      { attr: 'id', name: 'authz', evt: { action: 'click', fn: viewAuthz } }
    ],
    item: authTemplate
  }

  var uList = new window.List('authorizations', listOptions, items)
  uList.sort('desc', { order: 'asc' })

  // INIT APP
  // var initApp = function (webid) {
  showElement(authorizations)
  loadList()

  // register App
  // registerApp(webid)
  if (uList.visibleItems.length === 0) {
    showElement(welcome)
  } else {
    showElement(searchElement)
    showElement(actionsElement)
    uList.sort('desc', { order: 'asc' })
  }
  // }

  // public methods
  return {
    user: User,
    addFeedback: addFeedback,
    list: uList
  }
})()
