import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Box, Button, Typography } from "@mui/material";

export const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:5000/api/reset-password/${id}/${token}`,
        { password, repeat_password: repeatPassword }
      );

      if (response.data.message) {
        setMessage(response.data.message);
        // Handle success, e.g., redirect or show a success message
        navigate("/login");
      } else {
        setMessage(
          response.data.error || "Unexpected response format. Please try again."
        );
      }
    } catch (error) {
      setMessage(
        "An error occurred while processing the request. Please try again."
      );
      console.error("Error:", error);
    }
  };

  return (
    <div id="reset-password-container" style={{ margin: "6.2rem auto" }}>
      <Box
        marginLeft="auto"
        marginRight="auto"
        width={300}
        display="flex"
        flexDirection={"column"}
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h2">Reset Password</Typography>
        <form
          onSubmit={handleResetPasswordSubmit}
          encType="multipart/form-data"
        >
          <TextField
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            type={"password"}
            value={password}
            variant="outlined"
            placeholder="Password"
            margin="normal"
          />
          <TextField
            name="repeat-password"
            onChange={(e) => setRepeatPassword(e.target.value)}
            type={"password"}
            value={repeatPassword}
            variant="outlined"
            placeholder="Repeat Password"
            margin="normal"
          />

          <Button variant="contained" type="submit">
            Reset Password
          </Button>
        </form>
        {message && <p>{message}</p>}
      </Box>
    </div>
  );
};

export default ResetPassword;
