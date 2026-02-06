export const getV1UserLoansSoapData = {
  GetLibraryUserOrderListResult: {
    response: {
      status: {
        code: "101",
        message: "OK",
        LibraryExtension: {
          maxloanperiod: "30",
          maxloanpertime: "3",
          maxloanstotal: "135000",
          maxloanpertimesound: "0",
          maxloanstotalsound: "0",
          maxtotalperiod: "0",
          usertotalloans: "1",
          userebookloansremain: "2",
          userebookloansnexttime: "2025-03-13 12:08:45",
          usersoundloansNexttime: "2025-03-17 12:08:45",
          usertotalebookloans: "1",
          usertotalsoundloans: "0",
        },
      },
      data: {
        friendlycardnumber: "T4EFB7",
        orderitem: {
          internalordernumber: "5f9dacba-1ad5-4275-b90f-eac84a53ccae",
          retailerordernumber: "7cab0a54-2a22-4172-862c-b3ed346e1da0",
          orderstatus: {
            attributes: {
              id: "1",
              name: "Completed",
            },
          },
          orderdate: "2025-03-11 13:30:04",
          loanexpiredate: "2025-04-10 14:28:57",
          issubscriptionloan: "false",
          book: {
            attributes: {
              id: "9788772144467",
              idtype: "ISBN",
            },
            title: "Adams bold",
            authors: {
              author: [
                {
                  attributes: {
                    name: "Jørn Jensen",
                    type: "author",
                    idtype: "0",
                  },
                },
                {
                  attributes: {
                    name: "Keld Petersen",
                    type: "edited by",
                    idtype: "6",
                  },
                },
                {
                  attributes: {
                    name: "Kim Dalsgaard",
                  },
                },
              ],
            },
            publisher: "Forlaget Elysion",
          },
          format: {
            attributes: {
              id: "58",
              name: "Epub with Adobe encryption",
            },
          },
          data: {
            data: {
              downloadurl:
                "http://acs.pubhub.dk:8080/fulfillment/URLLink.acsm?action=enterloan&ordersource=Pubhub&orderid=5f9dacba-1ad5-4275-b90f-eac84a53ccae&resid=urn%3Auuid%3A9cf4576f-6421-4d68-beaf-45f804ccd403&rights=%24lat%231744288137%24&gbauthdate=03%2f11%2f2025+12%3a28+UTC&dateval=1741699737&gblver=4&auth=2e57dc39e0314c3cb3ab312b2ffa626b964b3a80",
            },
          },
        },
      },
    },
  },
}
