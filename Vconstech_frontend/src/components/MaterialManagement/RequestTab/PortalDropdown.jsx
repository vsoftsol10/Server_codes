import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

// Renders at document.body to escape overflow:hidden parents.
// Accepts a contentRef so the parent can track clicks inside the portal.
const PortalDropdown = ({ anchorRef, contentRef, open, children }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
  }, [open, anchorRef]);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={style} ref={contentRef}>
      {children}
    </div>,
    document.body,
  );
};

export default PortalDropdown;
