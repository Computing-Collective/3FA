import { Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 *
 * @param {object} props
 * @param {string} props.text - the text to display
 * @param {boolean} props.refreshButton - whether or not to display the refresh button
 * @returns an MUI alert that displays the error message given
 */
export function DisplayError({ text, refreshButton }) {
  const navigate = useNavigate();

  const handleRefresh = (event) => {};
  return (
    <>
      <Alert severity="error">
        {text}
        {/* load refresh button if props.refreshButton === true */}
        {refreshButton && (
          <Button variant="text" onClick={(e) => window.location.reload()}>
            Try again
          </Button>
        )}
      </Alert>
    </>
  );
}
