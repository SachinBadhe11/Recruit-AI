import React, { useState } from 'react';
import { Upload, FileText, Type, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { readFileContent } from '../utils/fileParser';

const FileUpload = ({ onAnalyze, isAnalyzing }) => {
    const [jdInputMode, setJdInputMode] = useState('file'); // 'file' or 'text'
    const [resumeInputMode, setResumeInputMode] = useState('file'); // 'file' or 'text'

    const [jdFile, setJdFile] = useState(null);
    const [jdText, setJdText] = useState('');

    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');

    const handleAnalyze = async () => {
        let jdContent = '';
        let resumeContent = '';

        try {
            // Get JD Content
            if (jdInputMode === 'file') {
                if (jdFile) {
                    jdContent = await readFileContent(jdFile);
                }
            } else {
                jdContent = jdText;
            }

            // Get Resume Content
            if (resumeInputMode === 'file') {
                if (resumeFile) {
                    resumeContent = await readFileContent(resumeFile);
                }
            } else {
                resumeContent = resumeText;
            }

            if (jdContent && resumeContent) {
                await onAnalyze(jdContent, resumeContent);
            }
        } catch (error) {
            console.error("Error reading files:", error);
            alert(`Failed to read file content: ${error.message}`);
        }
    };

    const hasValidInput = () => {
        const hasJD = jdInputMode === 'file' ? jdFile : jdText.trim().length > 0;
        const hasResume = resumeInputMode === 'file' ? resumeFile : resumeText.trim().length > 0;
        return hasJD && hasResume;
    };

    return (
        <div className="space-y-8">
            {/* Job Description Input */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-surface-900">Job Description</h3>
                    <div className="flex gap-2 bg-surface-100 rounded-lg p-1">
                        <button
                            onClick={() => setJdInputMode('file')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${jdInputMode === 'file'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-600 hover:text-surface-900'
                                }`}
                        >
                            <FileText size={16} className="inline mr-1" />
                            File
                        </button>
                        <button
                            onClick={() => setJdInputMode('text')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${jdInputMode === 'text'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-600 hover:text-surface-900'
                                }`}
                        >
                            <Type size={16} className="inline mr-1" />
                            Text
                        </button>
                    </div>
                </div>

                {jdInputMode === 'file' ? (
                    <UploadZone
                        title="Upload Job Description"
                        subtitle="PDF, DOC, or DOCX"
                        file={jdFile}
                        setFile={setJdFile}
                        color="blue"
                    />
                ) : (
                    <TextInput
                        value={jdText}
                        onChange={setJdText}
                        placeholder="Paste job description here...&#10;&#10;Example:&#10;Position: Senior React Developer&#10;Experience: 5+ years&#10;Skills: React, TypeScript, Node.js..."
                        rows={8}
                    />
                )}
            </div>

            {/* Resume Input */}
            <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-surface-900">Candidate Resume</h3>
                    <div className="flex gap-2 bg-surface-100 rounded-lg p-1">
                        <button
                            onClick={() => setResumeInputMode('file')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${resumeInputMode === 'file'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-600 hover:text-surface-900'
                                }`}
                        >
                            <FileText size={16} className="inline mr-1" />
                            File
                        </button>
                        <button
                            onClick={() => setResumeInputMode('text')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${resumeInputMode === 'text'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-600 hover:text-surface-900'
                                }`}
                        >
                            <Type size={16} className="inline mr-1" />
                            Text
                        </button>
                    </div>
                </div>

                {resumeInputMode === 'file' ? (
                    <UploadZone
                        title="Upload Resume"
                        subtitle="PDF, DOC, or DOCX"
                        file={resumeFile}
                        setFile={setResumeFile}
                        color="purple"
                    />
                ) : (
                    <TextInput
                        value={resumeText}
                        onChange={setResumeText}
                        placeholder="Paste resume content here...&#10;&#10;Example:&#10;John Doe&#10;Senior Software Engineer&#10;Experience: 6 years in React development..."
                        rows={8}
                    />
                )}
            </div>

            {/* Analyze Button */}
            <motion.button
                whileHover={hasValidInput() ? { scale: 1.02 } : {}}
                whileTap={hasValidInput() ? { scale: 0.98 } : {}}
                onClick={handleAnalyze}
                disabled={!hasValidInput() || isAnalyzing}
                className={`
          w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
          ${hasValidInput() && !isAnalyzing
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:shadow-xl cursor-pointer'
                        : 'bg-surface-200 text-surface-400 cursor-not-allowed'}
        `}
            >
                {isAnalyzing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles size={22} />
                        Run AI Analysis
                    </>
                )}
            </motion.button>
        </div>
    );
};

const UploadZone = ({ title, subtitle, file, setFile, color }) => {
    const fileInputRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const colorClasses = {
        blue: 'border-blue-300 bg-blue-50/50 text-blue-600',
        purple: 'border-purple-300 bg-purple-50/50 text-purple-600'
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleClick = () => {
        if (!file) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
        relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
        ${file ? 'border-green-300 bg-green-50/50' : isDragging ? colorClasses[color] : 'border-surface-300 hover:border-surface-400 bg-surface-50/50'}
      `}
        >
            {file ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <FileText size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-surface-900">{file.name}</p>
                            <p className="text-sm text-surface-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <Upload size={40} className="mx-auto mb-3 text-surface-400" />
                    <p className="font-semibold text-surface-900 mb-1">{title}</p>
                    <p className="text-sm text-surface-500">{subtitle}</p>
                    <p className="text-xs text-surface-400 mt-2">Click to browse or drag and drop</p>
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
            />
        </div>
    );
};

const TextInput = ({ value, onChange, placeholder, rows }) => {
    return (
        <div className="relative">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none font-mono text-sm"
            />
            {value && (
                <div className="absolute bottom-3 right-3 text-xs text-surface-400">
                    {value.length} characters
                </div>
            )}
        </div>
    );
};

export default FileUpload;
