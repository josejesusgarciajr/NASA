import { TextField } from "@mui/material";

type NEOSearchProps = {
    searchTerm: string;
    searchNEO: (searchTerm: string) => void;
    loadingNEO: boolean;
}

export const NEOSearch = ({searchTerm, searchNEO, loadingNEO} : NEOSearchProps) => { 

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const search = e.target.value;
        searchNEO(search);
    }

    return (
        <>
            <TextField label="Search" variant="outlined" size="small"
                value={searchTerm} onChange={handleSearchChange} disabled={loadingNEO}
                  sx={{
                        "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "rgba(56,189,248,0.35)",
                        },
                        "&:hover fieldset": {
                            borderColor: "#38bdf8",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#38bdf8",
                            boxShadow: "0 0 10px rgba(56,189,248,0.4)",
                        },
                        },
                    }}
                />
        </>
    );
}