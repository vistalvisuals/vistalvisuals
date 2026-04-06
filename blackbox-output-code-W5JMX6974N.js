class VisualEditor {
    constructor() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'select';
        this.elements = [];
        this.selectedElement = null;
        this.isDragging = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.tool-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Upload
        document.getElementById('mediaInput').addEventListener('change', (e) => {
            this.loadMedia(e.target.files[0]);
        });

        // Filters
        document.querySelector('.filter-select').addEventListener('change', (e) => {
            this.applyFilter(e.target.value);
        });
    }

    async loadMedia(file) {
        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                this.elements = [{ type: 'image', img, x: 100, y: 100, width: 400, height: 300 }];
                this.render();
                document.getElementById('uploadOverlay').style.display = 'none';
            };
            img.src = URL.createObjectURL(file);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.onloadeddata = () => {
                this.canvas.width = video.videoWidth;
                this.canvas.height = video.videoHeight;
                this.renderVideoFrame(video);
            };
            video.src = URL.createObjectURL(file);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.elements.forEach((element, index) => {
            if (element.type === 'image') {
                this.ctx.drawImage(element.img, element.x, element.y, element.width, element.height);
            }
            // Draw selection border
            if (element === this.selectedElement) {
                this.ctx.strokeStyle = '#667eea';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(element.x, element.y, element.width, element.height);
                this.ctx.setLineDash([]);
            }
        });
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;