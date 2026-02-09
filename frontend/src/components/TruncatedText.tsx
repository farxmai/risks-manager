import React from "react";
import { Tooltip, Typography } from "@mui/material";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
}

export function TruncatedText({
  text,
  maxLength = 100,
}: TruncatedTextProps): JSX.Element {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate
    ? `${text.substring(0, maxLength)}...`
    : text;

  if (shouldTruncate) {
    return (
      <Tooltip title={text} arrow placement="top">
        <Typography
          variant="body2"
          sx={{
            cursor: "help",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayText}
        </Typography>
      </Tooltip>
    );
  }

  return <Typography variant="body2">{displayText}</Typography>;
}
