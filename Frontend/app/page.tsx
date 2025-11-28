"use client";

import React, { useState, useRef, useEffect } from "react";

export default function Home() {
  // ==========================
  // STATE MANAGEMENT
  // ==========================
  const [blockData, setBlockData] = useState<any[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PARENT BLOCK TYPES
  const parentBlocks = ["500×500×2000", "800×400×2000"];
  const [selectedParent, setSelectedParent] = useState(parentBlocks[0]);

  // RUN LOGIC
  const [running, setRunning] = useState(false);
  const [approaches, setApproaches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ==========================
  // HELPER FUNCTIONS
  // ==========================

  // Get block identifier - always returns a string
  const getBlockIdentifier = (block: any) => {
    try {
      const identifier =
        block?.MARK || block?.mark || `Block-${blockData.indexOf(block) + 1}`;
      return String(identifier || "");
    } catch (error) {
      console.error("Error getting block identifier:", error, block);
      return `Block-${blockData.indexOf(block) + 1}`;
    }
  };

  // Get block value with exact field names
  const getBlockValue = (block: any, field: string) => {
    if (!block) return "N/A";
    const value = block[field];
    return value !== undefined && value !== null && value !== ""
      ? value
      : "N/A";
  };

  // Calculate selectAll status based on selectedBlocks
  const selectAll =
    selectedBlocks.length === blockData.length && blockData.length > 0;

  // Filter blocks based on search term
  const filteredBlocks = blockData.filter((block) => {
    try {
      const blockId = getBlockIdentifier(block);
      const searchText = searchTerm.toLowerCase();
      return String(blockId).toLowerCase().includes(searchText);
    } catch (error) {
      console.error("Error in block filtering:", error, block);
      return false;
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================
  // EXCEL FILE IMPORT HANDLER
  // ==========================
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError("Please upload a valid Excel file (.xlsx, .xls, .csv)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError(null);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setBlockData(result.data);
        setSelectedBlocks([]);
        setIsDropdownOpen(false);
        setSearchTerm("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(result.error || "Failed to process Excel file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error uploading file. Please try again.");
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ==========================
  // BLOCK SELECTION HANDLERS
  // ==========================
  const toggleBlock = (mark: string, e?: React.MouseEvent) => {
    // Prevent event propagation if event is provided
    if (e) {
      e.stopPropagation();
    }
    setSelectedBlocks((prev) =>
      prev.includes(mark) ? prev.filter((x) => x !== mark) : [...prev, mark]
    );
    // Don't close dropdown - keep it open
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedBlocks(blockData.map((b) => getBlockIdentifier(b)));
    } else {
      setSelectedBlocks([]);
    }
  };

  const removeSelectedBlock = (mark: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlocks((prev) => prev.filter((m) => m !== mark));
  };

  // ==========================
  // RUN BUTTON LOGIC
  // ==========================
  const onRun = () => {
    if (blockData.length === 0) {
      setError("Please import an Excel file first.");
      return;
    }

    if (selectedBlocks.length === 0) {
      setError("Please select at least one block.");
      return;
    }

    setError(null);
    setRunning(true);
    setApproaches([]);

    setTimeout(() => {
      setApproaches([
        {
          title: "Approach 1",
          desc: "Optimized cutting plan for selected blocks.",
          efficiency: "95%",
          waste: "2.3%",
          color: "from-green-500 to-emerald-600",
        },
        {
          title: "Approach 2",
          desc: "Balanced plan with moderate recovery rates.",
          efficiency: "88%",
          waste: "4.1%",
          color: "from-blue-500 to-cyan-600",
        },
        {
          title: "Approach 3",
          desc: "Backup approach with stable performance.",
          efficiency: "82%",
          waste: "5.7%",
          color: "from-purple-500 to-indigo-600",
        },
      ]);
      setRunning(false);
    }, 1500);
  };

  // Selected blocks display text
  const selectedBlocksText =
    selectedBlocks.length === 0
      ? "No blocks selected"
      : `${selectedBlocks.length} block${
          selectedBlocks.length > 1 ? "s" : ""
        } selected`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* COMPANY NAME */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
            Daniel Corus
          </h1>
          <p className="text-gray-600 text-lg">
            Advanced Block Optimization System
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Import Requirements
            </h2>
          </div>

          {/* EXCEL IMPORT SECTION */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Import Blocks from Excel
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <button
              onClick={triggerFileInput}
              className="w-full p-6 border-2 border-dashed border-gray-300 bg-white/50 rounded-xl shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 backdrop-blur-sm text-center group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-gray-700 font-semibold text-lg">
                    {blockData.length > 0
                      ? `✅ Imported ${blockData.length} blocks`
                      : "Click to import Excel file"}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports .xlsx, .xls, .csv files with block data
                  </p>
                </div>
                {blockData.length > 0 && (
                  <span className="text-blue-600 text-sm font-medium">
                    Click to re-import
                  </span>
                )}
              </div>
            </button>

            {/* File requirements info */}
            {blockData.length === 0 && (
              <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Expected Excel Format:
                </h4>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>
                    Columns: MARK, A(W1), B(W2), C(angle), D(length), Thickness,
                    α, Volume, AD, UW-(Kg), Nos, TOT V, TOT KG
                  </li>
                  <li>First row should contain headers</li>
                  <li>Supported formats: Excel (.xlsx, .xls) or CSV</li>
                </ul>
              </div>
            )}
          </div>

          {/* BLOCK SELECTION - DROPDOWN */}
          {blockData.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Select Blocks
              </h3>

              <div
                ref={dropdownRef}
                className="relative cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="border-2 border-gray-200/80 bg-white/50 p-4 rounded-xl shadow-sm hover:border-blue-300/50 transition-all duration-300 backdrop-blur-sm min-h-[60px]">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2 flex-1">
                      {selectedBlocks.length === 0 ? (
                        <span className="text-gray-400 font-medium">
                          {selectedBlocksText}
                        </span>
                      ) : (
                        selectedBlocks.map((mark) => {
                          const block = blockData.find(
                            (b) => getBlockIdentifier(b) === mark
                          );
                          return (
                            <div
                              key={mark}
                              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium group hover:bg-blue-200 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{mark}</span>
                              <span className="text-xs text-blue-600">
                                ({getBlockValue(block, "Nos")} units)
                              </span>
                              <button
                                onClick={(e) => removeSelectedBlock(mark, e)}
                                className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* DROPDOWN CONTENT */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg border border-gray-200/80 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    {/* SEARCH BAR */}
                    {/* SEARCH BAR */}
                    <div className="p-4 border-b border-gray-100/50 bg-white">
                      <div className="relative">
                        <svg
                          className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search blocks (e.g., G14, G15...)"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    {/* SELECT ALL OPTION */}
                    <div
                      className="flex items-center gap-3 p-3 border-b border-gray-100/50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={handleSelectAll}
                    >
                      <div
                        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                          selectAll
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectAll && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-700">
                        {selectAll
                          ? "Deselect All Blocks"
                          : "Select All Blocks"}
                      </span>
                    </div>

                    {/* BLOCK OPTIONS - COMPACT LAYOUT */}
                    <div className="max-h-80 overflow-y-auto">
                      {filteredBlocks.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No blocks found matching "{searchTerm}"
                        </div>
                      ) : (
                        filteredBlocks.map((block, index) => {
                          const blockId = getBlockIdentifier(block);
                          return (
                            <div
                              key={blockId}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50/80 transition-colors cursor-pointer border-b border-gray-100/30 last:border-b-0"
                              onClick={(e) => toggleBlock(blockId, e)}
                            >
                              <div
                                className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                                  selectedBlocks.includes(blockId)
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedBlocks.includes(blockId) && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* COMPACT BLOCK INFORMATION - SINGLE LINE */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="font-bold text-gray-800 text-sm whitespace-nowrap flex-shrink-0">
                                      {blockId}
                                    </span>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-1 overflow-x-auto scrollbar-hide">
                                      <span className="whitespace-nowrap">
                                        <strong>A:</strong>{" "}
                                        {getBlockValue(block, "A(W1)")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>B:</strong>{" "}
                                        {getBlockValue(block, "B(W2)")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>C:</strong>{" "}
                                        {getBlockValue(block, "C(angle)")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>D:</strong>{" "}
                                        {getBlockValue(block, "D(length)")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>Thick:</strong>{" "}
                                        {getBlockValue(block, "Thickness")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>α:</strong>{" "}
                                        {getBlockValue(block, "α")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>Vol:</strong>{" "}
                                        {getBlockValue(block, "Volume")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>TOT V:</strong>{" "}
                                        {getBlockValue(block, "TOT V")}
                                      </span>
                                      <span className="whitespace-nowrap">
                                        <strong>TOT KG:</strong>{" "}
                                        {getBlockValue(block, "TOT KG")}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-3 flex-shrink-0">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                      {getBlockValue(block, "Nos")} units
                                    </span>
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                      {getBlockValue(block, "UW-(Kg)")} kg
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PARENT BLOCK SELECTOR */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Select Parent Block
            </h3>
            <div className="relative">
              <select
                className="w-full p-4 border-2 border-gray-200/80 bg-white/50 rounded-xl shadow-sm appearance-none cursor-pointer hover:border-purple-300/50 transition-all duration-300 backdrop-blur-sm font-medium text-gray-700"
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
              >
                {parentBlocks.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm">
              <p className="text-red-600 font-medium flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* RUN BUTTON */}
          <div className="text-center">
            <button
              onClick={onRun}
              disabled={running || blockData.length === 0}
              className={`px-12 py-4 rounded-xl text-white font-semibold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 ${
                running || blockData.length === 0
                  ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25"
              }`}
            >
              {running ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Optimization...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Run Optimization
                </div>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></div>
            Best Approaches
          </h3>

          {approaches.length === 0 ? (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {blockData.length === 0
                  ? "Import an Excel file and run optimization to see results."
                  : "No results yet. Click Run to generate optimization approaches."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {approaches.map((a, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${a.color} p-6 rounded-2xl text-white shadow-2xl transform transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-xl">{a.title}</h4>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                      #{idx + 1}
                    </div>
                  </div>
                  <p className="text-white/90 mb-6 leading-relaxed">{a.desc}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{a.efficiency}</div>
                      <div className="text-white/70 text-sm">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{a.waste}</div>
                      <div className="text-white/70 text-sm">Waste</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-200/50">
          <p>
            Daniel Corus Optimization System • Advanced Block Cutting Solutions
          </p>
        </div>
      </div>
    </main>
  );
}
