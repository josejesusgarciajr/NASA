import { TextField } from "@mui/material";

type NEOSearchProps = {
    searchTerm: string;
    searchNEO: (searchTerm: string) => void;
}

export const NEOSearch = ({searchTerm, searchNEO} : NEOSearchProps) => { 

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const search = e.target.value;
        searchNEO(search);
    }

    return (
        <>
            <TextField label="Search" variant="outlined" size="small"
                value={searchTerm} onChange={handleSearchChange} 
                  sx={{
                        "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "primary.main",
                        },
                        "&:hover fieldset": {
                            borderColor: "secondary.main",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "secondary.main",
                            boxShadow: "0 0 8px rgba(156, 39, 176, 0.6)", // neon glow
                        },
                        },
                    }}
                />
        </>
    );
}