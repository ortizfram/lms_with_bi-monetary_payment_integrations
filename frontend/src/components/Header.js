import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Tabs, Tab } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "../store/index";
import axios from "axios";
axios.defaults.withCredentials = true;

function Header() {
  const dispatch = useDispatch();
  const [value, setValue] = useState();
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const sendLogoutRequest = async () => {
    const res = await axios.post("http://localhost:5000/api/logout", null, {
      withCredentials: true,
    });
    if (res.status == 200) {
      return res;
    }
    return new Error("Unable to logout. Please try again");
  };
  const handleLogout = () => {
    sendLogoutRequest().then(() => dispatch(authActions.logout()));
  };
  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h3">MernAuth</Typography>
          <Box sx={{ marginLeft: "auto" }}>
            <Tabs
              indicatorColor="secondary"
              onChange={(e, val) => setValue(val)}
              value={value}
              textColor="inherit"
            >
              {!isLoggedIn && (
                <React.Fragment>
                  <Tab to="/login" LinkComponent={Link} label="Login" />
                  <Tab to="/signup" LinkComponent={Link} label="Signup" />
                </React.Fragment>
              )}
              {isLoggedIn && (
                <Tab
                  onClick={handleLogout}
                  to="/"
                  LinkComponent={Link}
                  label="Logout"
                />
              )}{" "}
            </Tabs>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;
