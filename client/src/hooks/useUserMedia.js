import { useState, useEffect } from "react";

/**
 * gets the user media stream
 * @param {object} requestedMedia the media object that is passed to navigator.mediaDevices.getUserMedia() (e.g. { video: true, audio: true })
 * @param {function} setErr state modifier that sets the error message
 * @returns a mediastream object
 */
export function useUserMedia(requestedMedia, setErr) {
  const [mediaStream, setMediaStream] = useState(null); // mediaStream

  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(requestedMedia);
        setMediaStream(stream);
      } catch (err) {
        setErr("No camera detected");
      }
    }

    if (!mediaStream) {
      enableStream();
    } else {
      return function cleanup() {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      };
    }
  }, [mediaStream, requestedMedia]);

  return mediaStream;
}
