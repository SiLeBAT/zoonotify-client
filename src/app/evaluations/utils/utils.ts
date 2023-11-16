import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useStyles = makeStyles((theme: { spacing: (arg0: number) => any }) => ({
    formControl: {
        margin: theme.spacing(1),
        width: 300,
    },
    indeterminateColor: {
        color: "#f50057",
    },
    selectAllText: {
        fontWeight: 500,
    },
    selectedAll: {
        backgroundColor: "rgba(0, 0, 0, 0.08)",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)",
        },
    },
}));

export { useStyles };
