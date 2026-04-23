// material ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: '#0d1628',
    border: '1px solid rgba(56,189,248,0.4)',
    boxShadow: '0 0 24px rgba(56,189,248,0.2)',
    backdropFilter: 'blur(12px)',
    borderRadius: 2,
    p: 4,
};

type NASAConfirmModalProps = {
    open: boolean;
    dialogText: string;
    onCancel: () => void;
    onConfirm?: () => void;
}

export const NASAConfirmModal = ({ open, dialogText, onCancel, onConfirm }: NASAConfirmModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
        >
            <Box sx={style}>
                <Typography id="confirm-modal-title" variant="h6" component="h2" sx={{ color: '#e2e8f0' }}>
                    Are you sure?
                </Typography>
                <Typography id="confirm-modal-description" sx={{ mt: 2, color: '#94a3b8' }}>
                    {dialogText}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{
                            color: '#7dd3fc',
                            borderColor: 'rgba(56,189,248,0.4)',
                            '&:hover': {
                                borderColor: '#38bdf8',
                                boxShadow: '0 0 10px rgba(56,189,248,0.35)',
                                bgcolor: 'rgba(56,189,248,0.08)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onConfirm}
                        sx={{
                            color: '#f87171',
                            borderColor: 'rgba(239,68,68,0.4)',
                            '&:hover': {
                                borderColor: 'rgba(239,68,68,0.8)',
                                boxShadow: '0 0 10px rgba(239,68,68,0.35)',
                                bgcolor: 'rgba(239,68,68,0.08)',
                            },
                        }}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}