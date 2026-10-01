"use client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";
import "../app/globals.css";
import { Toaster } from "@/components/ui/toaster";
export default function ClientApp() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Router />
        <Toaster />
      </BrowserRouter>
    </React.StrictMode>
  );
}
