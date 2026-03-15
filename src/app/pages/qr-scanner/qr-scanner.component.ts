import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrScannerService } from './qr-scanner.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  eventId = 'event-1';
  
  scanCount = 12;
  successRate = 97;
  isCameraActive = false;
  lastScanResult: any = null;
  cameraError = '';
  private stream: MediaStream | null = null;
  private isScanning = false;
  private lastScannedCode: string | null = null;
  private lastScanTime = 0;
  private scanThrottleTime = 3000; // 3 seconds between same code scans
  
  recentScans: any[] = [];

  // Simulate QR codes for testing
  mockQRCodes = [
    { id: 1, volunteerName: 'Sarah Johnson', qrCode: 'QR-2024-001' },
    { id: 2, volunteerName: 'Michael Chen', qrCode: 'QR-2024-002' },
    { id: 3, volunteerName: 'David Thompson', qrCode: 'QR-2024-003' },
    { id: 4, volunteerName: 'Jessica Williams', qrCode: 'QR-2024-004' },
    { id: 5, volunteerName: 'Maria Garcia', qrCode: 'QR-2024-005' },
  ];

  constructor(private qrScannerService: QrScannerService) {}

  ngOnInit() {
    this.loadSessionStats();
    this.loadRecentScans();
  }

  ngAfterViewInit() {
    // Camera setup happens in startCamera
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  loadSessionStats() {
    this.qrScannerService.getSessionStats(this.eventId).subscribe(data => {
      this.scanCount = data.scanned;
      this.successRate = data.successRate;
    });
  }

  loadRecentScans() {
    this.qrScannerService.getRecentScans(this.eventId).subscribe(data => {
      this.recentScans = data.map((scan, index) => ({
        id: index + 1,
        volunteerName: scan.name,
        qrCode: scan.qrCode,
        timestamp: scan.time,
        status: 'success'
      }));
    });
  }

  private showNotification(message: string, type: string) {
    // This would normally show a toast notification
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  async startCamera() {
    this.cameraError = '';
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.videoElement && this.stream) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.videoElement.nativeElement.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
        this.videoElement.nativeElement.play();
        this.isCameraActive = true;
        this.isScanning = true;
        this.requestScanFrame();
      }
    } catch (error: any) {
      this.isCameraActive = false;
      this.cameraError = `Camera error: ${error.message}. Please ensure camera permissions are granted.`;
      console.error('Camera error:', error);
    }
  }

  private requestScanFrame() {
    if (!this.isCameraActive || !this.isScanning) return;
    requestAnimationFrame(() => this.scanFrame());
  }

  private scanFrame() {
    if (!this.isCameraActive || !this.isScanning) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const jsQR = (window as any).jsQR;
      if (jsQR) {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const now = Date.now();
          // Throttle scans of the same code
          if (code.data !== this.lastScannedCode || (now - this.lastScanTime) > this.scanThrottleTime) {
            console.log('Valid QR code found:', code.data);
            this.lastScannedCode = code.data;
            this.lastScanTime = now;
            this.handleBarcodeScan(code.data);
          }
        }
      } else {
        console.error('jsQR library not found on window');
      }
    }
    this.requestScanFrame();
  }

  private handleBarcodeScan(qrCode: string) {
    this.qrScannerService.processScan(qrCode, this.eventId).subscribe({
      next: (res) => {
        this.lastScanResult = res;
        if (res.success) {
          this.showNotification(res.message, 'success');
          this.loadSessionStats();
          this.loadRecentScans();
        } else {
          this.showNotification(res.message, 'error');
        }
      },
      error: (err) => {
        console.error('Scan processing error:', err);
        this.showNotification('Failed to process scan', 'error');
      }
    });
  }

  stopCamera() {
    this.isScanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive = false;
    this.cameraError = '';
  }
}
