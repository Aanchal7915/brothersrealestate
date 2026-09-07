import { useState } from "react";
import Chatbot from "./ChatBot";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chatbot window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "85px",
            right: "20px",
            width: "350px",
            height: "450px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0px 6px 20px rgba(0,0,0,0.25)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <Chatbot />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "30px",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        💬
      </button>
    </>
  );
}
