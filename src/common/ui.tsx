import * as React from "react";

export const ui = {
  highlight: (text: string, higlight: string): React.ReactNode => {
    const parts = text.split(new RegExp(`(${higlight})`, "gi"));
    return (
      <span>
        {parts.map(part =>
          part.toLowerCase() === higlight.toLowerCase() ? <b>{part}</b> : part
        )}
      </span>
    );
  }
};
