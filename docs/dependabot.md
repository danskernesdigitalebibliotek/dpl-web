Dependabot håndtering


Runbook for mandags dependabot triage
Skriv ned i DDF > Depandabot Triage Log løbende med de forskellige ting der er gjort (med fokus på hvad der har været anderledes ifht den sædvanlige procedure)
Kig på dependabot PR liste ved at at filtrere på “dependencies” eller filtrer på Dependabot brugeren
Major opgraderinger
Hvis den er grøn så vurder om der er “safe at merge” eks.: hvis det er en dev dependency
Minor opgraderinger
Tjek for flakyness (det kan højst sansynligt være fordi et CI run er gået galt). Kør evt “@dependabot rebase” for at køre dem igen.
Codegen ramte opdateringer (Orval/Graphql Codegen)
Det kan være nødvendigt at køre branchen op lokalt og køre codegen med den nye version - og pushe det.
Security and quality Kør Claude prompt: “/security-triage Run this on the dpl-web project. Only look at: https://github.com/danskernesdigitalebibliotek/dpl-web/security/dependabot. Don’t manipulate or search for any Jira tickets.”
Kig på github alerts og se om vi kan opdatere/dismiss transitive dependencies (https://github.com/danskernesdigitalebibliotek/dpl-web/security/dependabot)
Kig på dependabot.yml efter ignores for hvert projekt og se om vi kan fjerne ignorerede pakker 
Løsninger
Nu og her

ER I SPRINT -  Task: Lav triage skill ud fra Reloads generelle skill. Køre triage skill på DDF projekt til at lave rapport
Følge prioriteret rækkefølge fra rapport


DONE - Task: Vi skal have løst problemet med opdateringer som er gået under radaren for Dependabot på Go. Tomas tager den.
Fremtid: hvordan kan vi undgå at vi havner her igen?
Jævnlig mandags triage
En triagelog som der skrives i
Gennemgå ignores som en del af triagearbejdet ved at kigge på hvor lang tid at deps har ligget der (git blame)

Regler:
Så få ignores som muligt
En dep på ignores må ikke ligge for lang tid


 
—
Action points
Vi skal have en opgave på hvordan vi opdaterer transitive dependencies (og derefter lave et mandagsprogram) - Tomas laver opgave
