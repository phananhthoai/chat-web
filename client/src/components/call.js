export class CallState {
    constructor(user, setState) {
        this.user = user;
        this.state = 'NO_CALL';
        this._setState = setState;
        setState(this.state);
    }

    setState(newState) {
        this.state = newState;
        this._setState(newState);
    }

    onCallCreated() {
        if (window.videoUser.session.constructor.name === 'Inviter') {
            // Cuộc gọi này tạo bởi người gọi, không làm gì
            return;
        }
        window.callState.setState('CALL_RING');
        if (window.confirm(`Có cuộc gọi từ ${window.videoUser.session.request.from.displayName}, bạn muốn nghe không ?`)) {
            window.callState.user.session.answer();
            window.callState.setState('CALL_OK');
        } else {
            window.callState.user.session.incomingInviteRequest.reject();
            window.callState.setState('NO_CALL');
        }
    }

    onCallAnswered() {
        alert('Answered call');
    }

    onCallHangup() {
        debugger;
        alert('Handup call');
    }
}