let peerConnection;
let localStream;
let remoteStream;

let servers = {
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}


let init = async () => {
   localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
   document.getElementById('user-1').srcObject = localStream
}


let createPeerConnection = async (sdpType, onIceGatheringComplete) => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            // Mostrar información del candidate y su tipo
            const type = event.candidate.type;
            console.log('ICE candidate generado:', event.candidate.candidate, 'Tipo:', type);
        } else {
            // ICE gathering finished
            if (onIceGatheringComplete) {
                onIceGatheringComplete(peerConnection.localDescription);
            }
        }
    }
}

let createOffer = async () => {
    await createPeerConnection('offer-sdp', (localDescription) => {
        document.getElementById('offer-sdp').value = JSON.stringify(localDescription)
    })
    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    // No asignar el SDP aquí, esperar a que termine ICE gathering
}

let createAnswer = async () => {
    await createPeerConnection('answer-sdp', (localDescription) => {
        document.getElementById('answer-sdp').value = JSON.stringify(localDescription)
    })
    let offer = document.getElementById('offer-sdp').value
    if(!offer) return alert('Retrieve offer from peer first...')

    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)
    
    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    // No asignar el SDP aquí, esperar a que termine ICE gathering
}

let addAnswer = async () => {
    let answer = document.getElementById('answer-sdp').value
    if(!answer) return alert('Retrieve answer from peer first...')

    answer = JSON.parse(answer)

    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }

}

init()

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)