import axios from "axios";
import React, { useState } from "react";

const CryptoDashboard = () => {
  // Input Types: 'text' or 'image'
  const [inputType, setInputType] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Key States
  const [secretKey, setSecretKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const [algorithm, setAlgorithm] = useState("caesar");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const isAsymmetric = algorithm === "rsa";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      alert("Please upload an image file only.");
    }
  };

  const handleProcess = async (action) => {
    if (inputType === "text" && !textInput.trim())
      return alert("Please enter text to process!");
    if (inputType === "image" && !imageFile)
      return alert("Please upload an image!");

    if (isAsymmetric) {
      if (action === "encrypt" && !publicKey)
        return alert("Public key is required for encryption!");
      if (action === "decrypt" && !privateKey)
        return alert("Private key is required for decryption!");
    } else {
      if (!secretKey) return alert("Secret key is required!");
    }

    setLoading(true);
    setOutput(null);

    const formData = new FormData();
    formData.append("inputType", inputType);
    formData.append("algorithm", algorithm);

    if (inputType === "text") {
      formData.append("text", textInput);
    } else {
      formData.append("file", imageFile);
    }

    if (isAsymmetric) {
      formData.append("publicKey", publicKey);
      formData.append("privateKey", privateKey);
    } else {
      formData.append("key", secretKey);
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/${algorithm}/${action}`,
        formData,
        {
          responseType: inputType === "image" ? "blob" : "json",
        },
      );

      if (inputType === "image") {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        setOutput({
          type: "image",
          data: blobUrl,
          name: `${action === "encrypt" ? "encrypted" : "decrypted"}_image.png`,
        });
      } else {
        setOutput({
          type: "text",
          data: response.data.result || JSON.stringify(response.data),
        });
      }
    } catch (error) {
      console.error("Operation failed", error);

      // If the response is wrapped inside a binary blob, read it to display the true backend error
      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result);
            alert(
              `Error: ${errorJson.error || "Internal cryptographic engine processing error."}`,
            );
          } catch {
            alert(
              "Error processing your cryptographic request. Check key parameters.",
            );
          }
        };
        reader.readAsText(error.response.data);
      } else {
        const errorMsg =
          error.response?.data?.error ||
          "Error processing your request. Please check your backend configuration.";
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased font-sans flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg font-mono text-sm font-bold tracking-wider shadow-sm">
            Ω
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
              CipherEngine
            </h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest -mt-0.5">
              Symmetric & Asymmetric Pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            Node Secure
          </span>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Parameter Control Panel (Takes 5 cols) */}
        <section className="lg:col-span-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                01. Configuration Mode
              </h2>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInputType("text")}
                  className={`py-2 px-3 rounded-lg font-semibold text-xs tracking-wide transition-all duration-200 ${inputType === "text" ? "bg-white text-slate-900 shadow-sm border border-slate-200/40" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Plaintext String
                </button>
                <button
                  type="button"
                  onClick={() => setInputType("image")}
                  className={`py-2 px-3 rounded-lg font-semibold text-xs tracking-wide transition-all duration-200 ${inputType === "image" ? "bg-white text-slate-900 shadow-sm border border-slate-200/40" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Image Asset
                </button>
              </div>
            </div>

            {/* Dynamic Content Fields */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                02. Payload Entry
              </h2>
              {inputType === "text" ? (
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter message text to transform..."
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all resize-none text-sm font-mono tracking-tight"
                />
              ) : (
                <div className="group relative border border-dashed border-slate-300 hover:border-slate-900 rounded-xl p-4 transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center justify-center min-h-[118px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="relative z-0 max-h-20 overflow-hidden rounded-lg border border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700">
                        Drop your cryptographic image target here
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Strictly PNG / JPG / WEBP
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cryptography Framework Selection */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                03. Cryptosystem Scheme
              </h2>
              <div className="relative">
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl p-3.5 text-xs font-bold tracking-wide text-slate-800 focus:outline-none focus:border-slate-900 transition-all cursor-pointer"
                >
                  <option value="caesar">Caesar Cipher — Symmetric</option>
                  <option value="playfair">Playfair Cipher — Symmetric</option>
                  <option value="hill">Hill Cipher — Symmetric</option>
                  <option value="vigenere">Vigenere Cipher — Symmetric</option>
                  <option value="rsa">RSA Keypair — Asymmetric</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Core Cryptographic Keys */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                04. Authentication Keys
              </h2>
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-4">
                {!isAsymmetric ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Symmetric Key String
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., PASSPHRASE_VAL_89"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
                        Public Key Component (e, n)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Paste recipient public key elements..."
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all resize-none shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1.5">
                        Private Key Component (d, n)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Paste structural private decrypter matrix..."
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all resize-none shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Processing Submits */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleProcess("encrypt")}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-sm shadow-slate-900/10"
            >
              {loading ? "Processing..." : "Run Encryption"}
            </button>
            <button
              onClick={() => handleProcess("decrypt")}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-sm"
            >
              Run Decryption
            </button>
          </div>
        </section>

        {/* Right Column: Execution Output Console (Takes 7 cols) */}
        <section className="lg:col-span-7 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between h-full min-h-[520px]">
          <div className="w-full flex flex-col h-full justify-between">
            {/* Output Panel Header Control */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-900" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Pipeline Analytics Output
                </span>
              </div>
              {output && output.type === "text" && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output.data);
                    alert("Output copied to clipboard!");
                  }}
                  className="text-[11px] font-bold uppercase bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg transition"
                >
                  Copy Log
                </button>
              )}
            </div>

            {/* Render Interface Shell */}
            <div className="my-6 w-full bg-slate-950 border border-slate-900/40 rounded-xl p-5 flex-1 flex items-center justify-center relative overflow-hidden min-h-[360px]">
              {/* Subtle inner code background accent text */}
              <div className="absolute top-3 left-4 font-mono text-[9px] text-slate-800 select-none pointer-events-none">
                SECURE_BUFFER_STREAM // OUTPUT_LOG
              </div>

              {!output ? (
                <div className="text-center space-y-1.5 z-10">
                  <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                    Console Inactive
                  </p>
                  <p className="text-[11px] text-slate-600 max-w-xs font-medium">
                    Configure inputs on the left plane and initialize the script
                    engine pipeline.
                  </p>
                </div>
              ) : output.type === "text" ? (
                <div className="w-full h-full overflow-y-auto font-mono text-xs text-emerald-400 break-all text-left whitespace-pre-wrap self-start pt-4">
                  {output.data}
                </div>
              ) : (
                <div className="space-y-4 w-full flex flex-col items-center z-10">
                  <div className="max-w-xs overflow-hidden rounded-xl border border-slate-800 p-2 bg-slate-900 shadow-xl">
                    <img
                      src={output.data}
                      alt="Processed Stream"
                      className="max-h-56 w-auto rounded-lg object-contain mx-auto"
                    />
                  </div>
                  <a
                    href={output.data}
                    download={output.name}
                    className="inline-flex text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 py-2.5 px-4 rounded-lg shadow-sm transition"
                  >
                    Export Clean Asset
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-50">
            <span>ENGINE: V8_SANDBOXED</span>
            <span>SYSTEM_CORE_OK</span>
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-4 text-center text-[10px] font-mono tracking-wider text-slate-400 border-t border-slate-200/40 bg-white">
        © 2026 CRYPTOENGINE LABS • APP_V2.4.0
      </footer>
    </div>
  );
};

export default CryptoDashboard;
