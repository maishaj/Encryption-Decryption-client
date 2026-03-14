import axios from "axios";
import React, { useState } from "react";

const CryptoDashboard = () => {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState("");
  const [algorithm, setAlgorithm] = useState("playfair");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleProcess = async (action) => {
    if (!file || !key) return alert("Please upload a file and enter a key!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);

    try {
      // The endpoint will depend on the action (encrypt or decrypt)
      const response = await axios.post(
        `http://localhost:3000/api/${algorithm}/${action}`,
        formData,
        {
          responseType: "blob", // Important for downloading files
        },
      );

      // Create a download link for the returned file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${action === "encrypt" ? "encrypted" : "decrypted"}_${file.name}`,
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Operation failed", error);
      alert("Error processing file. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">
        🔐 Multi-Cipher System
      </h1>

      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* File Input */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Upload File (Text/Image)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
          />
        </div>

        {/* Algorithm Selection */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Select Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-cyan-500"
          >
            <option value="playfair">Playfair Cipher</option>
            <option value="aes">Hill Cipher</option>
            <option value="rsa">Vigenere Cipher</option>
            <option value="rsa">RSA</option>
          </select>
        </div>

        {/* Key Input */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Secret Key / Password
          </label>
          <input
            type="text"
            placeholder="Enter key..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleProcess("encrypt")}
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? "Processing..." : "Encrypt"}
          </button>
          <button
            onClick={() => handleProcess("decrypt")}
            disabled={loading}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition"
          >
            Decrypt
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoDashboard;
