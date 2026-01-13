const Card = ({ children, hoverable = false }) => {
  return (
    <div className={`card ${hoverable ? 'card-hover' : ''}`}>
      {children}
    </div>
  );
};