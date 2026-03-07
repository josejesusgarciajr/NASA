import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

export const APODExplorer = () => {
    return (
        <>
            <DatePicker defaultValue={dayjs('2022-08-15')} />
            <DesktopDatePicker defaultValue={dayjs('2022-08-15')} />
            <MobileDatePicker defaultValue={dayjs('2022-08-15')} />
        </>
    );
}