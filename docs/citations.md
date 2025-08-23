## Citations approach

- The backend searches the web using DuckDuckGo's HTML endpoint and filters results by official domains.
- Returned links are passed to the model to encourage grounded answers with numbered references.

### Whitelisted official domains
- `travel.state.gov` (US Department of State)
- `uscis.gov` (USCIS)
- `ice.gov` and `ice.gov/sevis` (SEVP/SEVIS)
- `cbp.gov` (US Customs and Border Protection)
- `educationusa.state.gov` (EducationUSA)
- `usembassy.gov` (US Embassies)

The list is managed at `backend/src/services/citations/sources.js`.

### Limitations
- HTML parsing may miss some results if the page structure changes.
- Always verify up-to-date policy on the official site or with a DSO.