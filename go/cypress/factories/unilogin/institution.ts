const institutionXml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tns="https://brugerdatabasen.stil.dk/bpi/wsiinst/6">
  <soap:Body>
    <hentInstitutionResponse xmlns="https://brugerdatabasen.stil.dk/bpi/wsiinst/6">
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
