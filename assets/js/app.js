var Conn = (function () {
  var $rdf = window.$rdf
  var sha1 = window.Sha1

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
  var moreInfo = document.getElementById('more-info')
  // var extendedInfo = document.getElementById('extended-info')
  var actionsElement = document.getElementById('actions')
  var feedback = document.getElementById('feedback')
  var newModal = document.getElementById('new')
  var overlay = document.getElementById('overlay')
  var infoButtons = document.getElementById('info-buttons')
  var addNewBtn = document.getElementById('add-new')
  var cancelNewBtn = document.getElementsByClassName('cancel-new')
  var showNewModal = document.getElementsByClassName('show-new')
  var lookupElement = document.getElementById('lookup')

  var Solid = require('solid')

  // User object
  // var User = {}
  var User = {
    webid: 'https://deiu.me/profile#me',
    authList: 'https://deiu.me/Private/credentials.ttl',
    credentialsUri: 'https://deiu.me/keys/'
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
    '<div class="uri tooltip" data-tooltip="View details">' +
    '<div class="inline-block">' +
    ' <div class="origin"></div>' +
    ' <div class="grey smaller">Added on: <span class="date"></span></div>' +
    '</div>' +
    '<div class="inline-block pull-right center">' +
    ' <img src="assets/icons/info.svg" class="icon">' +
    '</div>' +
    '</div>' +
  '</div>'

  var searchFields = ['origin', 'desc']
  var items = [
    // {
    //   uri: 'https://local1.databox.me:8443',
    //   // desc: 'Bob\'s personal server',
    //   origin: 'https://local1.databox.me:8443',
    //   date: 'Monday, June 20 2016'
    // },
    // {
    //   uri: 'https://local2.databox.me:8443',
    //   // desc: 'Alice\'s databox',
    //   origin: 'https://local2.databox.me:8443',
    //   date: 'Wednesday, May 16th 2016'
    // }
  ]
  // ------------ END LIST CONF ------------

  // ------------ TYPE REGISTRY ------------
  // Discovers where connections data is stored using the type registry
  // (also triggers a registration if no locations are found)
  // var registerApp = function (webid) {
  //   status.innerHTML = newStatus('Loading your authz data...')
  //   return Solid.identity.getProfile(webid)
  //     .then(function (authz) {
  //       var localUser = importSolidProfile(authz)
  //       User.webid = authz.webId
  //       User.name = localUser.name
  //       User.inbox = localUser.inbox
  //       // We need to register
  //       status.innerHTML = newStatus('Loading app data registry...')
  //       if (!authz.typeIndexListed.uri) {
  //         console.log('No registry found')
  //         // Create typeIndex
  //         authz.initTypeRegistry().then(function (authz) {
  //           registerType(authz)
  //         })
  //       } else {
  //         console.log('Found registry', authz.typeIndexListed.uri)
  //         // Load registry and find location for data
  //         // TODO add ConnectionsIndex to the solid terms vocab
  //         authz.loadTypeRegistry()
  //           .then(function (authz) {
  //             var privIndexes = authz.typeRegistryForClass(Solid.vocab.solid('PrivateConnections'))
  //             var pubIndexes = authz.typeRegistryForClass(Solid.vocab.solid('PublicConnections'))
  //             if (pubIndexes.concat(privIndexes).length === 0) {
  //               // register
  //               registerType(authz)
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
  //       console.log('Could not load authz:', err)
  //       addFeedback('error', 'Could not load authz data')
  //     })
  // }

  // Register the app data location with the type registry
  // TODO this belongs in Solid.js
  // var registerType = function (authz) {
  //   if (authz.storage.length > 0) {
  //     status.innerHTML = newStatus('Creating app storage...')
  //     Solid.web.createContainer(authz.storage, appContainer, {}).then(function (meta) {
  //       var classToRegister = Solid.vocab.solid('PrivateConnections')
  //       // TODO add UI for storage selection
  //       var dataLocation = Solid.util.absoluteUrl(authz.storage[0], meta.url)
  //       var slug = 'privIndex.ttl'
  //       var isListed = false
  //       // create the index documents
  //       status.innerHTML = newStatus('Initializing app data registry (1/4)...')
  //       Solid.web.post(dataLocation, null, slug).then(function (response) {
  //         status.innerHTML = newStatus('Initializing app data registry (2/4)...')
  //         var location = Solid.util.absoluteUrl(dataLocation, response.url)
  //         authz.registerType(classToRegister, location, 'instance', isListed).then(function (authz) {
  //           var privIndexes = authz.typeRegistryForClass(Solid.vocab.solid('PrivateConnections'))
  //           classToRegister = Solid.vocab.solid('PublicConnections')
  //           // TODO add UI for storage selection
  //           var location = Solid.util.absoluteUrl(authz.storage[0], meta.url)
  //           slug = 'pubIndex.ttl'
  //           isListed = true
  //           status.innerHTML = newStatus('Initializing app data registry (3/4)...')
  //           Solid.web.post(dataLocation, null, slug).then(function (response) {
  //             status.innerHTML = newStatus('Initializing app data registry (4/4)...')
  //             location = Solid.util.absoluteUrl(dataLocation, response.url)
  //             authz.registerType(classToRegister, location, 'instance', isListed).then(function (authz) {
  //               var pubIndexes = authz.typeRegistryForClass(Solid.vocab.solid('PublicConnections'))
  //               User.webid = authz.webId
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
    // return Solid.web.get(User.authList)
    //   .then(function (response) {
    //     var g = response.parsedGraph()
    //     var connections = g.statementsMatching(
    //       undefined,
    //       Solid.vocab.rdf('type'),
    //       Solid.vocab.solid('Connection')
    //     )
    //     connections.forEach(function (person) {
    //       var authz = {}
    //       authz.webid = person.subject.uri
    //       authz.graph = g.statementsMatching(person.subject, undefined, undefined)
    //       var name = g.any(person.subject, Solid.vocab.foaf('name'))
    //       if (name) {
    //         authz.name = name.value
    //       }
    //       addToList(authz)
    //     })
    //     return connections.length
    //   })
    //   .catch(function () {
    //     // TODO handle errors in case of missing index files or no access
    //     return 0
    //   })
  }

  var requestAuthz = function (uris) {
    var refAppUrl = queryVals['app']
    var refAppElem = document.getElementById('appUrl')
    refAppElem.innerHTML = refAppUrl

    authInfo.innerHTML = ''
    uris.forEach(function (uri) {
      authInfo.innerHTML += '<div>' +
      '<label for="' + uri + '">' +
      ' <input type="checkbox" name="origin" value="' + uri + '" id="' + uri + '" checked> ' + uri +
      '</label>'
      '</div>'
    })
    var tellMore = document.getElementById('tell-more')
    tellMore.addEventListener('click', function () {
      showElement(moreInfo)
    })

    addNewBtn.addEventListener('click', function () {
      addAuthz()
    })
    showModal()
  }

  // Add a new authorization to the authorizations document
  // @param authz {object} Contains fields contained in the authorizations document
  var addAuthz = function () {
    var selected = document.getElementsByName('origin')
    var toAdd = []
    var items = []
    var uris = []
    var g = $rdf.graph()
    selected.forEach(function (elem) {
      if (elem.checked) {
        uris.push(elem.id)
      }
    })
    var total = uris.length

    uris.forEach(function (uri) {
      Solid.web.head(uri).then(function () {
        // only interested in "errors" - i.e. HTTP 401
      })
      .catch(function (err) {
        var h = err.xhr.getResponseHeader('WWW-Authenticate')
        var nonce = null
        if (h && h.length > 0) {
          nonce = parseAuthnHeader(h)
        }
        if (!nonce) {
          return
        }
        // create new authorization
        var hash = sha1.hash(nonce)

        // Store nonce
        Solid.web.put(User.credentialsUri + hash)
          .then(function (resp) {
            var options = {
              headers: {
                'Authorization': 'WebID-Token webid="' + User.webid + '", nonce="' + nonce + '"'
              }
            }

            Solid.web.head(uri, options).then(function (resp) {
              var h = resp.xhr.getResponseHeader('Authorization')
              var token = null
              if (h && h.length > 0) {
                token = parseAuthzHeader(h)
              }
              if (!token) {
                return
              }

              console.log(token)
              var resUri = $rdf.sym(User.authList + '#' + hash.substr(0, 8))
              var origin = getOrigin(uri)
              var date = new Date()
              g.add(
                resUri,
                Solid.vocab.rdf('type'),
                Solid.vocab.solid('AccessToken')
              )
              g.add(
                resUri,
                Solid.vocab.solid('origin'),
                $rdf.sym(origin)
              )
              g.add(
                resUri,
                Solid.vocab.dct('accessToken'),
                $rdf.lit(token)
              )
              g.add(
                resUri,
                Solid.vocab.dct('created'),
                $rdf.lit(date.toISOString(), '', $rdf.NamedNode.prototype.XSDdateTime)
              )

              var st = g.statementsMatching(resUri, undefined, undefined)
              st.forEach(function (st) {
                toAdd.push(st.toNT())
              })

              var item = {
                uri: uri,
                origin: uri,
                token: token,
                date: date,
                graph: st
              }
              items.push(item)

              addToList(item, 'origin', 'asc', true)

              total--
              if (total === 0) {
                Solid.web.patch(User.authList, null, toAdd)
                  .then(function () {
                    addFeedback('success', 'Updated authorizations list')
                  })
                  .catch(function (err) {
                    console.log('Error updating authorizations:' + err)
                    addFeedback('error', 'Error updating authorizations')
                  })
              }
            }).catch(function (err) {
              console.log('Cannot write nonce to server', err)
            })
          }).catch(function (err) {
            console.log('Cannot write nonce to server', err)
          })
      })
    })

    closeModal()
  }

  // Add the new connection to the list and sort the list
  // @param item {object} Contains an authorization item
  // @param sort {string} Value to use for sorting (name, email, etc.)
  // @param order {string} Value to use for ordering (asc / desc)
  var addToList = function (item, sort, order) {
    sort = sort || 'name'
    order = order || 'asc'

    showElement(lookupElement)
    showElement(infoButtons)
    // Add to list of connections
    Authorizations[item.uri] = item
    // Add to UI
    uList.add(item)
    hideElement(welcome)
    showElement(searchElement)
    showElement(actionsElement)
    // clear the info authz
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
    Solid.web.patch(User.authList, toDel, toAdd).then(function () {
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
      addFeedback('error', 'Could not update authorization list')
    })
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

  var viewAuthz = function (uri) {
    authorization.classList.remove('slide-out')
    authorization.classList.add('slide-in')
    hideElement(actionsElement)

    var data = Authorizations[uri]

    var card = document.createElement('div')
    card.classList.add('card', 'no-border')

    var image = document.createElement('div')
    image.classList.add('text-center')
    card.appendChild(image)

    var body = document.createElement('div')
    card.appendChild(body)
    body.classList.add('card-body')

    if (data.desc) {
      var title = document.createElement('h4')
      title.classList.add('card-title', 'text-center')
      title.innerHTML = data.desc
      body.appendChild(title)
    }

    // URI
    var section = document.createElement('div')
    var label = document.createElement('h6')
    var icon = document.createElement('i')
    icon.classList.add('fa', 'fa-user')
    label.appendChild(icon)
    label.innerHTML += ' Server location'
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

    // remove button
    var remove = document.getElementById('remove')
    remove.innerHTML = ''
    var removeBtn = document.createElement('button')
    remove.appendChild(removeBtn)
    removeBtn.classList.add('btn', 'btn-link')
    var removeIcon = document.createElement('i')
    removeBtn.appendChild(removeIcon)
    removeIcon.classList.add('fa', 'fa-trash-o')
    removeBtn.innerHTML += ' Remove authorization'
    removeBtn.addEventListener('click', function () {
      removeDialog(data)
    })

    // finish
    authorization.appendChild(card)
  }

  // Parse the value of a WWW-Authenticate header
  // e.g. WebID-Token nonce="MTQ2NjYyMDI2N....."
  var parseAuthnHeader = function (header) {
    var challenges = header.split(';')
    for (var i = 0; i < challenges.length; i++) {
      var h = challenges[i].trim()
      var parts = h.split(' ')
      if (parts[0] === 'WebID-Token' && parts[1].length >= 0) {
        return parts[1].split('nonce=')[1].replace('"', '')
      }
    }
    return null
  }

  // Parse the value of a Authorization header
  // e.g. WebID-Bearer-Token abc
  var parseAuthzHeader = function (header) {
    var parts = header.split(' ')
    if (parts[0] === 'WebID-Bearer-Token' && parts[1].length >= 0) {
      return parts[1].replace(/\"/g, '')
    }
    return null
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

  var removeDialog = function (authz) {
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
    title.innerHTML = 'Remove authorization'

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
      removeAuthz(authz.uri)
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
  var getOrigin = function (uri) {
    var parser = document.createElement('a')
    parser.href = uri
    return parser.protocol + '//' + parser.host
  }

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

  // var deleteElement = function (elem) {
  //   if (elem.parentNode) {
  //     elem.parentNode.removeChild(elem)
  //   }
  // }

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
      { attr: 'id', name: 'uri', evt: { action: 'click', fn: viewAuthz } }
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
