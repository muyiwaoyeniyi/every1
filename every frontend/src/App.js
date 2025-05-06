import axios from "axios";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

export default function NonProfitSearchPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("heifer");

  useEffect(() => {
    if (search.trim().length > 0) {
      axios
        .get(`http://localhost:3001/non_profits?search_term=${search}`)
        .then((response) => {
          setItems(response.data);
        });
    }
  }, [search]);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-6 flex flex-col items-center">
      <motion.header
        className="w-full max-w-4xl text-center py-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold text-purple-800 mb-4">
          Support a Cause That Matters
        </h1>
        <p className="text-lg text-purple-700">
          Search, learn, and give back to nonprofits making a difference.
        </p>
      </motion.header>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 space-y-6">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search non-profits..."
          className="w-full px-4 py-3 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow"
        />

        {items.map((np) => (
          <motion.div
            key={np.id}
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="rounded-2xl shadow-lg border border-purple-200 bg-purple-50 p-6 space-y-4">
              <div className="flex items-center space-x-4">
                {np.logoUrl?.length > 0 && (
                  <img
                    src={np.logoUrl}
                    alt={np.name}
                    className="w-16 h-16 rounded-full border border-purple-300"
                  />
                )}
                <h2 className="text-2xl font-bold text-purple-800">
                  {np.name}
                </h2>
              </div>{" "}
              <p className="text-purple-700">{np.description}</p>
              <a
                rel="noopener"
                target="_blank"
                href={np.website}
                className="text-purple-600 underline"
              >
                Visit Website
              </a>
              <a
                rel="noopener"
                target="_blank"
                href={`https://www.every.org/${np.slug}#donate`}
                className="mt-4 block text-center w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg py-2 px-4 rounded-xl"
              >
                Give Now
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-12 text-center text-sm text-purple-500">
        &copy; {new Date().getFullYear()} GiveWell Search. Built with ❤️ using
        Tailwind CSS.
      </footer>
    </div>
  );
}
