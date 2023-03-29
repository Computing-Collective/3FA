import { useLoaderData, useNavigate } from "react-router-dom";
import { Backdoor } from "../components/Backdoor.jsx";
import {
  Accordion,
  Button,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@mui/material";
import { useContext, useState } from "react";
import { authContext } from "../main.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const api_endpoint = import.meta.env.VITE_API_ENDPOINT;

export function Home() {
  const [auth, setAuth] = useContext(authContext);
  const navigate = useNavigate();
  /*
  accordion: {
    id (UUID): 1234,
    name: 'Bob',
    methods: {
      password: true,
      face_recognition: true,
      motion_pattern: false,
    }
    time: Date() ;
    success: true
    email: "bob@email.com"
  }
  */
  const [accordions, setAccordions] = useState(useLoaderData());

  async function logout(auth, setAuth, navigate) {
    setAuth(null);
    // TODO this
    const url = `${api_endpoint}/api/dashboard/logout`;

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        auth_session_id: auth,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    console.log(json);
    if (json.success === 1) {
      navigate("/");
    }
  }
  return (
    <>
      <div className="absolute left-8 top-8 h-16 w-16">
        <Button
          color="primary"
          variant="contained"
          onClick={() => logout(auth, setAuth, navigate)}>
          Logout
        </Button>
      </div>
      <h1>Welcome to the admin dashboard</h1>
      <div className="flex flex-col">
        {/* render the accordions */}
        {accordions.map((accordion, index) => {
          return (
            <div key={accordion.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: "33%", flexShrink: 0 }}>
                    General settings
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    I am an accordion
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat.
                    Aliquam eget maximus est, id dignissim quam.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        })}
      </div>
      {import.meta.env.DEV && <Backdoor />}
    </>
  );
}

// const AccordionSummary = (props) => {
//   <MuiAccordionSummary />;
// };
