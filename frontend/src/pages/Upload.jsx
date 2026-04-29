import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import API from "../services/api";
import "./Upload.css";

function Upload() {
  const [title, setTitle] = useState("");
  const [university, setUniversity] = useState("");
  const [countryId, setCountryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [countries, setCountries] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching reference data with token:", token ? "Present" : "Missing");
      
      const [countriesRes, coursesRes] = await Promise.all([
        API.get("/countries"),
        API.get("/courses")
      ]);
      console.log("Countries loaded:", countriesRes.data);
      console.log("Courses loaded:", coursesRes.data);
      setCountries(countriesRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      console.error("Error fetching reference data:", err);
      console.error("Error details:", err.response?.data);
      showMessage("Failed to load countries and courses", "error");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
      const fileExtension = "." + selectedFile.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        showMessage("Invalid file type. Please upload PDF, Word, PowerPoint, or Image files.", "error");
        return;
      }
      
      console.log("File selected:", selectedFile.name, "Size:", selectedFile.size, "Type:", selectedFile.type);
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpload = async () => {
    console.log("Upload button clicked");
    console.log("Title:", title);
    console.log("University:", university);
    console.log("CountryId:", countryId);
    console.log("CourseId:", courseId);
    console.log("File:", file ? file.name : "No file");
    
    if (!title || !university || !countryId || !courseId || !file) {
      showMessage("Please fill all fields and select a file", "error");
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("countryId", countryId);
    formData.append("university", university);
    formData.append("courseId", courseId);

    // Log FormData contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Uploading with token:", token ? "Present" : "Missing");
      
      const response = await API.post("/files", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        }
      });
      
      console.log("Upload response:", response);
      
      if (response.status === 201) {
        showMessage("File uploaded successfully!", "success");
        resetForm();
      }
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      showMessage(error.response?.data?.message || "Upload failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setUniversity("");
    setCountryId("");
    setCourseId("");
    setFile(null);
    setFileName("");
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div>
      <Navbar />
      <div className="upload-container">
        <div className="upload-form">
          <h2>Upload Document</h2>
          <p className="upload-subtitle">Share your academic resources</p>

          {message && (
            <div className={`${message.type === "success" ? "success-message" : "error-message"}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>Document Title <span>*</span></label>
            <input
              type="text"
              placeholder="e.g., Artificial Intelligence Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Country <span>*</span></label>
            <select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>{country.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>University Name <span>*</span></label>
            <input
              type="text"
              placeholder="Enter university name"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Course <span>*</span></label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Choose File <span>*</span></label>
            <div className="file-input-wrapper">
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              />
              <div className="file-input-label">
                📎 {fileName ? "Change File" : "Click to upload"}
              </div>
            </div>
            {fileName && <div className="file-name">Selected: {fileName}</div>}
          </div>

          <button onClick={handleUpload} disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Uploading...
              </>
            ) : (
              "📤 Upload Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;