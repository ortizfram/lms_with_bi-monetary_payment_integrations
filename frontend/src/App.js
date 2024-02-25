import "./App.css";
import Header from "./components/Header";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Welcome } from "./components/Welcome";
import { useSelector } from "react-redux";

function App() {
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  console.log(isLoggedIn);
  return (
    <React.Fragment>
      <Header />
      <main>
        <Routes>
          {isLoggedIn ? (
            <Route path="/user" element={<Welcome />} />
          ) : (
            <React.Fragment>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </React.Fragment>
          )}
        </Routes>
      </main>
    </React.Fragment>
  );
}

export default App;
