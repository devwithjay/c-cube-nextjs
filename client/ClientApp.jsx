"use client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router.jsx";
import "./index.css";

export default function ClientApp() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </React.StrictMode>
  );
}
