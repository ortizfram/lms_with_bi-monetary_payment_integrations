import React, { useState } from "react";
import axios from "axios";
import { TextField, Box, Button, Typography } from "@mui/material";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [backendMessage, setBackendMessage] = useState(null);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.message) {
        setBackendMessage(response.data.message);
        // Handle success, e.g., redirect or show a success message
      } else if (response.data.error) {
        setBackendMessage(response.data.error);
      } else {
        setBackendMessage("Unexpected response format. Please try again.");
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      setBackendMessage(
        "An error occurred while processing the request. Please try again."
      );
      console.error("Error:", error);
    }
  };

  return (
    <div id="forgot-password-container" style={{ margin: "6.2rem auto" }}>
      <Box
        marginLeft="auto"
        marginRight="auto"
        width={300}
        display="flex"
        flexDirection={"column"}
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h2">Forgot Password</Typography>
        <form
          onSubmit={handleForgotPasswordSubmit}
          encType="multipart/form-data"
        >
          <TextField
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            type={"email"}
            value={email}
            variant="outlined"
            placeholder="Email"
            margin="normal"
          />

<Button variant="contained" type="submit">
            Recuperar
          </Button>
        </form>
        {backendMessage && <p>{backendMessage}</p>}
      </Box>
    </div>
  );
};

export default ForgotPassword;
