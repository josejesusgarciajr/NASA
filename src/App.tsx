import { useState, useEffect } from 'react'
import './App.css'

// NASA types
import type { APOD } from './types/NASA/APOD'
import type { NEOFeedResponse } from './types/NASA/NEOFeedResponse'

// NASA Components
import { APODDisplay } from './NASA_Components/APODDisplay'
import { NEOFeedDisplay } from './NASA_Components/NEOFeedDisplay'

// MATERIAL UI
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

function App() {
  const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY;

  // APOD
  const [apod, setApod] = useState<APOD | null>(null);
  const [loadingAPOD, setLoadingAPOD] = useState<boolean>(false);
  const [errorAPOD, setErrorAPOD] = useState<string>('');

  // NEO
  const [neoFeedResponse, setNeoFeedResponse] = useState<NEOFeedResponse | null>(null);
  const [loadingNEO, setLoadingNEO] = useState<boolean>(false);
  const [loadingNEOSELF, setLoadingNEOSELF] = useState<boolean>(false);
  const [errorNEO, setErrorNEO] = useState<string>('');

  const today = new Date();
  const localDate = today.toLocaleDateString('en-CA');
  const date7DaysOut = addDays(today, 7).toLocaleDateString('en-CA');

  const NASA_NEO_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${localDate}&end_date=${date7DaysOut}&api_key=${NASA_API_KEY}`;

  // run once on app mount to fetch APOD
  useEffect(() => {
    setLoadingAPOD(true);
    const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`

    fetch(NASA_APOD_URL)
    .then(res => res.json())
    .then(data => setApod(data))
    .catch(err => {
      console.log(`ERROR FETCHING NASA API APOD ENDPOINT: ${err}`);
      setErrorAPOD('ERROR FETCHING NASA API APOD ENDPOINT')
    })
    .finally(() =>
      setLoadingAPOD(false)
    );

    fetchNeoFeedResponse(NASA_NEO_URL);
  }, []);

  // Function to Add days to current date
  function addDays(date: Date, days: number) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + days);
      return newDate;
  }

  function fetchNeoFeedResponse(link: string) {
    setLoadingNEO(true);
    const secureLink = link.replace('http://', 'https://');

    fetch(secureLink)
    .then(res => res.json())
    .then(data => setNeoFeedResponse(data))
    .catch(err => {
      console.log(err);
      setErrorNEO('Error loading Near Earth Object from NASA');
    })
    .finally(() => {
      setLoadingNEO(false);
    });
  }

  function neoNavLink(link: string) {
    fetchNeoFeedResponse(link);
  }

  function handleLoadingNEOSelf(value: boolean) {
    setLoadingNEOSELF(value);
  }

  return (
    <>
      {loadingAPOD || loadingNEO && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 2000, // make sure it's above content
          }}
        >
          <LinearProgress />
        </Box>
      )}

      {loadingAPOD && <p>Loading APOD...</p>}
      {errorAPOD && errorAPOD}
      {apod && (
        <APODDisplay apod={apod} />
      )}

      {loadingNEOSELF && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 2000, // make sure it's above content
          }}
        >
          <LinearProgress />
        </Box>
      )}
      {loadingNEO && <p>Loading NEO...</p>}
      {errorNEO && errorNEO}
      {neoFeedResponse && (
        <NEOFeedDisplay neoFeedResponse={neoFeedResponse} neoNavLink={neoNavLink} 
                        setLoadingNEOSELF={handleLoadingNEOSelf}/>
      )}
    </>
  )
}

export default App
