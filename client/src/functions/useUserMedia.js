import { useState, useEffect } from "react";

/**
 * gets the user media stream
 * @param {*} requestedMedia
 * @param {*} setErr
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
