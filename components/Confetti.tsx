import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: 'var(--accent-color)',
      opacity: 0,
      ...style
    }}
  />
);

export const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 50 }).map((_, i) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * -10}vh`,
      backgroundColor: ['#f59e0b', '#fcd34d', '#10b981', '#3b82f6'][Math.floor(Math.random() * 4)],
      animation: `pop ${3 + Math.random() * 2}s ease-out forwards`,
      animationDelay: `${Math.random() * 0.5}s`,
      transform: `translateY(${Math.random() * 100}vh) rotate(${Math.random() * 1000}deg)`,
      width: `${Math.random() * 12 + 5}px`,
      height: `${Math.random() * 12 + 5}px`,
    };
    return <ConfettiPiece key={i} style={style} />;
  });

  return (
    <>
      <style>{`
        @keyframes pop {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0.5; }
        }
      `}</style>
      <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '100%', pointerEvents: 'none', zIndex: 100
      }}>
        {pieces}
      </div>
    </>
  );
};
