import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Reads a file and extracts its text content based on file type.
 * Supports: .txt, .json, .pdf, .doc, .docx
 * @param {File} file - The file object to read
 * @returns {Promise<string>} - The extracted text content
 */
export const readFileContent = async (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();

    try {
        switch (fileType) {
            case 'pdf':
                return await readPdfFile(file);
            case 'docx':
            case 'doc':
                return await readDocxFile(file);
            case 'txt':
            case 'json':
            case 'md':
                return await readTextFile(file);
            default:
                // Try reading as text for unknown types, or throw error
                console.warn(`Unknown file type: ${fileType}. Trying to read as text.`);
                return await readTextFile(file);
        }
    } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        throw new Error(`Failed to read file: ${error.message}`);
    }
};

/**
 * Reads a text file using FileReader
 */
const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("Failed to read text file"));
        reader.readAsText(file);
    });
};

/**
 * Reads a PDF file using pdfjs-dist
 */
const readPdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
};

/**
 * Reads a DOCX file using mammoth
 */
const readDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};
