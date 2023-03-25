import React from "react";
import { Checkbox } from "@mui/joy";
import { Done } from "@mui/icons-material";

export function HoverCheckbox(props) {
  return (
    <Checkbox
      uncheckedIcon={<Done />}
      label={props.label}
      onChange={props.onChange}
      slotProps={{
        root: ({ checked, focusVisible }) => ({
          sx: !checked
            ? {
                "& svg": { opacity: focusVisible ? 0.32 : 0 },
                "&:hover svg": {
                  opacity: 0.32,
                },
              }
            : undefined,
        }),
      }}
      defaultChecked={props.defaultChecked}
    />
  );
}
