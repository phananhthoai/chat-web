import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Home = ({socket}) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let response;
            if (isLogin) {
                response = await axios.post('https://backends.hocdevops.me/signin', {username, password});
                localStorage.setItem('token', response.data.token);
            } else {
                response = await axios.post('https://backends.hocdevops.me/signup', {username, password, email, phone});
                setIsLogin(true);
                setError('Sign up successful. Please log in.');
                return;
            }

            localStorage.setItem('userName', username);
            socket.emit('newUser', {userName: username, socketID: socket.id});
            navigate('/chat');
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <form className="home__container" onSubmit={handleSubmit}>
            <h2 className="home__header">{isLogin ? 'Sign in to Open Chat' : 'Sign up for Open Chat'}</h2>
            {error && <p className="error__message">{error}</p>}
            <label htmlFor="username">Username</label>
            <input
                type="text"
                minLength={5}
                name="username"
                id="username"
                className="username__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <label htmlFor="password">Password</label>
            <input
                type="password"
                minLength={5}
                name="password"
                id="password"
                className="password__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {!isLogin && (
                <>
                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        name="email"
                        id="email"
                        className="email__input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="phone">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        className="phone__input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </>
            )}
            <button className="home__cta">{isLogin ? 'SIGN IN' : 'SIGN UP'}</button>
            <p className="home__mode-switch" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </p>
        </form>
    );
};

export default Home;