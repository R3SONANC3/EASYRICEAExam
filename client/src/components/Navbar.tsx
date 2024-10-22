const Navbar = () => {

  return (
    <nav className="bg-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-2xl font-bold">EASYRICE TEST</span>
            </div>
          </div>
          <div className="hidden md:block">

          </div>
          <div className="md:hidden flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-green-300 hover:text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
            </button>
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;