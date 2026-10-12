const auth = {
  "auth.cookie-names.session-type": "go-session:type",
  // How long the CMS's answer about a session is trusted before we ask again.
  "auth.session-validation-ttl-seconds": 30,
  // Where Unilogin attributes are read with a Unilogin user token. Can be
  // overridden with the ADGANGSPLATFORMEN_USERINFO_URL env variable.
  "auth.adgangsplatformen-userinfo-url": "https://login.bib.dk/userinfo/",
}

export default auth
