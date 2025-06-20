import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Dashboard({token}) {

    const [stats, setStats] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, [token]);

    async function fetchStats() {

        try {
            const response = await axios.get("http://localhost:5000/api/stats", {
                headers: {"Authorization": `Bearer ${token}`}
            });
            setStats(response.data);

        } catch (err) {
            console.error("Error fetching stats.", err);
        }

    }

    if (!stats) {
        return <p>Loading stats ...</p>
    }

    // console.log(token);
    // console.log(stats);

    function gotoHome() {
        navigate("/");
    }

    return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Your Reading Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h4>{stats.books_read} / {stats.total_books}</h4>
            <p>Books Read</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h4>{stats.average_rating || "N/A"}</h4>
            <p>Average Rating</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h4>{stats.novels}</h4>
            <p>Novels</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm text-center p-3">
            <h4>{stats.short_stories}</h4>
            <p>Short Stories</p>
          </div>
        </div>
      </div>

      <h5>📚 Recent Reads</h5>
      <ul className="list-group">
        {stats.recent_reads.map((book, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between">
            <span><strong>{book.title}</strong> ({book.type})</span>
            <span>Rating: {book.rating}</span>
          </li>
        ))}
      </ul>

      <button className="btn btn-success mt-5" onClick={gotoHome}>Home</button>

    </div>
  );
}

export default Dashboard;