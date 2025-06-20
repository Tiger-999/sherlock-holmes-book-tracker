import React, {useState} from "react";
import {Link} from "react-router-dom";

function LoginForm(props) {

    const [input, setInput] = useState({email: "", password: ""});

    function handleChange(e) {
        const {name, value} = e.target;
        setInput((prev) => ({...prev, [name]: value}));
    }

    function handleLogin(e) {
        e.preventDefault();
        props.onLogin(input);
        setInput({email: "", password: ""});
    }

    return (
        <div>

            <h2>Login Form</h2>

            <form onSubmit={handleLogin}>

                <label>Email:</label>
                <input type="email"
                        name="email"
                        placeholder="Insert your email ..."
                        className="form-control"
                        value={input.email}
                        onChange={handleChange}
                />

                <label>Password:</label>
                <input type="password"
                        name="password"                        
                        placeholder="Insert your password ..."
                        className="form-control"
                        value={input.password}
                        onChange={handleChange}
                />

                <button type="submit" className="btn btn-primary btn-lg">Login</button>

            </form>

            <Link to="/register">Don't have an account? Sign Up for free</Link>

        </div>
    );
}

export default LoginForm;