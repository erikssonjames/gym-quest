import { useState, useEffect } from "react";

export function useDisplayTimer(startDate?: Date | string | number) {
  const [elapsedTime, setElapsedTime] = useState("0:00:00");

  useEffect(() => {
    if (!startDate) return;

    const startTimestamp = new Date(startDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - startTimestamp) / 1000);

      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      setElapsedTime(`${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };

    // Update immediately & start interval
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [startDate]);

  return elapsedTime;
}

export function useDisplayTimerInSeconds(
  startDate?: Date | string | number,
  initialSeconds = 0,
  paused = false
) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (paused) return

    // Convert startDate to a timestamp if provided; otherwise use "now."
    const startTimestamp = startDate
      ? new Date(startDate).getTime()
      : Date.now();

    function updateTimer() {
      // Time since start, in seconds
      const diff = Math.floor((Date.now() - startTimestamp) / 1000);
      // Include the initial offset
      setElapsedSeconds(diff + initialSeconds);
    }

    // Run immediately, then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startDate, initialSeconds, paused]);

  return elapsedSeconds;
}