const institutionXml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:uni="https://unilogin.dk" xmlns:tns="https://wsiinst.unilogin.dk/ws">
  <soap:Body>
    <hentInstitutionResponse xmlns="https://wsiinst.unilogin.dk/ws">
      <institution>
        <instnr>A04441</instnr>
        <instnavn>DDF</instnavn>
        <type>A04441</type>
        <typenavn>DDF</typenavn>
      </institution>
    </hentInstitutionResponse>
  </soap:Body>
</soap:Envelope>`

export default institutionXml
