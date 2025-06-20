import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";

function RegisterForm(props) {

    const [input, setInput] = useState({username: "", email: "", password: "", rePassword: ""});

    const navigate = useNavigate();

    function handleChange(e) {
        const {name, value} = e.target;
        setInput((prev) => ({...prev, [name]: value}));
    }

    async function handleRegister(e) {
        e.preventDefault();
        await props.onRegister(input);
        setInput({username: "", email: "", password: "", rePassword: ""});

        navigate("/");
    }

    return (
        <div>
            <h2>Register Form</h2>

            <form onSubmit={handleRegister}>

                <label>Username:</label>
                <input type="text"
                        name="username"
                        placeholder="Insert username ..."
                        className="form-control"
                        value={input.username}
                        onChange={handleChange}
                />

                <label>Email:</label>
                <input type="email" 
                        name="email"
                        placeholder="Insert email ..."
                        className="form-control"
                        value={input.email}
                        onChange={handleChange}
                />

                <label>Password:</label>
                <input type="password" 
                        name="password"
                        placeholder="Insert password ..."
                        className="form-control"
                        value={input.password}
                        onChange={handleChange}
                />

                <label>Re-Password:</label>
                <input type="password" 
                        name="rePassword"
                        placeholder="Insert re-password ..."
                        className="form-control"
                        value={input.rePassword}
                        onChange={handleChange}
                />

                <button type="submit" className="btn btn-primary btn-lg">Register</button>

            </form>

            <Link to="/login">Already have an account? Sign In</Link>

        </div>
    );
}

export default RegisterForm;