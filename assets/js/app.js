(function () {
  var DOMAIN = 'https://databox2.com'
  var ACCOUNT_ENDPOINT = 'api/accounts/signin'

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

  // Prepare account endpoint
  if (_accEndpoint && _accEndpoint.length > 0) {
    ACCOUNT_ENDPOINT = _accEndpoint
  }

  var userOK, nameOK, emailOK, passOK

  // get elements
  var successbox = document.getElementById('successbox')
  var form = document.getElementById('form')
  var fields = document.getElementById('fields')
  var signinBtn = document.getElementById('sign-in-btn')
  var userField = document.getElementsByName('username')[0]
  var passField = document.getElementsByName('password')[0]

  var signIn = function () {
    var username = document.getElementsByName('username')[0].value
    var password = document.getElementsByName('password')[0].value
    var email = document.getElementsByName('email')[0].value
  }

  var clearError = function (elemId) {
    document.getElementById(elemId).innerHTML = ''
    var errorBox = document.getElementById('errorbox')
    var errElem = document.getElementById(elemId + '-error')
    if (errElem) {
      errElem.parentNode.removeChild(errElem)
    }
    if (errorBox.style.display === 'block') {
      if (errorBox.childNodes.length === 1 && errorBox.childNodes[0].nodeType === 3) {
        errorBox.style.display = 'none'
      }
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

  // add event listeners
  signinBtn.addEventListener('click', function () {
    signIn()
  }, false)

  form.addEventListener('keypress', function (e) {
    if (e.which === 13) {
      signIn()
    }
  })

  userField.addEventListener('input', validateUsername, false)
})()
