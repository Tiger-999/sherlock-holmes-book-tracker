import React, {useState, useEffect} from "react";
import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import axios from "axios";
import RegisterForm from "./RegisterForm.jsx";
import LoginForm from "./LoginForm.jsx";
import AddReadTitleForm from "./AddReadTitleForm.jsx";
import BookInfo from "./BookInfo.jsx";
import Dashboard from "./Dashboard.jsx";
import '../App.css';

function App() {

  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState("");
  const [titles, setTitles] = useState([]); //title, read, rating, type, collection
  const [searchTerm, setSearchTerm] = useState("");

  const AUTH_API = "http://localhost:5000/api/auth";
  const TITLE_API = "http://localhost:5000/api/title";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      setUser(username);
      setIsLogin(true);
    }
  }, []);

  useEffect(() => {
    if (isLogin) {
      fetchTitles();
    }
  }, [isLogin]);

  async function fetchTitles() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(TITLE_API, {
        headers: {Authorization: `Bearer ${token}`}
      });
      console.log(response.data);
      setTitles(response.data);
    } catch (err) {
      console.error("Fetch read list failed.", err);
    }
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) {return "Good morinng";}
    if (hour < 18) {return "Good afternoon";}
    return "Good evening";
  }

  async function registerUser(userData) {
    try {
      const response = await axios.post(`${AUTH_API}/register`, userData);
      console.log("User registered.", response.data);

      const {token, username} = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      setUser(username);
      setIsLogin(true);

      return true;

    } catch (err) {
      console.error("Register failed.", err);
      return false;
    }
  }

  async function loginUser(userData) {
    try {
      const response = axios.post(`${AUTH_API}/login`, userData);
      console.log("User logged in.", response.data);

      const {token, username} = (await response).data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      setUser(username);
      setIsLogin(true);

    } catch (err) {
      console.error("Login failed.", err);
    }
  }

  async function logoutUser() {
    try {
      await axios.post(`${AUTH_API}/logout`);
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setUser("");
      setIsLogin(false);
      setTitles([]);
    } catch (err) {
      console.error("Logout failed.", err);
    }
  }

  async function addTitle(title) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(TITLE_API, title, {
        headers: {Authorization: `Bearer ${token}`}
      });
      fetchTitles();
    } catch (err) {
      console.error("Add title failed.", err);
    }
  }

  async function deleteTitle(id) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${TITLE_API}/${id}`, {
        headers: {Authorization: `Bearer ${token}`}
      });
      fetchTitles();
    } catch (err) {
      console.error("Delete title failed.", err);
    }
  }

  async function updateAll(updatedData) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${TITLE_API}/${updatedData.id}`, updatedData, {
        headers: {Authorization: `Bearer ${token}`}
      });
      fetchTitles();
    } catch (err) {
      console.error("Update all data failed.", err);
    }
  }

  async function updateField(updatedField) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${TITLE_API}/${updatedField.id}`, updatedField, {
        headers: {Authorization: `Bearer ${token}`}
      });
      fetchTitles();
    } catch (err) {
      console.error("Update field failed.", err);
    }
  }

  return (

    <div className="App">

      <BrowserRouter>
        <Routes>

          <Route path="/" element={ isLogin? (

            <div className="container-fluid">
              <div className="row">

                {/* Sidebar */}
                <div className="col-md-3 bg-dark text-white vh-100 p-3">
                  <h1 className="mb-4 text-center">Hello {user}!</h1>
                  <AddReadTitleForm titles={titles} onAddTitle={addTitle} onLogout={logoutUser} />
                </div>

                {/* Content Area */}
                <div className="col-md-9 p-4">
                  
                  <input type="text" placeholder="Search by title ..." className="form-control mb-4"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <div className="row justify-content-start">

                    {/* Add search bar */}
                    {titles.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
                           .map((item) => (
                            <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={item.id}>
                              <BookInfo id={item.id} title={item.title} read={item.read} rating={item.rating}
                                        type={item.type} collection={item.collection} titles={titles}
                                        onDelete={deleteTitle} onUpdateField={updateField}
                                        />
                            </div>
                           ))
                    }

                    {/* {titles.map((item) => (
                      <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={item.id}>
                        <BookInfo id={item.id} title={item.title} read={item.read} rating={item.rating} 
                                  type={item.type} collection={item.collection} titles={titles}
                                  onDelete={deleteTitle} onUpdateField={updateField}
                                  />
                      </div>            
                    ))} */}

                  </div>  
                </div>
              </div>
            </div>
            
            ) : <LoginForm onLogin={loginUser} />
            } />

            <Route path="/login" element={<LoginForm onLogin={loginUser} />} />
            <Route path="/register" element={<RegisterForm onRegister={registerUser} />} />
            <Route path="/dashboard" element={<Dashboard token={localStorage.getItem("token")}/>} />

        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;