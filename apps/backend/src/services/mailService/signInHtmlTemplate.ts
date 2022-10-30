export const signInMailTemplate = (
  url: string
) => `<div style="font-family: Arial, Helvetica, sans-serif">
    <div style="text-align: left; max-width: 500px; padding: 10px">
      <img
        alt="dundring.com logo"
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgOTM1LjM3IDIwOS42NiI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOnVybCgjbGluZWFyLWdyYWRpZW50KTt9LmNscy0ye2ZpbGw6IzkyYzRlYTt9PC9zdHlsZT48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudCIgeDE9IjQ2Ny42OSIgeTE9IjE0NS40MyIgeDI9IjQ2Ny42OSIgeTI9Ii0zMy45MyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzkyYzRlYSIvPjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjNzE2ZmFjIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9ImxvZ29fZ3JhZGllbnQiPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTUwMCw3Ni42MWMwLDQ1LjU1LTI5LDczLjI0LTc2LjQzLDczLjI0SDM4OWwxMy4yMS0yOS40MmgyMS41NWMyOC44OCwwLDQ2LjQ2LTE2LjU4LDQ2LjQ2LTQzLjkxLDAtMjcuNTEtMTcuNjctNDQuMjctNDYuNzMtNDQuMjdoLThsLTQuNTcsMjEuNjcsMTMuNzQtLjU0LTQzLjI5LDk2LjQ3LDYuNzgtOTUtMTYuNTcuNjZMMzg0LjQsM2gzOS4xN0M0NzEsMi45Miw1MDAsMzAuNzksNTAwLDc2LjYxWm0xMTkuNDEsNzMuMjRMNTc3LjY5LDkxLjQ2YzE1Ljc2LTUuNTYsMjcuMTQtMjIsMjcuMTQtNDAuOUM2MDQuODMsMjQuMTQsNTgyLjMzLDMsNTU0LjkxLDNINTA3bC4wOSwxNDYuODRINTM2LjZWODAuNDRsNDYuNzQsNjkuNDFabS04Mi45LTExNy42aDE5YzkuOTMsMCwxOC45NSw4LDE4Ljk1LDE4LjQ5cy04LjkzLDE4LjU4LTE4Ljk1LDE4LjQ5bC0xOS0uMDlabTg5LjksMTE3LjZoMjkuNTFWM0g2MjYuNDFabTEyNS0xNDcuMjFWODQuOUw2NjQuMzguMjdoLTEuNDZWMTUwaDI5LjUyVjY3Ljc3bDg3LjE4LDg0LjgxSDc4MVYyLjY0Wk05MzQuNjUsNjcuNDFoLTY5Vjk0LjY1aDM4Yy0xLDE3LjY3LTE2LDI4LjQyLTM3LDI4LjQyLTI4LjcsMC00OC41Ni0yMC45NS00OC41Ni00Ni40NiwwLTI3LjQyLDIzLjA1LTQ2LjczLDQ1LjgyLTQ2LjczLDEzLjEyLDAsMjYuMjQsNi4zOCwzNy43MiwxNy41OEw5MTgsMjNjLTE0LjM5LTE0LTM0LjctMjIuNzgtNTMuNzQtMjNDODIyLjIzLDAsNzg4LDM0LjYyLDc4OCw3Ni42MXMzNC4wNyw3Ni4xNiw3Ny4zNCw3Ni4xNmMzOC4yNiwwLDcwLTI2Ljg4LDcwLTczQTExOC40NiwxMTguNDYsMCwwLDAsOTM0LjY1LDY3LjQxWk00Mi43MiwzLDAsMy4xVjE0OS44NUg0Mi43MmM0Ny40NiwwLDc2LjQzLTI3LjY5LDc2LjQzLTczLjI0QzExOS4xNSwzMC43OSw5MC4xOCwyLjkyLDQyLjcyLDNabS4xOSwxMTcuNDJIMjkuNDJWMzIuMjVINDIuNjNjMjkuMDYsMCw0Ni43MywxNi43Niw0Ni43Myw0NC4yN0M4OS4zNiwxMDMuODUsNzEuNzgsMTIwLjQzLDQyLjkxLDEyMC40M1pNMTgyLjgxLDE1M2MzMS4yNSwwLDU2LjY2LTI0LjIzLDU2LjY2LTU3LjQ4VjNIMjA5Ljc4Vjk1LjQ3YTI3LDI3LDAsMSwxLTUzLjkzLDBWM2gtMjkuN1Y5NS41NkMxMjYuMTUsMTI4LjgxLDE1MS41NywxNTMsMTgyLjgxLDE1M1pNMzM0LjkzLDIuNjRWODQuOUwyNDcuOTMuMjdoLTEuNDZWMTUwSDI3NlY2Ny43N2w4Ny4xOCw4NC44MWgxLjM2VjIuNjRaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNNzgzLjI1LDIwMy42MmE2LjA2LDYuMDYsMCwxLDEsNi4wNiw2QTYuMTEsNi4xMSwwLDAsMSw3ODMuMjUsMjAzLjYyWm0xMy43Ny0xOUEyNC44OSwyNC44OSwwLDAsMSw4MjEuNTQsMTYwYzYuMTUuMDksMTEuNiwyLjUyLDE2LjU2LDcuM2wtNS40OCw3LjQ3Yy0zLjIzLTMuMTctNy4wOS01LjEtMTEuMTctNS4xYTE1LjMzLDE1LjMzLDAsMCwwLTE0LjgyLDE1YzAsOC40MSw3LjUsMTQuOTEsMTQuOCwxNC45MSw0LjMzLDAsOC4wOC0yLjMxLDExLjIyLTUuMzlsNS40NSw3LjY4Yy00LjE3LDQuMTMtOS4yMyw3LjIzLTE2LjM4LDcuMjNBMjQuNzgsMjQuNzgsMCwwLDEsNzk3LDE4NC41OFptMzguODYsMGEyNC41NywyNC41NywwLDEsMSwyNC41MiwyNC40NkEyNC42NiwyNC42NiwwLDAsMSw4MzUuODgsMTg0LjYxWm0zOS41Mi0uMDZhMTUsMTUsMCwxLDAtMTUsMTQuOTFBMTUsMTUsMCwwLDAsODc1LjQsMTg0LjU1Wm01OC41NC0yNC43OHY0OC40aC05LjQ5VjE4Ny42bC0xMy42LDE5Ljc3aC0uMDZMODk3LjE3LDE4Ny42djIwLjU3aC05LjQ5di00OC40aC41M0w5MTAuODIsMTkxbDIyLjU5LTMxLjJaIi8+PC9nPjwvZz48L3N2Zz4="
        style="max-width: 170px; margin-left: 0px"
      />
      <h1 style="font-size: 1.5rem">Use this link to sign in</h1>
      <p>
        You requested a magic login link. It will expire after 24 hours and can only
        be used once.
      </p>
      <p>Happy dundring! ⚡️</p>
      <a
        href="${url}"
        target="_blank"
        style="display: block; 
                color-scheme: light-only;
                font-size: 1.2rem;
                max-width: 250px; 
                margin: 0 auto;
                color: #ffffff !important;
                text-decoration: none;
                padding: 10px;
                border-radius: 10px;
                background: rgb(146,196,234);
                background: linear-gradient(0deg, rgba(146,196,234,1) 0%, rgba(113,111,172,1) 50%);
                font-weight: bold;
                text-align: center;"
      >
        Sign in
      </a>
    </div>
</div>`;
