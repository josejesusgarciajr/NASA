import type { NEOFeedResponse, NEOObject } from "../types/NASA/NEOFeedResponse";
import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import { NEOObjectDisplay } from "./NEOObjectDisplay";
import  { NEOSearch } from '../NASA_Components/NEOSearch';
import { NEODateFilter } from "./NEODateFilter";
import { NEOHazardousFilter } from "./NEOHazardousFilter";
import { NEODiameterSort } from './NEODiameterSort';
import { NEOObjectModal } from "./Modals/NEOObjectModal ";

import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";

import { useState, useEffect, useMemo } from 'react';

type NEOFeedDisplayProps = {
    neoFeedResponse: NEOFeedResponse;
    neoNavLink: (link: string) => void;
    setLoadingNEOSELF: (loadinNEOSELF: boolean) => void;
}

export const NEOFeedDisplay = ({neoFeedResponse, neoNavLink, setLoadingNEOSELF} : NEOFeedDisplayProps) => {
    // search
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedNEOObject, setSelectedNEOObject] = useState<NEOObject | null>(null);
    const [neoSELF, setNEOSELF] = useState<NEOObject | null>(null);
    
    // hazardous filter
    const [hazardous, setHazardous] = useState<boolean | null>(null);
    const hazardousOptions = ['HAZARDOUS', 'Not Hazardous'];

    // diameter sort
    const [selectedNEODiameterSort, setSelectedNEODiameterSort] = useState<string>('desc');
    const neoDiameterSortOptions = ['Biggest to smallest', 'Smallest to biggest'];

    // modal
    const openNEOModal = Boolean(selectedNEOObject);

    function handleNeoNavLink(link: string) {
        const secureLink = link.replace('http://', 'https://');
        neoNavLink(secureLink);
    }

    useEffect(() => {
        setSelectedDate('');
    }, [neoFeedResponse]);

    // Flatten all NEOObject[] from all dates into a single array of NEOObjectDisplay components
    const neosForSelectedDate = selectedDate
        ? neoFeedResponse.near_earth_objects[selectedDate] ?? []
        : Object.values(neoFeedResponse.near_earth_objects).flat();

    const getDiameter = (neo: NEOObject) => 
        (neo.estimated_diameter.kilometers.estimated_diameter_min + 
        neo.estimated_diameter.kilometers.estimated_diameter_max) / 2;

    const filteredNeos = useMemo(() => {
        const filtered = neosForSelectedDate.filter(neo => {
            return neo.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                   (neo.is_potentially_hazardous_asteroid == hazardous ||
                    hazardous === null);
        });

        if (selectedNEODiameterSort === 'asc') {
            return filtered.sort((a, b) => getDiameter(a) - getDiameter(b))
        } else {
            return filtered.sort((a, b) => getDiameter(b) - getDiameter(a))
        }
    }, [neosForSelectedDate, searchTerm, hazardous, selectedNEODiameterSort]);

    function handleNEOClick(neoObject: NEOObject) {
        setSelectedNEOObject(prev =>
            prev === neoObject ? null : neoObject
        );
    }

    function fetchNEOObject(neo: NEOObject) {
        setLoadingNEOSELF(true);
        const secureLink = neo.links.self.replace('http://', 'https://');

        fetch(secureLink)
        .then(res => res.json())
        .then(data => setNEOSELF(data))
        .catch(err => console.log(err))
        .finally(() => {
            setLoadingNEOSELF(false);
        });
    }

    useEffect(() => {
        if (selectedNEOObject !== null) {
            fetchNEOObject(selectedNEOObject);
        }
    }, [selectedNEOObject]);

    // Map NEOs to Grid items, inserting Collapse inline for selected NEO
    const neoDisplays = filteredNeos.flatMap(neo => {
        return (
            <Grid key={neo.id} size={2}>
                <div onClick={() => handleNEOClick(neo)}>
                    <NEOObjectDisplay neoObject={neo} />
                </div>
            </Grid>
        );
    });

    const dates = Object.keys(neoFeedResponse.near_earth_objects).sort();
    const dateRange = `${dates[0]} to ${dates[dates.length - 1]}`;

    function searchNEO(search: string) {
        setSearchTerm(search);
    }

    function sortByDate(date: string) {
        setSelectedDate(date);
    }

    function sortByHazardous(selectedSortHazardous: string) {
        switch (selectedSortHazardous) {
            case 'All': setHazardous(null); break;
            case 'HAZARDOUS': setHazardous(true); break;
            case 'Not Hazardous': setHazardous(false); break;
            default: setHazardous(null);
        }
    }

    function sortByDiameter(value: string) {
        setSelectedNEODiameterSort(value);
    }

    function onModalClose() {
        setSelectedNEOObject(null);
        setNEOSELF(null);
    }

    return (
        <>
            <NASAServiceDisplay serviceAcronym="ASTEROIDS - NEOWS" serviceName="Near Earth Object Web Service" />
            <Typography>{dateRange}</Typography>
            <Typography>Element Count: {filteredNeos.length}</Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mb={2}>
                <Button variant="outlined" onClick={() => handleNeoNavLink(neoFeedResponse.links.previous)}>Previous</Button>
                <Button variant="outlined" onClick={() => handleNeoNavLink(neoFeedResponse.links.next)}>Next</Button>
                <NEOSearch searchTerm={searchTerm} searchNEO={searchNEO} />
                <NEODateFilter dates={dates} selectedDate={selectedDate} setSelectedDate={sortByDate} />
                <NEOHazardousFilter hazardousOptions={hazardousOptions} hazardous={hazardous} selectedHazardous={sortByHazardous} />
                <NEODiameterSort sortOptions={neoDiameterSortOptions} selectedOption={selectedNEODiameterSort} sortByDiameter={sortByDiameter} />
            </Stack>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {neoDisplays}
                </Grid>
            </Box>
            { openNEOModal && (
                <NEOObjectModal neoObject={neoSELF} onClose={onModalClose} />
            )}
        </>
    );
}