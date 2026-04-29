import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import API from "../services/api";
import "./Myfiles.css";

function Myfiles() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Viewer Modal States
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerType, setViewerType] = useState("");

  useEffect(() => {
    fetchMyFiles();
  }, []);

  const fetchMyFiles = async () => {
    try {
      console.log("Fetching user files...");
      const response = await API.get("/my-files");
      console.log("Files response:", response.data);
      setFiles(response.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load your files");
    } finally {
      setLoading(false);
    }
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

  // Helper function to get MIME type
  const getMimeType = (extension) => {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
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

      let mimeType = getMimeType(extension);
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      setViewerUrl(url);
      setViewerTitle(title);
      setViewerType(extension.toLowerCase());
      setShowViewer(true);

    } catch (error) {
      console.error("View failed:", error);
      alert(error.response?.data?.message || "Failed to view file");
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

      const filename = `${title}.${extension}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("File downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      alert(error.response?.data?.message || "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    setDeletingId(fileId);
    try {
      console.log("Deleting file:", fileId);
      await API.delete(`/files/${fileId}`);
      setFiles(files.filter(file => file.id !== fileId));
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert(error.response?.data?.message || "Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const renderViewerContent = () => {
    if (!viewerUrl) return null;

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

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(viewerType)) {
      return (
          <div className="image-viewer">
            <img src={viewerUrl} alt={viewerTitle} />
          </div>
      );
    }

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

  if (loading) {
    return (
        <div>
          <Navbar />
          <div className="loading">Loading your files...</div>
        </div>
    );
  }

  return (
      <div>
        <Navbar />
        <div className="my-files-container">
          <div className="files-header">
            <h1>📄 My Files</h1>
            <button onClick={() => navigate("/upload")} className="upload-btn">
              + Upload New File
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {files.length === 0 ? (
              <div className="no-files">
                <p>No files uploaded yet</p>
                <button onClick={() => navigate("/upload")}>Upload Your First File</button>
              </div>
          ) : (
              <div className="files-grid">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="file-card"
                        onClick={() => handleViewFile(file.id, file.title, file.extension)}
                    >
                      <div className="card-top">
                        <div className="file-icon">
                          <img
                              src={getFileIcon(file.fileType)}
                              alt="file icon"
                              width="50"
                              height="50"
                          />
                        </div>
                        <div className="title-section">
                          <h3>{file.title}</h3>
                          <p>
                            <span className="file-type-badge">{file.fileType}</span>
                            <span> (.{file.extension})</span>
                          </p>
                        </div>
                      </div>

                      <div className="details-section">
                        <div className="detail-item">
                          <span className="detail-label">Country:</span>
                          <span className="detail-value">{file.countryName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Course:</span>
                          <span className="detail-value">{file.courseName || "N/A"}</span>
                        </div>
                      </div>

                      <div className="file-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => handleViewFile(file.id, file.title, file.extension)}
                            className="view-btn"
                            disabled={viewingId === file.id}
                        >
                          {viewingId === file.id ? "Opening..." : "👁️ View"}
                        </button>
                        <button
                            onClick={() => handleDownload(file.id, file.title, file.extension)}
                            className="download-btn"
                            disabled={downloadingId === file.id}
                        >
                          {downloadingId === file.id ? "Downloading..." : "📥 Download"}
                        </button>
                        <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="delete-btn"
                            disabled={deletingId === file.id}
                        >
                          {deletingId === file.id ? "Deleting..." : "🗑 Delete"}
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

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
      </div>
  );
}

export default Myfiles;