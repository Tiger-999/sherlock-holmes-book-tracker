import React , {useState, useEffect} from "react";
import axios from "axios";

function BookInfo(props) {

    const [isEditing, setIsEditing] = useState(false);
    const [editedRatingRead, setEditedRatingRead] = useState({rating: props.rating, read: props.read});
    // const [titles, setTitles] = useState([]);

    const availableRating = [1,2,3,4,5,6,7,8,9,10];

    // useEffect(() => {
    //     fetchTitles();
    // }, []);

    // async function fetchTitles() {
    //     try {
    //         const response = await axios.get("http://localhost:5000/api/title");
    //         console.log(response.data);
    //         setTitles(response.data)

    //     } catch (err) {
    //         console.error("Fetch read list failed.", err);
    //     }
    // }

    function handleChange(e) {
        const {name, value} = e.target;
        if (name === "rating") {
            setEditedRatingRead((prev) => ({...prev, [name]: Number(value)}));
        }
        else if (name === "read") {
            setEditedRatingRead((prev) => ({...prev, [name]: value === "true"? true : false}));
        }
    }

    function handleSave(e) {
        e.preventDefault();
        setEditedRatingRead({rating: editedRatingRead.rating, read: editedRatingRead.read});
        props.onUpdateField({id: props.id, rating: editedRatingRead.rating, read: editedRatingRead.read});
        setIsEditing(false);
    }

    function handleCancel(e) {
        e.preventDefault();
        setEditedRatingRead({rating: props.rating, read: props.read});
        setIsEditing(false);

    }

    function handleEdit(e) {
        e.preventDefault();
        setIsEditing(true);
    }

    function handleDelete(e) {
        e.preventDefault();
        props.onDelete(props.id);
    }

    return (
        <div className="card shadow-sm h-100 mx-auto" style={{ maxWidth: "300px" }}>
            <div className="card-body text-center">

                {!isEditing? (
                    <>
                        <h5 className="card-title fw-bold">Title: {props.title}</h5>
                        <p className="card-text">Type: {props.type}</p>
                        <p className="card-text">Collection: {props.collection}</p>
                        <p className="card-text">Rating: {props.rating}</p>
                        <p className="card-text">Read: {props.read === true? "Yes" : "No"}</p>

                        <div className="d-flex justify-content-center gap-2">
                            <button onClick={handleEdit} className="btn btn-warning">Edit</button>
                            <button onClick={handleDelete} className="btn btn-danger">Delete</button>
                        </div>    
                    </>           
            ) : (
            <>
                <h5 className="card-title">Title: {props.title}</h5>
                <p className="card-text">Type: {props.type}</p>
                <p className="card-text">Collection: {props.collection}</p>

                <p>Rating: </p>
                <select name="rating" value={editedRatingRead.rating} onChange={handleChange} className="form-select mb-2">
                    <option value="">Select rating</option>
                    {availableRating.map((item) =>
                        <option key={item} value={item}>{item}</option>
                    )}
                </select>

                <p>Read: </p>
                <select name="read" value={String(editedRatingRead.read)} onChange={handleChange} className="form-select mb-2">
                    <option value="">Select read / unread</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>

                <div className="d-flex justify-content-center gap-2">   
                    <button onClick={handleSave} className="btn btn-success btn-lg">Save</button>
                    <button onClick={handleCancel} className="btn btn-secondary btn-lg">Cancel</button>
                </div> 
            </>
            )
            }
            </div>
        </div>
    );
}

export default BookInfo;