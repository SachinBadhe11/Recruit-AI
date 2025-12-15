import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { readFileContent } from '../utils/fileParser';

const BulkUpload = ({ onAnalyze }) => {
    const jdInputRef = React.useRef(null);
    const resumeInputRef = React.useRef(null);
    const [jdInputMode, setJdInputMode] = useState('text'); // 'text' or 'file'
    const [jdText, setJdText] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [resumeFiles, setResumeFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState([]);

    const handleResumeDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setResumeFiles(prev => [...prev, ...files]);
    };

    const removeResume = (index) => {
        setResumeFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleBulkAnalyze = async () => {
        // Get JD text
        let jdContent = '';
        if (jdInputMode === 'text') {
            if (!jdText.trim()) {
                alert('Please enter a Job Description');
                return;
            }
            jdContent = jdText;
        } else {
            if (!jdFile) {
                alert('Please upload a Job Description file');
                return;
            }
            try {
                jdContent = await readFileContent(jdFile);
            } catch (error) {
                alert(`Failed to read JD file: ${error.message}`);
                return;
            }
        }

        if (resumeFiles.length === 0) {
            alert('Please upload at least one resume');
            return;
        }

        setIsProcessing(true);
        setResults([]);

        for (let i = 0; i < resumeFiles.length; i++) {
            try {
                // Read resume file
                const resumeContent = await readFileContent(resumeFiles[i]);

                // Analyze
                const result = await onAnalyze(jdContent, resumeContent);

                setResults(prev => [...prev, {
                    fileName: resumeFiles[i].name,
                    status: 'success',
                    data: result
                }]);
            } catch (error) {
                setResults(prev => [...prev, {
                    fileName: resumeFiles[i].name,
                    status: 'error',
                    error: error.message
                }]);
            }
        }

        setIsProcessing(false);
    };

    return (
        <div className="space-y-8">
            {/* JD Input */}
            <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-display font-bold text-surface-900">
                        Step 1: Job Description
                    </h3>
                    {/* Toggle Buttons */}
                    <div className="flex gap-2 bg-surface-100 p-1 rounded-xl">
                        <button
                            onClick={() => setJdInputMode('text')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${jdInputMode === 'text'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-600 hover:text-surface-900'
                                }`}
                        >
                            <Type size={18} />
                            Text
                        </button>
                        <button
                            onClick={() => setJdInputMode('file')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${jdInputMode === 'file'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-surface-600 hover:text-surface-900'
                                }`}
                        >
                            <Upload size={18} />
                            File
                        </button>
                    </div>
                </div>

                {jdInputMode === 'text' ? (
                    /* Text Input Mode */
                    <div>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste or type the Job Description here...&#10;&#10;Example:&#10;Senior React Developer&#10;- 5+ years React experience&#10;- TypeScript proficiency&#10;- Team leadership"
                            className="w-full h-64 p-4 border-2 border-primary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none bg-primary-50/30"
                        />
                        <p className="text-sm text-surface-500 mt-2">
                            {jdText.length} characters
                        </p>
                    </div>
                ) : (
                    /* File Upload Mode */
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setJdFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => !jdFile && jdInputRef.current?.click()}
                        className="border-2 border-dashed border-primary-300 bg-primary-50/30 rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    >
                        {jdFile ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary-600" size={24} />
                                    <span className="font-medium text-surface-900">{jdFile.name}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setJdFile(null); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <Upload className="mx-auto text-primary-500 mb-2" size={32} />
                                <p className="text-surface-600">Drop JD file here or click to upload</p>
                                <p className="text-sm text-surface-400 mt-1">Supports .txt, .pdf, .doc, .docx</p>
                            </div>
                        )}
                        <input ref={jdInputRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={(e) => setJdFile(e.target.files[0])} />
                    </div>
                )}
            </div>

            {/* Bulk Resume Upload */}
            <div className="glass-card rounded-3xl p-8">
                <h3 className="text-xl font-display font-bold text-surface-900 mb-4">
                    Step 2: Upload Candidate Resumes (Bulk)
                </h3>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleResumeDrop}
                    onClick={() => resumeInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 bg-purple-50/30 rounded-2xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer mb-4"
                >
                    <Upload className="mx-auto text-purple-500 mb-2" size={32} />
                    <p className="text-surface-600">Drop multiple resume files here or click to upload</p>
                    <p className="text-sm text-surface-400 mt-1">You can upload up to 50 resumes at once</p>
                    <p className="text-sm text-surface-400">Supports .txt, .pdf, .doc, .docx</p>
                    <input
                        ref={resumeInputRef}
                        type="file"
                        multiple
                        accept=".txt,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setResumeFiles(prev => [...prev, ...Array.from(e.target.files)])}
                    />
                </div>

                {/* Resume List */}
                {resumeFiles.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        <p className="text-sm font-semibold text-surface-700 mb-2">
                            {resumeFiles.length} resume{resumeFiles.length > 1 ? 's' : ''} uploaded
                        </p>
                        {resumeFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-surface-50 p-3 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-purple-600" />
                                    <span className="text-sm text-surface-700">{file.name}</span>
                                </div>
                                <button onClick={() => removeResume(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkAnalyze}
                    disabled={
                        (jdInputMode === 'text' ? !jdText.trim() : !jdFile) ||
                        resumeFiles.length === 0 ||
                        isProcessing
                    }
                    className={`
            px-10 py-4 rounded-2xl font-display font-semibold text-lg shadow-lg transition-all
            ${((jdInputMode === 'text' ? !jdText.trim() : !jdFile) || resumeFiles.length === 0)
                            ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:shadow-xl'}
          `}
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" />
                            Processing {results.length}/{resumeFiles.length}...
                        </span>
                    ) : (
                        `Analyze ${resumeFiles.length} Candidate${resumeFiles.length > 1 ? 's' : ''}`
                    )}
                </motion.button>
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="glass-card rounded-3xl p-8">
                    <h3 className="text-xl font-display font-bold text-surface-900 mb-6">Analysis Results</h3>
                    <div className="space-y-3">
                        {results.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-surface-200">
                                <div className="flex items-center gap-3">
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="text-green-600" size={20} />
                                    ) : (
                                        <AlertCircle className="text-red-600" size={20} />
                                    )}
                                    <span className="font-medium text-surface-900">{result.fileName}</span>
                                </div>
                                {result.status === 'success' && (
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${result.data.score >= 80 ? 'bg-green-100 text-green-700' :
                                            result.data.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            Score: {result.data.score}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.data.recommendation === 'Interview'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {result.data.recommendation}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
