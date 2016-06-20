(function () {
  var DOMAIN = 'https://databox2.com'
  var ACCOUNT_ENDPOINT = 'api/accounts/signin'
  var SIGNUP_LINK = 'https://databox2.com'
  var SIGNIN_LINK = 'http://localhost:8080'

  // get elements
  var successbox = document.getElementById('successbox')
  var form = document.getElementById('form')
  var fields = document.getElementById('fields')
  var signinBtn = document.getElementById('sign-in-btn')
  var signoutBtn = document.getElementById('signout')
  var userField = document.getElementsByName('username')[0]
  var passField = document.getElementsByName('password')[0]

  var accURL = {}
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

  // External source?
  var _domain = queryVals['domain']
  var _accEndpoint = queryVals['acc']

  // Prepare domain
  var parser = document.createElement('a')
  parser.href = (_domain && _domain.length > 0) ? _domain : DOMAIN
  accURL.host = parser.host + '/' // => 'example.com'
  accURL.path = parser.pathname // => '/pathname/'
  accURL.schema = parser.protocol + '//'
  accURL.url = accURL.schema + accURL.host + accURL.path

  // Prepare account endpoint
  if (_accEndpoint && _accEndpoint.length > 0) {
    ACCOUNT_ENDPOINT = _accEndpoint
  }

  if (queryVals['username']) {
    userField.value = queryVals['username']
  }

  // Set the signup link
  document.getElementById('signup').href = SIGNUP_LINK

  var signIn = function () {
    var username = document.getElementsByName('username')[0].value
    var password = document.getElementsByName('password')[0].value

    fields.setAttribute('disabled', true)
    signinBtn.classList.add('disabled')

    var data = {
      username: username
    }
    saveLocalStorage(data)
    notValid('signin-error', 'Wrong username or password')

    fields.setAttribute('disabled', false)
    signinBtn.classList.remove('disabled')
  }

  var signOut = function () {
    clearLocalStorage()
    userField.value = ''
    clearError('signin-error')
    console.log('You have been signed out')
  }

  var clearError = function (elemId) {
    var errorBox = document.getElementById('errorbox')
    var errElem = document.getElementById(elemId)
    if (errElem) {
      errElem.parentNode.removeChild(errElem)
    }
    if (errorBox.style.display === 'block') {
      if (errorBox.childNodes.length === 1 &&
        errorBox.childNodes[0].nodeType === 3) {
        errorBox.style.display = 'none'
      }
    }
  }

  var notValid = function (elemId, msg) {
    var errorBox = document.getElementById('errorbox')
    errorBox.style.display = 'block'
    var errElem = document.getElementById(elemId)
    if (!errElem) {
      var li = document.createElement('li')
      li.id = elemId
      li.innerHTML = msg
      errorBox.appendChild(li)
    }
  }

  var makeURI = function (username) {
    if (username.length > 0) {
      return accURL.schema + username + '.' + accURL.host
    }
    return null
  }

  // redirect back to app
  var returnToApp = function (webid, origin) {
    if (!origin || origin.length === 0) {
      origin = '*'
    }
    // send to parent window
    if (window.opener) {
      window.opener.postMessage('User:' + webid, origin)
      window.close()
    } else {
      // send to parent iframe creator
      window.parent.postMessage('User:' + webid, origin)
    }
  }

  // save to localStorage
  var saveLocalStorage = function (data) {
    try {
      window.localStorage.setItem(accURL.url, JSON.stringify(data))
    } catch (err) {
      console.log(err)
    }
  }
  // clear localstorage data
  var clearLocalStorage = function () {
    try {
      window.localStorage.removeItem(accURL.url)
    } catch (err) {
      console.log(err)
    }
  }
  // load localstorage config data
  var loadLocalStorage = function () {
    try {
      var data = JSON.parse(window.localStorage.getItem(accURL.url))
      if (data) {
        return data
      }
    } catch (err) {
      console.log(err)
    }
  }

  // add event listeners
  signinBtn.addEventListener('click', function () {
    signIn()
  }, false)

  form.addEventListener('keypress', function (e) {
    if (e.which === 13) {
      signIn()
    }
  })

  signoutBtn.addEventListener('click', function () {
    signOut()
  }, false)

  var user = loadLocalStorage()
  if (user) {
    if (user.username) {
      userField.value = user.username
    }
  }
})()
