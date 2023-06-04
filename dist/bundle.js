/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/call.js":
/*!********************!*\
  !*** ./js/call.js ***!
  \********************/
/***/ (() => {

eval("var localStream;\r\nvar remoteStream;\r\nvar localVideoElement = document.getElementById('local_video');\r\nvar remoteVideoElement = document.getElementById('remote_video');\r\nvar callTimerElement = document.getElementById('call_timer');\r\nvar callButton = document.getElementById('call_button');\r\nvar hangupButton = document.getElementById('hangup_button');\r\nvar audioCallButton = document.getElementById('audio_call_button');\r\nvar videoCallButton = document.getElementById('video_call_button');\r\nvar peerConnection;\r\n// var userB = '<?php echo $_GET[\"UserIdx\"]; ?>';\r\n// var UserId = '<?php echo $_SESSION[\"UserIdx\"]; ?>';\r\nvar callModal = document.getElementById('call_modal');\r\nvar callerNameElement = document.getElementById('name');\r\nvar callerStatusElement = document.getElementById('status');\r\n// var recipientFirstName = \"<?php echo $recipientFirstName; ?>\";\r\n// var recipientSurname = \"<?php echo $recipientSurname; ?>\";\r\n// Event listeners for call buttons\r\naudioCallButton.addEventListener('click', function () {\r\n    console.log('Audio Call Button clicked');\r\n    console.log(recipientFirstName + ' ' + recipientSurname);\r\n    startAudioCall();\r\n});\r\n\r\nvideoCallButton.addEventListener('click', function () {\r\n    console.log('Video Call Button clicked');\r\n    startVideoCall();\r\n});\r\n\r\nhangupButton.addEventListener('click', function () {\r\n    console.log('Hang Up Button clicked');\r\n    hangUpCall();\r\n});\r\n\r\n\r\n\r\nfunction startAudioCall() {\r\n    navigator.mediaDevices.getUserMedia({ audio: true, video: false })\r\n        .then(function (stream) {\r\n            localStream = stream;\r\n            peerConnection = new RTCPeerConnection();\r\n\r\n            stream.getAudioTracks().forEach(function (track) {\r\n                peerConnection.addTrack(track, stream);\r\n            });\r\n\r\n            sendCallOffer({ audio: true, video: false }); // Specify audio constraints\r\n\r\n            // Update the UI to reflect the call status\r\n            callButton.disabled = true;\r\n            hangupButton.disabled = false;\r\n            audioCallButton.disabled = false;\r\n            videoCallButton.disabled = false;\r\n        })\r\n        .catch(function (error) {\r\n            console.log('Error accessing microphone:', error);\r\n        });\r\n    callerStatusElement.textContent = \"In Audio Call\";\r\n\r\n    // Hide the local and remote video elements\r\n    localVideoElement.style.display = 'none';\r\n    remoteVideoElement.style.display = 'none';\r\n}\r\n\r\nfunction startVideoCall() {\r\n    navigator.mediaDevices.getUserMedia({ video: true, audio: true })\r\n        .then(function (stream) {\r\n            localStream = stream;\r\n            peerConnection = new RTCPeerConnection();\r\n\r\n            stream.getTracks().forEach(function (track) {\r\n                peerConnection.addTrack(track, stream);\r\n            });\r\n\r\n            sendCallOffer({ audio: true, video: true }); // Specify audio and video constraints\r\n\r\n            // Update the UI to reflect the call status\r\n            callButton.disabled = true;\r\n            hangupButton.disabled = false;\r\n            audioCallButton.disabled = false;\r\n            videoCallButton.disabled = false;\r\n            callerStatusElement.textContent = \"In Video Call\";\r\n\r\n            // Show the local and remote video elements\r\n            localVideoElement.style.display = 'block';\r\n            remoteVideoElement.style.display = 'block';\r\n            // Display the local video stream\r\n            localVideoElement.srcObject = stream;\r\n        })\r\n        .catch(function (error) {\r\n            console.log('Error accessing camera and microphone:', error);\r\n        });\r\n}\r\n\r\nfunction sendCallOffer(mediaConstraints) {\r\n    // Create and send a signaling message with the call offer and media constraints to the remote user\r\n    var offerOptions = {\r\n        offerToReceiveAudio: mediaConstraints.audio ? 1 : 0,\r\n        offerToReceiveVideo: mediaConstraints.video ? 1 : 0\r\n    };\r\n\r\n    peerConnection.createOffer(offerOptions)\r\n        .then(function (offer) {\r\n            return peerConnection.setLocalDescription(offer);\r\n        })\r\n        .then(function () {\r\n            var sdpOffer = peerConnection.localDescription;\r\n            console.log(\"SDP Offer:\", sdpOffer);\r\n\r\n            // Send the SDP offer and media constraints to the remote user via the signaling server\r\n            sendMessage({\r\n                type: 'offer',\r\n                offer: sdpOffer,\r\n                mediaConstraints: mediaConstraints\r\n            });\r\n        })\r\n        .catch(function (error) {\r\n            console.log('Error creating call offer:', error);\r\n        });\r\n}\r\n\r\nfunction handleOfferMessage(message) {\r\n    // Handle the call offer received from the caller\r\n    var offer = new RTCSessionDescription(message.offer);\r\n    var mediaConstraints = message.mediaConstraints; // Retrieve the media constraints from the message object\r\n\r\n    peerConnection = new RTCPeerConnection();\r\n    peerConnection.setRemoteDescription(offer)\r\n        .then(function () {\r\n            return navigator.mediaDevices.getUserMedia(mediaConstraints);\r\n        })\r\n        .then(function (stream) {\r\n            localStream = stream;\r\n\r\n            stream.getTracks().forEach(function (track) {\r\n                peerConnection.addTrack(track, stream);\r\n            });\r\n\r\n            return peerConnection.createAnswer();\r\n        })\r\n        .then(function (answer) {\r\n            return peerConnection.setLocalDescription(answer);\r\n        })\r\n        .then(function () {\r\n            var sdpAnswer = peerConnection.localDescription;\r\n            console.log(\"SDP Answer:\", sdpAnswer);\r\n\r\n            // Send the SDP answer to the caller via the signaling server\r\n            sendMessage({\r\n                type: 'answer',\r\n                answer: sdpAnswer\r\n            });\r\n\r\n;\r\n        })\r\n        .catch(function (error) {\r\n            console.log('Error handling call offer:', error);\r\n        });\r\n\r\n    // Update the UI to reflect the call status\r\n    callButton.disabled = true;\r\n    hangupButton.disabled = false;\r\n    audioCallButton.disabled = false;\r\n    videoCallButton.disabled = false;\r\n}\r\nfunction hangUpCall() {\r\n    // Stop the media streams\r\n    localStream.getTracks().forEach(function (track) {\r\n        track.stop();\r\n    });\r\n\r\n    // Close the RTCPeerConnection\r\n    if (peerConnection) {\r\n        peerConnection.close();\r\n        peerConnection = null;\r\n    }\r\n    callerStatusElement.textContent = \"Call Ended\";\r\n\r\n    // Hide the local and remote video elements\r\n    localVideoElement.style.display = 'none';\r\n    remoteVideoElement.style.display = 'none';\r\n\r\n    handleHangupMessage();\r\n\r\n    // Update the UI to reflect the call status\r\n    callButton.disabled = false;\r\n    hangupButton.disabled = true;\r\n    audioCallButton.disabled = false;\r\n    videoCallButton.disabled = false;\r\n    localVideoElement.srcObject = null;\r\n    remoteVideoElement.srcObject = null;\r\n    callTimerElement.textContent = '00:00:00';\r\n}\r\n\r\n\r\nfunction handleAnswerMessage(message) {\r\n    // Handle the call answer received from the remote user\r\n    var answer = new RTCSessionDescription(message.answer);\r\n\r\n    if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {\r\n        // If the signaling state is 'stable' or 'have-local-offer', set the remote description directly\r\n        setRemoteDescription(answer);\r\n    } else {\r\n        // If the signaling state is not 'stable' or 'have-local-offer', queue the remote description and apply it later\r\n        peerConnection.addEventListener('signalingstatechange', function () {\r\n            if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {\r\n                setRemoteDescription(answer);\r\n            }\r\n        });\r\n    }\r\n}\r\n\r\nfunction setRemoteDescription(description) {\r\n    if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {\r\n        // If the signaling state is 'stable' or 'have-local-offer', set the remote description directly\r\n        peerConnection.setRemoteDescription(description)\r\n            .then(function () {\r\n                // Check if there are any pending ICE candidates to be added\r\n                if (pendingCandidates.length > 0) {\r\n                    pendingCandidates.forEach(function (candidate) {\r\n                        peerConnection.addIceCandidate(candidate)\r\n                            .catch(function (error) {\r\n                                console.log('Error handling pending ICE candidate:', error);\r\n                            });\r\n                    });\r\n                    // Clear the pending candidates array\r\n                    pendingCandidates = [];\r\n                }\r\n            })\r\n            .catch(function (error) {\r\n                console.log('Error handling call answer:', error);\r\n            });\r\n    } else {\r\n        // If the signaling state is not 'stable' or 'have-local-offer', queue the remote description and apply it later\r\n        peerConnection.addEventListener('signalingstatechange', function () {\r\n            if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-offer') {\r\n                peerConnection.setRemoteDescription(description)\r\n                    .then(function () {\r\n                        // Check if there are any pending ICE candidates to be added\r\n                        if (pendingCandidates.length > 0) {\r\n                            pendingCandidates.forEach(function (candidate) {\r\n                                peerConnection.addIceCandidate(candidate)\r\n                                    .catch(function (error) {\r\n                                        console.log('Error handling pending ICE candidate:', error);\r\n                                    });\r\n                            });\r\n                            // Clear the pending candidates array\r\n                            pendingCandidates = [];\r\n                        }\r\n                    })\r\n                    .catch(function (error) {\r\n                        console.log('Error handling call answer:', error);\r\n                    });\r\n            }\r\n        });\r\n    }\r\n}\r\n\r\n\r\nfunction handleCandidateMessage(message) {\r\n    // Handle the ICE candidate received from the remote user\r\n    var candidate = new RTCIceCandidate(message.candidate);\r\n    peerConnection.addIceCandidate(candidate)\r\n        .catch(function (error) {\r\n            console.log('Error handling ICE candidate:', error);\r\n        });\r\n}\r\n\r\nfunction handleHangupMessage() {\r\n    // Handle the hangup message received from the remote user\r\n    hangUpCall();\r\n}\r\n\r\nfunction sendMessage(message) {\r\n    // Send the message to the remote user through your signaling mechanism\r\n    signalingSocket.send(JSON.stringify(message));\r\n}\r\n\r\n// WebSocket connection\r\nvar signalingSocket;\r\n\r\nfunction initSignaling() {\r\n    var signalingServerUrl = 'ws://localhost:8888?userB=' + userB; // Replace with your signaling server URL\r\n\r\n    signalingSocket = new WebSocket(signalingServerUrl);\r\n\r\n    signalingSocket.onopen = function () {\r\n        console.log('Signaling socket connection established');\r\n    };\r\n\r\n    signalingSocket.onmessage = function (event) {\r\n        console.log('Received message:', event.data);\r\n        console.log('Type of message:', typeof event.data);\r\n        console.log('Message value:', event.data);\r\n        if (typeof event.data === 'string') {\r\n            console.log('Message is a string');\r\n            try {\r\n                // Remove the prefix \"Server response:\" from the message\r\n                var messageString = event.data.replace('Server response:', '');\r\n                var message = JSON.parse(messageString);\r\n\r\n                if (message.type === 'offer') {\r\n                    handleOfferMessage(message);\r\n                } else if (message.type === 'answer') {\r\n                    handleAnswerMessage(message);\r\n                } else if (message.type === 'candidate') {\r\n                    handleCandidateMessage(message);\r\n                } else if (message.type === 'hangup') {\r\n                    handleHangupMessage(message);\r\n                }\r\n            } catch (error) {\r\n                console.log('Error parsing message:', error);\r\n            }\r\n        } else {\r\n            console.log('Received message is not a string');\r\n        }\r\n    };\r\n\r\n    signalingSocket.onclose = function (event) {\r\n        console.log('Signaling socket connection closed:', event.code, event.reason);\r\n        // Perform any necessary cleanup here\r\n    };\r\n\r\n    signalingSocket.onerror = function (error) {\r\n        console.log('Signaling socket error:', error);\r\n    };\r\n}\r\n\r\ninitSignaling();\r\n\n\n//# sourceURL=webpack:///./js/call.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./js/call.js"]();
/******/ 	
/******/ })()
;