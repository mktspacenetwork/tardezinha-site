import React, { useState, useEffect } from 'react';

const Countdown: React.FC = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date('2025-12-21T12:00:00') - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    } else {
        timeLeft = {
            dias: 0,
            horas: 0,
            minutos: 0,
            segundos: 0
        }
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });
  
  const isTimeUp = Object.values(timeLeft).every(val => val === 0);

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    return (
      <div key={interval} className="flex flex-col items-center justify-center bg-white/10 rounded-lg p-4 w-24 h-24 md:w-32 md:h-32 backdrop-blur-sm border border-white/20">
        <span className="text-4xl md:text-5xl font-bold text-white">
          {String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}
        </span>
        <span className="text-sm uppercase tracking-wider">{interval}</span>
      </div>
    );
  });

  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 mt-8">
      {isTimeUp ? <span>O grande dia chegou!</span> : timerComponents}
    </div>
  );
};

export default Countdown;