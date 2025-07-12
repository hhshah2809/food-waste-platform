// BackgroundWrapper.js
const BackgroundWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-400 text-black p-4">
      {children}
    </div>
  );
};

export default BackgroundWrapper;
