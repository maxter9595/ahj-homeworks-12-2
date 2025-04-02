import HasherWorker from './workers/hasher.worker.js';

export default class HasherApp {
  constructor() {
    this.container = document.querySelector('.hasher-container');
    this.dropZone = document.querySelector('.drop-zone');
    this.algorithmDisplay = document.querySelector('.algorithm-display');
    this.algorithmOptions = document.querySelector('.algorithm-options');
    this.hashResult = document.querySelector('.hash-result');
    this.currentAlgorithm = 'MD5';
    this.file = null;
    this.worker = null;
    this.fileArrayBuffer = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateAlgorithmDisplay();
  }

  setupEventListeners() {
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('dragover');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    this.dropZone.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e) => {
        if (e.target.files.length) {
          this.handleFile(e.target.files[0]);
        }
      };
      input.click();
    });

    this.algorithmDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      this.algorithmOptions.classList.toggle('visible');
    });

    document.querySelectorAll('.algorithm-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentAlgorithm = e.target.dataset.algorithm;
        this.updateAlgorithmDisplay();
        this.algorithmOptions.classList.remove('visible');
        if (this.file) this.calculateHash();
      });
    });

    document.addEventListener('click', () => {
      this.algorithmOptions.classList.remove('visible');
    });
  }

  handleFile(file) {
    this.file = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
      this.fileArrayBuffer = e.target.result;
      this.calculateHash();
    };
    
    reader.onerror = () => {
      this.hashResult.textContent = 'Error reading file';
    };
    
    reader.readAsArrayBuffer(file);
  }

  calculateHash() {
    if (!this.fileArrayBuffer) {
      console.error('No file data available');
      return;
    }

    const arrayBuffer = this.fileArrayBuffer.slice(0);
    
    if (this.worker) {
      this.worker.terminate();
    }
  
    this.worker = new HasherWorker();
    
    this.worker.onmessage = (e) => {
      if (e.data.success) {
        this.hashResult.textContent = e.data.hash;
      } else {
        console.error('Worker error:', e.data.error);
        this.hashResult.textContent = 'Error calculating hash';
      }
    };
    
    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.hashResult.textContent = 'Worker error';
    };
    
    try {
      this.worker.postMessage({
        fileData: arrayBuffer,
        algorithm: this.currentAlgorithm
      }, [arrayBuffer]);
    } catch (error) {
      console.error('PostMessage error:', error);
      this.hashResult.textContent = 'Error processing file';
    }
  }
  
  updateAlgorithmDisplay() {
    document.querySelectorAll('.algorithm-option').forEach(option => {
      option.classList.toggle('selected', option.dataset.algorithm === this.currentAlgorithm);
    });
    
    const selectedAlgorithmElement = this.algorithmDisplay.querySelector('.selected-algorithm');
    if (selectedAlgorithmElement) {
      selectedAlgorithmElement.textContent = this.currentAlgorithm;
    }
  }
}
