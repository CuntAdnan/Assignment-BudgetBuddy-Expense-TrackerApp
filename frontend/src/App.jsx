import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { proxy } from "../utils/proxy";

import Home from "./pages/Home.jsx";
import NewEntry from "./pages/NewEntry.jsx";
import Month from "./pages/Month.jsx";
import Login from "./pages/Login.jsx";
import Category from "./pages/Category.jsx";
import SignUp from "./pages/Signup.jsx";
import "./App.css";

function App() {
  
  const userId = localStorage.getItem("userId");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${proxy}/api/transactions/${userId}`);
        setTransactions(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Home transactions={transactions} />} />
          <Route path="/month" element={<Month transactions={transactions} />} />
          <Route path="/new-entry" element={<NewEntry userId={userId} />} />
          <Route path="/" element={<SignUp />} />
          <Route path="/category" element={<Category transactions={transactions} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
