// src/components/UploadButton.jsx
import React, { useRef, useState } from 'react';

const UploadButton = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div>
      {/* Hidden file input */}
      <input 
        type="file" 
        accept=".pdf, .doc, .docx" 
        ref={fileInputRef} 
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Styled upload button */}
      <button 
        type="button"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => fileInputRef.current.click()}
      >
        {fileName ? `Change File (${fileName})` : 'Upload Resume'}
      </button>
    </div>
  );
};

export default UploadButton;
