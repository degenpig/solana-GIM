export const calculateTimeLeft = () => {
  const date = new Date();
  const info = Date.now();
  const difference = +new Date(Date.UTC(2022, 2, 22, 16, 0, 0)) - +new Date();
  let timeLeft = {};
  if (difference > 0) {
    timeLeft = {
      D: Math.floor(difference / (1000 * 60 * 60 * 24)),
      H: Math.floor((difference / (1000 * 60 * 60)) % 24),
      M: Math.floor((difference / 1000 / 60) % 60),
      S: Math.floor((difference / 1000) % 60)
    };
  }
  return timeLeft;
}