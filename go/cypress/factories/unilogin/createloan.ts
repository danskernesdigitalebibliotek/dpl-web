const createLoanSuccessXml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <CreateLoanResponse xmlns="pubhub.dk">
      <CreateLoanResult>
        <response xmlns:xs1="http://172.16.6.26:2000/webservices/schema/createloan.xsd" xmlns="http://pubhub.dk/">
          <status xmlns="">
            <code>101</code>
            <message>OK</message>
          </status>
          <data xmlns="">
            <downloadurl>https://service.pubhub.dk/Download.aspx?id=757a22ed-cbc4-4659-a5a9-be39bfc2ba6c</downloadurl>
            <expirationdateutc>2025-10-01T12:39:57.3646246Z</expirationdateutc>
            <retailerordernumber>757a22ed-cbc4-4659-a5a9-be39bfc2ba6c</retailerordernumber>
            <internalordernumber>757a22ed-cbc4-4659-a5a9-be39bfc2ba6c</internalordernumber>
          </data>
        </response>
      </CreateLoanResult>
    </CreateLoanResponse>
  </soap:Body>
</soap:Envelope>`

export default createLoanSuccessXml
