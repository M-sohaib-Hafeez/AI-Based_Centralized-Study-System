import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import API from "../services/api";
import "./Search.css";

function Search() {
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Viewer Modal States
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerType, setViewerType] = useState("");

  const [filters, setFilters] = useState({
    title: "",
    fileType: "",
    countryId: "",
    universityName: "",
    courseId: ""
  });

  const [countries, setCountries] = useState([]);
  const [courses, setCourses] = useState([]);

  const [openChat, setOpenChat] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFileTitle, setSelectedFileTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [countriesRes, coursesRes] = await Promise.all([
        API.get("/countries"),
        API.get("/courses")
      ]);
      setCountries(countriesRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      console.error("Error fetching reference data:", err);
      showNotification("Failed to load countries and courses", "error");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterPayload = {
        title: filters.title || searchTerm,
        fileType: filters.fileType || null,
        countryId: filters.countryId || null,
        universityName: filters.universityName || null,
        courseId: filters.courseId || null
      };

      console.log("Search payload:", filterPayload);
      console.log("Page:", page);

      const res = await API.post(`/search?page=${page}`, filterPayload);

      console.log("Search response:", res.data);

      setFiles(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err.response?.data?.message || "Failed to load files");
      showNotification("Failed to load files", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, page, searchTerm]);

  // Helper function to get MIME type
  const getMimeType = (extension) => {
    const mimeTypes = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',

      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',

      // Default
      'default': 'application/octet-stream'
    };

    return mimeTypes[extension.toLowerCase()] || mimeTypes.default;
  };

  const handleViewFile = async (fileId, title, extension) => {
    setViewingId(fileId);
    try {
      console.log("Viewing file:", fileId);

      const response = await API.get(`/files/${fileId}`, {
        responseType: "blob"
      });

      // Determine the correct MIME type based on file extension
      let mimeType = getMimeType(extension);

      // Create blob with proper MIME type
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      setViewerUrl(url);
      setViewerTitle(title);
      setViewerType(extension.toLowerCase());
      setShowViewer(true);

    } catch (error) {
      console.error("View failed:", error);
      showNotification(error.response?.data?.message || "Failed to view file", "error");
    } finally {
      setViewingId(null);
    }
  };

  const closeViewer = () => {
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setShowViewer(false);
    setViewerUrl("");
    setViewerTitle("");
    setViewerType("");
  };

  const handleDownload = async (fileId, title, extension) => {
    setDownloadingId(fileId);
    try {
      console.log("Downloading file:", fileId);

      const response = await API.get(`/files/${fileId}`, {
        responseType: "blob"
      });

      let filename = `${title}.${extension}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification("File downloaded successfully", "success");
    } catch (error) {
      console.error("Download failed:", error);
      console.error("Error response:", error.response);
      showNotification(error.response?.data?.message || "Download failed", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAIChat = (fileId, title) => {
    setSelectedFileId(fileId);
    setSelectedFileTitle(title);
    setMessages([]);
    setOpenChat(true);
  };

  const sendAIMessage = async () => {
    if (!chatInput.trim() || !selectedFileId) return;

    const userMessage = { role: "user", text: chatInput };
    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await API.post(`/files/${selectedFileId}/generate`, {
        prompt: chatInput
      });

      const botMessage = { role: "bot", text: res.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("AI Error:", err);
      showNotification(err.response?.data?.message || "AI service error", "error");
      const errorMessage = { role: "bot", text: "Sorry, I couldn't process your request." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setError({ message, type });
    setTimeout(() => setError(null), 5000);
  };

  const getFileIcon = (fileType) => {
    const icons = {
      WORD: "https://cdn-icons-png.flaticon.com/512/337/337932.png",
      PDF: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
      PRESENTATION: "https://tse2.mm.bing.net/th/id/OIP.uqtaSeofAhwRP9yvuo7inwHaHa?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
      IMAGE: "https://thfvnext.bing.com/th/id/OIP.rcXpu-cQuTHpTRnbsuQe5QHaHa?r=0&o=7&cb=thfvnextrm=3&rs=1&pid=ImgDetMain&o=7&rm=3"
    };
    return icons[fileType] || "https://cdn-icons-png.flaticon.com/512/337/337912.png";
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const applyFilters = () => {
    setShowFilter(false);
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      title: "",
      fileType: "",
      countryId: "",
      universityName: "",
      courseId: ""
    });
    setSearchTerm("");
    setPage(0);
    setShowFilter(false);
  };

  // Render different viewer content based on file type
  const renderViewerContent = () => {
    if (!viewerUrl) return null;

    // For PDF files
    if (viewerType === 'pdf') {
      return (
          <iframe
              src={`${viewerUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              title={viewerTitle}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allowFullScreen
          />
      );
    }

    // For images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(viewerType)) {
      return (
          <div className="image-viewer">
            <img src={viewerUrl} alt={viewerTitle} />
          </div>
      );
    }

    // For text files
    if (viewerType === 'txt') {
      return (
          <iframe
              src={viewerUrl}
              title={viewerTitle}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
          />
      );
    }

    // For Office documents using Google Docs Viewer
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(viewerType)) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(viewerUrl)}&embedded=true`;
      return (
          <iframe
              src={googleDocsUrl}
              title={viewerTitle}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allowFullScreen
          />
      );
    }

    // Fallback for other file types
    return (
        <div className="fallback-viewer">
          <p>Cannot preview this file type directly.</p>
          <button onClick={() => {
            const link = document.createElement('a');
            link.href = viewerUrl;
            link.setAttribute('download', viewerTitle);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}>
            Download File
          </button>
        </div>
    );
  };

  return (
      <div className="search-container">
        <Navbar />

        {error && (
            <div className={`notification ${error.type === "error" ? "error" : "success"}`}>
              {error.message}
              <button onClick={() => setError(null)}>×</button>
            </div>
        )}

        <div className="top-bar">
          <input
              className="search-input"
              type="text"
              placeholder="Search documents by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange("title", e.target.value);
              }}
          />
          <button className="filter-btn" onClick={() => setShowFilter(true)}>
            Filter ⚙️
          </button>
        </div>

        {loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner-large"></div>
              <p>Loading files...</p>
            </div>
        ) : (
            <>
              <div className="card-grid">
                {files.length === 0 ? (
                    <div className="no-results">No files found</div>
                ) : (
                    files.map((item) => (
                        <div className="card" key={item.id}>
                          <div className="thumbnail">
                            <img
                                src={getFileIcon(item.fileType)}
                                alt={item.fileType}
                                className="file-icon-large"
                            />
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.countryName}</p>
                          <p className="file-extension">Type: {item.fileType} (.{item.extension})</p>
                          <p className="course-text">Course: {item.courseName || "N/A"}</p>
                          <div className="card-buttons">
                            <button
                                className="view-btn"
                                onClick={() => handleViewFile(item.id, item.title, item.extension)}
                                disabled={viewingId === item.id}
                            >
                              {viewingId === item.id ? "Opening..." : "👁️ View"}
                            </button>
                            <button
                                className="download-btn"
                                onClick={() => handleDownload(item.id, item.title, item.extension)}
                                disabled={downloadingId === item.id}
                            >
                              {downloadingId === item.id ? "Downloading..." : "📥 Download"}
                            </button>
                            <button
                                className="ai-btn"
                                onClick={() => handleAIChat(item.id, item.title)}
                            >
                              🤖 Ask AI
                            </button>
                          </div>
                        </div>
                    ))
                )}
              </div>

              {totalPages > 1 && (
                  <div className="pagination">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setPage(index)}
                            className={page === index ? "active-page" : ""}
                        >
                          {index + 1}
                        </button>
                    ))}
                    <button
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
              )}
            </>
        )}

        {/* Filter Modal */}
        {showFilter && (
            <div className="modal" onClick={() => setShowFilter(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Filter Documents</h3>

                <input
                    type="text"
                    placeholder="Title"
                    value={filters.title}
                    onChange={(e) => handleFilterChange("title", e.target.value)}
                />

                <select
                    value={filters.countryId}
                    onChange={(e) => handleFilterChange("countryId", e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                      <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>

                <input
                    type="text"
                    placeholder="University Name"
                    value={filters.universityName}
                    onChange={(e) => handleFilterChange("universityName", e.target.value)}
                />

                <select
                    value={filters.courseId}
                    onChange={(e) => handleFilterChange("courseId", e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>

                <select
                    value={filters.fileType}
                    onChange={(e) => handleFilterChange("fileType", e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="WORD">Word Documents</option>
                  <option value="PDF">PDF Files</option>
                  <option value="PRESENTATION">Presentations</option>
                  <option value="IMAGE">Images</option>
                </select>

                <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
                <button className="clear-btn" onClick={clearFilters}>Clear All</button>
                <button className="close-btn" onClick={() => setShowFilter(false)}>Close</button>
              </div>
            </div>
        )}

        {/* File Viewer Modal */}
        {showViewer && (
            <div className="viewer-modal" onClick={closeViewer}>
              <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
                <div className="viewer-header">
                  <h3>{viewerTitle}</h3>
                  <button className="viewer-close" onClick={closeViewer}>×</button>
                </div>
                <div className="viewer-body">
                  {renderViewerContent()}
                </div>
                <div className="viewer-footer">
                  <button onClick={() => {
                    const link = document.createElement('a');
                    link.href = viewerUrl;
                    link.setAttribute('download', viewerTitle);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}>
                    Download
                  </button>
                  <button onClick={closeViewer}>Close</button>
                </div>
              </div>
            </div>
        )}

        {/* AI Chat Modal */}
        {openChat && (
            <div className="chat-modal" onClick={() => setOpenChat(false)}>
              <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="chat-header">
                  <h4>🤖 AI Assistant - {selectedFileTitle}</h4>
                  <button className="close-btn" onClick={() => setOpenChat(false)}>×</button>
                </div>
                <div className="chat-body">
                  {messages.length === 0 && (
                      <div className="chat-placeholder">
                        Ask questions about this document...
                      </div>
                  )}
                  {messages.map((msg, i) => (
                      <div key={i} className={`chat-message ${msg.role}`}>
                        <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
                        <p>{msg.text}</p>
                      </div>
                  ))}
                  {chatLoading && <div className="typing-indicator">AI is typing...</div>}
                </div>
                <div className="chat-input-area">
                  <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about this document..."
                      onKeyPress={(e) => e.key === "Enter" && sendAIMessage()}
                  />
                  <button onClick={sendAIMessage} disabled={chatLoading}>
                    Send
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default Search;