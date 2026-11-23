import React, { useRef, useState, useEffect } from 'react';
import { NavLink} from "react-router-dom";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react"
import {
	BrowserView,
	MobileView
} from "react-device-detect";
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import IconButton from '@material-ui/core/IconButton';
import Brightness7RoundedIcon from '@material-ui/icons/Brightness7Rounded';
import Brightness4RoundedIcon from '@material-ui/icons/Brightness4Rounded';
import { RiCheckFill } from 'react-icons/ri';
import ShareRoundedIcon from '@material-ui/icons/ShareRounded';
import Messages from '../ChatFeature/Messages/Messages';
import Input from '../ChatFeature/Input/Input';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import PublishRoundedIcon from '@material-ui/icons/PublishRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import fileDownload from 'js-file-download'
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import './editor.css';

const MyEditor = (props) => {

	const socket = props.socket;
	const { nameOfUser, setcodeInRoom, setlanguageInRoom } = props;
    const history = useHistory();
	let { id } = useParams();

	const [savedRoomState] = useState(() => {
		try {
			const savedState = window.localStorage.getItem(`room-${id}`);
			return savedState ? JSON.parse(savedState) : null;
		} catch (error) {
			console.error("Failed to restore saved room state", error);
			return null;
		}
	});

	const [theme, setTheme] = useState("vs-dark");

	const [language, setLanguage] = useState(savedRoomState?.language || "cpp")
	// Send chunks of code on change
	const [editorCode, seteditorCode] = useState(savedRoomState?.code || "")
	// Set value of editor
	const [value, setValue] = useState(savedRoomState?.code || '')
	const [roomJoined, setRoomJoined] = useState(false)
	const [sendInitialData, setSendInitialData] = useState(false)
	const [users, setUsers] = useState(0)
	const [title, setTitle] = useState(savedRoomState?.title || "Untitled")
	const [titleInfo, setTitleInfo] = useState(savedRoomState?.title || "Untitled")
	const [titleChange, setTitleChange] = useState(false)
	const [fileExtensionValue, setfileExtensionValue] = useState(0)

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [fontsize, setFontsize] = useState("16px")

	const { enqueueSnackbar } = useSnackbar();

	// Ref for editor
	const editorRef = useRef()

	// Called on initialization, adds ref
	const handleEditorDidMount = (_, editor) => {
		editorRef.current = editor
		setcodeInRoom(editorCode)
		setlanguageInRoom(language)
	}

	// Called whenever there is a change in the editor
	const handleEditorChange = (value, event) => {
		const code = value || ""
		seteditorCode(code)
		setValue(code)
		setcodeInRoom(code)
		if (roomJoined && socket) {
			socket.emit('code-change', code)
		}
	};

	// For theme of code editor
	const toggleTheme = () => {
		if (theme==="light") {
			enqueueSnackbar('Changed to Dark mode',{
				variant:"success"
			});
		}
		else{
			enqueueSnackbar('Changed to Light mode',{
				variant:"success"
			});
		}
		setTheme(theme === "light" ? "vs-dark" : "light")
		props.setRoomTheme(theme === "light" ? "vs-dark" : "light")
	}

	//for copying room code
	const copyRoomCode = () => {
		navigator.clipboard.writeText(id);
		enqueueSnackbar(`Room-code copied! Share this code with your friends and Code with them!🤩`, {
			variant:"success"
		});
	}

	// Recieve code, title and language changes
	useEffect(() => {
		if (!socket) {
			return;
		}

		const joinRoom = () => {
			socket.emit('join-room', { id, nameOfUser })
			setRoomJoined(true)
		}

		const handleCodeUpdate = (data) => {
			const code = typeof data === "string" ? data : data.code
			seteditorCode(code)
			setValue(code)
			setcodeInRoom(code)
		}

		const handleLanguageUpdate = (data) => {
			setLanguage(data)
			setlanguageInRoom(data)
		}

		const handleTitleUpdate = (data) => {
			setTitle(data)
			setTitleInfo(data)
			setTitleChange(false)
		}

		const handleReceiveMessage = (message) => {
			setMessages(messages => [...messages, message]);
		}

		const handleRequestInfo = () => {
			setSendInitialData(true)
		}

		const handleAcceptInfo = (data) => {
			setTitle(data.title)
			setTitleInfo(data.title)
			setLanguage(data.language)
			setlanguageInRoom(data.language)
			seteditorCode(data.code)
			setValue(data.code)
			setcodeInRoom(data.code)
		}

		const handleJoinedUsers = (data) => {
			setUsers(data)
		}

		const handleRoomCheck = (exists) => {
			if (!exists && savedRoomState) {
				socket.emit('created-room', id)
				joinRoom()
			} else if (exists) {
				joinRoom()
			}
		}

		socket.on('code-update', handleCodeUpdate)
		socket.on('language-update', handleLanguageUpdate)
		socket.on('title-update', handleTitleUpdate)
		socket.on('receive-message', handleReceiveMessage)
		socket.on('room-check', handleRoomCheck)
		socket.on('request-info', handleRequestInfo)
		socket.on('accept-info', handleAcceptInfo)
		socket.on('joined-users', handleJoinedUsers)

		socket.emit('room-id', id)

		return () => {
			socket.off('code-update', handleCodeUpdate)
			socket.off('language-update', handleLanguageUpdate)
			socket.off('title-update', handleTitleUpdate)
			socket.off('receive-message', handleReceiveMessage)
			socket.off('room-check', handleRoomCheck)
			socket.off('request-info', handleRequestInfo)
			socket.off('accept-info', handleAcceptInfo)
			socket.off('joined-users', handleJoinedUsers)
		}
	}, [socket, id, nameOfUser, savedRoomState, setcodeInRoom, setlanguageInRoom])

	useEffect(() => {
		if (roomJoined) {
			try {
				window.localStorage.setItem(`room-${id}`, JSON.stringify({
					code: editorCode,
					title,
					language
				}))
			} catch (error) {
				console.error("Failed to save room state", error);
			}
		}
	}, [roomJoined, id, editorCode, title, language])


	// If a new user join, send him current language and title used by other sockets.
	useEffect(() => {
		if (socket && sendInitialData === true) {
			socket.emit('user-join', { code: editorCode, title, language })
			setSendInitialData(false)
		}
		
	}, [socket, sendInitialData, editorCode, title, language])

	const languages = ["cpp", "python", "javascript", "c", "java", "go"]
	const languageExtension = ["cpp", "py", "js", "c", "java", "go"]
	const fontSizes = ["10px", "12px", "14px", "16px", "18px", "20px", "22px", "24px", "26px", "28px", "30px"]

	const changeLanguage = (e) => {
		const nextLanguage = languages[e.target.value]
		setLanguage(nextLanguage)
		setlanguageInRoom(nextLanguage)
		setfileExtensionValue(e.target.value)
		if (roomJoined && socket) {
			socket.emit('language-change', nextLanguage)
		}
	}

	const changeFontSize = (e) => {
		setFontsize(fontSizes[e.target.value])
		props.setRoomFontSize(fontSizes[e.target.value])
	}

	const titleUpdating = (e) => {
		setTitleInfo(e.target.value)
		setTitleChange(e.target.value !== title)
	}

	const leaveRoom = (e) =>{
		if (socket===undefined) {
			history.push("/");
		} else {
			socket.emit('leaving', {nameOfUser});
			socket.disconnect();
			props.setIsDisconnected(true);
			history.push("/");
		}
	}

	const sendMessage = (event) => {
		event.preventDefault();

		if (message) {
			socket.emit('sendMessage', { message, sender: nameOfUser });
			setMessage("");
		}
	}

	const titleUpdated = (e) => {
		e.preventDefault()
		const nextTitle = titleInfo.trim()
		if (!nextTitle) {
			enqueueSnackbar('Room title cannot be empty', { variant: "warning" })
			return
		}

		setTitleInfo(nextTitle)
		setTitle(nextTitle)
		setTitleChange(false)
		if (roomJoined && socket) {
			socket.emit('title-change', nextTitle)
		}
	}

	const downloadCode = (e) =>{
		e.preventDefault();
		fileDownload(editorCode, `${title}.${languageExtension[fileExtensionValue]}`)
	}

	const showFile = async (e) => {
		e.preventDefault()
		const reader = new FileReader()
		reader.onload = async (e) => { 
		  const text = (e.target.result)
		  setValue(text)
		  setcodeInRoom(text)
		  seteditorCode(text)
		  if (roomJoined && socket) {
			socket.emit('code-change', text)
		  }
		};
		reader.readAsText(e.target.files[0])
	}

	const hiddenFileInput = React.useRef(null);
	
  	const handleUpload = event => {
    	hiddenFileInput.current.click();
  	};
  

	return (
		<>
			<BrowserView className="w-100">

				<nav className="navbar navbar-expand-lg navbar-light bg-white shadow mb-1 py-0 room-navbar">
					<NavLink className="navbar-brand" to="/" onClick={leaveRoom}>LiveCodeX</NavLink>
					<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
					<form className="d-flex room-title-form" onSubmit={titleUpdated}>
						<input className="form-control me-2 room-title-input" type="text" placeholder="Enter file name here" aria-label="Room title" value={titleInfo} onChange={titleUpdating} />
						{titleChange === true &&
							<button type="submit" className="btn ml-2 btn-outline-success room-title-save" aria-label="Save room title" title="Save room title" disabled={!titleInfo.trim()}>
								<RiCheckFill aria-hidden="true" />
							</button>
						}
					</form>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav ml-auto">
							
							<li className="nav-item">
								<IconButton color="primary" title="Run code" onClick={props.runcode}>
									<PlayArrowRoundedIcon/>
                                </IconButton>
							</li>

							<li className="nav-item">
								<IconButton color="primary" title="Download the code" onClick={downloadCode}>
									<GetAppRoundedIcon/>
                                </IconButton>
							</li>
							<li className="nav-item">
								<IconButton color="primary" title="Upload the code" onClick={handleUpload}>
									<PublishRoundedIcon/>
                                </IconButton>
								{/* <input type="file" onChange={(e) => showFile(e)}></input> */}
								<input
									type="file"
									ref={hiddenFileInput}
									onChange={(e)=>showFile(e)}
									style={{display:'none'}} 
								/>
							</li>

							<li className="nav-item">
								{
									theme==="vs-dark" ? 
										<IconButton color="primary" onClick={toggleTheme} title="Change to Light theme">
                                    		<Brightness7RoundedIcon />
                                		</IconButton>
									:
										<IconButton color="primary" onClick={toggleTheme} title="Change to Dark theme">
                                    		<Brightness4RoundedIcon />
                                		</IconButton>
								}
							</li>

							<li className="nav-item">
								<IconButton color="primary" onClick={copyRoomCode} title="Share the room code">
                                	<ShareRoundedIcon />
                                </IconButton>
								{/* <span className="nav-link">{id}</span> */}
							</li>

							

							<li className="nav-item">
								<span className="nav-link mt-1">Participants: {users}</span>
							</li>

							<li className="nav-item mr-2">
								<select className="custom-select mt-1" title="change font size" onChange={changeFontSize}>
									<option value="0">10px</option>
									<option value="1">12px</option>
									<option value="2">14px</option>
									<option value="3" selected>16px</option>
									<option value="4">18px</option>
									<option value="5">20px</option>
									<option value="6">22px</option>
									<option value="7">24px</option>
									<option value="8">26px</option>
									<option value="9">28px</option>
									<option value="10">30px</option>
								</select>
							</li>
							
							<li className="nav-item">
								<select className="custom-select mt-1" title="Select Language" onChange={changeLanguage}>
									<option value="0">C++</option>
									<option value="1">Python</option>
									<option value="2">Javascript</option>
									<option value="3">C</option>
									<option value="4">Java</option>
									<option value="5">Go</option>
								</select>
							</li>

							<li className="nav-item">
								<IconButton style={{color:"#dc3545"}} onClick={leaveRoom} title="Leave room">
                                	<ExitToAppRoundedIcon/>
                                </IconButton>
							</li>
						</ul>

					</div>
				</nav>

				<div className="room-workspace">
					<section className="room-editor-panel">
						<Editor
							height="65vh"
							width="100%"
							theme={theme}
							language={language}
							value={value}
							editorDidMount={handleEditorDidMount}
							onChange={handleEditorChange}
							loading={"Loading..."}
							options={{ fontSize: fontsize}}
						/>
					</section>
					<section className="room-chat-panel">
						<div className="d-flex flex-column border border-warning room-chat-box">
							<Messages messages={messages} nameOfUser={props.nameOfUser}>
							</Messages>
							<Input message={message} setMessage={setMessage} sendMessage={sendMessage}></Input>
						</div>
					</section>


				</div>
			</BrowserView>
			<MobileView>
				<div className="mobile-notValid text-center" style={{position:'absolute', top:"50%", left:"50%", transform:'translate(-50%, -50%)'}}>
					<h1>Dear user, unfortunately this app is not supported in MobileView.</h1>
					<h1>Kindly use on a Desktop.</h1>
				</div>
			</MobileView>
		</>
	);

}

export default MyEditor;
