import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import * as SIP from 'sip.js';
import {CallState} from "./call";

const ChatFooter = ({socket}) => {
    const [message, setMessage] = useState('');

    const [callState, setCallState] = useState('UNKNOWN');
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    useEffect(() => {
        if (!localVideoRef.current || !remoteVideoRef.current) {
            // Nếu chưa khởi tạo xong video
            return;
        }
        if (window.callState) {
            return;
        }
        const username = localStorage.getItem('userName');
        const options = {
            aor: `sip:chat_thoai-${username}@sipjs.onsip.com`,
            delegate: {
                onCallCreated() {
                    if (window.callState.user.session.constructor.name === 'Inviter') {
                        // Cuộc gọi này tạo bởi người gọi, không làm gì
                        return;
                    }
                    window.callState.setState('CALL_RING');
                    if (window.confirm(`Có cuộc gọi từ ${window.callState.user.session.request.from.displayName}, bạn muốn nghe không ?`)) {
                        window.callState.user.answer();
                        window.callState.setState('CALL_OK');
                    } else {
                        window.callState.user.session.incomingInviteRequest.reject();
                        window.callState.setState('NO_CALL');
                    }
                },
                onCallAnswered() {
                    window.callState.setState('CALL_OK');
                },
                onCallHangup() {
                    if (window.callState.state === 'START_CALL') {
                        alert('Người nhận không nghe máy');
                    } else if (window.callState.state === 'CALL_OK') {
                        alert('Cuộc gọi đã kết thúc');
                    }
                    window.callState.setState('NO_CALL');
                },
            },
            media: {
                constraints: {
                    video: true,
                },
                local: {
                    video: localVideoRef.current,
                    audio: localVideoRef.current,
                },
                remote: {
                    video: remoteVideoRef.current,
                    audio: remoteVideoRef.current,
                }
            },
            userAgentOptions: {
                displayName: username,
            }
        }
        const video_user = new SIP.Web.SimpleUser('wss://edge.sip.onsip.com', options);
        window.callState = new CallState(video_user, setCallState);
        video_user.connect().then(() => video_user.register());
    }, [localVideoRef, remoteVideoRef]);

    const handleCallButtonClick = async () => {
        if (!window.callState) {
            return;
        }
        if (window.callState.state === 'NO_CALL') {
            const username = prompt('Bạn muốn gọi tới ai ?');
            window.callState.setState('START_CALL');
            window.callState.user.call(`sip:chat_thoai-${username}@sipjs.onsip.com`);
        } else if (callState === 'CALL_OK') {
            window.callState.user.hangup().then(() => alert('Cuộc gọi đã dừng !'));
        } else {
            alert('Bạn đang trong 1 cuộc gọi khác !!!');
        }
    };

    const debounce = useCallback((func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }, []);

    const emitTyping = useCallback(() => {
        socket.emit('typing', `${localStorage.getItem('userName')} is typing`);
    }, [socket]);

    const debouncedEmitTyping = useMemo(() => debounce(emitTyping, 1), [debounce, emitTyping]);

    const handleTyping = () => {
        debouncedEmitTyping();
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && localStorage.getItem('userName')) {
            socket.emit('message', {
                text: message,
                name: localStorage.getItem('userName'),
                id: `${socket.id}${Math.random()}`,
                socketID: socket.id,
            });
        }
        setMessage('');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                socket.emit("upload", localStorage.getItem('userName'), file.name, event.target.result, (status) => {
                    console.log(status);
                });
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div className="chat__footer">
            <form className="form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Write message"
                    className="message"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                />
                <button type="submit" className="sendBtn">SEND</button>
                <input
                    type="file"
                    className="sendFile"
                    onChange={handleFileUpload}
                    style={{display: 'none'}}
                    id="fileInput"
                />
                <button
                    type="button"
                    className="sendBtn"
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    FILE
                </button>
                <button type="button" className="sendBtn" onClick={handleCallButtonClick}>
                    {callState}
                </button>
            </form>
            <video ref={localVideoRef} autoPlay style={{height: '300px', width: '300px'}}/>
            <video ref={remoteVideoRef} autoPlay style={{height: '300px', width: '300px'}}/>

            {/*<form className="chat__footer">*/}
            {/*    <input*/}
            {/*        type="file"*/}
            {/*        className="sendFile"*/}
            {/*        onChange={handleFileUpload}*/}
            {/*        style={{display: 'none'}}*/}
            {/*        id="fileInput"*/}
            {/*    />*/}
            {/*    <button*/}
            {/*        type="button"*/}
            {/*        className="sendFileBtn"*/}
            {/*        onClick={() => document.getElementById('fileInput').click()}*/}
            {/*    >*/}
            {/*        FILE*/}
            {/*    </button>*/}
            {/*</form>*/}
        </div>
    );
};

export default ChatFooter;
