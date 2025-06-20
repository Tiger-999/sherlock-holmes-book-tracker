import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function AddReadTitleForm(props) {

    const [data, setData] = useState({title: "", read: "", rating: "", collection: "", type: ""});
    const [allTitles, setAlltitles] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const allRating = [1,2,3,4,5,6,7,8,9,10];

    const usedTitles = props.titles.map((item) => item.title);
    // const usedRating = props.titles.map((item) => item.rating);

    const availableTitles = allTitles.filter((item) => !usedTitles.includes(item.title));
    // const availableRating = allRating.filter((item) => !usedRating.includes(item));

    useEffect(() => {
        fetchTitles();
    }, []);

    function handleChange(e) {
        const {name, value} = e.target;
        if (name === "title")   {setData((prev) => ({...prev, [name]: value}));}
        else if (name === "read")   {setData((prev) => ({...prev, [name]: value === "true"}))}
        else if (name === "rating") {setData((prev) => ({...prev, [name]: value === ""? "" : Number(value)}))}
    }

    async function fetchTitles() {
        try {
            const response = await axios.get("http://localhost:5000/api/titledata");
            // console.log(response.data);
            setAlltitles(response.data);
        } catch (err) {
            console.error("Error fetching titles.", err);
            setError("Error fetching titles.");
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!data.title || typeof data.read !== "boolean" || data.rating === "" || data.rating < 1 || data.rating > 10) {
            setError("Please fill all fields.");
            return;
        }
        setError("");
        props.onAddTitle(data);
        //console.log(data);
        setData({title: "", read: "", rating: "", collection: "", type: ""});
    }

    function handleLogout(e) {
        e.preventDefault();
        props.onLogout();
    }

    function gotoDashboard(e) {
        e.preventDefault();
        navigate("/dashboard");
    }

    return (

        <div>

            <h2>📚 Add Title Form</h2>

            <form onSubmit={handleSubmit} className="mb-4">

                <div className="mb-3">
                    <label className="form-label">Title:</label>
                    <select name="title" value={data.title} onChange={handleChange} className="form-select">
                        <option value="">Select title</option>
                        {availableTitles.map((item) => 
                            <option key={item.id} value={item.title}>{item.title}</option>
                        )}
                    </select>
                </div>        

                <div className="mb-3">
                    <label className="form-label">Rating:</label>
                    <select name="rating" value={data.rating} onChange={handleChange} className="form-select">
                        <option value="">Select rating</option>
                        {allRating.map((item) =>
                            <option key={item} value={item}>{item}</option>
                        )}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Read:</label>
                    <select name="read" value={String(data.read)} onChange={handleChange} className="form-select">
                        <option value="">Select read / unread</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div> 

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="d-flex justify-content-between">     
                    <button type="submit" className="btn btn-primary">Add</button>
                    <button type="button" className="btn btn-info" onClick={gotoDashboard}>Dashboard</button>
                    <button type="button" onClick={handleLogout} className="btn btn-danger">Logout</button>
                </div>   

            </form>

        </div>

    );
}

export default AddReadTitleForm;