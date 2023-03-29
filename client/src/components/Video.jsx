import React, { useCallback, useRef, useState } from "react";
import Measure from "react-measure";
import { useUserMedia } from "../hooks/useUserMedia";
import styled, { css, keyframes } from "styled-components";
import { useOffsets } from "../hooks/useOffsets";
import { Button } from "@mui/material";

// constrain the size of screenshot / video

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: "environment" },
};

/**
 *
 * @param {object} props
 * @param {function} props.setText- sets the text of the error message
 * @param {function} props.onCapture - callback for when the user captures an image
 * @param {function} props.onClear - callback for when the user clears the canvas
 * @returns a video component that displays the camera feed and allows the user to take a picture. also sends the picture to the admin
 */
export function Video({ setText, onCapture, onClear }) {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const mediaStream = useUserMedia(CAPTURE_OPTIONS, setText);
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  // update the videoRef if the mediaStream changes
  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  // handler whenever the window size changes
  function handleResize(contentRect) {
    setContainer({
      width: contentRect.bounds.width,
      height: Math.round(contentRect.bounds.width / 1),
    });
  }

  // handler for when the user draws on the canvas
  function handleCapture() {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      offsets.x,
      offsets.y,
      container.width,
      container.height,
      0,
      0,
      container.width,
      container.height
    );

    canvasRef.current.toBlob((blob) => onCapture(blob), "image/jpeg", 1);
    setIsCanvasEmpty(false);
    setIsFlashing(true);
  }

  // clears the canvas
  function handleClear() {
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
    onClear();
  }

  // autoplays the camera footage
  function handleCanPlay() {
    setIsVideoPlaying(true);
    videoRef.current.play();
  }

  return (
    <>
      <Measure bounds onResize={handleResize}>
        {({ measureRef }) => (
          <>
            <Container
              ref={measureRef}
              maxWidth={videoRef.current && videoRef.current.videoHeight} // by removing height, we allow the video to finish renderering and be cropped 1:1
              style={{
                height: `${container.height}px`,
              }}>
              <VideoComponent
                ref={videoRef}
                onCanPlay={handleCanPlay}
                autoPlay
                playsInline
                muted
                style={{
                  objectFit: "cover",
                  // should already have an aspect ratio of 1
                  width: `${container.width}px`,
                  height: `${container.height}px`,
                  // flips the camera
                  transform: "scaleX(-1)",
                }}
              />
              <Canvas
                ref={canvasRef}
                width={container.width}
                height={container.height}
                style={{
                  transform: "scaleX(-1)",
                }}
              />
              <Flash flash={isFlashing} onAnimationEnd={() => setIsFlashing(false)} />
            </Container>
            {isVideoPlaying && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  isCanvasEmpty ? handleCapture() : handleClear();
                }}>
                {isCanvasEmpty ? "Take a picture" : "Take another picture"}
              </Button>
            )}
          </>
        )}
      </Measure>
    </>
  );
}

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const VideoComponent = styled.video`
  position: absolute;

  &::-webkit-media-controls-play-button {
    display: none !important;
    -webkit-appearance: none;
  }
`;

const Flash = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #ffffff;
  opacity: 0;

  ${({ flash }) => {
    if (flash) {
      return css`
        animation: ${flashAnimation} 750ms ease-out;
      `;
    }
  }}
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth && `${maxWidth}px`};
  max-height: ${({ maxHeight }) => maxHeight && `${maxHeight}px`};
  overflow: hidden;
`;

const flashAnimation = keyframes`
  from {
    opacity: 0.75;
  }

  to {
    opacity: 0;
  }
`;
