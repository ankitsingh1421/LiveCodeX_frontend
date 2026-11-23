import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { v4 as uuidV4 } from "uuid";
import roombackground from './../../assets/Backgrounds/rooms.svg';
import Button from '@material-ui/core/Button';
import './Rooms.css';
import Typewriter from 'typewriter-effect';
import { apiUrl } from '../../api';

const Rooms = (props) => {
    const history = useHistory();
    const socket = props.socket;
    const setNameOfUser = props.setNameOfUser;
    const [userData, setUserData] = useState({});
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [joinRoom, setJoinRoom] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const checkForAuthentication = async () => {
            try {
                const res = await fetch(apiUrl('/roomsforuser'), {
                    method: "GET",
                    headers: {
                        Accept: 'application/json',
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Unable to verify your account");
                }
                setUserData(data);
                setNameOfUser(data.userName);
            } catch (error) {
                console.error("Unable to load rooms", error);
                history.push("/login");
            }
        };

        checkForAuthentication();
    }, [history, setNameOfUser]);

    useEffect(() => {
        if (!isJoinOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsJoinOpen(false);
                setErrorMessage("");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isJoinOpen]);

    const createRoom = () => {
        if (!socket) {
            setErrorMessage("Connecting to rooms. Please try again in a moment.");
            return;
        }

        const roomCode = uuidV4();
        socket.emit('created-room', roomCode);
        history.push(`/room/${roomCode}`);
    };

    const joinRoomByCode = (event) => {
        event.preventDefault();
        const roomCode = joinRoom.trim();
        if (!roomCode) {
            setErrorMessage("Enter a room code to continue.");
            return;
        }
        if (!socket) {
            setErrorMessage("Connecting to rooms. Please try again in a moment.");
            return;
        }

        history.push(`/room/${encodeURIComponent(roomCode)}`);
        setIsJoinOpen(false);
        setJoinRoom("");
        setErrorMessage("");
    };

    const closeJoinDialog = () => {
        setIsJoinOpen(false);
        setErrorMessage("");
    };

    return (
        <main className="rooms-page" style={{ backgroundImage: `linear-gradient(115deg, rgba(10, 17, 34, .9), rgba(13, 25, 45, .55)), url(${roombackground})` }}>
            <nav className="navbar navbar-expand-lg navbar-dark rooms-navbar">
                <div className="container">
                    <NavLink exact to="/" className="navbar-brand rooms-brand">LiveCodeX<span>.</span></NavLink>
                    <NavLink className="nav-link roomsLink" to="/">Home</NavLink>
                </div>
            </nav>

            <section className="rooms-content">
                <div className="rooms-intro">
                    <span className="rooms-kicker">Your shared workspace</span>
                    <h1>Make room for<br /><span>great ideas.</span></h1>
                    <p className="rooms-greeting">Welcome back{userData.userName ? `, ${userData.userName}` : ''}.</p>
                    <div className="rooms-prompt">
                        <Typewriter
                            onInit={(typewriter) => {
                                typewriter
                                    .typeString("Create a new room")
                                    .pauseFor(1200)
                                    .deleteAll()
                                    .typeString("Join your friend's room")
                                    .pauseFor(1200)
                                    .deleteAll()
                                    .start();
                            }}
                            options={{ autoStart: true, loop: true, delay: 45 }}
                        />
                    </div>
                    <div className="rooms-actions">
                        <Button size="large" variant="contained" className="rooms-create-button" onClick={createRoom} disabled={!socket}>
                            <span className="rooms-action-icon">+</span> Create a room
                        </Button>
                        <Button size="large" variant="outlined" className="rooms-join-button" onClick={() => { setErrorMessage(""); setIsJoinOpen(true); }} disabled={!socket}>
                            Join with a code <span aria-hidden="true">→</span>
                        </Button>
                    </div>
                    {errorMessage && !isJoinOpen && <p className="rooms-error" role="alert">{errorMessage}</p>}
                    <p className="rooms-help"><span>●</span> Create a room and share its code with your collaborator.</p>
                </div>
                <div className="rooms-visual" aria-hidden="true">
                    <div className="rooms-visual-glow"></div>
                    <div className="rooms-visual-card">
                        <div className="rooms-visual-top"><span></span><span></span><span></span><b>Live session</b><i>●  Connected</i></div>
                        <div className="rooms-visual-code">
                            <span>01</span><code><em>const</em> room = <strong>"yours"</strong>;</code>
                            <span>02</span><code><em>await</em> ideas.<u>flow</u>();</code>
                            <span>03</span><code><b>build something together</b></code>
                        </div>
                        <div className="rooms-visual-people"><span>AK</span><span>JS</span><small>2 collaborators</small></div>
                    </div>
                    <div className="rooms-floating-note"><span>↗</span> Code + conversation</div>
                </div>
            </section>

            <div className="rooms-bottom-note"><span>LIVE CODE</span><i></i><span>SHARE IDEAS</span><i></i><span>BUILD TOGETHER</span></div>

            {isJoinOpen && (
                <div className="join-room-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeJoinDialog(); }}>
                    <section className="join-room-dialog" role="dialog" aria-modal="true" aria-labelledby="join-room-title">
                        <button type="button" className="join-room-close" onClick={closeJoinDialog} aria-label="Close dialog">×</button>
                        <span className="join-room-icon" aria-hidden="true">↗</span>
                        <span className="rooms-kicker">Pick up where your team left off</span>
                        <h2 id="join-room-title">Join a room</h2>
                        <p>Paste the room code your collaborator shared with you.</p>
                        <form onSubmit={joinRoomByCode}>
                            <label htmlFor="join-room-code">Room code</label>
                            <input
                                autoFocus
                                id="join-room-code"
                                type="text"
                                className="join-room-input"
                                placeholder="Paste your room code"
                                value={joinRoom}
                                onChange={(event) => { setJoinRoom(event.target.value); setErrorMessage(""); }}
                            />
                            {errorMessage && <p className="join-room-error" role="alert">{errorMessage}</p>}
                            <div className="join-room-actions">
                                <button type="button" className="join-room-cancel" onClick={closeJoinDialog}>Cancel</button>
                                <button type="submit" className="join-room-submit" disabled={!socket || !joinRoom.trim()}>Join room <span aria-hidden="true">→</span></button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

export default Rooms;
