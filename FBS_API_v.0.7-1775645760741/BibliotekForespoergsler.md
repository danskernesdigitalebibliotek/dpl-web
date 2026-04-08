# <a name="75b1c4c5-499f-47ed-a72e-4c17d7b9eb68"></a>BibliotekForespørgsler

| Egenskaber:      |                  |
|:-----------------|:-----------------|
| Revision:        | r6977 |  
| Servicekategori: | Webservice |  
| Servicetype:     | GraphQL |  
| Source:          | Fælles Bibliotekssystem |  
| Contact name:    | Britt Montesinos |  
| Contact url:     | http://www.kombit.dk |  
| Contact email:   | bibsys@kombit.dk |  
  
##### Short description

  FBS API'et giver 3. parter adgang til det Fælles Bibliotekssystem (FBS), og er baseret på GraphQL over HTTP.  
   
API'et er designet til at blive brugt af slutbrugergrænsefladerne på biblioteksområdet, så bibliotekslånere kan tjekke deres lån, reservationer, mellemværender og mere. Integrationen må kun bruges i interaktion med en bibliotekslåner. Integrationen må ikke anvendes til hentning af store mængder informationer om f.eks. lånere eller biblioteker.    
      

## <a name="10394c5f-354d-4e91-bd1a-3f8c80a7483d"></a>Operation: BeholdningHent

  Forespørgslen returnerer en liste over beholdninger for hver manifestation. Beholdningen viser, hvor materialerne er placering, og om de er tilgængelige på hylden eller udlånt. Hvis materialerne er udlånt, vil en forventet returdato også være tilgængelig.    
      
### Request: <a name="27447f51-e267-42f7-b089-a04ff7c26c13"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`ManifestationFAUSTNummer` | Query |  |  
|`FilialISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="45bd9f2a-3a7d-4689-b45e-af7c55a5dd5a"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [Beholdninger](#9ed21161-cb61-4052-b3ea-b031dd7079d8)  

## <a name="12a305db-9050-419c-ae9c-cdbd967cf2d7"></a>Operation: ReservationOpret

  Operationen bruges til at oprette nye reservationer.    
      
### Request: <a name="c21977ef-acaa-4d7f-a262-3078ad8cde54"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
| (`RekvisitionReservationType`) | Query | Reservationstype, der kan være Normal, Serie, Parallel eller Fjernlån. |  
|`ManifestationFAUSTNummer` | Query |  |  
| (`RekvisitionInteressefrist`) | Query |  |  
| (`RekvisitionAfhentningssted`) | Query | Definition: Filialnummeret er en fortløbende nummerering af filialerne/betjeningsstederne under biblioteket Kommentar: For folkebiblioteker består biblioteksnummeret af tallet 7 + det 3-cifrede kommunenummer + et 2-cifret filialnummer. Kilde: International Standard Identifier for Libraries and Related Organizations (ISO 15511) |  
| (`PeriodikaReservation`) | Query |  |  
| (`RekvisitionAktiveringsDato`) | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="b0c575a0-6f84-4801-828a-80ac9721df46"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [ReservationOpretResultat](#309b8119-3cae-4e79-b7ed-d0751d45054d)  

## <a name="19390643-28a4-420f-86ff-091b49ac3a7c"></a>Operation: BookingOpret

  Kaldet opretter nye bookinger for en låner.    
      
### Request: <a name="12f25bcf-eb1d-40b8-b867-215bb0dd96e3"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`BookingDetalje` | Query |  |  
  

### Response: <a name="5cb57f6e-e1f6-4676-8342-2121a0d8260c"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [BookingOpretResultat](#179ec834-86e7-4a51-88b8-76edb09294f2)  

## <a name="19e43cfd-175a-4257-809f-2cd19b0b0c1a"></a>Operation: LukkedagHent

  Kaldet returnerer en liste af lukkedage inden for et givet tidsrum, som en given filial har registreret.    
      
### Request: <a name="da823baf-6c76-4ee2-9def-c52346cc5dbb"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`FilialISILNummer` | Query |  |  
|`StartDato` | Query | Startdatoen for forespørgselsperioden. Elementet er et transient element. |  
|`SlutDato` | Query | Slutdatoen for forespørgselsperioden. Elementet er et transient element. |  
  

### Response: <a name="1b13daa5-75eb-4cce-80f6-c06bb464c253"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
*Content-Type:* application/json  
##### Datastruktur: [LukkedagHentResultat](#f12be18f-fb05-4bed-8e15-efd61f8acbca)  

## <a name="28a8d2e2-ec2d-4319-b1ad-a9b7a4f9da0d"></a>Operation: LånerGruppeHent

  Forespørgslen returnerer en liste over bibliotekets typer af gruppelånere.    
      
### Request: <a name="ac9ea4d6-b8cc-49a6-b5e5-7d8e8c51fe24"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="d701e8d1-233a-4486-8097-f9e91cc0deb9"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [LånerGruppeHentResultat](#7290d4e2-7da3-4fa9-999d-898b637523f6)  

## <a name="35accdda-a135-4b7c-9d02-2945c755c2bc"></a>Operation: BookingHent

  Forespørgslen henter alle bookiner for en låner.    
      
### Request: <a name="d9054c48-4ca0-4ce0-b8c5-54339853b6db"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
  

### Response: <a name="bf1f22b6-4de3-408b-adca-5bfa03f20632"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [BookingHentResultat](#d37a7c71-296e-4342-8e48-659237be5918)  

## <a name="36417b5c-9a1a-417b-aa6e-369dae05e788"></a>Operation: SektionerHent

  Forespørgslen returnerer en liste af sektioner tilhørende en given bibliotekssektor.    
      
### Request: <a name="a27c0311-686b-4ea0-905b-c13d05fe9db9"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

### Response: <a name="1e2786f2-b77b-4211-8f3e-8039c0e89e7d"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [SektionHentResultat](#9b00a37d-538c-4bce-8463-58b9c877935e)  

## <a name="481fbda1-0466-4421-96bb-7da7ea192fa9"></a>Operation: LånForny

  Forespørgslen returnerer en liste over de lån, der forsøges fornyet samt resultatet af forsøget.  
   
Hvis lånet ikke kan fornyes, ændres afleveringsdatoen ikke, og afvisningsårsagen vil fremgå af FornyelseStatusListe.    
      
### Request: <a name="9a8f107b-ca97-448e-b1a1-f70110da4460"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`LånID` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="5b9a1807-ee60-4ddc-baf0-c29e1e09ec38"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
*Content-Type:* application/json  
##### Datastruktur: [FornyLånResultat](#5fbfb97c-40a3-4d3c-9bef-d46cd61562d0)  

## <a name="5146418e-96f8-4a8c-94fa-5e19934e14d9"></a>Operation: OpstillingHent

  Forespørgslen returnerer en liste af opstillinger tilhørende en given bibliotekssektor.    
      
### Request: <a name="239f31f3-b2f1-4c6d-807d-a942ddefc502"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

### Response: <a name="dc103261-c574-425c-89dd-1e230e7598c5"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [OpstillingHentResultat](#e1fecf8d-137d-47a9-9022-c8864162f702)  

## <a name="579ccd07-a92a-4b81-b514-abce9c76496a"></a>Operation: DelopstillingHent

  Forespørgslen returnerer en liste af delopstillinger tilhørende en given bibliotekssektor.    
      
### Request: <a name="03afb3f5-9188-4127-a7f4-106607972d15"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

### Response: <a name="3892cf4b-52f4-428d-9164-54d42e46aa20"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [DelopstillingHentResultat](#76b67d4c-21d5-41ed-99f5-4039ac32b772)  

## <a name="6938c8ef-e568-4305-ab27-3fef2c5a6c7f"></a>Operation: ForetrukketSprogHent

  Returnerer de sprog, som biblioteket understøtter.    
      
### Request: <a name="8c6e0472-4cd0-4a06-9118-4f075d221208"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="0b84e168-ce2c-48ec-9998-1ef0b9cabe29"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [ForetrukketSprogHentResultat](#d7fdc192-fafc-43f1-956a-e4b0a753abc6)  

## <a name="745a0f93-ada4-4d7f-95fc-7e5da6ed0e88"></a>Operation: BookingOpdater

  Kaldet opdaterer eksisterende bookinger for en låner.    
      
### Request: <a name="0411402e-3a3c-4725-a26d-4fd14775f494"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`RekvisitionNummer` | Query |  |  
|`BookingDetalje` | Query |  |  
  

### Response: <a name="b58134fe-08af-4e95-969a-c92e7ff0c358"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [BookingOpdaterResultat](#5a0cf6a8-e77f-47a6-a6cb-f558b0a06e16)  

## <a name="801ca584-2e8a-4790-9a8b-20ab8fb18a26"></a>Operation: AfdelingHent
### Request: <a name="137aba15-4c74-48ab-b725-6dad28c8b8ba"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

### Response: <a name="ee3cf6d7-2602-44ab-8258-783669ea95d1"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [AfdelingHentResultat](#288d966f-57f9-418f-9e68-1e36ab883343)  

## <a name="833ebf98-fabd-4582-9bee-bdaf3a7c90e9"></a>Operation: LånerHent

  Forespørgslen returnerer en specifik låners oplysninger. Låneren kan være af typerne Personlåner, Virksomhedslåner, Gruppelåner og Biblioteklåner.  
   
Lånerens adresseinformationer medsendes ikke.    
      
### Request: <a name="607d2f0d-1c8c-4877-bf16-f84f5b5109b0"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="61718ecb-71ed-48ac-89d2-f5088465359e"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [LånerHentResultat](#2f6e0292-9ad1-4002-9f45-c9c6dbf0de83)  

## <a name="8d7129f0-4395-4bee-bc2e-4c6f776bae29"></a>Operation: PinkodeOpdater

  Opdaterer en låners nulstillede pinkode. Baseret på den UUID, låneren har modtaget via email om nulstilling af pinkode, opdateres lånerens pinkode.    
      
### Request: <a name="d026e5f7-8ea8-42e2-9b81-fef16ca6468b"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`LånerPinkode` | Query |  |  
|`emailUUID` | Query | UUID, der er sendt til låneren i forbindelse med nulstilling af pinkode. emailUUID er et transient element. |  
  

### Response: <a name="85f6644f-f0d9-4078-a2fa-2d60caec1c7a"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  

            PinkodeOpdaterSvar
            DataElement
            Britt Montesinos
            2026 02 26 14.51:31
            2026 02 26 14.59:16
            Britt Montesinos
            All Users
            rwrwr-      
            0      
            0      
              Development  
            
                
                 
                  
                
                 
                  
                
                 
                  
              Svaret på forespørgslen om opdatering af en specifik låners på pinkode efter en pinkodenulstilling.  
      
         
## <a name="98949424-0369-4b97-8e60-455626df20f6"></a>Operation: LånerMellemværendeHent

  Forespørgslen returnerer en liste af mellemværender, som en specifik låner har.    
      
### Request: <a name="d67d285d-cd8d-44c0-929b-aac057b113f7"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="5e06646f-dd36-48ab-9767-0c150c671914"></a>get_200  

  Returnerer en liste over gebyrer samt materialer, som gebyret vedrører.    
      


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [LånerMellemværendeResultat](#302fdb14-3a33-45de-858f-b0087b0743e6)  

## <a name="989a6549-d451-4648-80a5-324b72d4bee2"></a>Operation: LånHent

  Forespørgslen returnerer en liste over aktuelle lån, som en specifik låner har.    
      
### Request: <a name="58af966c-26dc-4f55-a844-bd45006922db"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="f5fb56b5-972a-44a1-8400-1f03af8f7ec4"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [MaterialeLån](#3bcc6aec-a72d-4223-b9d4-0cff10ec5dae)  

## <a name="a06c9982-c382-4ed3-95ff-e20f313eaa0e"></a>Operation: FilialHent

  Forespørgslen returnerer en liste af filialer tilhørende en given bibliotekssektor. I forespørgslen er det muligt at ekskludere filialer fra resultatet.    
      
### Request: <a name="ada25439-f41b-48aa-bed1-eaba53a36fa0"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`FilialISILNummer` | Query |  |  
  

### Response: <a name="f25142fa-8f39-4a2e-b2fa-2c1208f97fab"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [FilialHentResultat](#33fa98f8-2f46-43a6-abc4-1679071ac4db)  

## <a name="ac074ec0-c928-42ad-9540-eb8966ba87d8"></a>Operation: InteresseHent

  Returnerer et biblioteks opsætning af interesseområder, som deres lånere kan have.    
      
### Request: <a name="2414bbbe-b372-4204-a927-13027240266f"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="870ceb1f-2efb-4d5e-be7b-7c9da0b38349"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [InteresseHentResultat](#97b5e403-ff5d-42a5-b3dc-e37026114ca6)  

## <a name="ae5b411a-450a-4023-b537-aa5cc3dbc2c2"></a>Operation: PinkodeNulstil

  Sender en email om nulstilling af pinkode til lånerens emailadresse.    
      
### Request: <a name="2d5d9fa4-ac94-4ba4-a6b9-c2db889e0522"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`LånerEmailAdresse` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="f257671d-0510-4e79-b500-36f76ee7da4c"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  

            PinkodeNulstilSvar
            DataElement
            Britt Montesinos
            2026 02 26 14.54:30
            2026 02 26 14.59:17
            Britt Montesinos
            All Users
            rwrwr-      
            0      
            0      
              Development  
            
                
                 
                  
                
                 
                  
                
                 
                  
              Svaret på forespørgslen på nulstilling af en specifik låners pinkode.  
      
         
## <a name="b0bee980-9629-4a36-b192-6b9dbe112ee1"></a>Operation: ReservationSlet
### Request: <a name="5f7bdab6-d3f0-4305-95dd-7080998f8a3e"></a>delete  
*HTTP Method:* DELETE  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`RekvisitionNummer` | Query |  |  
  

### Response: <a name="68e0dc5b-ac43-477b-9683-a00ef6c97d19"></a>delete_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [RekvisitionSlettetResultat](#042ae6e0-c523-489e-b5f0-0ab89205af9a)  

## <a name="b6097504-a975-4051-8889-3a4636c21d54"></a>Operation: ReservationHent
### Request: <a name="463bcde6-7c78-48da-b455-638564155aff"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="ed010a48-04ca-4f3b-af2a-343396f56f17"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [ReservationHentResultat](#e4cb1a2a-50fc-456d-b793-1220da5285d2)  

## <a name="c085d487-9090-480d-9858-eea879905270"></a>Operation: TilgængelighedHent

  Forespørgslen returnerer en liste over tilgængelige materialer for hver manifestation.    
      

  Forespørgslen returnerer en liste over tilgængelige materialer for hver manifestation.- GraphQL-sektionen.    
      
### Request: <a name="f5ae58c4-b0c1-430d-b6f9-dd9cab17c46e"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`ManifestationFAUSTNummer` | Query |  |  
|`FilialISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="ef3d0f36-2ef3-45f3-8d45-422eef2de030"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [Tilgængelighed](#6d1807a2-12fe-4e35-be2a-c167c926e2b9)  

## <a name="c83ab540-fc5f-41dc-a020-bf17a01ab9f0"></a>Operation: BookingSlet

  Kaldet sletter specifikke bookinger for en låner.    
      
### Request: <a name="36e2273e-cc41-4b38-92b2-7a4551a5b9a4"></a>delete  
*HTTP Method:* DELETE  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`RekvisitionNummer` | Query |  |  
  

### Response: <a name="296f4815-7219-4860-be53-ad2ad019c509"></a>delete_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [RekvisitionSlettetResultat](#042ae6e0-c523-489e-b5f0-0ab89205af9a)  

## <a name="cbc62641-a786-4392-a567-45bc83029308"></a>Operation: LånerOpdater

  Kaldet opdaterer en låners informationer. Navn og adresse kan dog ikke opdateres.  
   
Det er muligt at opdatere enten en eller flere af følgende informationer for en låner:  
-Pinkode  
-Foretrukket afhentningsfilial  
-Fraværsperiode  
-emailadresser  
-Telefonnumre  
-Notifikationskanaler  
-Lånerinteresser  
   
Hvis flere emailadresser eller telefonnumre har ModtagNotifikation sat til Sand, så vil kun en af hver type blive sat til lånerens foretrukne notifikationskanal.    
      
### Request: <a name="0041b499-8dcd-4e73-ad47-51643e383edb"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
| (`LånerPinkode`) | Query |  |  
| (`LånerForetrukketAfhentningFilial`) | Query | Lånerens foretrukne afhentningsfilial |  
| (`LånerFraværsperiodeFra`) | Query |  |  
| (`LånerFraværsperiodeTil`) | Query |  |  
| (`EmailDetalje`) | Query | En låners email, om den er verificeret samt der skal kunne modtages notifikationer via denne. |  
| (`TelefonnummerDetalje`) | Query | En låners telefonnummer samt om der skal kunne modtages notifikationer via denne. |  
| (`NotifikationProtokolForkortelse`) | Query |  |  
| (`LånerInteresseNavnForkortet`) | Query | Et interesseområde, som en låner kan have. |  
  

*Content-Type:* application/json  
### Response: <a name="df736dc5-65ef-44bd-bd50-145cb039be1a"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [LånerOpdaterResultat](#5f76d24a-b802-409a-8d15-93d203129291)  

## <a name="d0287e4f-e3c3-414b-a8d6-d04fc44ab725"></a>Operation: ÅbningstidHent

  Returnerer en filials åbningstider samt typen af åbningstider.    
      
### Request: <a name="8ced5442-b20d-4314-91b9-9152b4f10b8f"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`FilialISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="0b13913b-70a0-49a1-a0a0-081309564c1d"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [ÅbningstiderHentResultat](#842c5bc6-d596-4de8-a6e7-5d9635821dc5)  

## <a name="d7054982-a3b2-4603-a27b-4e83da65e31a"></a>Operation: BibliotekKontaktInformationHent

  Forespørgslen henter en liste af filialinformationer for et givet bibliotek.    
      
### Request: <a name="a2096d0d-e57a-431a-99c3-f4629495556a"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`FilialISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="0932ccea-0ca1-47b0-b1cb-b0f791a363f3"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [BibliotekKontaktInformationHentResultat](#c585d78e-138f-4837-ab43-ee76aa05c9a5)  

## <a name="e284dcaf-ebaa-444e-a949-11416f9a54da"></a>Operation: LånerSlet

  Forespørgslen sletter en given låner. Låneren kan dog kun slettes, hvis låneren ikke har aktive lån eller mellemværende.    
      
### Request: <a name="719f22b4-95f0-4f2c-b9de-5a861ea4a783"></a>delete  
*HTTP Method:* DELETE  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="aad2de38-2d21-495a-b6ef-5bef8272ae49"></a>delete_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [LånerSletResultat](#77f1ab56-946c-4990-a4ae-1196288793f1)  

## <a name="f00c079e-f2c6-43c8-be64-632982f1a791"></a>Operation: ReservationOpdater

  Kaldet opdaterer eksisterende reservationer for en låner.    
      
### Request: <a name="009daf0e-6220-44f1-842d-c3669036d5c1"></a>post  
*HTTP Method:* POST  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
|`LånerID` | Query |  |  
|`RekvisitionNummer` | Query |  |  
| (`RekvisitionAfhentningsFrist`) | Query |  |  
| (`RekvisitionAfhentningssted`) | Query | Definition: Filialnummeret er en fortløbende nummerering af filialerne/betjeningsstederne under biblioteket Kommentar: For folkebiblioteker består biblioteksnummeret af tallet 7 + det 3-cifrede kommunenummer + et 2-cifret filialnummer. Kilde: International Standard Identifier for Libraries and Related Organizations (ISO 15511) |  
| (`RekvisitionAktiveringsDato`) | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="b97ca901-04d1-4e78-9546-16345575585b"></a>post_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [ReservationOpdaterResultat](#7a7f6acf-21db-4728-9e57-9e624424947e)  

## <a name="fe5e27bd-5cb5-4a41-ad11-99e0583018ed"></a>Operation: NotifikationKanalHent

  Henter en liste over mulige notifikationsprotokoller, som et bibliotek anvender, og som kan tilknyttes lånere.    
      
### Request: <a name="ba98143b-3ce4-43f5-a8af-e235fabb6996"></a>get  
*HTTP Method:* GET  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header | Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |
|(`x-OnBehalfOfUser`)               | Header | Identifikation af en bruger i det kaldende system |
|(`x-Rute-AfsenderOrganisation`)    | Header | Identificerer kaldende organisation. |
|(`x-Rute-AfsenderItSystemInstans`) | Header | En UUID der identificerer kaldende it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Rute-ModtagerOrganisation`)    | Header | Identificerer modtagende organisation. |
|(`x-Rute-ModtagerItSystemInstans`) | Header | En UUID der identificerer kaldte it-systeminstans, indsat af kalder. UUID refererer til it-systeminstans fra KOMBIT Organisation støttesystem. |
|(`x-Processing`)                   | Header | Mulighed for at passere yderligere kontekstuelle variable, f.eks. instrukser til teststubbe. |
|`BibliotekssektorISILNummer` | Query |  |  
  

*Content-Type:* application/json  
### Response: <a name="8923287e-3a74-4c70-a78a-def97e7de75f"></a>get_200  


|Parameter                          | Type   | Beskrivelse |
|:----------------------------------|:-------|:------------|
|`x-TransaktionsId`                 | Header | Unik identifier for konversation. Når kald og svar hænger sammen som dele af samme konversation, bruges samme TransaktionsId i både kald og svar. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsId også videre uændret. |
|`x-TransaktionsTid`                | Header |Tidsstempel der påsættes af oprindelig kalder, som indikering af kaldstidspunktet som det opfattes af kalder. Når et kald passeres videre til eller fra et undersystem, passeres TransaktionsTid også videre uændret. |
|(`x-RequestId`)                    | Header | En UUID der unik identificerer de enkelte kald og eventuelle genkald. |

*Body:*  
##### Datastruktur: [NotifikationKanalHentResultat](#f35d4a6f-7aff-4baa-9214-924586a0f539)  

## Datastrukturer:


#### Datastruktur: <a name="8938beb1-2f45-4c3e-a8cc-b95d462629ee"></a>Afdeling  
**UUID:** 8938beb1-2f45-4c3e-a8cc-b95d462629ee  


~~~
  PlaceringAfdelingNummer  
  PlaceringAfdelingNavn  
  
~~~
#### Datastruktur: <a name="288d966f-57f9-418f-9e68-1e36ab883343"></a>AfdelingHentResultat  
**UUID:** 288d966f-57f9-418f-9e68-1e36ab883343  


  Returnerer en liste af afdelinger.    
      

~~~
  *AfdelingListe*  
  {  
    Afdeling  
  }  
  
~~~
#### Datastruktur: <a name="6aea86b0-2824-4f62-b2d6-643c98fd3247"></a>Beholdning  
**UUID:** 6aea86b0-2824-4f62-b2d6-643c98fd3247  


  Beskriver beholdningerne inkl. placeringer for en given manifestation.    
      

~~~
  *MaterialeListe*  
  {  
    *Materiale*  
      [  
        MaterialeNummer  
        LånAfleveringsFrist  
        MaterialegruppeNavn  
        (  
          Periodika  
        )  
        TilgængeligMarkering  
      ]  
  }  
  LMSPlacering  
  (  
    *CMS-delplaceringListe*  
      [  
        *CMS-delplacering*  
        {  
          CMSPlaceringDelplacering  
        }  
      ]  
  )  
  
~~~
#### Datastruktur: <a name="98061173-78f9-416f-aa4c-0bf1b52e7c05"></a>BeholdningManifestation  
**UUID:** 98061173-78f9-416f-aa4c-0bf1b52e7c05  


  En liste over beholdninger for det forespurgte FAUST-nummer samt deres placering.    
      

~~~
  ManifestationFAUSTNummer  
  AntalReservationer  
  KanReserveres  
  *BeholdningListe*  
  {  
    Beholdning  
  }  
  
~~~
#### Datastruktur: <a name="9ed21161-cb61-4052-b3ea-b031dd7079d8"></a>Beholdninger  
**UUID:** 9ed21161-cb61-4052-b3ea-b031dd7079d8  


  En liste over beholdninger for de forespurgte FAUST-numre samt deres placering.    
      

~~~
  *BeholdningManifestationListe*  
  {  
    BeholdningManifestation  
  }  
  
~~~
#### Datastruktur: <a name="c585d78e-138f-4837-ab43-ee76aa05c9a5"></a>BibliotekKontaktInformationHentResultat  
**UUID:** c585d78e-138f-4837-ab43-ee76aa05c9a5  


  Returnerer en liste over kontaktinformationerne for de forespurgte filialer.    
      

~~~
  *KontaktInformationListe*  
  {  
    KontaktInformation  
  }  
  
~~~
#### Datastruktur: <a name="493a700e-7a28-41a6-82f4-12d647544c3a"></a>BlokeringÅrsag  
**UUID:** 493a700e-7a28-41a6-82f4-12d647544c3a  


  Angiver årsag til blokering.    
      

~~~
  BlokeringÅrsagKode  
  BlokeringÅrsagBeskrivelse  
  BlokeringDato  
  
~~~
#### Datastruktur: <a name="286f482f-b708-4cf0-82c8-8b90024a5c47"></a>BookingDetalje  
**UUID:** 286f482f-b708-4cf0-82c8-8b90024a5c47  


~~~
  ManifestationFAUSTNummer  
  BookingØnsketAntal  
  BookingMinimumAntal  
  (  
    RekvisitionNote  
  )  
  BookingStartDato  
  BookingSlutDato  
  LånergruppeID  
  RekvisitionAfhentningssted  
  *AnmodetFraFilial*  
    [  
      FilialISILNummer  
    ]  
  
~~~
#### Datastruktur: <a name="d37a7c71-296e-4342-8e48-659237be5918"></a>BookingHentResultat  
**UUID:** d37a7c71-296e-4342-8e48-659237be5918  


  Liste over bookinger oprettet af en specifik låner.    
      

~~~
  *BookingListe*  
  {  
    *Booking*  
      [  
        RekvisitionNummer  
        BookingStatus  
        BookingDetalje  
      ]  
  }  
  
~~~
#### Datastruktur: <a name="4c2f4b93-1181-4d4b-8bfa-04c000a2b8ff"></a>BookingOpdater  
**UUID:** 4c2f4b93-1181-4d4b-8bfa-04c000a2b8ff  


~~~
  RekvisitionNummer  
  BookingOpdaterStatus  
  BookingDetalje  
  
~~~
#### Datastruktur: <a name="5a0cf6a8-e77f-47a6-a6cb-f558b0a06e16"></a>BookingOpdaterResultat  
**UUID:** 5a0cf6a8-e77f-47a6-a6cb-f558b0a06e16  


  Liste over opdaterede bookinger foretaget af en specifik låner.    
      

~~~
  *BookingOpdaterListe*  
  {  
    BookingOpdater  
  }  
  
~~~
#### Datastruktur: <a name="59fe03f4-809c-471f-ada6-6ac346533b55"></a>BookingOpret  
**UUID:** 59fe03f4-809c-471f-ada6-6ac346533b55  


  En oprettet booking.    
      

~~~
  RekvisitionNummer  
  BookingOpretStatus  
  BookingDetalje  
  
~~~
#### Datastruktur: <a name="179ec834-86e7-4a51-88b8-76edb09294f2"></a>BookingOpretResultat  
**UUID:** 179ec834-86e7-4a51-88b8-76edb09294f2  


  Liste over oprettede bookinger foretaget af en specifik låner.    
      

~~~
  *BookingOprettetListe*  
  {  
    BookingOpret  
  }  
  
~~~
#### Datastruktur: <a name="24296a95-ee85-45a6-be18-3765d493c54b"></a>Delopstilling  
**UUID:** 24296a95-ee85-45a6-be18-3765d493c54b  


~~~
  PlaceringDelopstillingNummer  
  PlaceringDelopstillingNavn  
  
~~~
#### Datastruktur: <a name="76b67d4c-21d5-41ed-99f5-4039ac32b772"></a>DelopstillingHentResultat  
**UUID:** 76b67d4c-21d5-41ed-99f5-4039ac32b772  


  Returnerer en liste af delopstillinger.    
      

~~~
  *DelopstillingListe*  
  {  
    Delopstilling  
  }  
  
~~~
#### Datastruktur: <a name="7f79475c-9259-4763-a20a-72c20d4e02aa"></a>EmailDetalje  
**UUID:** 7f79475c-9259-4763-a20a-72c20d4e02aa  


  En låners email, om den er verificeret samt der skal kunne modtages notifikationer via denne.     
      

~~~
  ModtagNotifikation  
  LånerEmailAdresse  
  VerifiseretEmail  
  
~~~
#### Datastruktur: <a name="e46bb76e-56a0-4695-840c-e23d1da2e26c"></a>Filial  
**UUID:** e46bb76e-56a0-4695-840c-e23d1da2e26c  


  Angivelse af filialinformationer    
      

~~~
  FilialISILNummer  
  FilialNavn  
  
~~~
#### Datastruktur: <a name="33fa98f8-2f46-43a6-abc4-1679071ac4db"></a>FilialHentResultat  
**UUID:** 33fa98f8-2f46-43a6-abc4-1679071ac4db  


  Returnerer en liste af filialer.    
      

~~~
  *FilialListe*  
  {  
    Filial  
  }  
  
~~~
#### Datastruktur: <a name="aac1193a-946d-4dc5-8775-e32ef06494a0"></a>FjernlånManifestation  
**UUID:** aac1193a-946d-4dc5-8775-e32ef06494a0  


  Relevante manifestationsinformationer for et fjernlån.    
      

~~~
  ManifestationFAUSTNummer  
  (  
    AktørNavn  
  )  
  (  
    *ISBN*  
      [  
        IdentifikationNummer  
      ]  
  )  
  (  
    PeriodikaPublikationNummer  
  )  
  (  
    PeriodikaPublikationVolumen  
  )  
  (  
    UdgaveBetegnelse  
  )  
  (  
    SprogSprogkode  
  )  
  (  
    ManifestationKategori  
  )  
  (  
    TitelNavn  
  )  
  (  
    *ISSN*  
      [  
        IdentifikationNummer  
      ]  
  )  
  MaterialetypeBeskrivelse  
  (  
    ManifestationUdgiver  
  )  
  (  
    ManifestationOriginalUdgivelseÅr  
  )  
  (  
    UdgaveUdgivelsesår  
  )  
  
~~~
#### Datastruktur: <a name="d7fdc192-fafc-43f1-956a-e4b0a753abc6"></a>ForetrukketSprogHentResultat  
**UUID:** d7fdc192-fafc-43f1-956a-e4b0a753abc6  


  Returnerer en liste over de sprog, som biblioteket understøtter.    
      

~~~
  *SprogListe*  
  {  
    LånerSprog  
  }  
  
~~~
#### Datastruktur: <a name="f04bda12-2ac6-4da9-a357-25a985952fea"></a>FornyLån  
**UUID:** f04bda12-2ac6-4da9-a357-25a985952fea  


  Beskriver et aktivt lån samt resultatet af forespørgelsen på fornyelse, som en specifik låner foretaget.     
      

~~~
  LånDetaljer  
  *FornyelsesStatusListe*  
  {  
    FornyelseStatus  
  }  
  
~~~
#### Datastruktur: <a name="5fbfb97c-40a3-4d3c-9bef-d46cd61562d0"></a>FornyLånResultat  
**UUID:** 5fbfb97c-40a3-4d3c-9bef-d46cd61562d0  


~~~
  *FornyLånListe*  
  {  
    FornyLån  
  }  
  
~~~
#### Datastruktur: <a name="97b5e403-ff5d-42a5-b3dc-e37026114ca6"></a>InteresseHentResultat  
**UUID:** 97b5e403-ff5d-42a5-b3dc-e37026114ca6  


  Returnerer en liste over de interesseområder biblioteket har opsat for deres lånere.    
      

~~~
  *LånerInteresseListe*  
  {  
    LånerInteresseNavnForkortet  
  }  
  
~~~
#### Datastruktur: <a name="c58ddad2-9e44-416e-b6de-bc425d9d650b"></a>KontaktInformation  
**UUID:** c58ddad2-9e44-416e-b6de-bc425d9d650b  


  En filials kontaktinformationer.    
      

~~~
  FilialISILNummer  
  FilialNavn  
  CVRAdresseVejnavn  
  CPRAdresseHusnummer  
  CVRAdressePostnummer  
  CVRAdressePostdistrikt  
  FilialKontaktTelefonnummer  
  FilialKontaktEmail  
  FilialHjemmeside  
  
~~~
#### Datastruktur: <a name="ebed0eaf-3153-4cfe-963d-9e03a4b87909"></a>LMSPlacering  
**UUID:** ebed0eaf-3153-4cfe-963d-9e03a4b87909  


  Placering for materiale.    
      

~~~
  (  
    Afdeling  
  )  
  (  
    Sektion  
  )  
  (  
    Opstilling  
  )  
  (  
    Delopstilling  
  )  
  
~~~
#### Datastruktur: <a name="f12be18f-fb05-4bed-8e15-efd61f8acbca"></a>LukkedagHentResultat  
**UUID:** f12be18f-fb05-4bed-8e15-efd61f8acbca  


  Returnerer en liste over de lukkedage, de er registreret for en specifik filial i et forespurgt tidsrum.    
      

~~~
  *LukkedagListe*  
  {  
    *Lukkedag*  
      [  
        FilialISILNummer  
        LukkedagBeskrivelse  
        LukkedagDato  
      ]  
  }  
  
~~~
#### Datastruktur: <a name="637392dc-f513-4d93-8b39-2fcc25f54c83"></a>Lån  
**UUID:** 637392dc-f513-4d93-8b39-2fcc25f54c83  


  Beksriver et aktivt lån.  Anvendes i forbindelse med, at der hentes en liste over aktuelle lån, som en specifik låner har.    
      

~~~
  LånDetaljer  
  KanFornys  
  UdlånsprofilFastAfleveringsdato  
  
~~~
#### Datastruktur: <a name="6bb54604-6e6b-4cfa-8cb8-398125a7d7d4"></a>LånDetaljer  
**UUID:** 6bb54604-6e6b-4cfa-8cb8-398125a7d7d4  


~~~
  ManifestationFAUSTNummer  
  FjernlåntMaterialeMarkering  
  MaterialeGruppe  
  (  
    Periodika  
  )  
  LånAfleveringsfrist  
  (  
    FjernlånManifestation  
  )  
  ForventetGebyr  
  LånUdlånsdato  
  AntalFornyelse  
  MaterialeNummer  
  LånID  
  
~~~
#### Datastruktur: <a name="581ccdc9-47a8-4503-8197-815d4b7371ab"></a>LånerDetaljer  
**UUID:** 581ccdc9-47a8-4503-8197-815d4b7371ab  


~~~
  LånerID  
  LånerKaldenavn  
  (  
    LånerSprog  
  )  
  LånerForetrukketAfhentningFilial  
  (  
    LånerFraværsperiodeFra  
  )  
  (  
    LånerFraværsperiodeTil  
  )  
  (  
    *BlokeringÅrsagListe*  
    {  
      BlokeringÅrsag  
    }  
  )  
  (  
    *TelefonnummerListe*  
    {  
      TelefonnummerDetalje  
    }  
  )  
  (  
    *EmailListe*  
    {  
      EmailDetalje  
    }  
  )  
  (  
    *LånerRettighedListe*  
    {  
      LånerRettighedNavn  
    }  
  )  
  LånerFysiskPost  
  LånerTilladBooking  
  (  
    LånerNoteTilLåner  
  )  
  FilialStandardInteressePeriode  
  (  
    *NotifikationKanalListe*  
    {  
      NotifikationProtokolForkortelse  
    }  
  )  
  (  
    *LånerInteresserListe*  
    {  
      LånerInteresseNavnForkortet  
    }  
  )  
  
~~~
#### Datastruktur: <a name="577d50ce-ea2f-4d39-b2e8-a8b0813390c2"></a>LånerGruppe  
**UUID:** 577d50ce-ea2f-4d39-b2e8-a8b0813390c2  


  Lånergruppens basale informationer.    
      

~~~
  LånergruppeID  
  LånergruppeNavn  
  LånergruppeBeskrivelse  
  (  
    *UndergruppeListe*  
    {  
      Lånergruppe  
    }  
  )  
  
~~~
#### Datastruktur: <a name="7290d4e2-7da3-4fa9-999d-898b637523f6"></a>LånerGruppeHentResultat  
**UUID:** 7290d4e2-7da3-4fa9-999d-898b637523f6  


  Returnerer roden af Lånergruppehierakiet for en specifik filial.    
      

~~~
  *LånerGruppeListe*  
  {  
    LånerGruppe  
  }  
  
~~~
#### Datastruktur: <a name="2f6e0292-9ad1-4002-9f45-c9c6dbf0de83"></a>LånerHentResultat  
**UUID:** 2f6e0292-9ad1-4002-9f45-c9c6dbf0de83  


  Returnerer en låners informationer. En låner kan være af typerne Personlåner, Virksomhedslåner, Gruppelåner og Biblioteklåner.    
      

~~~
  *LånerValg*  
    [  
      *PersonLåner*  
        [  
          LånerFødselsdato  
          LånerBorKommunen  
        ]  
    ]  
    |  
    [  
      *VirksomhedLåner*  
        [  
          VirksomhedslånerCvrNummer  
          VirksomhedslånerKontaktperson  
        ]  
    ]  
    |  
    [  
      *GruppeLåner*  
        [  
          IkkepersonliglånerKontaktperson  
        ]  
    ]  
    |  
    [  
      *BibliotekLåner*  
        [  
          FilialISILNummer  
        ]  
    ]  
  LånerDetaljer  
  
~~~
#### Datastruktur: <a name="302fdb14-3a33-45de-858f-b0087b0743e6"></a>LånerMellemværendeResultat  
**UUID:** 302fdb14-3a33-45de-858f-b0087b0743e6  


  Liste over en specifik låners mellemværende med tilhørende materialer.    
      

~~~
  *MellemværendeListe*  
  {  
    Mellemværende  
  }  
  
~~~
#### Datastruktur: <a name="5f76d24a-b802-409a-8d15-93d203129291"></a>LånerOpdaterResultat  
**UUID:** 5f76d24a-b802-409a-8d15-93d203129291  


  Returnerer svarene på opdatering af lånerinformationerne.    
      

~~~
  *LånerOpdateretSvarListe*  
  {  
  }  
  
~~~
#### Datastruktur: <a name="77f1ab56-946c-4990-a4ae-1196288793f1"></a>LånerSletResultat  
**UUID:** 77f1ab56-946c-4990-a4ae-1196288793f1  


  Returnerer resultatet af slet-forespørgslen.    
      

~~~
  *LånerSletSvarListe*  
  {  
    LånerSletSvar  
  }  
  
~~~
#### Datastruktur: <a name="4b8bf6ed-0fd6-4481-ac76-1e12c725030f"></a>MaterialeGruppe  
**UUID:** 4b8bf6ed-0fd6-4481-ac76-1e12c725030f  



Materialegrupper anvendes til at gruppere materialer efter et formål, således at de kan behandles som en samlet enhed.



~~~
  MaterialegruppeNavn  
  (  
    MaterialegruppeBeskrivelse  
  )  
  
~~~
#### Datastruktur: <a name="3bcc6aec-a72d-4223-b9d4-0cff10ec5dae"></a>MaterialeLån  
**UUID:** 3bcc6aec-a72d-4223-b9d4-0cff10ec5dae  


  Henter en liste af aktuelle lån, som en låner har.    
      

~~~
  *LånListe*  
  {  
    Lån  
  }  
  
~~~
#### Datastruktur: <a name="45a44fda-28f3-4181-a566-c81f5ddb94e4"></a>Mellemværende  
**UUID:** 45a44fda-28f3-4181-a566-c81f5ddb94e4  


  Liste over en specifik låners mellemværender    
      

~~~
  MellemværendeBeløb  
  BetalingDato  
  MellemværendeType  
  *MellemværendeMaterialeListe*  
  {  
    MellemværendeMateriale  
  }  
  MellemværendeNoteTilLåner  
  (  
    MellemværendeForfaldsdato  
  )  
  MellemværendeDato  
  MellemværendeID  
  
~~~
#### Datastruktur: <a name="38db8f57-42a9-4eec-85ca-3de7da17ce7f"></a>MellemværendeMateriale  
**UUID:** 38db8f57-42a9-4eec-85ca-3de7da17ce7f  


  Liste over materialer, som mellemværendet omhandler.    
      

~~~
  ManifestationFAUSTNummer  
  MaterialeGruppe  
  (  
    Periodika  
  )  
  MaterialeNummer  
  
~~~
#### Datastruktur: <a name="938d3a62-041a-406a-b6ad-091023887f2f"></a>NotifikationKanal  
**UUID:** 938d3a62-041a-406a-b6ad-091023887f2f  


  Informationer om en notifikationsprotokol.    
      

~~~
  NotifikationProtokolForkortelse  
  NotifikationProtokolNavn  
  
~~~
#### Datastruktur: <a name="f35d4a6f-7aff-4baa-9214-924586a0f539"></a>NotifikationKanalHentResultat  
**UUID:** f35d4a6f-7aff-4baa-9214-924586a0f539  


  Liste over de notifikationsprotokoller et givet bibliotek tillader.    
      

~~~
  *NotifikationKanalListe*  
  {  
    NotifikationKanal  
  }  
  
~~~
#### Datastruktur: <a name="d41168e0-eaa6-4818-b974-cf846d6be5e0"></a>Opstilling  
**UUID:** d41168e0-eaa6-4818-b974-cf846d6be5e0  


~~~
  PlaceringOpstillingNummer  
  PlaceringOpstillingNavn  
  
~~~
#### Datastruktur: <a name="e1fecf8d-137d-47a9-9022-c8864162f702"></a>OpstillingHentResultat  
**UUID:** e1fecf8d-137d-47a9-9022-c8864162f702  


  Returnerer en liste af opstillinger.    
      

~~~
  *OpstillingListe*  
  {  
    Opstilling  
  }  
  
~~~
#### Datastruktur: <a name="50ce4ba2-ac9d-430a-b8e1-f2a5ca73d77e"></a>Periodika  
**UUID:** 50ce4ba2-ac9d-430a-b8e1-f2a5ca73d77e  


  Periodika er publikationer, der udsendes successivt. Periodika omfatter bl.a. aviser, tidsskrifter og årspublikationer.    
      

~~~
  (  
    PeriodikaPublikationVolumen  
  )  
  (  
    PeriodikaPublikationÅrgang  
  )  
  (  
    PeriodikaPublikationÅr  
  )  
  PeriodikaPublikationTekst  
  (  
    PeriodikaPublikationNummer  
  )  
  
~~~
#### Datastruktur: <a name="038c1100-e134-419c-a388-15e6661870cf"></a>PeriodikaReservation  
**UUID:** 038c1100-e134-419c-a388-15e6661870cf  


~~~
  PeriodikaPublikationVolumen  
  PeriodikaPublikationÅrgang  
  (  
    PeriodikaPublikationNummer  
  )  
  
~~~
#### Datastruktur: <a name="042ae6e0-c523-489e-b5f0-0ab89205af9a"></a>RekvisitionSlettetResultat  
**UUID:** 042ae6e0-c523-489e-b5f0-0ab89205af9a  


  Resultat over Liste over slettede rekvisitioner.    
      

~~~
  *SlettetRekvisitionListe*  
  {  
    *SlettetRekvisition*  
      [  
        RekvisitionNummer  
        RekvisitionSletStatus  
      ]  
  }  
  
~~~
#### Datastruktur: <a name="2161e396-981f-4bfa-9736-a44743bc00a6"></a>ReservationDetalje  
**UUID:** 2161e396-981f-4bfa-9736-a44743bc00a6  


  En oplistning af detaljerne på en reservation.    
      

~~~
  RekvisitionNummer  
  ManifestationFAUSTNummer  
  RekvisitionAfhentningssted  
  (  
    RekvisitionAfhentningsNummer  
  )  
  (  
    ParallelTransaktionId  
  )  
  RekvisitionDato  
  (  
    RekvisitionAfhentningsFrist  
  )  
  (  
    RekvisitionAktiveringsDato  
  )  
  (  
    RekvisitionEstimatAntalDage  
  )  
  (  
    FjernlånManifestation  
  )  
  (  
    RekvisitionKøNummer  
  )  
  RekvisitionInteressefrist  
  (  
    Periodika  
  )  
  RekvisitionReservationType  
  RekvisitionStatus  
  
~~~
#### Datastruktur: <a name="e4cb1a2a-50fc-456d-b793-1220da5285d2"></a>ReservationHentResultat  
**UUID:** e4cb1a2a-50fc-456d-b793-1220da5285d2  


  Liste over reservationer foretaget af en specifik låner.    
      

~~~
  *ReservationHentResultat*  
  {  
    ReservationDetalje  
  }  
  
~~~
#### Datastruktur: <a name="7a7f6acf-21db-4728-9e57-9e624424947e"></a>ReservationOpdaterResultat  
**UUID:** 7a7f6acf-21db-4728-9e57-9e624424947e  


  Liste over resultater af reservationsopdateringer.    
      

~~~
  *ReservationOpdaterListe*  
  {  
    ReservationOpretOpdater  
  }  
  
~~~
#### Datastruktur: <a name="04d087e2-719b-4efc-a189-da9e708cd8e1"></a>ReservationOpretOpdater  
**UUID:** 04d087e2-719b-4efc-a189-da9e708cd8e1  


  Resultatet af en reservationsoprettelse eller opdatering.    
      

~~~
  Reserveret  
  (  
    ReservationDetalje  
  )  
  
~~~
#### Datastruktur: <a name="309b8119-3cae-4e79-b7ed-d0751d45054d"></a>ReservationOpretResultat  
**UUID:** 309b8119-3cae-4e79-b7ed-d0751d45054d  


  Liste over resultater af reservationsoprettelser.    
      

~~~
  *ReservationOpretListet*  
  {  
    ReservationOpretOpdater  
  }  
  
~~~
#### Datastruktur: <a name="c51e1a5c-55ec-47c2-bb3a-c5fe6261fe10"></a>Sektion  
**UUID:** c51e1a5c-55ec-47c2-bb3a-c5fe6261fe10  


~~~
  PlaceringSektionNummer  
  PlaceringSektionNavn  
  
~~~
#### Datastruktur: <a name="9b00a37d-538c-4bce-8463-58b9c877935e"></a>SektionHentResultat  
**UUID:** 9b00a37d-538c-4bce-8463-58b9c877935e  


  Returnerer en liste af sektioner.    
      

~~~
  *SektionListe*  
  {  
    Sektion  
  }  
  
~~~
#### Datastruktur: <a name="98448ccb-b912-449c-96a6-1921be1d9b6b"></a>TelefonnummerDetalje  
**UUID:** 98448ccb-b912-449c-96a6-1921be1d9b6b  


  En låners telefonnummer samt om der skal kunne modtages notifikationer via denne.    
      

~~~
  ModtagNotifikation  
  LånerTelefonnummer  
  
~~~
#### Datastruktur: <a name="ff4bb9a4-bee9-46fe-84d7-6ac816ca6469"></a>TilgængeligManifestation  
**UUID:** ff4bb9a4-bee9-46fe-84d7-6ac816ca6469  


  Informationer om en manifestations tilgængelighed    
      

~~~
  ManifestationFAUSTNummer  
  AntalReservationer  
  KanReserveres  
  ErTilgængelig  
  
~~~
#### Datastruktur: <a name="6d1807a2-12fe-4e35-be2a-c167c926e2b9"></a>Tilgængelighed  
**UUID:** 6d1807a2-12fe-4e35-be2a-c167c926e2b9  


  Returnerer en liste manifestationer og informationer om deres tilgængelighed.    
      

~~~
  *TilgængeligManifestationListe*  
  {  
    TilgængeligManifestation  
  }  
  
~~~
#### Datastruktur: <a name="8e2d0a2c-99ce-4267-ac3e-7df4538c28ee"></a>Åbningstider  
**UUID:** 8e2d0a2c-99ce-4267-ac3e-7df4538c28ee  


  Åbningstiden på en specifik dag.    
      

~~~
  FilialISILNummer  
  ObjectNameStub  
  ÅbningstidType  
  ÅbningstidUgedag  
  ÅbningstidStartTidspunkt  
  ÅbningstidSlutTidspunkt  
  
~~~
#### Datastruktur: <a name="842c5bc6-d596-4de8-a6e7-5d9635821dc5"></a>ÅbningstiderHentResultat  
**UUID:** 842c5bc6-d596-4de8-a6e7-5d9635821dc5  


  Liste over åbningstiderne for en specifik filial.    
      

~~~
  *ÅbningstiderListe*  
  {  
    Åbningstider  
  }  
  
~~~

## Dataelementer:

_Felter:_  

| Element navn: | Datatype: | Beskrivelse: |
|----|----|----|
| AktørNavn| Scalar: Tekst1000  _<br/>string, <br/>maxLength:1000_  | Definition: <br/>Fulde navn i normal rækkefølgeKilde: FBI API (display, firstName, lastName,nameSort, aliases) |  
| AntalFornyelse| Scalar: TalHel2  _<br/>integer, <br/>maximum:99_  | Antallet af gange dette lån er blevet fornyet. <br/> <br/>AntalFornyelse er et transient element. <br/> |  
| AntalReservationer| Scalar: TalHel3  _<br/>integer, <br/>maximum:999_  | Angiver summen af RekvisitionNummer for en given manifestation. <br/> |  
| BetalingDato| Scalar: DatoTid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Dato, hvor betalingen blev gennemført eller registreretKilde: KL |  
| BibliotekssektorISILNummer| Scalar: ISIL  _<br/>string_  | Definition: <br/>Biblioteksnummer er det 6-cifrede nummer, som tildeles af SLKS som det officielle biblioteksnummer.Kommentar: <br/>For folkebiblioteker består biblioteksnummeret af tallet 7 + det 3-cifrede kommunenummer + et 2-cifret filialnummer. Filialnummeret er en fortløbende nummerering af filialerne/betjeningsstederne. Dog har hovedbiblioteket altid løbenummer 00. Rækkefølgen af de øvrige filialer bestemmes af biblioteket. I tilfælde af flere bogbusser har hver bus sit eget nummer. <br/> <br/>For skoler og pædagogiske læringscentre skabes biblioteksnummeret udefra de institutionsnumre der findes i Institutionsregisteret: <br/> <br/>Hvis institutionsnummeret starter med 2: <br/>Institutionsnummeret bruges som biblioteksnummer uforandret. <br/>Hvis institutionsnummeret starter med et andet tal end 2: <br/>Det fjerde ciffer i institutionsnummeret fjernes og man tilføjer et 6-tal foran. <br/>For forskningsbiblioteker består biblioteksnummeret af tallet 8 + 4 cifre + et 1-cifret filialnummer. Filialnummeret er en fortløbende nummerering af filialerne/betjeningsstederne og hovedbiblioteket har normalt altid løbenummer 0. <br/> <br/>Kilde:International Standard Identifier for Libraries and Related Organizations (ISO 15511) |  
| BlokeringDato| Scalar: DatoTid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Dato hvor blokeringen er oprettet og trådt i kraft |  
| BlokeringÅrsagBeskrivelse|  |  |  
| BlokeringÅrsagKode| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Årsag og måde hvorved en låner pålægges restriktioner ift. anvendelse af bibliotekets faciliteter og lån af materialer.Eksempel: <br/>Afdød <br/>Blokeret af selvbetjeningsautomat <br/>Gebyrgrænse overskredet <br/> <br/>AccepteretTerm: blokeringskode |  
| BookingMinimumAntal| Scalar: TalHel3  _<br/>integer, <br/>maximum:999_  | Det minimale antal materialer, som kan opfylde bookingen. <br/> |  
| BookingOpdaterStatus| Scalar: SvarBookingOpdater  _<br/>string, <br/>enum: "OPDATERET", "BOOKING_IKKE_FUNDET", "IKKE_NOK_MATERIALER", "KAN_IKKE_OPDATERES", "LÅNER_IKKE_TILLADELSE", "ANDET"_  | Resultatet af bookingopdateringe. <br/> |  
| BookingOpretStatus| Scalar: SvarBookingOpret  _<br/>string, <br/>enum: "OPRETTET", "IKKE_NOK_MATERIALER", "KAN_IKKE_OPRETTES", "LÅNER_IKKE_TILLADELSE", "ANDET"_  | Resultatet af bookingoprettelse. <br/> |  
| BookingSlutDato| Scalar: Dato  _<br/>string, <br/>format: date_  | Slutdatoen for låneperioden. <br/> |  
| BookingStartDato| Scalar: Dato  _<br/>string, <br/>format: date_  | Startdato for låneperioden. <br/> |  
| BookingStatus| Scalar: StatusBooking  _<br/>string, <br/>enum: "AKTIV", "OPFYLDT", "UNDER_OPFYLDELSE"_  | Definition: <br/>Status på booking. <br/> Eksempelvis: <br/>- Aktiv <br/>- I proces <br/>- Opfyldt <br/>- Gennemført <br/>- Afvist <br/>- Slettet <br/> |  
| BookingØnsketAntal| Scalar: TalHel3  _<br/>integer, <br/>maximum:999_  | Det ønskede antal materialer, som bookingen vedrører <br/> |  
| CMSPlaceringDelplacering| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Den placering, som vises på bibliotekernes hjemmeside, hvor et materiale er opstillet på et bibliotek. <br/> |  
| CPRAdresseHusnummer| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Feltet angiver husnummer på en given bolig. <br/> |  
| CVRAdressePostdistrikt| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Postdistriktets navn <br/> Postdistriktets navn <br/> |  
| CVRAdressePostnummer| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Postnummer <br/> Postnummer <br/> |  
| CVRAdresseVejnavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Navn på vejen <br/> Navn på vejen <br/> |  
| ErTilgængelig| Scalar: Markering  _<br/>boolean_  | Angiver om materialet er tilgængeligt. <br/> |  
| FilialHjemmeside| Scalar: Tekst255  _<br/>string, <br/>maxLength:255_  | Definition: <br/>Filialens hjemmeside. <br/> |  
| FilialISILNummer| Scalar: ISIL  _<br/>string_  | Definition: <br/>Filialnummeret er en fortløbende nummerering af filialerne/betjeningsstederne under biblioteketKommentar: <br/>For folkebiblioteker består biblioteksnummeret af tallet 7 + det 3-cifrede kommunenummer + et 2-cifret filialnummer. <br/> <br/>Kilde: International Standard Identifier for Libraries and Related Organizations (ISO 15511) |  
| FilialKontaktEmail| Scalar: Tekst255  _<br/>string, <br/>maxLength:255_  | Definition: <br/>Filialens email. <br/> |  
| FilialKontaktTelefonnummer| Scalar: TalHel18  _<br/>integer, <br/>maximum:999999999999999999_  | Definition: <br/>Filialens kontakt telefonnummer. <br/> |  
| FilialNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Navnet på en specifik filial.Eksempel: <br/>Bibliotekshuset <br/> <br/>Afledt af: https://data.gov.dk/conceptl/core/organisation/organisationsenhed/navn <br/> |  
| FilialStandardInteressePeriode| Scalar: TalHel3  _<br/>integer, <br/>maximum:999_  |  |  
| FjernlåntMaterialeMarkering| Scalar: Markering  _<br/>boolean_  | Definition: <br/>Angiver at materialet er et fjernlån. <br/> |  
| FornyelseStatus| Scalar: FornyResultat  _<br/>string, <br/>enum: "FORNYET", "AFVIST_RESERVERET", "AFVIST_MAX_ANTAL_FORNYELSER", "AFVIST_BLOKERET_lÅNER", "AFVIST_MATERIALET_KAN_IKKE_LÅNES", "AFVIST_ANDEN_GRUND"_  | Angiver om materialet kan fornys <br/> |  
| ForventetGebyr| Scalar: Beløb  _<br/>number_  | Det gebyrbeløb, der ville blive opkrævet, hvis lånet blev fornyet på nuværende tidspunkt på grund af at afleveringsfristen er overskredet for lånet. Beløbet vil være 0 kr, hvis der ikke ville blive opkrævet noget gebyr, <br/> <br/>ForventetGebyr er et transient element. <br/> |  
| IdentifikationNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>ISBN: består af 13 cifre, <br/>ISSN: består af 14 tegn - <br/>ISMN: består af <br/> |  
| IkkepersonliglånerKontaktperson| Scalar: Tekst500  _<br/>string, <br/>maxLength:500_  | Definition: <br/>Navn på person der kan kontaktes. <br/> |  
| KanFornys| Scalar: Markering  _<br/>boolean_  | Angiver om et lån kan fornys. <br/> |  
| KanReserveres| Scalar: Markering  _<br/>boolean_  | Angiver om det er muligt at reservere en givet manifestation. <br/> |  
| LukkedagBeskrivelse| Scalar: Tekst255  _<br/>string, <br/>maxLength:255_  | Definition: <br/>Beskrivelse af lukkedag. <br/> Eksempelvis: <br/>Julelukket <br/>Sommerferie <br/>Påskeferie <br/>Lukket hver søndag <br/> |  
| LukkedagDato| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Dato for lukkedag <br/> |  
| LånAfleveringsFrist| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Den dato hvor låner senest skal returnere lånte materialer til biblioteket. |  
| LånID| Scalar: Tekst30  _<br/>string, <br/>maxLength:30_  | Definition: <br/>Unikt identifikationsnummer der tildeles hvert lån. |  
| LånUdlånsDato| Scalar: DatoTid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Angiver den dato og det tidspunkt, hvor lånet blev oprettet eller foretaget |  
| LånerBorKommunen| Scalar: Markering  _<br/>boolean_  | Angiver om låneren bor i den kommune, som biblioteket hører under. <br/> <br/>LånerBorKommunen er et transient element. <br/> |  
| LånerEmailAdresse| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>En eller flere emailadresser, som låneren ønsker benytte til at modtage kommunikation og information fra biblioteket |  
| LånerForetrukketAfhentningFilial| Scalar: ISIL  _<br/>string_  | Definition: <br/>Låners foretrukne afhentningssted. |  
| LånerFraværsperiodeFra| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Dato for start på en fraværsperiode, hvor en låner kan sikre sig at reservationer og bestillinger ikke opfyldes i den angivne periode. <br/> |  
| LånerFraværsperiodeTil| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Slutdato for en fraværsperiode, hvor en låner kan sikre sig at reservationer og bestillinger ikke opfyldes i den angivne periode. <br/> |  
| LånerFysiskPost| Scalar: Markering  _<br/>boolean_  | Definition: <br/>Angiver om låneren skal modtage fysisk post <br/> |  
| LånerFødselsdato| Scalar: Dato  _<br/>string, <br/>format: date_  |  |  
| LånerGruppeBeskrivelse| Scalar: Tekst200  _<br/>string, <br/>maxLength:200_  | Definition: <br/>Kort tekst som kan bruges til at beskrive gruppen. |  
| LånerGruppeID| Scalar: TalHel4  _<br/>integer, <br/>maximum:9999_  | Definition: <br/>Lånergruppens unikke ID. |  
| LånerGruppeNavn| Scalar: Tekst50  _<br/>string, <br/>maxLength:50_  | Definition: <br/>Tekstuel brugervendt navngivning af gruppen. |  
| LånerID| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Systemspecifikt unikt IDnummer på låner. |  
| LånerInteresseNavnForkortet|  |  |  
| LånerKaldenavn| Scalar: Tekst50  _<br/>string, <br/>maxLength:50_  | Definition: <br/>Tekstfelt til at angive en låners kaldenavn ifm. navne- og adressebeskyttelse. |  
| LånerNoteTilLåner| Scalar: Tekst500  _<br/>string, <br/>maxLength:500_  | Definition: <br/>Oplysninger der skal videregives til låner. <br/> |  
| LånerPinkode| Scalar: TalHel10  _<br/>integer, <br/>maximum:9999999999_  | Definition: <br/>Pinkode som er tilknyttet lånerID. |  
| LånerRettighedNavn|  |  |  
| LånerSletSvar| Scalar: SvarLånerSlet  _<br/>string, <br/>enum: "SLETTET", "AFVIST_LÅN", "AFVIST_MELLEMVÆRENDE", "AFVIST_ANDET"_  |  |  
| LånerSprog| Scalar: Tekst10  _<br/>string, <br/>maxLength:10_  | Definition: <br/>Lånerens foretrukne sprog som anvendes i beskeder fra biblioteketEksempel: <br/>Dansk <br/>Engelsk |  
| LånerTelefonnummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Det telefonnummer, der er tilknyttet låneren |  
| LånerTilladBooking| Scalar: Markering  _<br/>boolean_  | Definition: <br/>Angiver om låneren må foretage bookinger. <br/> |  
| ManifestationFAUSTNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>ID-nummer til en bibliografisk post som repræsenterer en manifestation <br/>(Kilde https://www.informationsordbogen.dk/concept.php?cid=589)Kommentar: <br/>Anvendes hyppigt af bibliotekerne, som entydig identifikator af en bestemt udgave. <br/> <br/>Kilde: Felt 002 Tidligere Faustnummer eller decentralt ID-nummer (DBC), (https://www.kat-format.dk/danMARC2/Danmarc2.6.htm#pgfId=1532873) |  
| ManifestationKategori| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | m Monografi <br/>s Samlingsværk (BIA, Nationalbibliografien) <br/>p Periodicum <br/>a Analyse <br/>h Hjælpepost <br/> m Monografi <br/>s Samlingsværk (BIA, Nationalbibliografien) <br/>p Periodicum <br/>a Analyse <br/>h Hjælpepost <br/>Delfelt *t kode 'p' er obligatorisk for periodica. <br/> <br/>Monografi : Ikke-periodisk materiale, der enten er afsluttet i én del eller afsluttet eller planlagt afsluttet i et bestemt antal dele. <br/> <br/>Samlingsværk: Polygrafisk monografi eller værk, der består af flere bidrag af én eller flere forfattere. Det kan være såvel tekster som billeder. <br/> <br/>Periodicum: Materiale i et hvilket som helst medium, der udsendes i successive dele med alfabetiske, numeriske og/eller kronologiske betegnelser, og som ikke stiler mod en afslutning. Periodica omfatter fx aviser, tidsskrifter, årspublikationer (herunder visse publikationer, der udsendes regelmæssigt i nye udgaver) samt nummererede serier. <br/> <br/>Analyse: Selvstændig bibliografisk beskrivelse af en fysisk integreret del af et større værk, se også under felt 004 delfelt *a Kode for bibliografisk posttype. <br/> <br/>Hjælpepost: Se de forskellige typer af hjælpeposter i kommentaren til felt 004 delfelt *x. <br/>Kilde: danMarc2 <br/> |  
| ManifestationOriginalUdgivelseÅr| Scalar: Dato  _<br/>string, <br/>format: date_  | Dato for orginal udgaves udgivelse. <br/> |  
| ManifestationUdgiver| Scalar: Tekst1000  _<br/>string, <br/>maxLength:1000_  | Definition: <br/>Information om den entitet, der er ansvarlig for at bringe materialet til offentlighedens opmærksomhedKommentar: <br/>Kan omfatte forlag, produktionshuse, distributører eller enkeltpersoner, der er ansvarlige for at fremstille og bringe materialet til læsere eller brugere <br/> <br/>Kilde: FBI API (publisher) |  
| MaterialeNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Unikt nummer der er knyttet til det enkelte eksemplar, der er knyttet til en bibliografisk post i en materialesamling. Nummeret kan være gengivet i klartekst og som stregkode på en etiket og/eller indlagt på en RFID-chip.Kommentar: <br/>DBC koordinerer og udleverer sekvenser af materialenumre jf: https://www.dbc.dk/produkter/numre-og-stregkoder/stregkodeetiketter-sekvensnumre <br/>AccepteretTerm: materiale-id |  
| MaterialegruppeBeskrivelse| Scalar: Tekst1000  _<br/>string, <br/>maxLength:1000_  | Definition: <br/>Tekstlig beskrivelse eller forklaring af den specifikke gruppe af materialer |  
| MaterialegruppeNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Titel der identificerer den specifikke gruppe af materialer, som en række forskellige materialetyper kan tilhøre |  
| MaterialetypeBeskrivelse| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Beskrivelse af materialetypekoden. <br/>Eksempel: <br/>Film <br/>- DVD <br/>- Streaming <br/>Bøger <br/>- Trykt <br/>- Lydbøger <br/>- e-bøger <br/>- Punktskrift <br/> <br/>AccepteretTerm: type |  
| MellemværendeBeløb| Scalar: Beløb  _<br/>number_  | Definition: <br/>Det økonomiske beløb, der udgør det udestående mellem lånerne og biblioteket. Dette beløb repræsenterer den samlede økonomiske forpligtelse, som lånerne har over for biblioteket. |  
| MellemværendeDato| Scalar: DatoTid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Den dato, hvor det økonomiske udestående mellem lånerne og biblioteket er registreret. |  
| MellemværendeForfaldsdato| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Dato mellemværende senest skal betales. <br/> |  
| MellemværendeID| Scalar: TalHel10  _<br/>integer, <br/>maximum:9999999999_  | Definition: <br/>Unikt ID per mellemværende. <br/> |  
| MellemværendeNoteTilLåner| Scalar: Tekst200  _<br/>string, <br/>maxLength:200_  | Definition: <br/>Note på mellemværende som vises for låner. <br/> |  
| MellemværendeType| Scalar: TypeMellemværende  _<br/>string, <br/>enum: "GEBYR", "ERSTATNING"_  | Definition: <br/>Kategori eller art af det økonomiske mellemværende mellem lånerne og biblioteket Kommentar: <br/>Erstatning: Det beløb en låner skal betale for et materiale, der er beskadiget eller bortkommet hos låneren, og som låneren derfor skal erstatte økonomisk overfor bibliotek/PLC. <br/> <br/>Gebyr: Det beløb, som biblioteket opkræver en låner, hvis de ikke afleverer lånt materiale inden afleveringsfristens udløb. <br/> <br/> |  
| ModtagNotifikation| Scalar: Markering  _<br/>boolean_  | ModtagNotifikation anvendes sammen med en notifikationskanal og angiver om kanalen skal anvendes i forbindele med fremsendelse af notifikationer. <br/> <br/>ModtagNotifikation er et transient element <br/> |  
| NotifikationProtokolForkortelse| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Visningsnavnet på notifikationsprotokollen. <br/> |  
| NotifikationProtokolNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Navnet på notifikationsprotokollen. <br/> |  
| ParallelTransaktionId| Scalar: Tekst10  _<br/>string, <br/>maxLength:10_  | ParallelTransaktionId linker parallelle reservationer sammen. <br/> <br/>ParallelTransaktionId er et transient element. <br/> |  
| PeriodikaPublikationNummer| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Periodikas 'issue'. <br/> Kommentar: <br/>Stammer fra hostPublication, hvor issue ('Udgivelse') beskriver årgang, nummer mv. f.eks. 'Årg. 62, nr. 6 (2020)'. <br/> <br/>Kilde: FBI API |  
| PeriodikaPublikationTekst| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | En brugervenlig repræsentation af publikationens informationer. <br/> |  
| PeriodikaPublikationVolumen| Scalar: Tekst50  _<br/>string, <br/>maxLength:50_  | danMARC2 felt 245 *g numerisk eller alfabetisk betegnelse for bind (bindpost) <br/> |  
| PeriodikaPublikationÅr| Scalar: År  _<br/>integer_  | Definition: <br/>Året for første udgivelse af periodika. <br/> |  
| PeriodikaPublikationÅrgang| Scalar: Tekst50  _<br/>string, <br/>maxLength:50_  | Definition: <br/>Periodikas årgang. <br/> |  
| PinkodeNulstilSvar| Scalar: SvarPinkodeNulstil  _<br/>string, <br/>enum: "EMAIL_SENDT", "AFVIST_UKENDT_LÅNER", "AFVIST_UKENDT_EMAILADRESSE"_  | Svaret på forespørgslen på nulstilling af en specifik låners pinkode. <br/> |  
| PinkodeOpdaterSvar| Scalar: SvarPinkodeOpdater  _<br/>string, <br/>enum: "PINKODE_OPDATERET", "AFVIST_UKENDT_UUID", "AFVIST_PINKODE"_  | Svaret på forespørgslen om opdatering af en specifik låners på pinkode efter en pinkodenulstilling. <br/> |  
| PlaceringAfdelingNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Tekststreng der repræsenterer navn eller betegnelsen for en specifik placeringEksempel: <br/>Billedbøger <br/>Fjernlån <br/> <br/>Kilde: KL |  
| PlaceringAfdelingNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Unik kode eller nummer, der tjener til at identificere og skelne hver enkelt placeringEksempel: <br/>557 <br/> |  
| PlaceringDelopstillingNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Navnet op en delopstilling fx jazz, krimi, jul <br/> |  
| PlaceringDelopstillingNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Talkode for en delopstillings placeringsoplysninger af materiale. <br/> |  
| PlaceringOpstillingNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Navnet på placeringsoplysninger, som beskriver materialets præcise opstilling på det fysiske bibliotek. <br/> |  
| PlaceringOpstillingNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Talkode for en opstilling til placeringsoplysning af materiale <br/> |  
| PlaceringSektionNavn| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Navnet på den fysiske placeringsoplysning, som beskriver materialets præcise opstilling på det fysiske bibliotek. <br/> |  
| PlaceringSektionNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Talkode for den fysiske placeringsoplysning af et materiale <br/> |  
| RekvisitionAfhentningsFrist| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Den dato, hvorpå en låner senest skal afhente det rekvirerede materiale, der er stillet frem på biblioteket og er klar til udlån.Kommentar: <br/>Afhentningsfristen på baggrund af et fast antal dage, der tager højde for evt. lukkedage. Afhentningsfristen kan genstartes manuelt af medarbejder. <br/>AccepteretTerm: Afhentningsdato |  
| RekvisitionAfhentningsNummer| Scalar: Tekst10  _<br/>string, <br/>maxLength:10_  | Definition: <br/>Fortløbende nummer en rekvisition tildeles, når den ændrer status til 'Klar til afhentning'.Kommentar: <br/>Afhentningsnummer anvendes til at sætte rekvisitioner, der er klar til afhentning i rækkefølge, for at gøre det lettere for låner at finde det rekvirerede materiale. |  
| RekvisitionAfhentningssted| Scalar: Tekst30  _<br/>string, <br/>maxLength:30_  | Definition: <br/>Afhentningssted valgt af låner. Kan være andet sted end låners tilhørsfilial. <br/> |  
| RekvisitionAktiveringsDato| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Dato rekvisition må opfyldes fra. <br/> |  
| RekvisitionEstimatAntalDage| Scalar: TalHel3  _<br/>integer, <br/>maximum:999_  | Et estimeret antal dage til forventet lån. <br/> |  
| RekvisitionInteressefrist| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Tidspunktet hvor en rekvisition er aktiv eller gyldig til. Kommentar: <br/>Periode hvori en rekvisition er interessant for låner. <br/>Når interessedatoen er overskredet udløber rekvisitionen. <br/> |  
| RekvisitionKøNummer| Scalar: TalHel3  _<br/>integer, <br/>maximum:999_  | Definition: <br/>Anvendes ifm. reservationer og angiver det antal reservationer, der skal opfyldes, før materialet er tilgængeligt. |  
| RekvisitionNote| Scalar: Tekst250  _<br/>string, <br/>maxLength:250_  | Definition: <br/>En kommentar tilknyttet rekvisitionen, der kan printes på afhentningsnoten.Eksempelvis: <br/>- Tjek materiale for fej <br/>- Til udstilling om emne <br/> <br/> <br/>Kilde: KOMBIT |  
| RekvisitionNummer| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Unikt identifikationsnummer der tildeles hver rekvisition. |  
| RekvisitionOprettelsesDato| Scalar: DatoTid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Det tidspunkt, hvor rekvisitionen blev foretaget eller oprettet af låneren |  
| RekvisitionReservationType| Scalar: TypeReservation  _<br/>string, <br/>enum: "NORMAL", "SERIE", "PARALLEL", "FJERNLÅN"_  | Angiver om reservationen er en Normal, Serie eller Parallel reservation eller om reservationen er et Fjernlån. <br/> |  
| RekvisitionSletStatus| Scalar: SvarRekvisitionSlet  _<br/>string, <br/>enum: "SLETTET", "UKENDT_LÅNER", "IKKE_FUNDET", "ANDET"_  | Resultatet af sletteforespørgslen for en rekvisition. <br/> |  
| RekvisitionStatus| Scalar: StatusRekvisition  _<br/>string, <br/>enum: "AKTIV", "I_TRANSIT", "KLAR_TIL_AFHENTNING", "OPFYLDT", "UDLØBET", "PASSIV"_  | Definition: <br/>Den aktuelle tilstand for en rekvisition. Kan have følgende værdier: <br/>Aktiv <br/>I transit <br/>Klar til afhentning <br/>Opfyldt <br/>Udløbet <br/>Passiv <br/> Eksempel: <br/>Oprettet: Rekvisitionen er blevet oprettet og materialet er blevet reserveret, bestilt eller booket. <br/> <br/>Afvist: Rekvisitionen er blevet afvist af biblioteket af forskellige årsager, f.eks. manglende tilgængelighed af materialet. <br/> <br/>Annulleret: Låneren eller biblioteket har annulleret rekvisitionen, og den bliver ikke længere fulgt op. <br/> <br/>Udført: Materialet er blevet udleveret til låneren, og rekvisitionen er blevet afsluttet. <br/> <br/>Klar til afhentning: Rekvisitionen er behandlet og materialet er klargjort til afhentning <br/> <br/>Ikke afhentet indenfor afhentningsfrist: Afhentningsfrist for rekvision er overskredet og materialet er ikke afhentet. |  
| Reserveret| Scalar: Markering  _<br/>boolean_  | Indeholder svaret om reservationen er oprettet. <br/> <br/>Reserveret er et transient element. <br/> |  
| SlutDato| Scalar: Dato  _<br/>string, <br/>format: date_  | Slutdatoen for forespørgselsperioden. <br/> <br/>Elementet er et transient element. <br/> |  
| SprogSprogkode| Scalar: Tekst10  _<br/>string, <br/>maxLength:10_  | Definition: <br/>Kategorisering af sprog efter sprogkoder.Kommentar: <br/>ISO 639-2 (language codes) <br/>Eksempelvis <br/>Dansk = 'dan' <br/>Engelsk ''eng' <br/> <br/>Kilde: (danMARC2) 041 a-p |  
| StartDato| Scalar: Dato  _<br/>string, <br/>format: date_  | Startdatoen for forespørgselsperioden. <br/> <br/>Elementet er et transient element. <br/> |  
| TilgængeligMarkering| Scalar: Markering  _<br/>boolean_  | Angiver om materialet er hjemme. <br/>MaterialeStatus skal være lig med 'Hjemme' <br/> |  
| TitelNavn| Scalar: Tekst1000  _<br/>string, <br/>maxLength:1000_  | Definition: <br/>Navn eller titel Kilde: danMARC2 felt 245 a |  
| UdgaveBetegnelse| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Kort og præcis indikation af, hvilken udgave af posten det er tale om.Kommentar: <br/>kan udtrykkes ved nummer og tekst(navn) <br/> <br/>Kilde: FBI API (edition) |  
| UdgaveUdgivelsesår| Scalar: Tekst100  _<br/>string, <br/>maxLength:100_  | Definition: <br/>Det år, hvor den pågældende udgave af et værk blev udgivet eller offentliggjortKommentar: <br/>Året kan beskrives som tal eller tekst <br/> <br/>Kilde: FBI API (publicationYear) |  
| UdlånsprofilFastAfleveringsdato| Scalar: Dato  _<br/>string, <br/>format: date_  | Definition: <br/>Fastsat afleveringsdato. Eksempel: <br/>Undervisningsmaterialer der er lånt ud til skoleårets slutning, skal uafhængigt af hvornår materialet udlånes, afleveres senest på den fastsatte dato. <br/> |  
| VerifiseretEmail| Scalar: Markering  _<br/>boolean_  | VerificeretEmail anvendes sammen med LånerEmailAdresse og angiver om denne er verificeret. <br/> <br/>VerificeretEmail er et transient element. <br/> |  
| VirksomhedslånerCvrNummer|  | Definition: <br/>otte-cifret nummer, der entydigt identificerer en juridisk enhedKilde: Grunddata (Virksomhed.cvrNummer) |  
| VirksomhedslånerKontaktperson| Scalar: Tekst500  _<br/>string, <br/>maxLength:500_  | Definition: <br/>Navn på person, der kan kontaktes. <br/> |  
| emailUUID| Scalar: UUID  _<br/>string, <br/>pattern: `[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}`_  | UUID, der er sendt til låneren i forbindelse med nulstilling af pinkode. <br/> <br/>emailUUID er et transient element. <br/> |  
| ÅbningstidSlutTidspunkt| Scalar: Tid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Tidspunktet hvor åbningstiden slutter. <br/> |  
| ÅbningstidStartTidspunkt| Scalar: Tid  _<br/>string, <br/>format: date-time_  | Definition: <br/>Tidspunktet hvor åbningstiden starter. <br/> |  
| ÅbningstidType| Scalar: Tekst20  _<br/>string, <br/>maxLength:20_  | Definition: <br/>Typen af åbningstid f.eks. betjening, selvbetjening, kun adgang med sundhedskort mv. <br/> |  
| ÅbningstidUgedag| Scalar: Ugedag  _<br/>string, <br/>enum: "MANDAG", "TIRSDAG", "ONSDAG", "TORSDAG", "FREDAG", "LØRDAG", "SØNDAG"_  | Definition: <br/>Ugedagen for åbningstiden. <br/> |  



