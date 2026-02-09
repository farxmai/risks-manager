import React, { useState } from "react";
import { TextField, ClickAwayListener, Tooltip } from "@mui/material";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
}

export function InlineEdit({
  value,
  onSave,
  multiline = false,
  maxLength = 50,
}: InlineEditProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const shouldTruncate = value.length > maxLength;
  const displayValue = shouldTruncate
    ? `${value.substring(0, maxLength)}...`
    : value;

  const handleBlur = (): void => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleBlur}>
        <TextField
          autoFocus
          fullWidth
          multiline={multiline}
          rows={multiline ? 2 : 1}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{ "& .MuiInputBase-root": { fontSize: "inherit" } }}
        />
      </ClickAwayListener>
    );
  }

  const content = (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        cursor: "pointer",
        padding: "4px",
        borderRadius: "4px",
        minHeight: multiline ? "40px" : "24px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {displayValue}
    </div>
  );

  if (shouldTruncate) {
    return (
      <Tooltip title={value} arrow placement="top">
        {content}
      </Tooltip>
    );
  }

  return content;
}
