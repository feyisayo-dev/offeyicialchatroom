var localStream;
var remoteStream;
var localVideoElement = document.getElementById('local_video');
var remoteVideoElement = document.getElementById('remote_video');
var callTimerElement = document.getElementById('call_timer');
var callButton = document.getElementById('call_button');
var hangupButton = document.getElementById('hangup_button');
var audioCallButton = document.getElementById('audio_call_button');
var videoCallButton = document.getElementById('video_call_button');
var peerConnection;
// var userB = '<?php echo $_GET["UserIdx"]; ?>';
// var UserId = '<?php echo $_SESSION["UserIdx"]; ?>';
var callModal = document.getElementById('call_modal');
var callerNameElement = document.getElementById('name');
var callerStatusElement = document.getElementById('status');
// var recipientFirstName = "<?php echo $recipientFirstName; ?>";
// var recipientSurname = "<?php echo $recipientSurname; ?>";
// Event listeners for call buttons
audioCallButton.addEventListener('click', function () {
    console.log('Audio Call Button clicked');
    console.log(recipientFirstName + ' ' + recipientSurname);
    startAudioCall();
});

videoCallButton.addEventListener('click', function () {
    console.log('Video Call Button clicked');
    startVideoCall();
});

hangupButton.addEventListener('click', function () {
    console.log('Hang Up Button clicked');
    hangUpCall();
});



function startAudioCall() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function (stream) {
            localStream = stream;
            peerConnection = new RTCPeerConnection();

            stream.getAudioTracks().forEach(function (track) {
                peerConnection.addTrack(track, stream);
            });

            sendCallOffer({ audio: true, video: false }); // Specify audio constraints

            // Update the UI to reflect the call status
            callButton.disabled = true;
            hangupButton.disabled = false;
            audioCallButton.disabled = false;
            videoCallButton.disabled = false;
        })
        .catch(function (error) {
            console.log('Error accessing microphone:', error);
        });
    callerStatusElement.textContent = "In Audio Call";

    // Hide the local and remote video elements
    localVideoElement.style.display = 'none';
    remoteVideoElement.style.display = 'none';
}

function startVideoCall() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function (stream) {
            localStream = stream;
            peerConnection = new RTCPeerConnection();

            stream.getTracks().forEach(function (track) {
                peerConnection.addTrack(track, stream);
            });

            sendCallOffer({ audio: true, video: true }); // Specify audio and video constraints

            // Update the UI to reflect the call status
            callButton.disabled = true;
            hangupButton.disabled = false;
            audioCallButton.disabled = false;
            videoCallButton.disabled = false;
            callerStatusElement.textContent = "In Video Call";

            // Show the local and remote video elements
            localVideoElement.style.display = 'block';
            remoteVideoElement.style.display = 'block';
            // Display the local video stream
            localVideoElement.srcObject = stream;
        })
        .catch(function (error) {
            console.log('Error accessing camera and microphone:', error);
        });
}

function sendCallOffer(mediaConstraints) {
    // Create and send a signaling message with the call offer and media constraints to the remote user
    var offerOptions = {
        offerToReceiveAudio: mediaConstraints.audio ? 1 : 0,
        offerToReceiveVideo: mediaConstraints.video ? 1 : 0
    };

    peerConnection.createOffer(offerOptions)
        .then(function (offer) {
            return peerConnection.setLocalDescription(offer);
        })
        .then(function () {
            var sdpOffer = peerConnection.localDescription;
            console.log("SDP Offer:", sdpOffer);

            // Send the SDP offer and media constraints to the remote user via the signaling server
            sendMessage({
                type: 'offer',
                offer: sdpOffer,
                mediaConstraints: mediaConstraints
            });
        })
        .catch(function (error) {
            console.log('Error creating call offer:', error);
        });
}

function handleOfferMessage(message) {
    // Handle the call offer received from the caller
    var offer = new RTCSessionDescription(message.offer);
    var mediaConstraints = message.mediaConstraints; // Retrieve the media constraints from the message object

    peerConnection = new RTCPeerConnection();
    peerConnection.setRemoteDescription(offer)
        .then(function () {
            return navigator.mediaDevices.getUserMedia(mediaConstraints);
        })
        .then(function (stream) {
            localStream = stream;

            stream.getTracks().forEach(function (track) {
                peerConnection.addTrack(track, stream);
            });

            return peerConnection.createAnswer();
        })
        .then(function (answer) {
            return peerConnection.setLocalDescription(answer);
        })
        .then(function () {
            var sdpAnswer = peerConnection.localDescription;
            console.log("SDP Answer:", sdpAnswer);

            // Send the SDP answer to the caller via the signaling server
            sendMessage({
                type: 'answer',
                answer: sdpAnswer
            });

;
        })
        .catch(function (error) {
            console.log('Error handling call offer:', error);
        });

    // Update the UI to reflect the call status
    callButton.disabled = true;
    hangupButton.disabled = false;
    audioCallButton.disabled = false;
    videoCallButton.disabled = false;
}
function hangUpCall() {
    // Stop the media streams
    localStream.getTracks().forEach(function (track) {
        track.stop();
    });

    // Close the RTCPeerConnection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    callerStatusElement.textContent = "Call Ended";

    // Hide the local and remote video elements
    localVideoElement.style.display = 'none';
    remoteVideoElement.style.display = 'none';

    handleHangupMessage();

    // Update the UI to reflect the call status
    callButton.disabled = false;
    hangupButton.disabled = true;
    audioCallButton.disabled = false;
    videoCallButton.disabled = false;
    localVideoElement.srcObject = null;
    remoteVideoElement.srcObject = null;
    callTimerElement.textContent = '00:00:00';
}


function handleAnswerMessage(message) {
    // Handle the call answer received from the remote user
    var answer = new RTCSessionDescription(message.answer);

    if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {
        // If the signaling state is 'stable' or 'have-local-offer', set the remote description directly
        setRemoteDescription(answer);
    } else {
        // If the signaling state is not 'stable' or 'have-local-offer', queue the remote description and apply it later
        peerConnection.addEventListener('signalingstatechange', function () {
            if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {
                setRemoteDescription(answer);
            }
        });
    }
}

function setRemoteDescription(description) {
    if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {
        // If the signaling state is 'stable' or 'have-local-offer', set the remote description directly
        peerConnection.setRemoteDescription(description)
            .then(function () {
                // Check if there are any pending ICE candidates to be added
                if (pendingCandidates.length > 0) {
                    pendingCandidates.forEach(function (candidate) {
                        peerConnection.addIceCandidate(candidate)
                            .catch(function (error) {
                                console.log('Error handling pending ICE candidate:', error);
                            });
                    });
                    // Clear the pending candidates array
                    pendingCandidates = [];
                }
            })
            .catch(function (error) {
                console.log('Error handling call answer:', error);
            });
    } else {
        // If the signaling state is not 'stable' or 'have-local-offer', queue the remote description and apply it later
        peerConnection.addEventListener('signalingstatechange', function () {
            if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {
                peerConnection.setRemoteDescription(description)
                    .then(function () {
                        // Check if there are any pending ICE candidates to be added
                        if (pendingCandidates.length > 0) {
                            pendingCandidates.forEach(function (candidate) {
                                peerConnection.addIceCandidate(candidate)
                                    .catch(function (error) {
                                        console.log('Error handling pending ICE candidate:', error);
                                    });
                            });
                            // Clear the pending candidates array
                            pendingCandidates = [];
                        }
                    })
                    .catch(function (error) {
                        console.log('Error handling call answer:', error);
                    });
            }
        });
    }
}


function handleCandidateMessage(message) {
    // Handle the ICE candidate received from the remote user
    var candidate = new RTCIceCandidate(message.candidate);
    peerConnection.addIceCandidate(candidate)
        .catch(function (error) {
            console.log('Error handling ICE candidate:', error);
        });
}

function handleHangupMessage() {
    // Handle the hangup message received from the remote user
    hangUpCall();
}

function sendMessage(message) {
    // Send the message to the remote user through your signaling mechanism
    signalingSocket.send(JSON.stringify(message));
}

// WebSocket connection
var signalingSocket;

function initSignaling() {
    var signalingServerUrl = 'ws://localhost:8888?userB=' + userB; // Replace with your signaling server URL

    signalingSocket = new WebSocket(signalingServerUrl);

    signalingSocket.onopen = function () {
        console.log('Signaling socket connection established');
    };

    signalingSocket.onmessage = function (event) {
        console.log('Received message:', event.data);
        console.log('Type of message:', typeof event.data);
        console.log('Message value:', event.data);
        if (typeof event.data === 'string') {
            console.log('Message is a string');
            try {
                // Remove the prefix "Server response:" from the message
                var messageString = event.data.replace('Server response:', '');
                var message = JSON.parse(messageString);

                if (message.type === 'offer') {
                    handleOfferMessage(message);
                } else if (message.type === 'answer') {
                    handleAnswerMessage(message);
                } else if (message.type === 'candidate') {
                    handleCandidateMessage(message);
                } else if (message.type === 'hangup') {
                    handleHangupMessage(message);
                }
            } catch (error) {
                console.log('Error parsing message:', error);
            }
        } else {
            console.log('Received message is not a string');
        }
    };

    signalingSocket.onclose = function (event) {
        console.log('Signaling socket connection closed:', event.code, event.reason);
        // Perform any necessary cleanup here
    };

    signalingSocket.onerror = function (error) {
        console.log('Signaling socket error:', error);
    };
}

initSignaling();