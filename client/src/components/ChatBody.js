import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBody = ({ messages, lastMessageRef, typingStatus, socket }) => {
    const navigate = useNavigate();

    const handleLeaveChat = () => {
        const userName = localStorage.getItem('userName');
        socket.emit('leaveChat', { userName: userName });
        localStorage.removeItem('userName');
        navigate('/');
        window.location.reload();
    };

    return (
        <>
            <header className="chat__mainHeader">
                <p>Hangout with Colleagues</p>
                <button className="leaveChat__btn" onClick={handleLeaveChat}>
                    LEAVE CHAT
                </button>
            </header>

            <div className="message__container">
                {messages.map((message) =>
                    message.name === localStorage.getItem('userName') ? (
                        <div className="message__chats" key={message.id}>
                            <p className="sender__name">You</p>
                            <div className="message__sender">
                                {/*<p>{message.text}</p>*/}
                                <p>
                                    <div dangerouslySetInnerHTML={{__html: message.text}}/>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="message__chats" key={message.id}>
                            <p>{message.name}</p>
                            <div className="message__recipient">
                                {/*<p>{message.text}</p>*/}
                                <p>
                                    <div dangerouslySetInnerHTML={{__html: message.text}}/>
                                </p>
                            </div>
                        </div>
                    )
                )}

                <div className="message__status">
                    <p>{typingStatus}</p>
                </div>
                <div ref={lastMessageRef}/>
            </div>
        </>
    );
};

export default ChatBody;

