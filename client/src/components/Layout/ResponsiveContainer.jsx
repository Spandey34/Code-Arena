const ResponsiveContainer = ({ children }) => {
  return (
    <div className="responsive-container">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
};